# TrBlazeUI Component Library - Issues Report

**Reported by:** TechieRag Web Sample App team
**Package Version:** `TrBlazeUI.Components 0.0.0-beta.0.8`
**Target Framework:** .NET 10
**Date:** 2026-02-17

---

## Issue #1: Missing `CaptureUnmatchedValues` on 30+ Components

**Severity:** P0 - Critical (Runtime crash)
**Type:** Bug

### Description

Many TrBlazeUI components do not implement `[Parameter(CaptureUnmatchedValues = true)]`. This causes an unhandled `System.InvalidOperationException` at runtime when any standard HTML attribute (`id`, `style`, `data-*`, `aria-*`) or Blazor event handler (`@onclick`, `@onkeydown`, `@onchange`, etc.) is passed to the component.

### Reproduction

```razor
@* CRASHES at runtime *@
<CardContent id="chat-messages">...</CardContent>

@* CRASHES at runtime *@
<Textarea @bind-Value="text" @onkeydown="HandleKey" />
```

### Error

```
System.InvalidOperationException: Object of type 'TrBlazeUI.Components.Card.CardContent'
does not have a property matching the name 'id'.
   at Microsoft.AspNetCore.Components.Reflection.ComponentProperties
      .ThrowForUnknownIncomingParameterName(Type targetType, String parameterName)
```

### Affected Components

| Component Group | Components |
|---|---|
| **Card** | `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`, `CardAction` |
| **Textarea** | `Textarea` |
| **Badge** | `Badge` |
| **Separator** | `Separator` |
| **Accordion** | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| **Collapsible** | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` |
| **Popover** | `Popover`, `PopoverTrigger`, `PopoverContent` |
| **HoverCard** | `HoverCard`, `HoverCardTrigger`, `HoverCardContent` |
| **Avatar** | `Avatar`, `AvatarImage`, `AvatarFallback` |
| **Skeleton** | `Skeleton` |
| **Other** | `Empty`, `MarkdownEditor`, `Menubar`, `Pagination`, `Resizable`, `RichTextEditor` |

### Components That Already Support It (Working Correctly)

These components handle arbitrary attributes without crashing:

`Button`, `DatePicker`, `Select` (and sub-components), `InputGroup` (and sub-components), `Field` (and sub-components), `Dialog`, `AlertDialog`, `Sheet`, `Sidebar` (and sub-components), `Calendar`, `Chart`, `Command`, `Progress`, `Spinner`, `Tabs`, `Toolbar`, `Tooltip`, `DropdownMenu`

### Recommended Fix

Add attribute splatting to all components:

```csharp
// In each affected component's .razor or .razor.cs file:
[Parameter(CaptureUnmatchedValues = true)]
public Dictionary<string, object>? AdditionalAttributes { get; set; }
```

Then apply on the root rendered element:

```razor
<div class="@ComputedClass" @attributes="AdditionalAttributes">
    @ChildContent
</div>
```

This is the standard Blazor pattern used by Microsoft's own component libraries (MudBlazor, Radzen, FluentUI).

---

## Issue #2: `Textarea` Lacks Keyboard Event Support

**Severity:** P1 - High
**Type:** Feature gap

### Description

There is no way to handle keyboard events on `Textarea`. The component has no `OnKeyDown`, `OnKeyPress`, or `OnKeyUp` `EventCallback` parameters, and it does not support attribute splatting (Issue #1), so `@onkeydown` cannot be passed as an unmatched attribute either.

This blocks a very common UX pattern: **"press Enter to send"** in chat/messaging interfaces.

### Reproduction

```razor
@* CRASHES - @onkeydown is not a known parameter *@
<Textarea @bind-Value="message" @onkeydown="HandleKeyDown" />
```

### Current Workaround

Wrapping the Textarea in a div and handling the event there. This works but captures events from sibling elements too (e.g., a send button inside the same div):

```razor
<div @onkeydown="HandleKeyDown">
    <Textarea @bind-Value="message" />
</div>
```

### Recommended Fix (Either Option)

**Option A** - Add attribute splatting (resolves generically via Issue #1 fix):
```csharp
[Parameter(CaptureUnmatchedValues = true)]
public Dictionary<string, object>? AdditionalAttributes { get; set; }
```

**Option B** - Add explicit event parameters:
```csharp
[Parameter] public EventCallback<KeyboardEventArgs> OnKeyDown { get; set; }
[Parameter] public EventCallback<KeyboardEventArgs> OnKeyUp { get; set; }
[Parameter] public EventCallback<KeyboardEventArgs> OnKeyPress { get; set; }
```

Option A is preferred as it solves the problem for all event types at once.

---

## Issue #3: `Button.Icon` and `Alert.Icon` Child Content Causes RZ10012 Compiler Warnings

**Severity:** P2 - Low
**Type:** Developer experience

### Description

The documented pattern for adding icons to `Button` and `Alert` uses Razor child content syntax:

```razor
<Button>
    <Button.Icon><LucideIcon Name="mail" Size="16" /></Button.Icon>
    Send Email
