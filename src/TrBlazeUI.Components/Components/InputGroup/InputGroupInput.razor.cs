using TrBlazeUI.Components.Input;
using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace TrBlazeUI.Components.InputGroup;

/// <summary>
/// An input component optimized for use within InputGroup.
/// </summary>
/// <remarks>
/// <para>
/// InputGroupInput is a specialized version of the Input component designed to work
/// seamlessly within an InputGroup container. It removes the standalone input styling
/// (border, background, focus ring) since those are provided by the parent InputGroup.
/// </para>
/// <para>
/// Features:
/// - Transparent background for seamless integration
/// - No border or focus ring (parent handles these)
/// - Flexible width to fill available space
/// - Full parameter compatibility with standard Input
/// - Automatic marking for parent detection (data-slot attribute)
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;InputGroup&gt;
///     &lt;InputGroupInput Type="InputType.Email" Placeholder="Enter email" /&gt;
/// &lt;/InputGroup&gt;
/// </code>
/// </example>
public partial class InputGroupInput : ComponentBase, IDisposable
{
    private ElementReference objInputRef;

    private CancellationTokenSource? objDebounceCts;

    /// <summary>
    /// Gets or sets how long, in milliseconds, to wait after the last keystroke before raising
    /// <c>ValueChanged</c>.
    /// </summary>
    /// <remarks>
    /// Behaves exactly as <c>Input.DebounceMilliseconds</c>. Zero (the default) raises the callback on
    /// every keystroke. A value in the 150-300 ms range lets a filter box drawn with a leading icon
    /// re-filter once typing pauses instead of on every key (TfLens TR-040). The control's own DOM
    /// value is never debounced - only the notification to the parent is.
    /// </remarks>
    [Parameter]
    public int DebounceMilliseconds { get; set; }

    /// <summary>
    /// Gets or sets the type of input.
    /// </summary>
    [Parameter]
    public InputType Type { get; set; } = InputType.Text;

    /// <summary>
    /// Gets or sets the current value of the input.
    /// </summary>
    [Parameter]
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the input value changes.
    /// </summary>
    [Parameter]
    public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>
    /// Gets or sets the placeholder text.
    /// </summary>
    [Parameter]
    public string? Placeholder { get; set; }

    /// <summary>
    /// Gets or sets whether the input is disabled.
    /// </summary>
    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets whether the input is required.
    /// </summary>
    [Parameter]
    public bool Required { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the HTML id attribute.
    /// </summary>
    [Parameter]
    public string? Id { get; set; }

    /// <summary>
    /// Gets or sets the ARIA label.
    /// </summary>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the ARIA described-by attribute.
    /// </summary>
    [Parameter]
    public string? AriaDescribedBy { get; set; }

    /// <summary>
    /// Gets or sets whether the input value is invalid.
    /// </summary>
    [Parameter]
    public bool? AriaInvalid { get; set; }

    /// <summary>
    /// Gets or sets additional attributes.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Callback invoked after first render with the input's ElementReference.
    /// Use this for JS interop operations like focusing or event setup.
    /// </summary>
    [Parameter]
    public Action<ElementReference>? OnInputRef { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the input element.
    /// </summary>
    /// <remarks>
    /// Uses minimal styling since the parent InputGroup provides the visual container.
    /// Focuses on text rendering, placeholder, and disabled state only.
    /// </remarks>
    private string CssClass => ClassNames.cn(
        // Base styles - minimal for group context
        "flex-1 bg-transparent px-3 py-2 text-base",
        "border-0 rounded-none", // No border or radius for seamless integration
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // File input styling
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Medium screens and up: smaller text
        "md:text-sm",
        // Custom classes
        Class
    );

    /// <summary>
    /// Gets the HTML input type attribute value.
    /// </summary>
    private string HtmlType => Type switch
    {
        InputType.Text => "text",
        InputType.Email => "email",
        InputType.Password => "password",
        InputType.Number => "number",
        InputType.Tel => "tel",
        InputType.Url => "url",
        InputType.Search => "search",
        InputType.Date => "date",
        InputType.Time => "time",
        InputType.File => "file",
        _ => "text"
    };

    /// <summary>
    /// Handles the input event (fired on every keystroke).
    /// </summary>
    private async Task HandleInput(ChangeEventArgs args)
    {
        var newValue = args.Value?.ToString();
        Value = newValue;

        await NotifyValueChangedAsync(newValue);
    }

    /// <summary>
    /// Raises <c>ValueChanged</c>, honouring <see cref="DebounceMilliseconds"/>.
    /// </summary>
    /// <remarks>
    /// Steps: with no listener, stop; with no debounce, raise at once; otherwise cancel the pending
    /// notification, wait out the debounce on a fresh token and raise only if no newer keystroke
    /// cancelled it.
    /// </remarks>
    /// <param name="aValue">The new value.</param>
    private async Task NotifyValueChangedAsync(string? aValue)
    {
        if (!ValueChanged.HasDelegate)
        {
            return;
        }

        if (DebounceMilliseconds <= 0)
        {
            await ValueChanged.InvokeAsync(aValue);
            return;
        }

        objDebounceCts?.Cancel();
        objDebounceCts?.Dispose();

        var vCts = new CancellationTokenSource();
        objDebounceCts = vCts;

        try
        {
            await Task.Delay(DebounceMilliseconds, vCts.Token);
            await ValueChanged.InvokeAsync(aValue);
        }
        catch (OperationCanceledException)
        {
            // A newer keystroke superseded this one.
        }
    }

    /// <summary>
    /// Releases the debounce timer.
    /// </summary>
    /// <remarks>
    /// Cancels a pending notification so a disposed control never calls back into its parent.
    /// </remarks>
    public void Dispose()
    {
        objDebounceCts?.Cancel();
        objDebounceCts?.Dispose();
        objDebounceCts = null;
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Handles the change event (fired when input loses focus).
    /// </summary>
    private static async Task HandleChange(ChangeEventArgs args) =>
        await Task.CompletedTask;

    /// <summary>
    /// Invokes the OnInputRef callback after first render.
    /// </summary>
    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender && OnInputRef != null)
        {
            OnInputRef.Invoke(objInputRef);
        }
    }
}
