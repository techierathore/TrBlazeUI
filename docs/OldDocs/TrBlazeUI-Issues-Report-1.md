# TrBlazeUI Issue Report: Dialog Component & Interactive Content

**Reporter:** AppStudio IDE Team
**TrBlazeUI Version:** 0.0.0-beta.0.8
**Target Framework:** .NET 10.0
**Host:** MAUI Blazor Hybrid (WebView2) on Windows
**Date:** 2026-02-17
**Last Updated:** 2026-02-17 (fix statuses updated)

---

## Executive Summary

When building the AppStudio IDE, we encountered **critical issues** with TrBlazeUI's `<Dialog>`, `<NativeSelect>`, and `<Input>` components that make them unusable in dialogs containing interactive content. We implemented custom workaround components to bypass these limitations.

> **Update:** Issues #1, #3, #4, and #5 have been **fixed in TrBlazeUI**. Issue #2 is a WebView2/MAUI platform limitation — use `<Select>` instead of `<NativeSelect>` inside overlays. All workaround components can now be migrated back to standard TrBlazeUI components.

### Workaround Components Created

| Component | Replaces | Location |
|-----------|----------|----------|
| `AppDialog` | `<Dialog>` | `Components/Shared/AppDialog.razor` |
| `SettingsSelect` | `<NativeSelect>` | `Components/Shared/SettingsSelect.razor` |
| Plain `<input class="settings-input">` | `<Input>` | CSS class in `ide-layout.css` |

---

## Issue 1: Dialog PortalHost Does Not Re-render on Internal State Changes (CRITICAL)

### Severity: **Blocker**
### Status: **Fixed in TrBlazeUI** — Reactive portal refresh mechanism added

### Description

TrBlazeUI's `<Dialog>` component renders its content through `<PortalHost>`, which physically moves DOM elements to a separate location via JavaScript (`portal.js` using `appendChild`). The `PortalHost` component sits as a **sibling** of the page content in the layout, not as a descendant.

**Component tree structure:**
```
MainLayout
  └── ErrorBoundary
        ├── IdeShell (page with Dialog components)  ← component 62
        └── PortalHost                               ← component 9
```

When any state change occurs **inside** a Dialog's content (e.g., clicking a sidebar item, toggling a checkbox, selecting a dropdown value), the following happens:

1. The event handler in the dialog component fires
2. `StateHasChanged()` is called (either explicitly or automatically by Blazor after event handling)
3. The dialog component re-renders
4. The `DialogPortal` cascade re-renders
5. **But the `PortalHost` does NOT re-render** because it is a sibling, not a descendant of the dialog component

The user sees **no visual change** in the dialog. The dialog appears completely static.

### Our Workaround: `AppDialog`

We created a custom `AppDialog` component (`Components/Shared/AppDialog.razor`) that renders directly in the component tree using `position: fixed`, bypassing TrBlazeUI's portal entirely:

```razor
<AppDialog @bind-Open="objIsOpen" ContentStyle="max-width: 500px; width: 90vw; padding: 20px;">
    <div class="app-dialog-header">
        <h3>Title</h3>
        <p>Description</p>
    </div>
    content...
    <div class="app-dialog-footer">buttons</div>
</AppDialog>
```

**Fixes:** All internal state changes (sidebar navigation, form controls, checkboxes, dropdowns) work correctly because content is in the normal Blazor component tree.

**Trade-offs:** Loses TrBlazeUI Dialog's animations, focus trap, aria attributes, and consistent design language.

### Proposed Solutions for TrBlazeUI Team

#### Option A: Reactive Portal Content (Recommended)

Make `PortalHost` subscribe to content changes from registered portals:

```csharp
public class PortalService
{
    public event Action? OnContentChanged;
    public void NotifyContentChanged() => OnContentChanged?.Invoke();
}

// In PortalHost
protected override void OnInitialized()
{
    PortalService.OnContentChanged += () => InvokeAsync(StateHasChanged);
}
```

