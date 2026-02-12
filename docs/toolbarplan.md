# Toolbar Component - Orchestration Plan

**Date:** 2026-02-12
**Prepared by:** Mary (Business Analyst)
**Execution:** BMAD Orchestrator Agent - Single-Pass Implementation
**Repository:** TrBlazeUI (branch: Dev)
**Reference:** Visual Studio toolbar (see `uiIssues/TabBarExample.png`)

---

## Executive Summary

Add a **Toolbar** component to TrBlazeUI for use in desktop/hybrid Blazor applications. The toolbar provides a horizontal (or vertical) bar of action buttons, grouped controls, separators, and dropdown triggers - similar to the Visual Studio toolbar. This is a **styled component only** (no primitive needed). The implementation covers: the core component in the library, a full demo page in the demo app, registration in the component index, and updates to the AI reference documentation.

**Scope:** 3 work streams, all sequential (each builds on the previous).

---

## Work Stream 1: Core Toolbar Component

**Agent:** Dev
**Location:** `src/TrBlazeUI.Components/Components/Toolbar/`

### Sub-Components to Create

The Toolbar is a **compound component** (parent + children), following the same pattern as ButtonGroup but with richer child types.

| # | File | Purpose |
|---|------|---------|
| 1 | `Toolbar.razor` | Main container markup |
| 2 | `Toolbar.razor.cs` | Main container logic |
| 3 | `ToolbarGroup.razor` | Groups related items together (like button clusters) |
| 4 | `ToolbarGroup.razor.cs` | Group logic |
| 5 | `ToolbarSeparator.razor` | Vertical divider between groups |
| 6 | `ToolbarSeparator.razor.cs` | Separator logic |
| 7 | `ToolbarButton.razor` | Toolbar-styled action button (icon-only or icon+text) |
| 8 | `ToolbarButton.razor.cs` | Button logic with click handler and toggle support |
| 9 | `ToolbarToggleButton.razor` | Toggle-able toolbar button (e.g., Bold on/off) |
| 10 | `ToolbarToggleButton.razor.cs` | Toggle state management |
| 11 | `ToolbarVariant.cs` | Enum: Default, Compact, Dense |
| 12 | `ToolbarButtonVariant.cs` | Enum: Default, Ghost, Outline |

### Step 1.1: Create `ToolbarVariant.cs`

```csharp
namespace TrBlazeUI.Components.Toolbar;

/// <summary>
/// Defines the visual density variants for the Toolbar component.
/// </summary>
public enum ToolbarVariant
{
    /// <summary>
    /// Default spacing with comfortable padding (p-2, gap-2).
    /// </summary>
    Default,

    /// <summary>
    /// Compact spacing with reduced padding (p-1.5, gap-1.5).
    /// </summary>
    Compact,

    /// <summary>
    /// Dense spacing with minimal padding (p-1, gap-1). Ideal for desktop apps with limited vertical space.
    /// </summary>
    Dense
}
```

### Step 1.2: Create `ToolbarButtonVariant.cs`

```csharp
namespace TrBlazeUI.Components.Toolbar;

/// <summary>
/// Defines the visual variants for toolbar buttons.
/// </summary>
public enum ToolbarButtonVariant
{
    /// <summary>
    /// Default toolbar button with subtle hover background.
    /// </summary>
    Default,

    /// <summary>
    /// Ghost variant with no background, only hover effect.
    /// </summary>
    Ghost,

    /// <summary>
    /// Outlined variant with a visible border.
    /// </summary>
    Outline
}
```

### Step 1.3: Create `Toolbar.razor.cs`

**Pattern reference:** `src/TrBlazeUI.Components/Components/ButtonGroup/ButtonGroup.razor.cs`

```csharp
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
```

### Step 1.4: Create `Toolbar.razor`

```razor
@namespace TrBlazeUI.Components.Toolbar

<div
    data-slot="toolbar"
    role="toolbar"
    aria-label="@AriaLabel"
    aria-orientation="@(Vertical ? "vertical" : "horizontal")"
    class="@CssClass"
    @attributes="AdditionalAttributes">
    @ChildContent
</div>
```

### Step 1.5: Create `ToolbarGroup.razor.cs`

```csharp
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
```

### Step 1.6: Create `ToolbarGroup.razor`

```razor
@namespace TrBlazeUI.Components.Toolbar

<div
    data-slot="toolbar-group"
    role="group"
    aria-label="@AriaLabel"
    class="@CssClass"
    @attributes="AdditionalAttributes">
    @ChildContent
</div>
```

### Step 1.7: Create `ToolbarSeparator.razor.cs`

```csharp
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
```

### Step 1.8: Create `ToolbarSeparator.razor`

