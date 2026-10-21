using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Card;

/// <summary>
/// The header section of a card component.
/// </summary>
/// <remarks>
/// <para>
/// CardHeader provides a distinct top section for card content, typically containing
/// a title, description, and optional action elements. It uses a grid layout that gains
/// a second column only when a <see cref="CardAction"/> is present, matching shadcn/ui.
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;CardHeader&gt;
///     &lt;CardTitle&gt;Card Title&lt;/CardTitle&gt;
///     &lt;CardDescription&gt;Card description&lt;/CardDescription&gt;
/// &lt;/CardHeader&gt;
/// </code>
/// </example>
public partial class CardHeader : ComponentBase
{
    private readonly CardHeaderContext objContext = new();

    /// <summary>
    /// Gets or sets the content to be rendered inside the card header.
    /// </summary>
    /// <remarks>
    /// Typically contains CardTitle, CardDescription, and optionally CardAction.
    /// </remarks>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the card header.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the card header element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        // Base header styles (from shadcn/ui). Render as a single-column grid by default so a
        // CardDescription stays under the CardTitle (Lekhak TR-010). When a CardAction is present,
        // the action registers itself through the cascading context and the second column appears
        // so the action sits at the right edge of the title row (Lekhak TR-009).
        "grid gap-1.5 p-6 items-start",
        objContext.HasAction ? "grid-cols-[1fr_auto]" : null,
        // Custom classes (if provided)
        Class
    );
}