Then in `DialogPortal`, call `PortalService.NotifyContentChanged()` on every render cycle when the portal is active.

#### Option B: RenderFragment-Based Portal

Pass content as a `RenderFragment` through a cascading service instead of physically moving DOM elements via JavaScript. Content changes would propagate naturally through Blazor's rendering system.

### TrBlazeUI Fix Applied

**Fixed.** A reactive portal refresh mechanism was implemented (combination of Options A and B):

- `PortalService` now has a `RefreshPortal(id)` method that triggers `OnPortalsChanged` event
- `PortalHost` subscribes to `OnPortalsChanged` and calls `InvokeAsync(StateHasChanged)` to re-render
- `DialogPortal` calls `PortalService.RefreshPortal()` when the dialog is already open, ensuring internal state changes propagate to the PortalHost

**Consumer migration:** `AppDialog` workaround can be replaced with standard `<Dialog>` — internal state changes (sidebar navigation, form controls, checkboxes, dropdowns) now re-render correctly.

---

## Issue 2: NativeSelect Dropdown Does Not Open Inside Dialog/Overlay (CRITICAL)

### Severity: **Blocker** (in MAUI Blazor Hybrid context)
### Status: **Platform Limitation** — Use `<Select>` instead of `<NativeSelect>` inside overlays

### Description

`<NativeSelect>` (which renders a native HTML `<select>` element) does not open its dropdown options panel when placed inside **any** `position: fixed` overlay — including both TrBlazeUI's Dialog and our custom AppDialog.

This is a **WebView2/MAUI platform limitation**: The native `<select>` dropdown popup is rendered by the browser engine/OS, and in WebView2 embedded within MAUI, this popup is blocked or clipped when inside a `position: fixed` container with high z-index.

### Evidence from Screenshots

| Screenshot | Issue Observed |
|---|---|
| Settings-General.png | "Auto Save Interval" select text barely readable (half-height text) |
| Settings-Appearance.png | Color Theme and Icon Theme dropdowns don't open at all when clicked |
| Settings-Editor-1.png | Tab Size, Word Wrap, Line Numbers — text clipped/half-visible |
| Settings-Editor-2.png | Render Whitespace select — text half-visible |
| Settings-Layout.png | All selects and inputs nearly invisible (contrast issue in dark theme) |

### Root Cause

1. **WebView2 native popup blocking**: The `<select>` element's native dropdown popup is rendered outside the WebView2 bounds and gets clipped/blocked by the MAUI window when inside `position: fixed` overlays.
2. **NativeSelectSize.Small**: Reduces the element height to a point where text is vertically clipped, showing only the top half of characters.
3. **TrBlazeUI styling**: NativeSelect applies `appearance: none` with custom CSS that may conflict with the dark theme variables inside overlays, causing contrast issues.

### Our Workaround: `SettingsSelect`

We created a custom `SettingsSelect` component (`Components/Shared/SettingsSelect.razor`) — a div-based dropdown that does NOT use the native `<select>` element:

```razor
<SettingsSelect @bind-Value="objTheme" Options="objThemeOptions" />

@code {
    private static readonly List<SettingsSelect.SelectOption> objThemeOptions =
    [
        new("light", "Light"),
        new("dark", "Dark"),
        new("dracula", "Dracula"),
    ];
}
```

**How it works:**
- Renders as `<div>` elements with CSS styling matching the theme
- Dropdown options are rendered as absolutely-positioned `<div>` list
- A fixed backdrop catches clicks outside to close the dropdown
- Full control over text color, background, sizing via CSS variables
- Works in any container regardless of `position: fixed` or z-index

**Trade-offs:**
- API change: Options passed as `List<SelectOption>` instead of `<option>` child content
- Dropdown may be clipped by scrollable parent containers (mitigated by extra bottom padding)
- No native keyboard navigation (arrow keys) — acceptable for mockup stage