```razor
@namespace TrBlazeUI.Components.Toolbar

<div
    data-slot="toolbar-separator"
    role="separator"
    aria-orientation="@(Vertical ? "vertical" : "horizontal")"
    class="@CssClass"
    @attributes="AdditionalAttributes">
</div>
```

### Step 1.9: Create `ToolbarButton.razor.cs`

```csharp
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
```

### Step 1.10: Create `ToolbarButton.razor`

```razor
@namespace TrBlazeUI.Components.Toolbar

<button
    data-slot="toolbar-button"
    type="button"
    class="@CssClass"
    aria-label="@AriaLabel"
    title="@EffectiveTitle"
    disabled="@Disabled"
    @onclick="HandleClick"
    @attributes="AdditionalAttributes">
    @ChildContent
</button>
```

### Step 1.11: Create `ToolbarToggleButton.razor.cs`

```csharp
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
```

### Step 1.12: Create `ToolbarToggleButton.razor`

```razor
@namespace TrBlazeUI.Components.Toolbar

<button
    data-slot="toolbar-toggle-button"
    type="button"
    class="@CssClass"
    aria-label="@AriaLabel"
    aria-pressed="@IsPressed.ToString().ToLowerInvariant()"
    title="@EffectiveTitle"
    disabled="@Disabled"
    @onclick="HandleClick"
    @attributes="AdditionalAttributes">
    @ChildContent
</button>
```

### Step 1.13: Build Verification

After creating all files, run:

```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" build "C:\3AIGenCode\TrBlazeUI\src\TrBlazeUI.Components\TrBlazeUI.Components.csproj" -c Release -p:CI=true
```

**Expected:** 0 errors, 0 warnings. Fix any issues before proceeding.

---

## Work Stream 2: Demo Page

**Agent:** Dev
**Depends on:** WS-1 complete and building

### Step 2.1: Create Demo Page

**File:** `demos/TrBlazeUI.Demo.Shared/Pages/Components/ToolbarDemo.razor`
**Route:** `@page "/components/toolbar"`

The demo page should follow the exact pattern of `ButtonGroupDemo.razor` with these sections:

#### Section Structure

1. **Header** - Title "Toolbar" + description about desktop/hybrid app quick actions
2. **Basic Toolbar** - Simple toolbar with icon-only buttons (New, Open, Save) in a group
3. **Multiple Groups with Separators** - File actions | Edit actions (Undo/Redo) | View actions, separated by ToolbarSeparator
4. **Toolbar Variants** - Show Default, Compact, and Dense side by side
5. **Toolbar with Text Buttons** - Buttons showing icon + text label
6. **Toggle Buttons** - Text formatting toolbar (Bold, Italic, Underline, Strikethrough) with @bind-IsPressed
7. **Toolbar with Dropdowns** - Mix ToolbarButton with existing DropdownMenu component (e.g., a "Debug" dropdown and a "Platform" dropdown, mimicking the VS toolbar)
8. **Vertical Toolbar** - Demonstrate Vertical=true for side-mounted toolbars
9. **Toolbar Button Variants** - Default, Ghost, Outline button styles
10. **Disabled State** - Show disabled buttons within a toolbar
11. **Real-World Example: Document Editor Toolbar** - Full-featured toolbar combining groups, separators, toggle buttons, dropdowns, mimicking a document editor (File | Formatting | Insert | View)
12. **Real-World Example: IDE-Style Toolbar** - Mimicking the Visual Studio reference screenshot with Run/Debug controls, project selector, navigation buttons

#### Code Block Requirements

Each section needs a `@code` block managing the relevant state:

```csharp
@code {
    // Toggle states for formatting example
    private bool objIsBold;
    private bool objIsItalic;
    private bool objIsUnderline;
    private bool objIsStrikethrough;

    // Click handler for action feedback
    private string objLastAction = "";
    private void HandleAction(string action)
    {
        objLastAction = action;
        StateHasChanged();
    }
}
```

#### Required Usings at Top of File

```razor
@page "/components/toolbar"
@using TrBlazeUI.Components.Toolbar
@using TrBlazeUI.Components.Button
@using TrBlazeUI.Components.DropdownMenu
@using TrBlazeUI.Components.Separator
@using TrBlazeUI.Components.Tooltip
@using TrBlazeUI.Icons.Lucide.Components
```

### Step 2.2: Add Toolbar to Component Index Page

**File:** `demos/TrBlazeUI.Demo.Shared/Pages/Components/Index.razor`

Add the Toolbar entry in alphabetical position (between Toast and Toggle) in the component grid:

