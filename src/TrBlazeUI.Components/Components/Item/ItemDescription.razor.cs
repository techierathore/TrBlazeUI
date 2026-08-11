using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Item;

/// <summary>
/// Renders secondary text/description with line clamping.
/// </summary>
/// <remarks>
/// ItemDescription displays supporting text with muted foreground colors
/// and line-clamp for overflow control.
/// </remarks>
public partial class ItemDescription : ComponentBase
{
    /// <summary>
    /// Gets or sets additional CSS classes to apply to the description.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets the content to be rendered as the description.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the description element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        "line-clamp-2 text-sm text-muted-foreground",
        Class
    );

    /// <summary>
    /// Gets or sets additional HTML attributes (id, style, data-*, aria-*, event handlers)
    /// forwarded to the rendered root element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
