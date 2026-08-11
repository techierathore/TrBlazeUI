using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;

namespace TrBlazeUI.Components.Item;

/// <summary>
/// A horizontal divider element for separating items in a list.
/// </summary>
/// <remarks>
/// ItemSeparator uses the Separator component with specific margin utilities
/// to create visual separation between items.
/// </remarks>
public partial class ItemSeparator : ComponentBase
{
    /// <summary>
    /// Gets or sets additional CSS classes to apply to the separator.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the separator element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        "my-1",
        Class
    );

    /// <summary>
    /// Gets or sets additional HTML attributes (id, style, data-*, aria-*, event handlers)
    /// forwarded to the rendered root element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