```razor
<!-- Toolbar -->
<a href="/components/toolbar" class="group p-5 border rounded-lg hover:border-primary hover:bg-accent transition-colors no-underline">
    <h3 class="font-semibold text-lg mb-2 group-hover:text-primary">Toolbar</h3>
    <p class="text-sm text-muted-foreground">
        Action bar with grouped buttons, separators, and controls for desktop apps
    </p>
</a>
```

### Step 2.3: Add Toolbar to Sidebar Navigation

Find the sidebar navigation file that lists component links (check `demos/TrBlazeUI.Demo.Shared/Shared/` for the sidebar or nav component) and add a "Toolbar" entry linking to `/components/toolbar` in alphabetical order alongside other components.

### Step 2.4: Build and Verify Demo

```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" build "C:\3AIGenCode\TrBlazeUI\TrBlazeUI.sln" -c Release -p:CI=true
```

**Expected:** Full solution builds with 0 errors, 0 warnings.

---

## Work Stream 3: Documentation Updates

**Agent:** Dev
**Depends on:** WS-1 and WS-2 complete

### Step 3.1: Update AI Component Reference

**File:** `docs/TrBlazeUI-AI-Reference.md`

Add a new **Toolbar** section in the appropriate alphabetical location within the document. Follow the existing documentation pattern (see how ButtonGroup is documented). Include:

#### Section Content

```markdown
### Toolbar

Action toolbar for desktop/hybrid applications with grouped buttons, separators, and controls.

**Import:** `@using TrBlazeUI.Components.Toolbar`

#### Basic Toolbar

\```razor
<Toolbar AriaLabel="File actions">
    <ToolbarGroup>
        <ToolbarButton AriaLabel="New file" OnClick="HandleNew">
            <LucideIcon Name="file-plus" Size="16" />
        </ToolbarButton>
        <ToolbarButton AriaLabel="Open file" OnClick="HandleOpen">
            <LucideIcon Name="folder-open" Size="16" />
        </ToolbarButton>
        <ToolbarButton AriaLabel="Save" OnClick="HandleSave">
            <LucideIcon Name="save" Size="16" />
        </ToolbarButton>
    </ToolbarGroup>
    <ToolbarSeparator />
    <ToolbarGroup>
        <ToolbarButton AriaLabel="Undo" OnClick="HandleUndo">
            <LucideIcon Name="undo-2" Size="16" />
        </ToolbarButton>
        <ToolbarButton AriaLabel="Redo" OnClick="HandleRedo">
            <LucideIcon Name="redo-2" Size="16" />
        </ToolbarButton>
    </ToolbarGroup>
</Toolbar>
\```

#### Toolbar Variants

\```razor
<Toolbar Variant="ToolbarVariant.Default" AriaLabel="Default toolbar">...</Toolbar>
<Toolbar Variant="ToolbarVariant.Compact" AriaLabel="Compact toolbar">...</Toolbar>
<Toolbar Variant="ToolbarVariant.Dense" AriaLabel="Dense toolbar">...</Toolbar>
\```

#### Toggle Buttons (Formatting Toolbar)

\```razor
<Toolbar AriaLabel="Text formatting">
    <ToolbarGroup>
        <ToolbarToggleButton AriaLabel="Bold" @bind-IsPressed="objIsBold">
            <LucideIcon Name="bold" Size="16" />
        </ToolbarToggleButton>
        <ToolbarToggleButton AriaLabel="Italic" @bind-IsPressed="objIsItalic">
            <LucideIcon Name="italic" Size="16" />
        </ToolbarToggleButton>
        <ToolbarToggleButton AriaLabel="Underline" @bind-IsPressed="objIsUnderline">
            <LucideIcon Name="underline" Size="16" />
        </ToolbarToggleButton>
    </ToolbarGroup>
</Toolbar>
\```

#### With Dropdown Menus

\```razor
<Toolbar AriaLabel="IDE toolbar">
    <ToolbarGroup>
        <DropdownMenu>
            <DropdownMenuTrigger>
                <ToolbarButton AriaLabel="Build configuration">
                    Debug
                    <LucideIcon Name="chevron-down" Size="14" />
                </ToolbarButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Debug</DropdownMenuItem>
                <DropdownMenuItem>Release</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </ToolbarGroup>
    <ToolbarSeparator />
    <ToolbarGroup>
        <ToolbarButton AriaLabel="Start debugging" Class="text-green-600">
            <LucideIcon Name="play" Size="16" />
        </ToolbarButton>
    </ToolbarGroup>
</Toolbar>
\```

#### Vertical Toolbar

\```razor
<Toolbar Vertical AriaLabel="Side tools">
    <ToolbarButton AriaLabel="Select">
        <LucideIcon Name="mouse-pointer" Size="16" />
    </ToolbarButton>
    <ToolbarButton AriaLabel="Move">
        <LucideIcon Name="move" Size="16" />
    </ToolbarButton>
    <ToolbarSeparator Vertical="false" />
    <ToolbarButton AriaLabel="Zoom in">
        <LucideIcon Name="zoom-in" Size="16" />
    </ToolbarButton>
</Toolbar>
\```

#### Toolbar API

| Component | Key Parameters |
|-----------|---------------|
| `Toolbar` | `Variant` (Default/Compact/Dense), `Vertical` (bool), `AriaLabel`, `Class` |
| `ToolbarGroup` | `AriaLabel`, `Class` |
| `ToolbarButton` | `Variant` (Default/Ghost/Outline), `OnClick`, `Disabled`, `AriaLabel`, `Title`, `Class` |
| `ToolbarToggleButton` | `@bind-IsPressed`, `Disabled`, `AriaLabel`, `Title`, `Class` |
| `ToolbarSeparator` | `Vertical` (bool, default true), `Class` |
```

