using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace TrBlazeUI.Components.Input;

/// <summary>
/// An input component that follows the shadcn/ui design system.
/// </summary>
/// <remarks>
/// <para>
/// The Input component provides a customizable, accessible form input that supports
/// multiple input types and states. It follows WCAG 2.1 AA standards
/// for accessibility and integrates with Blazor's data binding system.
/// </para>
/// <para>
/// Features:
/// - Multiple input types (text, email, password, number, tel, url, file, search, date, time)
/// - File input styling with custom pseudo-selectors
/// - Error state visualization via aria-invalid attribute
/// - Smooth color transitions for state changes
/// - Disabled and required states
/// - Placeholder text support
/// - Two-way data binding with Value/ValueChanged
/// - Full ARIA attribute support
/// - RTL (Right-to-Left) support
/// - Dark mode compatible via CSS variables
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;Input Type="InputType.Text" @bind-Value="userName" Placeholder="Enter your name" /&gt;
///
/// &lt;Input Type="InputType.Email" Value="@email" ValueChanged="HandleEmailChange" Required="true" AriaInvalid="@hasError" /&gt;
/// </code>
/// </example>
public partial class Input : ComponentBase, IDisposable
{
    /// <summary>
    /// Gets or sets the type of input.
    /// </summary>
    /// <remarks>
    /// Determines the HTML input type attribute.
    /// Default value is <see cref="InputType.Text"/>.
    /// </remarks>
    [Parameter]
    public InputType Type { get; set; } = InputType.Text;

    /// <summary>
    /// Gets or sets the current value of the input.
    /// </summary>
    /// <remarks>
    /// Supports two-way binding via @bind-Value syntax.
    /// </remarks>
    [Parameter]
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the input value changes.
    /// </summary>
    /// <remarks>
    /// This event is fired on every keystroke (oninput event).
    /// Use with Value parameter for two-way binding.
    /// </remarks>
    [Parameter]
    public EventCallback<string?> ValueChanged { get; set; }

    /// <summary>
    /// Gets or sets the placeholder text displayed when the input is empty.
    /// </summary>
    /// <remarks>
    /// Provides a hint to the user about what to enter.
    /// Should not be used as a replacement for a label.
    /// </remarks>
    [Parameter]
    public string? Placeholder { get; set; }

    /// <summary>
    /// Gets or sets whether the input is disabled.
    /// </summary>
    /// <remarks>
    /// When disabled:
    /// - Input cannot be focused or edited
    /// - Cursor is set to not-allowed
    /// - Opacity is reduced for visual feedback
    /// </remarks>
    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets whether the input is required.
    /// </summary>
    /// <remarks>
    /// When true, the HTML5 required attribute is set.
    /// Works with form validation and :invalid CSS pseudo-class.
    /// </remarks>
    [Parameter]
    public bool Required { get; set; }


    /// <summary>
    /// Gets or sets additional CSS classes to apply to the input.
    /// </summary>
    /// <remarks>
    /// Custom classes are appended after the component's base classes,
    /// allowing for style overrides and extensions.
    /// </remarks>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the visible label text for the input.
    /// </summary>
    /// <remarks>
    /// When provided, a &lt;label&gt; element is rendered immediately before the input and
    /// associated with it via the label's 'for' attribute (an id is generated when the
    /// <see cref="Id"/> parameter is not set). This gives the input both a visible label
    /// and an accessible name.
    /// </remarks>
    [Parameter]
    public string? Label { get; set; }

    /// <summary>
    /// Gets or sets the HTML id attribute for the input element.
    /// </summary>
    /// <remarks>
    /// Used to associate the input with a label element via the label's 'for' attribute.
    /// This is essential for accessibility and allows clicking the label to focus the input.
    /// </remarks>
    [Parameter]
    public string? Id { get; set; }

    /// <summary>
    /// Gets or sets the ARIA label for the input.
    /// </summary>
    /// <remarks>
    /// Provides an accessible name for screen readers.
    /// Use when there is no visible label element.
    /// </remarks>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the ID of the element that describes the input.
    /// </summary>
    /// <remarks>
    /// References the id of an element containing help text or error messages.
    /// Improves screen reader experience by associating descriptive text.
    /// </remarks>
    [Parameter]
    public string? AriaDescribedBy { get; set; }

    /// <summary>
    /// Gets or sets whether the input value is invalid.
    /// </summary>
    /// <remarks>
    /// When true, aria-invalid="true" is set.
    /// Should be set based on validation state.
    /// </remarks>
    [Parameter]
    public bool? AriaInvalid { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the input element.
    /// </summary>
    /// <remarks>
    /// Combines:
    /// - Base input styles (flex, rounded, border, transitions, focus states)
    /// - File input pseudo-selector styling for better file input appearance
    /// - aria-invalid pseudo-selector for error state styling with destructive colors
    /// - Smooth color transitions for state changes
    /// - Custom classes from the Class parameter
    /// Uses the cn() utility for intelligent class merging and Tailwind conflict resolution.
    /// </remarks>
    private string CssClass => ClassNames.cn(
        // Base input styles (from shadcn/ui)
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base",
        "ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // aria-invalid state styling (destructive error colors)
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive",
        // Smooth transitions for state changes
        "transition-colors",
        // Medium screens and up: smaller text
        "md:text-sm",
        // Custom classes (if provided)
        Class
    );

    /// <summary>
    /// Generated id used to associate the rendered label with the input
    /// when a Label is provided but no explicit Id is set.
    /// </summary>
    private string? objGeneratedId;

    /// <summary>
    /// Gets the effective id for the input element: the explicit <see cref="Id"/> when set,
    /// otherwise a generated id when a <see cref="Label"/> requires the association,
    /// otherwise null (no id attribute is rendered).
    /// </summary>
    private string? EffectiveId
    {
        get
        {
            if (!string.IsNullOrEmpty(Id))
            {
                return Id;
            }

            if (string.IsNullOrEmpty(Label))
            {
                return null;
            }

            objGeneratedId ??= $"trblazeui-input-{Guid.NewGuid():N}";
            return objGeneratedId;
        }
    }

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
    /// Handles the change event (fired when input loses focus).
    /// </summary>
    /// <param name="args">The change event arguments.</param>
    private static async Task HandleChange(ChangeEventArgs args) =>
        // Change event is already handled by HandleInput for immediate updates
        // This is here for compatibility and potential future use
        await Task.CompletedTask;

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