</Button>
```

This works correctly at runtime, but the Razor compiler emits a warning for every usage:

```
warning RZ10012: Found markup element with unexpected name 'Button.Icon'.
If this is intended to be a component, add a @using directive for its namespace.
```

### Impact

A 10-page application produces **17 warnings** just from `Button.Icon` and `Alert.Icon` usage, creating noise that masks real issues during development.

### Suggested Fixes

1. **Provide alternative wrapper components** as aliases:
   ```razor
   @* Alternative syntax that wouldn't warn *@
   <Button>
       <ButtonIcon><LucideIcon Name="mail" Size="16" /></ButtonIcon>
       Send Email
   </Button>
   ```

2. **Document a suppression pattern** in the AI Reference guide:
   ```xml
   <!-- In .csproj -->
   <NoWarn>$(NoWarn);RZ10012</NoWarn>
   ```

3. **Investigate Razor source generators** that could suppress this for known child content patterns.

---

## Issue #4: CSS Path Inconsistency in Documentation

**Severity:** P1 - High
**Type:** Documentation bug

### Description

The actual CSS file in the NuGet package is located at:

```
staticwebassets/trblazeui.css
```

Which maps to the browser path:

```html
<link rel="stylesheet" href="_content/TrBlazeUI.Components/trblazeui.css" />
```

However, some documentation references (including the TrBlazeUI agent YAML configuration) show an incorrect path with a `css/` subfolder:

```html
<!-- WRONG - this file does not exist -->
<link rel="stylesheet" href="_content/TrBlazeUI.Components/css/trblazeui.css" />
```

### Impact

New users following the documentation get a completely unstyled application with no visible error. The sidebar renders as bullet-point links, all layout is broken, and it's difficult to diagnose because there are no console errors - the CSS file simply returns a 404 silently.

### Package Contents (Verified)

```
trblazeui.components/0.0.0-beta.0.8/staticwebassets/
  trblazeui.css          <-- correct file
  css/trblazeui-input.css  <-- source/input file, NOT the compiled output
```

### Recommended Fix

1. Update all documentation to reference the correct path: `_content/TrBlazeUI.Components/trblazeui.css`
2. Update the TrBlazeUI agent YAML `css_references` section
3. Update the TrBlazeUI-AI-Reference.md quick start section

---

## Issue #5: `CardContent` and Other Card Sub-Components Lack `Id` Parameter

**Severity:** P2 - Medium
**Type:** Feature gap

### Description

Unlike `Input`, `Checkbox`, and `Switch` which have explicit `Id` parameters, the Card sub-components (`CardContent`, `CardHeader`, `CardFooter`, etc.) do not expose an `Id` parameter. This prevents targeting them with JavaScript interop for common scenarios like auto-scrolling a chat container.

### Affected Use Case

```razor
@* Cannot set an ID for JS interop scroll-to-bottom *@
<CardContent Class="overflow-y-auto">
    @foreach (var msg in messages) { ... }
</CardContent>
```

### Current Workaround

Nest an extra `<div>` inside the component:

```razor
<CardContent Class="overflow-y-auto">
    <div id="chat-messages">
        @foreach (var msg in messages) { ... }
    </div>
</CardContent>
```

### Recommended Fix

This would be resolved automatically by implementing Issue #1 (attribute splatting). Alternatively, add an explicit `Id` parameter to all Card sub-components.

---

## Summary

| Priority | Issue | Type | Impact |
|----------|-------|------|--------|
| **P0** | #1 - Missing `CaptureUnmatchedValues` on 30+ components | Bug | Runtime crash |
| **P1** | #2 - Textarea lacks keyboard event support | Feature gap | Common UX pattern blocked |
| **P1** | #4 - CSS path wrong in documentation | Docs bug | Completely unstyled apps for new users |
| **P2** | #3 - RZ10012 warnings on Button.Icon / Alert.Icon | DX | Build warning noise |
| **P2** | #5 - Card sub-components lack Id parameter | Feature gap | JS interop limitation |

### Note on Issue Dependencies

Issues #2 and #5 would both be **automatically resolved** by fixing Issue #1 (adding `CaptureUnmatchedValues` to all components). This is the highest-leverage fix.