### Step 3.2: Update `_Imports.razor`

**File:** `demos/TrBlazeUI.Demo.Shared/_Imports.razor`

Add the Toolbar namespace import in alphabetical order:

```razor
@using TrBlazeUI.Components.Toolbar
```

### Step 3.3: Update the TrBlazeUI Skill Files

If the skill files at `docs/skills/claude-code-trblazeui.md` and `docs/skills/opencode-trblazeui.md` contain component lists, add Toolbar to those lists.

### Step 3.4: Final Full Build Verification

```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" build "C:\3AIGenCode\TrBlazeUI\TrBlazeUI.sln" -c Release -p:CI=true
```

**Expected:** 0 errors, 0 warnings across all projects.

---

## Implementation Checklist

| # | Task | Work Stream | Status |
|---|------|-------------|--------|
| 1 | Create `ToolbarVariant.cs` enum | WS-1 | PENDING |
| 2 | Create `ToolbarButtonVariant.cs` enum | WS-1 | PENDING |
| 3 | Create `Toolbar.razor` + `Toolbar.razor.cs` | WS-1 | PENDING |
| 4 | Create `ToolbarGroup.razor` + `ToolbarGroup.razor.cs` | WS-1 | PENDING |
| 5 | Create `ToolbarSeparator.razor` + `ToolbarSeparator.razor.cs` | WS-1 | PENDING |
| 6 | Create `ToolbarButton.razor` + `ToolbarButton.razor.cs` | WS-1 | PENDING |
| 7 | Create `ToolbarToggleButton.razor` + `ToolbarToggleButton.razor.cs` | WS-1 | PENDING |
| 8 | Verify component project builds | WS-1 | PENDING |
| 9 | Create `ToolbarDemo.razor` demo page | WS-2 | PENDING |
| 10 | Add Toolbar to component Index page | WS-2 | PENDING |
| 11 | Add Toolbar to sidebar navigation | WS-2 | PENDING |
| 12 | Verify full solution builds | WS-2 | PENDING |
| 13 | Add Toolbar section to `TrBlazeUI-AI-Reference.md` | WS-3 | PENDING |
| 14 | Add `@using TrBlazeUI.Components.Toolbar` to `_Imports.razor` | WS-3 | PENDING |
| 15 | Update skill files if component lists exist | WS-3 | PENDING |
| 16 | Final full build verification | WS-3 | PENDING |

---

## Technical Notes for the Implementing Agent

1. **Namespace:** All files use `namespace TrBlazeUI.Components.Toolbar;` (file-scoped)
2. **Coding standards:** Private fields use `obj` prefix (e.g., `objIsBold`). All public members need XML docs with `<summary>`, `<remarks>`, `<example>`.
3. **CSS approach:** Tailwind utilities only via `ClassNames.cn()`. No component-specific CSS files.
4. **Data attributes:** Use `data-slot="toolbar"`, `data-slot="toolbar-group"`, etc. for potential CSS targeting.
5. **ARIA:** `role="toolbar"` on main container, `role="group"` on groups, `role="separator"` on separators, `aria-pressed` on toggles.
6. **Build command:** Always use `"/mnt/c/Program Files/dotnet/dotnet.exe"` with Windows paths and `-p:CI=true` to skip Tailwind.
7. **TreatWarningsAsErrors** is enabled - all warnings must be resolved.
8. **Icons:** Use `LucideIcon` from `TrBlazeUI.Icons.Lucide.Components` with `Size="16"` for toolbar-appropriate sizing.
9. **No hot reload:** Application does not support hot reload. Build and restart to test changes.
10. **Existing components:** The toolbar can compose existing components (Button, DropdownMenu, Tooltip, Select) as children. Only create toolbar-specific sub-components.