### What TrBlazeUI Should Provide

Either:
1. A JavaScript-based `Select` component (custom dropdown, not native `<select>` popup) that works inside overlays
2. Or a documented fallback mechanism for MAUI Blazor Hybrid users
3. Or both: `<NativeSelect>` for normal contexts + `<Select>` for overlay contexts

### TrBlazeUI Guidance

**No code fix needed — this is a WebView2/MAUI platform limitation.** TrBlazeUI already provides both components:
- `<NativeSelect>` — native HTML `<select>`, use in normal page contexts
- `<Select>` — custom JavaScript-based dropdown, use inside dialogs/overlays

**Consumer migration:** Replace `<SettingsSelect>` with `<Select TValue="string">` inside overlays. The `<Select>` component renders a custom dropdown that works in `position: fixed` containers.

---

## Issue 3: Input Component Text Truncation / Poor Contrast

### Severity: **Major**
### Status: **Fixed in TrBlazeUI** — `CaptureUnmatchedValues` added to Input

### Description

TrBlazeUI's `<Input>` component:
1. **Does not accept `style=` attribute** — not in `CaptureUnmatchedValues`
2. **Does not accept `width` or sizing attributes** directly
3. In dark themes inside `position: fixed` overlays, text contrast is poor (dark text on dark background)
4. In constrained containers (flex rows with `justify-content: space-between`), the Input collapses to minimum width, truncating text

### Our Workaround: Plain `<input>` with CSS class

```razor
<input class="settings-input" @bind="objFontFamily" />
<input class="settings-input settings-input--small" type="number" @bind="objFontSize" />
```

CSS in `ide-layout.css`:
```css
.settings-input {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 10px;
    min-height: 32px;
    font-size: 13px;
    color: var(--foreground);
    font-family: inherit;
    width: 160px;
    outline: none;
    box-sizing: border-box;
}
```

**Fixes:** Full control over width, height, colors, contrast. Uses theme CSS variables for proper appearance in all themes.

### Requested Enhancement for TrBlazeUI

1. Add `CaptureUnmatchedValues` support to `<Input>` so it accepts `style=`, `id=`, etc.
2. Or provide a `Width` / `FullWidth` parameter
3. Or set default CSS to `width: 100%` to fill container

### TrBlazeUI Fix Applied

**Fixed.** `Input` now has `CaptureUnmatchedValues` support (`Input.razor.cs`) with `@attributes="AdditionalAttributes"` on the rendered element. It accepts `style=`, `id=`, `data-*`, and all other HTML attributes.

**Consumer migration:** Replace `<input class="settings-input">` with `<Input style="width: 160px" @bind-Value="val" />`.

---

## Issue 4: NativeSelect Does Not Accept HTML Attributes

### Severity: **Minor**
### Status: **Fixed in TrBlazeUI** — `CaptureUnmatchedValues` added to NativeSelect

Like `<Input>`, `<NativeSelect>` previously did not accept `style=` or other arbitrary HTML attributes.

### TrBlazeUI Fix Applied

**Fixed.** `NativeSelect` now has `CaptureUnmatchedValues` support with `@attributes="AdditionalAttributes"` on the rendered `<select>` element.

---

## Issue 5: Badge Does Not Accept `style=` Attribute

### Severity: **Minor**
### Status: **Fixed in TrBlazeUI** — `CaptureUnmatchedValues` added to Badge

`<Badge>` previously did not forward `style=` to its rendered element.

### TrBlazeUI Fix Applied

**Fixed.** `Badge` now has `CaptureUnmatchedValues` support (`Badge.razor.cs`) with `@attributes="AdditionalAttributes"` on the rendered element.

**Consumer migration:** Remove `<span>` wrappers and pass `style=` directly to `<Badge>`.

---

## Migration Plan: What Happens When TrBlazeUI Fixes These Issues

### Will our code break?

