using System.ComponentModel;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using ApexCharts;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.Chart;

/// <summary>
/// The <see cref="ApexChart{TItem}"/> every TrBlazeUI chart renders, with a teardown that tolerates a
/// closed circuit.
/// </summary>
/// <remarks>
/// <para>
/// Blazor-ApexCharts (6.1.0, and still 7.0.0) releases its JavaScript module from the synchronous
/// <c>Dispose</c> as <c>InvokeAsync(async () =&gt; await module.DisposeAsync())</c> and never awaits
/// the task. When a page is left the circuit is already gone, so that task faults with
/// <see cref="JSDisconnectedException"/>, the surrounding <c>catch</c> never sees it, and the host
/// logs one unobserved task exception per chart (TfLens TR-039).
/// </para>
/// <para>
/// Steps: immediately before the base teardown runs, the module reference the base holds is swapped
/// for a <see cref="DisconnectSafeJSObjectReference"/> around it. The base then destroys the chart
/// and releases the module exactly as before, through the wrapper, which ignores a closed connection
/// on release. Nothing changes while the chart is alive. An in-process (WebAssembly) reference
/// cannot disconnect and is left alone; if a later Blazor-ApexCharts renames the field, the base
/// teardown simply runs unchanged.
/// </para>
/// <para>
/// Public only because Razor discovers public components alone; it is an implementation detail of
/// the chart types and hidden from IntelliSense.
/// </para>
/// </remarks>
/// <typeparam name="TItem">The type of data items used in the chart.</typeparam>
[EditorBrowsable(EditorBrowsableState.Never)]
public sealed class DisconnectSafeApexChart<TItem> : ApexChart<TItem> where TItem : class
{
    private const string ModuleFieldName = "blazor_apexchart";

    private static readonly FieldInfo? ModuleField =
        typeof(ApexChart<TItem>).GetField(ModuleFieldName, BindingFlags.Instance | BindingFlags.NonPublic);

    /// <summary>
    /// Tears the chart down, releasing its JavaScript module without faulting on a closed circuit.
    /// </summary>
    /// <remarks>
    /// Steps: read the base's module reference; when it is an out-of-process reference not already
    /// wrapped, store the wrapper in its place; then run the base teardown.
    /// </remarks>
    [DynamicDependency(ModuleFieldName, typeof(ApexChart<>))]
    public override void Dispose()
    {
        if (ModuleField?.GetValue(this) is IJSObjectReference vModule
            && vModule is not IJSInProcessObjectReference
            && vModule is not DisconnectSafeJSObjectReference)
        {
            ModuleField.SetValue(this, new DisconnectSafeJSObjectReference(vModule));
        }

        base.Dispose();
    }
}
