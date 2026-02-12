using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using System.Collections.Generic;

namespace TrBlazeUI.Components.Toolbar;

/// <summary>
/// Groups related toolbar items together within a Toolbar.
/// </summary>
/// <remarks>
/// <para>
/// ToolbarGroup provides a logical and visual grouping for related toolbar items.
/// Items within a group are displayed adjacent to each other. Use ToolbarSeparator
/// between groups to create visual divisions.
/// </para>
/// <para>
/// Features:
/// - Flex container for grouped items
/// - ARIA role="group" for accessibility
/// - Automatic gap spacing inherited from parent Toolbar variant
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;ToolbarGroup AriaLabel="File actions"&gt;
///     &lt;ToolbarButton AriaLabel="New"&gt;...&lt;/ToolbarButton&gt;
///     &lt;ToolbarButton AriaLabel="Open"&gt;...&lt;/ToolbarButton&gt;
/// &lt;/ToolbarGroup&gt;
/// </code>
/// </example>
public partial class ToolbarGroup : ComponentBase
{
    /// <summary>
    /// Gets or sets the ARIA label for this group.
    /// </summary>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the content to render inside the group.
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes for the group container.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes for the group element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the group element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        "flex items-center gap-0.5",
        Class
    );
}
