using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TrBlazeUI.Components.Toolbar;

/// <summary>
/// A toolbar-styled action button, typically used with an icon for quick actions.
/// </summary>
/// <remarks>
/// <para>
/// ToolbarButton provides a compact, icon-friendly button specifically designed for toolbar use.
/// It supports icon-only and icon+text layouts, tooltips via aria-label, and disabled state.
/// </para>
/// <para>
/// Features:
/// - Icon-only and icon+text modes
/// - Multiple visual variants (Default, Ghost, Outline)
/// - Disabled state with visual feedback
/// - Compact sizing optimized for toolbar density
/// - Full keyboard accessibility (Tab, Enter, Space)
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;ToolbarButton AriaLabel="Save" OnClick="HandleSave"&gt;
///     &lt;LucideIcon Name="save" Size="16" /&gt;
/// &lt;/ToolbarButton&gt;
///
/// &lt;ToolbarButton AriaLabel="Copy" OnClick="HandleCopy" Variant="ToolbarButtonVariant.Ghost"&gt;
///     &lt;LucideIcon Name="copy" Size="16" /&gt;
///     Copy
/// &lt;/ToolbarButton&gt;
/// </code>
/// </example>
public partial class ToolbarButton : ComponentBase
{
    /// <summary>
    /// Gets or sets the visual variant of the toolbar button.
    /// </summary>
    [Parameter]
    public ToolbarButtonVariant Variant { get; set; } = ToolbarButtonVariant.Default;

    /// <summary>
    /// Gets or sets the click event callback.
    /// </summary>
    [Parameter]
    public EventCallback<MouseEventArgs> OnClick { get; set; }

    /// <summary>
    /// Gets or sets whether the button is disabled.
    /// </summary>
    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets the ARIA label for the button.
    /// </summary>
    /// <remarks>
    /// Required for icon-only buttons. Provides accessible name for screen readers.
    /// </remarks>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the tooltip text. Defaults to AriaLabel if not set.
    /// </summary>
    [Parameter]
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the content (typically an icon, or icon + text).
    /// </summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the effective tooltip text.
    /// </summary>
    private string? EffectiveTitle => Title ?? AriaLabel;

    /// <summary>
    /// Gets the computed CSS classes for the button.
    /// </summary>
    private string CssClass => ClassNames.cn(
        // Base styles
        "inline-flex items-center justify-center gap-1.5 rounded-sm",
        "h-7 min-w-7 px-1.5 text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:pointer-events-none",

        // Variant-specific styles
        Variant switch
        {
            ToolbarButtonVariant.Ghost =>
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ToolbarButtonVariant.Outline =>
                "border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            _ => // Default
                "text-foreground hover:bg-accent hover:text-accent-foreground"
        },

        // Custom classes
        Class
    );

    /// <summary>
    /// Handles the button click event.
    /// </summary>
    private async Task HandleClick(MouseEventArgs args)
    {
        if (!Disabled && OnClick.HasDelegate)
        {
            await OnClick.InvokeAsync(args);
        }
    }
}
