using System.Diagnostics.CodeAnalysis;
using Microsoft.JSInterop;

namespace TrBlazeUI.Components.Chart;

/// <summary>
/// Wraps a JavaScript module reference so that releasing it after the circuit has closed is a no-op.
/// </summary>
/// <remarks>
/// <para>
/// Every call is passed straight to the wrapped reference; only <see cref="DisposeAsync"/> differs, by
/// ignoring <see cref="JSDisconnectedException"/>. A circuit ending is the ordinary way a Blazor Server
/// page ends, and the browser has already released the module by then, so there is nothing left to do.
/// </para>
/// <para>
/// Used only by <see cref="DisconnectSafeApexChart{TItem}"/>, at teardown (TfLens TR-039).
/// </para>
/// </remarks>
internal sealed class DisconnectSafeJSObjectReference : IJSObjectReference
{
    private const DynamicallyAccessedMemberTypes JsonSerialized =
        DynamicallyAccessedMemberTypes.PublicConstructors
        | DynamicallyAccessedMemberTypes.PublicFields
        | DynamicallyAccessedMemberTypes.PublicProperties;

    private readonly IJSObjectReference objInner;

    /// <summary>
    /// Initializes a new instance of the <see cref="DisconnectSafeJSObjectReference"/> class.
    /// </summary>
    /// <param name="aInner">The module reference every call is passed to.</param>
    public DisconnectSafeJSObjectReference(IJSObjectReference aInner) => objInner = aInner;

    /// <inheritdoc />
    public ValueTask<TValue> InvokeAsync<[DynamicallyAccessedMembers(JsonSerialized)] TValue>(
        string aIdentifier, object?[]? aArgs) =>
        objInner.InvokeAsync<TValue>(aIdentifier, aArgs);

    /// <inheritdoc />
    public ValueTask<TValue> InvokeAsync<[DynamicallyAccessedMembers(JsonSerialized)] TValue>(
        string aIdentifier, CancellationToken aCancellationToken, object?[]? aArgs) =>
        objInner.InvokeAsync<TValue>(aIdentifier, aCancellationToken, aArgs);

    /// <summary>
    /// Releases the wrapped reference, ignoring a circuit that has already closed.
    /// </summary>
    /// <remarks>
    /// Steps: await the wrapped reference's own release; if the circuit is gone, the browser side no
    /// longer exists and the exception carries no information, so it is swallowed rather than left to
    /// fault a task nobody awaits.
    /// </remarks>
    /// <returns>A task that completes when the reference has been released or found already gone.</returns>
    public async ValueTask DisposeAsync()
    {
        try
        {
            await objInner.DisposeAsync().ConfigureAwait(false);
        }
        catch (JSDisconnectedException)
        {
            // The circuit closed first; the browser released the module with it.
        }
    }
}
