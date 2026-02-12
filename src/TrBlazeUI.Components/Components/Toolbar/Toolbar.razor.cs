using TrBlazeUI.Components.Utilities;
using Microsoft.AspNetCore.Components;
using System.Collections.Generic;

namespace TrBlazeUI.Components.Toolbar;

/// <summary>
/// A toolbar component for grouping action buttons, controls, and quick-access tools.
/// </summary>
/// <remarks>
/// <para>
/// The Toolbar component provides a horizontal (or vertical) container for action buttons,
/// dropdown triggers, separators, and grouped controls. Designed for desktop and hybrid
/// Blazor applications where quick-access toolbars are needed (e.g., document editors,
/// IDE-like layouts, admin panels).
/// </para>
/// <para>
/// Features:
/// - Horizontal and vertical orientation
/// - Three density variants (Default, Compact, Dense)
/// - Composed of ToolbarGroup, ToolbarButton, ToolbarToggleButton, and ToolbarSeparator
/// - Proper ARIA role="toolbar" with aria-orientation for accessibility
/// - Arrow key navigation between focusable items (Left/Right for horizontal, Up/Down for vertical)
/// - Automatic border, background, and shadow styling via Tailwind
/// - Dark mode support via CSS variables
/// - Supports any child content (Button, DropdownMenu, Select, etc.)
/// </para>
/// </remarks>
/// <example>
/// <code>
/// &lt;Toolbar AriaLabel="Document actions"&gt;
///     &lt;ToolbarGroup&gt;
///         &lt;ToolbarButton AriaLabel="New" OnClick="HandleNew"&gt;
///             &lt;LucideIcon Name="file-plus" Size="16" /&gt;
///         &lt;/ToolbarButton&gt;
///         &lt;ToolbarButton AriaLabel="Open" OnClick="HandleOpen"&gt;
///             &lt;LucideIcon Name="folder-open" Size="16" /&gt;
///         &lt;/ToolbarButton&gt;
///         &lt;ToolbarButton AriaLabel="Save" OnClick="HandleSave"&gt;
///             &lt;LucideIcon Name="save" Size="16" /&gt;
///         &lt;/ToolbarButton&gt;
///     &lt;/ToolbarGroup&gt;
///     &lt;ToolbarSeparator /&gt;
///     &lt;ToolbarGroup&gt;
///         &lt;ToolbarButton AriaLabel="Undo" OnClick="HandleUndo"&gt;
///             &lt;LucideIcon Name="undo-2" Size="16" /&gt;
///         &lt;/ToolbarButton&gt;
///         &lt;ToolbarButton AriaLabel="Redo" OnClick="HandleRedo"&gt;
///             &lt;LucideIcon Name="redo-2" Size="16" /&gt;
///         &lt;/ToolbarButton&gt;
///     &lt;/ToolbarGroup&gt;
/// &lt;/Toolbar&gt;
/// </code>
/// </example>
public partial class Toolbar : ComponentBase
{
    /// <summary>
    /// Gets or sets the visual density variant of the toolbar.
    /// </summary>
    /// <remarks>
    /// Controls padding and gap sizing. Default provides comfortable spacing.
    /// Compact and Dense reduce spacing for information-dense UIs.
    /// Default value is <see cref="ToolbarVariant.Default"/>.
    /// </remarks>
    [Parameter]
    public ToolbarVariant Variant { get; set; } = ToolbarVariant.Default;

    /// <summary>
    /// Gets or sets whether the toolbar is horizontal or vertical.
    /// </summary>
    /// <remarks>
    /// When true, items stack vertically. Default is false (horizontal).
    /// Arrow key navigation direction changes accordingly.
    /// </remarks>
    [Parameter]
    public bool Vertical { get; set; }

    /// <summary>
    /// Gets or sets the ARIA label for the toolbar.
    /// </summary>
    /// <remarks>
    /// Provides an accessible name for the toolbar. Required for accessibility.
    /// Describes the toolbar's purpose (e.g., "Document actions", "Formatting tools").
    /// </remarks>
    [Parameter]
    public string? AriaLabel { get; set; }

    /// <summary>
    /// Gets or sets the content to render inside the toolbar.
    /// </summary>
    /// <remarks>
    /// Typically contains ToolbarGroup, ToolbarButton, ToolbarSeparator,
    /// ToolbarToggleButton, or any other controls (DropdownMenu, Select, etc.).
    /// </remarks>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>
    /// Gets or sets additional CSS classes for the toolbar container.
    /// </summary>
    [Parameter]
    public string? Class { get; set; }

    /// <summary>
    /// Gets or sets additional HTML attributes for the toolbar element.
    /// </summary>
    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    /// <summary>
    /// Gets the computed CSS classes for the toolbar element.
    /// </summary>
    private string CssClass => ClassNames.cn(
        // Base styles
        "flex items-center border bg-background rounded-md shadow-sm",

        // Orientation
        Vertical ? "flex-col" : "flex-row",

        // Variant-specific padding and gap
        Variant switch
        {
            ToolbarVariant.Compact => "p-1.5 gap-1.5",
            ToolbarVariant.Dense => "p-1 gap-1",
            _ => "p-2 gap-2"
        },

        // Custom classes
        Class
    );
}
