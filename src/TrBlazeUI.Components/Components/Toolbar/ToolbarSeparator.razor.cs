using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using System.Collections.Generic;

namespace TrBlazeUI.Components.Toolbar;

/// <summary>
/// A vertical (or horizontal) separator line within a Toolbar to visually divide groups.
/// </summary>
/// <remarks>
/// <para>
/// Renders a thin line between toolbar groups. Automatically selects vertical orientation
/// when inside a horizontal toolbar and horizontal when inside a vertical toolbar.
/// Uses role="separator" with aria-orientation for accessibility.
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;Toolbar&gt;
///     &lt;ToolbarGroup&gt;...&lt;/ToolbarGroup&gt;
///     &lt;ToolbarSeparator /&gt;
///     &lt;ToolbarGroup&gt;...&lt;/ToolbarGroup&gt;
/// &lt;/Toolbar&gt;
/// </code>
/// </example>
public partial class ToolbarSeparator : ComponentBase
{
    /// <summary>
    /// Gets or sets whether this separator is vertical. Default is true (vertical line in a horizontal toolbar).
    /// </summary>
    [Parameter]
    public bool Vertical { get; set; } = true;

    /// <summary>
    /// Gets or sets additional CSS classes for the separator.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes for the separator element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the separator element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        "shrink-0 bg-border",
        Vertical ? "w-[1px] self-stretch my-1" : "h-[1px] self-stretch mx-1",
        Class
    );
}
