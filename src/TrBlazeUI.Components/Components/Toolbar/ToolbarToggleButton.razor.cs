using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TrBlazeUI.Components.Toolbar;

/// <summary>
/// A toggle-able toolbar button that maintains pressed/unpressed state.
/// </summary>
/// <remarks>
/// <para>
/// ToolbarToggleButton extends the toolbar button with toggle state management.
/// Ideal for formatting toggles (bold, italic), view mode toggles, or any
/// on/off toolbar action. Uses aria-pressed for accessibility.
/// </para>
/// <para>
/// Features:
/// - Two-way binding with IsPressed/IsPressedChanged
/// - Visual pressed state with accent background
/// - aria-pressed attribute for screen readers
/// - All features of ToolbarButton (variants, disabled, icon support)
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;ToolbarToggleButton AriaLabel="Bold" @bind-IsPressed="objIsBold"&gt;
///     &lt;LucideIcon Name="bold" Size="16" /&gt;
/// &lt;/ToolbarToggleButton&gt;
/// </code>
/// </example>
public partial class ToolbarToggleButton : ComponentBase
{
    /// <summary>
    /// Gets or sets whether the toggle button is in the pressed state.
    /// </summary>
    [Parameter]
    public bool IsPressed { get; set; }

    /// <summary>
    /// Gets or sets the callback invoked when the pressed state changes.
    /// </summary>
    [Parameter]
    public EventCallback<bool> IsPressedChanged { get; set; }

    /// <summary>
    /// Gets or sets whether the button is disabled.
    /// </summary>
    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>
    /// Gets or sets the ARIA label.
    /// </summary>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the tooltip text. Defaults to AriaLabel if not set.
    /// </summary>
    [Parameter]
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the content (typically an icon).
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
    /// Gets the computed CSS classes for the toggle button.
    /// </summary>
    private string CssClass => ClassNames.cn(
        // Base styles (same as ToolbarButton)
        "inline-flex items-center justify-center gap-1.5 rounded-sm",
        "h-7 min-w-7 px-1.5 text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:pointer-events-none",

        // State-dependent styling
        IsPressed
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",

        // Custom classes
        Class
    );

    /// <summary>
    /// Handles the toggle click.
    /// </summary>
    private async Task HandleClick(MouseEventArgs args)
    {
        if (!Disabled)
        {
            IsPressed = !IsPressed;
            if (IsPressedChanged.HasDelegate)
            {
                await IsPressedChanged.InvokeAsync(IsPressed);
            }
        }
    }
}
