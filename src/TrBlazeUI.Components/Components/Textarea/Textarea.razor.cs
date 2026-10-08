using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace TrBlazeUI.Components.Textarea;

/// <summary>
/// A textarea component that follows the shadcn/ui design system.
/// </summary>
/// <remarks>
/// <para>
/// The Textarea component provides a customizable, accessible multi-line text input that
/// supports various states and features. It follows WCAG 2.1 AA standards
/// for accessibility and integrates with Blazor's data binding system.
/// </para>
/// <para>
/// Features:
/// - Multi-line text input with automatic content sizing
/// - Two-way data binding with Value/ValueChanged
/// - Character limit support via MaxLength parameter
/// - Error state visualization via aria-invalid attribute
/// - Smooth color and shadow transitions for state changes
/// - Disabled and required states
/// - Placeholder text support
/// - Full ARIA attribute support
/// - RTL (Right-to-Left) support
/// - Dark mode compatible via CSS variables
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;Textarea @bind-Value="description" Placeholder="Enter your description" /&gt;
///
/// &lt;Textarea Value="@comment" ValueChanged="HandleCommentChange" MaxLength="500" Required="true" AriaInvalid="@hasError" /&gt;
/// </code>
/// </example>
public partial class Textarea : ComponentBase, IDisposable
{
    /// <summary>
    /// Gets or sets the current value of the textarea.
    /// </summary>
    /// <remarks>
    /// Supports two-way binding via @bind-Value syntax.
    /// </remarks>
    [Parameter]
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the textarea value changes.
    /// </summary>
    /// <remarks>
    /// This event is fired on every keystroke (oninput event).
    /// Use with Value parameter for two-way binding.
    /// </remarks>
    [Parameter]
    public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>
    /// Gets or sets the placeholder text displayed when the textarea is empty.
    /// </summary>
    /// <remarks>
    /// Provides a hint to the user about what to enter.
    /// Should not be used as a replacement for a label.
    /// </remarks>
    [Parameter]
    public string? Placeholder { get; set; }