**No.** Our workaround components are **independent** of TrBlazeUI. They don't extend, override, or monkey-patch TrBlazeUI components. They exist alongside TrBlazeUI components in the codebase:

```
Components/Shared/
  AppDialog.razor          ← Our custom dialog (uses position: fixed)
  SettingsSelect.razor     ← Our custom dropdown (uses div-based list)

TrBlazeUI still provides:
  <Dialog>                 ← Still available, used for simple confirm dialogs
  <NativeSelect>           ← Still available, used in non-overlay contexts (toolbar, panels)
  <Input>                  ← Still available, used in non-constrained contexts
```

### When migrating away from workarounds:

All fixes below are now available in TrBlazeUI. Migration is optional and incremental.

| TrBlazeUI Fix | Migration Needed | Effort | Risk | Fix Available |
|---|---|---|---|---|
| **Dialog portal re-rendering (Issue 1)** | Replace `<AppDialog>` with `<Dialog>` + TrBlazeUI content components | Medium — API is similar but header/footer structure differs | Low — test each dialog individually | **Yes** |
| **NativeSelect in overlays (Issue 2)** | Replace `<SettingsSelect>` with `<Select TValue="string">` (not `<NativeSelect>`) | Medium — change `Options` list to `<SelectItem>` child content | Low — straightforward API change | **Yes** (use `<Select>`) |
| **Input accepts `style=` (Issue 3)** | Replace `<input class="settings-input">` with `<Input>` | Low — add `style="width: 160px"` to each Input | Very Low | **Yes** |
| **Badge accepts `style=` (Issue 5)** | Remove `<span>` wrappers around Badge | Very Low | None | **Yes** |

### Key points:

1. **No urgency to migrate.** Our workarounds work correctly and will continue to work regardless of TrBlazeUI updates.
2. **TrBlazeUI package updates won't break anything.** The packages can be updated to any version — our custom components use different class names and different code paths.
3. **Migration is optional and incremental.** Each dialog/component can be migrated individually. No big-bang refactor required.
4. **CSS won't conflict.** Our CSS uses `.settings-select`, `.settings-input`, `.app-dialog-*` classes which don't overlap with TrBlazeUI's `.trblaze-*` classes.

---

## Summary of All Issues and Current Status

| # | Issue | Severity | Workaround | TrBlazeUI Fix | Consumer Migration |
|---|-------|----------|-----------|---------------|-------------------|
| 1 | Dialog PortalHost does not re-render on internal state changes | **Blocker** | `AppDialog` component | **Fixed** — Reactive portal refresh | Replace `AppDialog` with `<Dialog>` |
| 2 | NativeSelect dropdown doesn't open inside Dialog/overlay | **Blocker** | `SettingsSelect` component | **N/A** — Platform limitation | Use `<Select>` instead of `<NativeSelect>` in overlays |
| 3 | Input text truncation / poor contrast in constrained containers | **Major** | Plain `<input class="settings-input">` | **Fixed** — CaptureUnmatchedValues | Replace with `<Input style="width: 160px">` |
| 4 | NativeSelect doesn't accept HTML attributes | **Minor** | Bypassed | **Fixed** — CaptureUnmatchedValues | Can now pass `style=`, `id=`, etc. |
| 5 | Badge doesn't accept `style=` | **Minor** | Wrapper `<span>` | **Fixed** — CaptureUnmatchedValues | Remove `<span>` wrappers |

---

## Environment Details

- **App Type:** MAUI Blazor Hybrid (Windows only, `net10.0-windows10.0.19041.0`)
- **WebView2:** Microsoft.AspNetCore.Components.WebView.Maui 10.0.0-rc.2.25164.2
- **.NET SDK:** 10.0.100
- **TrBlazeUI.Components:** 0.0.0-beta.0.8
- **TrBlazeUI.Icons.Lucide:** 0.0.0-beta.0.7
- **OS:** Windows 11 Pro (10.0.26100)
- **Rendering:** WebView2 (Chromium-based) inside MAUI window
