using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Card;

/// <summary>
/// An action area within the card header for buttons, links, or other interactive elements.
/// </summary>
/// <remarks>
/// <para>
/// CardAction provides a dedicated space for action elements like buttons or links
/// within the card header, typically positioned to the right of the title/description.
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;CardAction&gt;
///     &lt;Button Size="ButtonSize.Small"&gt;Action&lt;/Button&gt;
/// &lt;/CardAction&gt;
/// </code>
/// </example>
public partial class CardAction : ComponentBase
{
    /// <summary>
    /// Gets or sets the content to be rendered in the card action area.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes to apply to the card action area.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes to apply to the element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the card action element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        // Position at the end of the title row when CardHeader renders the two-column grid
        // (Lekhak TR-009). The start margin replaces the header column gap so the spacing only
        // appears when an action is actually rendered.
        "col-start-2 row-start-1 row-span-2 self-start justify-self-end flex items-center gap-2 ms-4",
        // Custom classes (if provided)
        Class
    );
}