    /// <summary>
    /// Gets or sets whether the textarea is disabled.
    /// </summary>
    /// <remarks>
    /// When disabled:
    /// - Textarea cannot be focused or edited
    /// - Cursor is set to not-allowed
    /// - Opacity is reduced for visual feedback
    /// </remarks>
    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets whether the textarea is required.
    /// </summary>
    /// <remarks>
    /// When true, the HTML5 required attribute is set.
    /// Works with form validation and :invalid CSS pseudo-class.
    /// </remarks>
    [Parameter]
    public bool Required { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of characters allowed in the textarea.
    /// </summary>
    /// <remarks>
    /// When set, the HTML5 maxlength attribute is applied.
    /// Browser will prevent users from entering more than this many characters.
    /// </remarks>
    [Parameter]
    public int? MaxLength { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the textarea.
    /// </summary>
    /// <remarks>
    /// Custom classes are appended after the component's base classes,
    /// allowing for style overrides and extensions.
    /// </remarks>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the HTML id attribute for the textarea element.
    /// </summary>
    /// <remarks>
    /// Used to associate the textarea with a label element via the label's 'for' attribute.
    /// This is essential for accessibility and allows clicking the label to focus the textarea.
    /// </remarks>
    [Parameter]
    public string? Id { get; set; }

    /// <summary>
    /// Gets or sets the ARIA label for the textarea.
    /// </summary>
    /// <remarks>
    /// Provides an accessible name for screen readers.
    /// Use when there is no visible label element.
    /// </remarks>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the ID of the element that describes the textarea.
    /// </summary>
    /// <remarks>
    /// References the id of an element containing help text or error messages.
    /// Improves screen reader experience by associating descriptive text.
    /// </remarks>
    [Parameter]
    public string? AriaDescribedBy { get; set; }

    /// <summary>
    /// Gets or sets whether the textarea value is invalid.
    /// </summary>
    /// <remarks>
    /// When true, aria-invalid="true" is set.
    /// Should be set based on validation state.
    /// Triggers destructive color styling for error states.
    /// </remarks>
    [Parameter]
    public bool? AriaInvalid { get; set; }

    /// <summary>
    /// Gets or sets the starting height of the box, in lines of text.
    /// </summary>
    /// <remarks>
    /// <para>
    /// Rendered as the <c>rows</c> attribute and as a matching minimum height, so the box opens at
    /// this many lines and grows from there as text is typed (the component sizes itself to its
    /// content through CSS <c>field-sizing: content</c>, Chromium 123+ and Safari 18.x). In a browser
    /// without that property the box stays at <c>Rows</c> lines and scrolls, as a plain textarea does.
    /// </para>
    /// <para>
    /// Left unset, the box keeps its default minimum height of 4rem. Chat composers and comment boxes
    /// that must start small and grow are the case this serves (Sevak TR-026).
    /// </para>
    /// </remarks>
    [Parameter]
    public int? Rows { get; set; }

    /// <summary>
    /// Gets or sets the height, in lines of text, past which the box stops growing and scrolls.
    /// </summary>
    /// <remarks>
    /// Rendered as an inline <c>max-height</c> of that many lines plus the box's padding and border,
    /// so the cap follows the text size the box actually renders at. Works with or without
    /// <see cref="Rows"/>. Left unset, the box grows with its content without limit (Sevak TR-026).
    /// </remarks>
    [Parameter]
    public int? MaxRows { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    // The box is border-box, so a height of N lines is N line-heights plus the vertical padding
    // (py-2 = 1rem) plus the two 1px borders. `lh` is the element's own line-height, so the cap is
    // right at every text size without measuring anything.
    private static string LinesToHeight(int aLines) => $"calc({aLines}lh + 1rem + 2px)";

    /// <summary>
    /// Gets the inline style the sizing parameters need, merged with any style the caller passed.
    /// </summary>
    private string? InlineStyle
    {
        get
        {
            var vParts = new List<string>(3);

            if (AdditionalAttributes is not null
                && AdditionalAttributes.TryGetValue("style", out var vCallerStyle)
                && vCallerStyle is string vCallerText
                && !string.IsNullOrWhiteSpace(vCallerText))
            {
                vParts.Add(vCallerText.TrimEnd().TrimEnd(';'));
            }

            if (Rows is > 0)
            {
                vParts.Add($"min-height: {LinesToHeight(Rows.Value)}");
            }

            if (MaxRows is > 0)
            {
                vParts.Add($"max-height: {LinesToHeight(MaxRows.Value)}");
            }

            return vParts.Count == 0 ? null : string.Join("; ", vParts);
        }
    }

    /// <summary>
    /// Gets the caller's attributes with <c>style</c> replaced by the merged inline style, so a
    /// caller's own style and the sizing parameters both land on the element.
    /// </summary>
    private IReadOnlyDictionary<string, object>? EffectiveAttributes
    {
        get
        {
            var vStyle = InlineStyle;
            if (vStyle is null)
            {
                return AdditionalAttributes;
            }

            var vMerged = AdditionalAttributes is null
                ? new Dictionary<string, object>(1)
                : new Dictionary<string, object>(AdditionalAttributes);
            vMerged["style"] = vStyle;
            return vMerged;
        }
    }

    /// <summary>
    /// Gets the computed CSS classes for the textarea element.
    /// </summary>
    /// <remarks>
    /// Combines shadcn/ui v4 textarea styles:
    /// - field-sizing-content for automatic content-based sizing
    /// - min-h-16 for minimum height (4rem)
    /// - Base styles (flex, rounded, border, padding, transitions)
    /// - Focus states with ring effects
    /// - aria-invalid pseudo-selector for error state styling
    /// - Dark mode support via CSS variables
    /// - Smooth transitions for color and box-shadow
    /// - Custom classes from the Class parameter
    /// Uses the cn() utility for intelligent class merging and Tailwind conflict resolution.
    /// </remarks>
    private string CssClass => ClassNames.cn(
        // Base textarea styles (from shadcn/ui v4). With Rows set, the rows attribute and its inline
        // min-height give the starting height, so the 4rem minimum must not win over them.
        "flex field-sizing-content w-full rounded-md border border-input",
        Rows is > 0 ? null : "min-h-16",
        "bg-transparent dark:bg-input/30 px-3 py-2 text-base shadow-xs",
        "placeholder:text-muted-foreground",
        // Focus states
        "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        // Error states (aria-invalid)
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20",
        "dark:aria-[invalid=true]:ring-destructive/40",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Smooth transitions
        "transition-[color,box-shadow]",
        // Responsive text sizing
        "md:text-sm",
        // Custom classes (if provided)
        Class
    );

    /// <summary>
    /// Handles the input event (fired on every keystroke).
    /// </summary>
    /// <param name="args">The change event arguments.</param>
    private async Task HandleInput(ChangeEventArgs args)
    {
        var newValue = args.Value?.ToString();

        // Record what the DOM now holds BEFORE Value changes, so the render that follows this
        // event does not write the (already stale) echo back over what the user is typing.
        objValueSync.OnUserInput(newValue);
        Value = newValue;

        await NotifyValueChangedAsync(newValue);
    }

    /// <summary>
    /// Keeps the DOM value out of sync with the server's echo of the user's own keystrokes.
    /// </summary>
    private readonly TextValueSync objValueSync = new();

    private CancellationTokenSource? objDebounceCts;

    /// <summary>
    /// Gets or sets how long, in milliseconds, to wait after the last keystroke before raising
    /// <c>ValueChanged</c>.
    /// </summary>
    /// <remarks>
    /// Zero (the default) raises the callback on every keystroke. A value in the 150-300 ms range
    /// cuts the per-keystroke round trips a Blazor <b>Server</b> circuit would otherwise make.
    /// The control's own DOM value is never debounced - only the notification to the parent is.
    /// </remarks>
    [Parameter]
    public int DebounceMilliseconds { get; set; }

    /// <inheritdoc />
    protected override void OnParametersSet() => objValueSync.OnValueSupplied(Value);

    private void HandleFocus() => objValueSync.OnFocus();

    private void HandleBlur() => objValueSync.OnBlur();

    /// <summary>
    /// Releases the debounce timer.
    /// </summary>
    public void Dispose()
    {
        objDebounceCts?.Cancel();
        objDebounceCts?.Dispose();
        objDebounceCts = null;
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Raises <c>ValueChanged</c>, honouring <see cref="DebounceMilliseconds"/>.
    /// </summary>
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
}
