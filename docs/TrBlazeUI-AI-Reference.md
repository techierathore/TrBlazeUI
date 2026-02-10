# TrBlazeUI AI Component Reference

> Comprehensive reference for AI agents generating TrBlazeUI-based Blazor UIs.
> TrBlazeUI is a .NET 8 Blazor component library with Tailwind CSS v4 and shadcn/ui design.

---

## 1. Quick Start Setup

### NuGet Packages

```xml
<!-- Required -->
<PackageReference Include="TrBlazeUI.Primitives" />
<PackageReference Include="TrBlazeUI.Components" />

<!-- Icons (pick one or more) -->
<PackageReference Include="TrBlazeUI.Icons.Lucide" />
<PackageReference Include="TrBlazeUI.Icons.Heroicons" />
<PackageReference Include="TrBlazeUI.Icons.Feather" />
```

### Program.cs Service Registration

```csharp
using TrBlazeUI.Primitives.Extensions;
using TrBlazeUI.Components.Toast;

builder.Services.AddTrBlazeUIPrimitives(); // PortalService, FocusManager, PositioningService, etc.
builder.Services.AddScoped<ToastService>();  // Required for Toast notifications
```

### _Imports.razor

```razor
@using TrBlazeUI.Components
@using TrBlazeUI.Primitives
@using TrBlazeUI.Components.Button
@using TrBlazeUI.Components.Card
@using TrBlazeUI.Components.Checkbox
@using TrBlazeUI.Components.RadioGroup
@using TrBlazeUI.Components.Select
@using TrBlazeUI.Components.Switch
@using TrBlazeUI.Components.Separator
@using TrBlazeUI.Components.Badge
@using TrBlazeUI.Components.Sidebar
@using TrBlazeUI.Components.Dialog
@using TrBlazeUI.Components.DropdownMenu
@using TrBlazeUI.Components.Toast
@using TrBlazeUI.Components.Tabs
@using TrBlazeUI.Components.Alert
@using TrBlazeUI.Components.Avatar
@using TrBlazeUI.Components.Input
@using TrBlazeUI.Components.Textarea
@using TrBlazeUI.Components.Label
@using TrBlazeUI.Components.Field
@using TrBlazeUI.Components.Combobox
@using TrBlazeUI.Components.Sheet
@using TrBlazeUI.Components.Tooltip
@using TrBlazeUI.Components.Progress
@using TrBlazeUI.Components.Skeleton
@using TrBlazeUI.Components.Spinner
@using TrBlazeUI.Components.DataTable
@using TrBlazeUI.Components.Breadcrumb
@using TrBlazeUI.Components.Collapsible
@using TrBlazeUI.Components.Drawer
@using TrBlazeUI.Components.Slider
@using TrBlazeUI.Components.Carousel
@using TrBlazeUI.Components.Command
@using TrBlazeUI.Components.ContextMenu
@using TrBlazeUI.Components.Popover
@using TrBlazeUI.Components.HoverCard
@using TrBlazeUI.Components.AlertDialog
@using TrBlazeUI.Icons.Lucide.Components
@using TrBlazeUI.Icons.Lucide.Data
```

### App.razor / MainLayout.razor Setup

```razor
@inherits LayoutComponentBase
@using TrBlazeUI.Components.Sidebar
@using TrBlazeUI.Components.Toast

<SidebarProvider DefaultOpen="true" HeightClass="h-screen">
    <Sidebar Collapsible="true">
        <SidebarHeader>...</SidebarHeader>
        <SidebarContent>...</SidebarContent>
        <SidebarFooter>...</SidebarFooter>
    </Sidebar>

    <SidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
        </header>
        <div class="flex-1 overflow-auto p-6 md:p-8">
            @Body
        </div>
    </SidebarInset>
</SidebarProvider>

<ToastProvider Position="ToastPosition.BottomRight" />
<PortalHost />
```

### CSS Imports (in order)

```html
<link rel="stylesheet" href="_content/TrBlazeUI.Components/css/trblazeui.css" />
<link rel="stylesheet" href="styles/theme.css" />
<link rel="stylesheet" href="styles/base.css" />
```

---

## 2. Theme Setup

### CSS Variables (OKLCH Color Space)

TrBlazeUI uses OKLCH colors in CSS custom properties, compatible with shadcn themes from tweakcn.com.

```css
@layer base {
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.1450 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.1450 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.1450 0 0);
    --primary: oklch(0.2050 0 0);
    --primary-foreground: oklch(0.9850 0 0);
    --secondary: oklch(0.9700 0 0);
    --secondary-foreground: oklch(0.2050 0 0);
    --muted: oklch(0.9700 0 0);
    --muted-foreground: oklch(0.5560 0 0);
    --accent: oklch(0.9700 0 0);
    --accent-foreground: oklch(0.2050 0 0);
    --destructive: oklch(0.5770 0.2450 27.3250);
    --destructive-foreground: oklch(1 0 0);
    --border: oklch(0.9220 0 0);
    --input: oklch(0.9220 0 0);
    --ring: oklch(0.7080 0 0);
    --radius: 0.625rem;

    /* Sidebar-specific */
    --sidebar: oklch(0.9850 0 0);
    --sidebar-foreground: oklch(0.1450 0 0);
    --sidebar-primary: oklch(0.2050 0 0);
    --sidebar-primary-foreground: oklch(0.9850 0 0);
    --sidebar-accent: oklch(0.9700 0 0);
    --sidebar-accent-foreground: oklch(0.2050 0 0);
    --sidebar-border: oklch(0.9220 0 0);

    /* Alert variants */
    --alert-success: oklch(0.55 0.20 142);
    --alert-info: oklch(0.50 0.20 255);
    --alert-warning: oklch(0.68 0.18 55);
    --alert-danger: oklch(0.55 0.22 27);

    /* Chart colors */
    --chart-1 through --chart-5
  }

  .dark {
    /* Dark mode overrides for all above variables */
  }
}
```

### Tailwind v4 Theme Integration

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... all semantic colors mapped */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### Dark Mode

Add `class="dark"` to the `<html>` element. All components automatically adapt.

---

## 3. Layout Components

### SidebarProvider

Root wrapper that manages sidebar state, persistence, and responsive behavior.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| DefaultOpen | bool | true | Initial open state |
| Variant | SidebarVariant | Sidebar | Visual variant: Sidebar, Floating, Inset |
| Side | SidebarSide | Left | Which side: Left, Right |
| CookieKey | string? | "sidebar:state" | Cookie key for persistence (null disables) |
| HeightClass | string | "min-h-screen" | Container height CSS class |
| ChildContent | RenderFragment | - | Content (Sidebar + SidebarInset) |

### Sidebar Component Hierarchy

```
SidebarProvider
  Sidebar (Collapsible="true")
    SidebarHeader
      SidebarHeaderContent
        [logo div]
        SidebarHeaderInfo
          [title span]
          [subtitle span]
    SidebarContent
      SidebarGroup
        SidebarGroupLabel
        SidebarGroupContent
          SidebarMenu
            SidebarMenuItem
              SidebarMenuButton (Tooltip="..." IsActive="true" Href="/path")
                [LucideIcon]
                [span text]
              SidebarMenuBadge  (optional)
              SidebarMenuAction (optional)
              SidebarMenuSub    (submenu)
                SidebarMenuSubItem
                  SidebarMenuSubButton
      SidebarSeparator
    SidebarFooter
      SidebarMenu > SidebarMenuItem > ...
  SidebarInset
    header > SidebarTrigger
    [main content]
  SidebarRail (optional)
```

#### SidebarMenuButton

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Tooltip | string? | null | Tooltip in collapsed state |
| Size | SidebarMenuButtonSize | Default | Size: Default, Small, Large |
| Variant | SidebarMenuButtonVariant | Default | Style: Default, Outline |
| IsActive | bool | false | Active/selected state |
| Href | string? | null | URL (auto-renders as NavLink) |
| Match | NavLinkMatch | Prefix | URL match mode |
| Class | string? | null | Additional CSS |

```razor
<SidebarProvider DefaultOpen="true">
    <Sidebar Collapsible="true">
        <SidebarHeader>
            <SidebarHeaderContent>
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <LucideIcon Name="command" Size="16" />
                </div>
                <SidebarHeaderInfo>
                    <span class="truncate font-semibold">App Name</span>
                    <span class="truncate text-xs text-muted-foreground">v1.0</span>
                </SidebarHeaderInfo>
            </SidebarHeaderContent>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton Href="/" Match="NavLinkMatch.All" Tooltip="Home">
                        <LucideIcon Name="house" Size="16" />
                        <span>Home</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton Tooltip="Settings" IsActive="true">
                        <LucideIcon Name="settings" Size="16" />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
    </Sidebar>
    <SidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 class="text-lg font-semibold">Page Title</h1>
        </header>
        <div class="flex-1 p-6">@Body</div>
    </SidebarInset>
</SidebarProvider>
```

#### Collapsible Submenu Pattern

```razor
<SidebarMenuItem>
    <Collapsible>
        <SidebarMenuButton Tooltip="Models">
            <LucideIcon Name="box" Size="16" />
            <span>Models</span>
            <SidebarMenuChevron>
                <LucideIcon Name="chevron-right" Size="16" />
            </SidebarMenuChevron>
        </SidebarMenuButton>
        <CollapsibleContent>
            <SidebarMenuSub>
                <SidebarMenuSubItem>
                    <SidebarMenuSubButton><span>Sub Item</span></SidebarMenuSubButton>
                </SidebarMenuSubItem>
            </SidebarMenuSub>
        </CollapsibleContent>
    </Collapsible>
</SidebarMenuItem>
```

### Card

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Class | string? | null | Additional CSS classes |
| ChildContent | RenderFragment | - | Card content |

Sub-components: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`

```razor
<Card>
    <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description text</CardDescription>
    </CardHeader>
    <CardContent>
        <p>Main content here</p>
    </CardContent>
    <CardFooter Class="gap-2">
        <Button Variant="ButtonVariant.Outline">Cancel</Button>
        <Button>Save</Button>
    </CardFooter>
</Card>
```

### Separator

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Orientation | SeparatorOrientation | Horizontal | Horizontal or Vertical |
| Decorative | bool | true | If true, hidden from screen readers |
| Class | string? | null | Additional CSS classes |

```razor
<Separator />
<Separator Orientation="SeparatorOrientation.Vertical" />
```

### AspectRatio

```razor
<AspectRatio Ratio="16.0/9.0">
    <img src="image.jpg" class="rounded-md object-cover" />
</AspectRatio>
```

### ScrollArea

```razor
<ScrollArea Class="h-[200px] w-[350px] rounded-md border p-4">
    <p>Long scrollable content...</p>
</ScrollArea>
```

### Collapsible

```razor
<Collapsible @bind-Open="isOpen">
    <CollapsibleTrigger>Toggle</CollapsibleTrigger>
    <CollapsibleContent>
        <p>Hidden content revealed on toggle</p>
    </CollapsibleContent>
</Collapsible>
```

---

## 4. Navigation Components

### Breadcrumb

```razor
<Breadcrumb>
    <BreadcrumbList>
        <BreadcrumbItem>
            <BreadcrumbLink Href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
            <BreadcrumbLink Href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
    </BreadcrumbList>
</Breadcrumb>
```

### Tabs

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| DefaultValue | string? | null | Default active tab (uncontrolled) |
| Value | string? | null | Active tab (controlled) |
| ValueChanged | EventCallback<string?> | - | Tab change callback |
| Orientation | TabsOrientation | Horizontal | Horizontal or Vertical |
| ActivationMode | TabsActivationMode | Automatic | Automatic or Manual |
| Class | string? | null | Additional CSS classes |

```razor
<Tabs DefaultValue="account">
    <TabsList Class="grid w-full grid-cols-2">
        <TabsTrigger Value="account">Account</TabsTrigger>
        <TabsTrigger Value="password">Password</TabsTrigger>
    </TabsList>
    <TabsContent Value="account">
        <p>Account settings content</p>
    </TabsContent>
    <TabsContent Value="password">
        <p>Password settings content</p>
    </TabsContent>
</Tabs>
```

### Pagination

```razor
<Pagination CurrentPage="@currentPage"
            TotalPages="@totalPages"
            OnPageChanged="HandlePageChange" />
```

### NavigationMenu

```razor
<NavigationMenu>
    <NavigationMenuList>
        <NavigationMenuItem>
            <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
            <NavigationMenuContent>
                <NavigationMenuLink Href="/docs">Documentation</NavigationMenuLink>
            </NavigationMenuContent>
        </NavigationMenuItem>
    </NavigationMenuList>
</NavigationMenu>
```

### Menubar

```razor
<Menubar>
    <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
            <MenubarItem>New Tab</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Exit</MenubarItem>
        </MenubarContent>
    </MenubarMenu>
</Menubar>
```

---

## 5. Form Components

### Button

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Variant | ButtonVariant | Default | Default, Destructive, Outline, Secondary, Ghost, Link |
| Size | ButtonSize | Default | Small, Default, Large, Icon, IconSmall, IconLarge |
| Type | ButtonType | Button | Button, Submit, Reset |
| Disabled | bool | false | Disabled state |
| OnClick | EventCallback<MouseEventArgs> | - | Click handler |
| Icon | RenderFragment? | null | Icon content |
| IconPosition | IconPosition | Start | Start or End |
| Href | string? | null | Renders as anchor when set |
| Target | string? | null | Anchor target |
| AriaLabel | string? | null | Accessible label |
| Class | string? | null | Additional CSS classes |

```razor
<!-- Basic -->
<Button OnClick="HandleClick">Click me</Button>

<!-- Variants -->
<Button Variant="ButtonVariant.Destructive">Delete</Button>
<Button Variant="ButtonVariant.Outline">Cancel</Button>
<Button Variant="ButtonVariant.Secondary">Secondary</Button>
<Button Variant="ButtonVariant.Ghost">Ghost</Button>
<Button Variant="ButtonVariant.Link">Link</Button>

<!-- Sizes -->
<Button Size="ButtonSize.Small">Small</Button>
<Button Size="ButtonSize.Large">Large</Button>

<!-- Icon button -->
<Button Size="ButtonSize.Icon" AriaLabel="Settings">
    <LucideIcon Name="settings" Size="16" />
</Button>

<!-- With icon -->
<Button>
    <Button.Icon><LucideIcon Name="mail" Size="16" /></Button.Icon>
    Send Email
</Button>

<!-- As link -->
<Button Href="/about" Variant="ButtonVariant.Link">About</Button>

<!-- Submit -->
<Button Type="ButtonType.Submit">Submit Form</Button>
```

### Input

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Type | InputType | Text | Text, Email, Password, Number, Tel, Url, Search, Date, Time, File |
| Value | string? | null | Current value |
| ValueChanged | EventCallback<string?> | - | Value change (two-way: @bind-Value) |
| Placeholder | string? | null | Placeholder text |
| Disabled | bool | false | Disabled state |
| Required | bool | false | Required field |
| Id | string? | null | Element ID (for label association) |
| AriaInvalid | bool? | null | Invalid state |
| AriaDescribedBy | string? | null | ID of describing element |
| Class | string? | null | Additional CSS classes |

```razor
<Input @bind-Value="name" Placeholder="Enter your name" />
<Input Type="InputType.Email" @bind-Value="email" Required="true" />
<Input Type="InputType.Password" @bind-Value="password" />
<Input Type="InputType.Number" @bind-Value="age" />
```

### Textarea

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Value | string? | null | Current value |
| ValueChanged | EventCallback<string?> | - | Value change (two-way: @bind-Value) |
| Placeholder | string? | null | Placeholder text |
| MaxLength | int? | null | Character limit |
| Disabled | bool | false | Disabled state |
| Required | bool | false | Required field |
| Class | string? | null | Additional CSS classes |

```razor
<Textarea @bind-Value="description" Placeholder="Enter description" MaxLength="500" />
```

### Label

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| For | string? | null | ID of associated form element |
| Class | string? | null | Additional CSS classes |

```razor
<Label For="email">Email Address</Label>
<Input Id="email" Type="InputType.Email" @bind-Value="email" />
```

### Checkbox

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Checked | bool | false | Checked state |
| CheckedChanged | EventCallback<bool> | - | Two-way: @bind-Checked |
| Indeterminate | bool | false | Indeterminate state |
| Disabled | bool | false | Disabled state |
| Id | string? | null | Element ID |
| Class | string? | null | Additional CSS classes |

```razor
<div class="flex items-center space-x-2">
    <Checkbox @bind-Checked="isAccepted" Id="terms" />
    <Label For="terms">Accept terms and conditions</Label>
</div>
```

### Switch

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Checked | bool | false | On/off state |
| CheckedChanged | EventCallback<bool> | - | Two-way: @bind-Checked |
| Size | SwitchSize | Medium | Small, Medium, Large |
| Disabled | bool | false | Disabled state |
| Id | string? | null | Element ID |
| Class | string? | null | Additional CSS classes |

```razor
<div class="flex items-center space-x-2">
    <Switch @bind-Checked="isEnabled" Id="airplane-mode" />
    <Label For="airplane-mode">Airplane Mode</Label>
</div>
```

### Select (Generic)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| TValue | type param | - | Value type (e.g., string) |
| Value | TValue? | null | Selected value |
| ValueChanged | EventCallback<TValue?> | - | Two-way: @bind-Value |
| Disabled | bool | false | Disabled state |
| DisplayTextSelector | Func<TValue, string>? | null | Display text function |
| Class | string? | null | Additional CSS classes |

Sub-components: `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`

```razor
<Select @bind-Value="selectedFruit" TValue="string" Class="w-[280px]">
    <SelectTrigger>
        <SelectValue Placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
        <SelectItem Value="@("apple")" Text="Apple" TValue="string">Apple</SelectItem>
        <SelectItem Value="@("banana")" Text="Banana" TValue="string">Banana</SelectItem>
        <SelectItem Value="@("cherry")" Text="Cherry" TValue="string">Cherry</SelectItem>
    </SelectContent>
</Select>
```

#### Grouped Select

```razor
<Select @bind-Value="selected" TValue="string" Class="w-[280px]">
    <SelectTrigger>
        <SelectValue Placeholder="Select..." />
    </SelectTrigger>
    <SelectContent>
        <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem Value="@("apple")" Text="Apple" TValue="string">Apple</SelectItem>
        </SelectGroup>
        <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem Value="@("carrot")" Text="Carrot" TValue="string">Carrot</SelectItem>
        </SelectGroup>
    </SelectContent>
</Select>
```

### RadioGroup (Generic)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| TValue | type param | - | Value type |
| Value | TValue | default! | Selected value |
| ValueChanged | EventCallback<TValue> | - | Two-way: @bind-Value |
| Disabled | bool | false | Disabled state |
| AriaLabel | string? | null | Accessible label |
| Class | string? | null | Additional CSS classes |

```razor
<RadioGroup @bind-Value="selectedOption" TValue="string">
    <div class="flex items-center space-x-2">
        <RadioGroupItem Value="@("option1")" Id="r1" TValue="string" />
        <Label For="r1">Option 1</Label>
    </div>
    <div class="flex items-center space-x-2">
        <RadioGroupItem Value="@("option2")" Id="r2" TValue="string" />
        <Label For="r2">Option 2</Label>
    </div>
</RadioGroup>
```

### Combobox (Generic)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| TItem | type param | - | Item type |
| Items | IEnumerable<TItem> | required | Data source |
| Value | string? | null | Selected value |
| ValueChanged | EventCallback<string?> | - | Two-way: @bind-Value |
| ValueSelector | Func<TItem, string> | required | Extract value from item |
| DisplaySelector | Func<TItem, string> | required | Extract display text |
| Placeholder | string | "Select an option..." | Button placeholder |
| SearchPlaceholder | string | "Search..." | Search input placeholder |
| EmptyMessage | string | "No results found." | Empty state message |
| Disabled | bool | false | Disabled state |
| PopoverWidth | string | "w-[200px]" | Dropdown width |
| MatchTriggerWidth | bool | false | Match trigger width |

```razor
<Combobox TItem="Framework"
          Items="frameworks"
          @bind-Value="selectedValue"
          ValueSelector="@(f => f.Value)"
          DisplaySelector="@(f => f.Label)"
          Placeholder="Select framework..."
          SearchPlaceholder="Search framework..."
          EmptyMessage="No framework found." />

@code {
    record Framework(string Value, string Label);
    List<Framework> frameworks = new() {
        new("blazor", "Blazor"),
        new("react", "React"),
        new("vue", "Vue")
    };
    string? selectedValue;
}
```

### Field

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Orientation | FieldOrientation | Vertical | Vertical, Horizontal, Responsive |
| IsInvalid | bool | false | Error state |
| Class | string? | null | Additional CSS classes |

Sub-components: `FieldLabel`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldTitle`, `FieldSeparator`

```razor
<Field Orientation="FieldOrientation.Vertical">
    <FieldLabel>Email</FieldLabel>
    <FieldContent>
        <Input Type="InputType.Email" @bind-Value="email" />
        <FieldDescription>We will never share your email.</FieldDescription>
    </FieldContent>
</Field>

<Field Orientation="FieldOrientation.Horizontal" IsInvalid="@hasError">
    <FieldLabel>Username</FieldLabel>
    <FieldContent>
        <Input @bind-Value="username" />
        <FieldError>Username is required</FieldError>
    </FieldContent>
</Field>
```

### Calendar

```razor
<Calendar @bind-Value="selectedDate" />
```

### DatePicker

```razor
<DatePicker @bind-Value="selectedDate" Placeholder="Pick a date" />
```

### DateRangePicker

```razor
<DateRangePicker @bind-StartDate="startDate" @bind-EndDate="endDate" />
```

### TimePicker

```razor
<TimePicker @bind-Value="selectedTime" />
```

### Slider

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Value | double | 0 | Current value |
| ValueChanged | EventCallback<double> | - | Two-way: @bind-Value |
| Min | double | 0 | Minimum |
| Max | double | 100 | Maximum |
| Step | double | 1 | Step increment |
| Disabled | bool | false | Disabled state |
| Class | string? | null | Additional CSS classes |

```razor
<Slider @bind-Value="volume" Min="0" Max="100" Step="1" />
```

### RangeSlider

```razor
<RangeSlider @bind-LowValue="minPrice" @bind-HighValue="maxPrice" Min="0" Max="1000" />
```

### NumericInput

```razor
<NumericInput @bind-Value="quantity" Min="0" Max="100" Step="1" />
```

### CurrencyInput

```razor
<CurrencyInput @bind-Value="amount" CurrencySymbol="$" />
```

### MaskedInput

```razor
<MaskedInput @bind-Value="phone" Mask="(000) 000-0000" />
```

### InputOTP

```razor
<InputOTP @bind-Value="otp" Length="6" />
```

### InputGroup

```razor
<InputGroup>
    <InputGroupAddon>
        <LucideIcon Name="search" Size="16" />
    </InputGroupAddon>
    <InputGroupInput Placeholder="Search..." @bind-Value="searchQuery" />
    <InputGroupButton>
        <Button Size="ButtonSize.Small">Go</Button>
    </InputGroupButton>
</InputGroup>
```

### ColorPicker

```razor
<ColorPicker @bind-Value="selectedColor" />
```

### FileUpload

```razor
<FileUpload OnFilesSelected="HandleFiles" Accept=".pdf,.doc" Multiple="true" />
```

### MultiSelect

```razor
<MultiSelect TItem="string"
             Items="options"
             @bind-SelectedValues="selectedItems"
             DisplaySelector="@(x => x)"
             ValueSelector="@(x => x)"
             Placeholder="Select items..." />
```

### NativeSelect

```razor
<NativeSelect @bind-Value="selected">
    <option value="">Choose...</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
</NativeSelect>
```

### Rating

```razor
<Rating @bind-Value="rating" Max="5" />
```

### Toggle

```razor
<Toggle @bind-Pressed="isBold" AriaLabel="Toggle bold">
    <LucideIcon Name="bold" Size="16" />
</Toggle>
```

---

## 6. Data Display Components

### Avatar

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Size | AvatarSize | Default | Small (h-8), Default (h-10), Large (h-12), ExtraLarge (h-16) |
| Class | string? | null | Additional CSS classes |

Sub-components: `AvatarImage` (Source, Alt), `AvatarFallback`

```razor
<Avatar>
    <AvatarImage Source="https://example.com/avatar.jpg" Alt="John" />
    <AvatarFallback>JD</AvatarFallback>
</Avatar>

<Avatar Size="AvatarSize.Large" Class="rounded-lg">
    <AvatarFallback Class="rounded-lg">AB</AvatarFallback>
</Avatar>
```

### Badge

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Variant | BadgeVariant | Default | Default, Secondary, Destructive, Outline |
| Class | string? | null | Additional CSS classes |

```razor
<Badge>New</Badge>
<Badge Variant="BadgeVariant.Secondary">Draft</Badge>
<Badge Variant="BadgeVariant.Destructive">Error</Badge>
<Badge Variant="BadgeVariant.Outline">Active</Badge>
```

### DataTable (Generic)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| TData | type param | - | Data item type (class) |
| Data | IEnumerable<TData> | required | Data source |
| SelectionMode | DataTableSelectionMode | None | None, Single, Multiple |
| ShowToolbar | bool | true | Show search/column visibility |
| ShowPagination | bool | true | Show pagination |
| IsLoading | bool | false | Loading state |
| InitialPageSize | int | 5 | Initial rows per page |
| PageSizes | int[] | [5,10,20,50,100] | Page size options |
| SelectedItems | IReadOnlyCollection<TData> | [] | Two-way: @bind-SelectedItems |
| Class | string? | null | Additional CSS classes |

```razor
<DataTable TData="Person" Data="@people" SelectionMode="DataTableSelectionMode.Multiple">
    <Columns>
        <DataTableColumn TData="Person" TValue="string"
                         Property="@(p => p.Name)" Header="Name" Sortable Filterable />
        <DataTableColumn TData="Person" TValue="int"
                         Property="@(p => p.Age)" Header="Age" Sortable />
        <DataTableColumn TData="Person" TValue="string"
                         Property="@(p => p.Email)" Header="Email" Filterable />
    </Columns>
</DataTable>

@code {
    record Person(string Name, int Age, string Email);
    List<Person> people = new() { new("Alice", 30, "alice@test.com") };
}
```

### Progress

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Value | double | 0 | Current progress value |
| Max | double | 100 | Maximum value |
| Class | string? | null | Container CSS classes |
| IndicatorClass | string? | null | Indicator CSS classes |

```razor
<Progress Value="66" />
<Progress Value="33" Class="h-2" IndicatorClass="bg-destructive" />
```

### Skeleton

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Shape | SkeletonShape | Rectangular | Rectangular or Circular |
| Class | string? | null | Dimensions CSS classes |

```razor
<div class="flex items-center space-x-4">
    <Skeleton Shape="SkeletonShape.Circular" Class="h-12 w-12" />
    <div class="space-y-2">
        <Skeleton Class="h-4 w-[250px]" />
        <Skeleton Class="h-4 w-[200px]" />
    </div>
</div>
```

### Spinner

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Size | SpinnerSize | Default | Small (h-4), Default (h-6), Large (h-10) |
| AriaLabel | string? | "Loading" | Accessible label |
| Class | string? | null | Additional CSS classes |

```razor
<Spinner />
<Spinner Size="SpinnerSize.Large" Class="text-primary" />
```

### Kbd

```razor
<Kbd>Ctrl</Kbd> + <Kbd>C</Kbd>
```

### Typography

```razor
<TypographyH1>Heading 1</TypographyH1>
<TypographyH2>Heading 2</TypographyH2>
<TypographyH3>Heading 3</TypographyH3>
<TypographyH4>Heading 4</TypographyH4>
<TypographyP>Paragraph text</TypographyP>
<TypographyLead>Lead paragraph</TypographyLead>
<TypographyLarge>Large text</TypographyLarge>
<TypographySmall>Small text</TypographySmall>
<TypographyMuted>Muted text</TypographyMuted>
<TypographyInlineCode>code</TypographyInlineCode>
```

### Empty

```razor
<Empty>
    <EmptyIcon><LucideIcon Name="inbox" Size="48" /></EmptyIcon>
    <EmptyTitle>No results found</EmptyTitle>
    <EmptyDescription>Try adjusting your search criteria.</EmptyDescription>
    <EmptyAction><Button>Create New</Button></EmptyAction>
</Empty>
```

### Item

```razor
<ItemGroup>
    <Item>
        <ItemMedia><Avatar Size="AvatarSize.Small"><AvatarFallback>JD</AvatarFallback></Avatar></ItemMedia>
        <ItemContent>
            <ItemTitle>John Doe</ItemTitle>
            <ItemDescription>Software Engineer</ItemDescription>
        </ItemContent>
        <ItemActions><Button Size="ButtonSize.IconSmall" Variant="ButtonVariant.Ghost"><LucideIcon Name="more-horizontal" Size="16" /></Button></ItemActions>
    </Item>
</ItemGroup>
```

---

## 7. Feedback & Overlay Components

### Alert

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Variant | AlertVariant | Default | Default, Success, Info, Warning, Danger |
| AccentBorder | bool | false | Show thick left border |
| Icon | RenderFragment? | null | Icon content |
| Class | string? | null | Additional CSS classes |

Sub-components: `AlertTitle`, `AlertDescription`

```razor
<Alert Variant="AlertVariant.Default">
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription>You can add components to your app.</AlertDescription>
</Alert>

<Alert Variant="AlertVariant.Danger" AccentBorder="true">
    <Alert.Icon><LucideIcon Name="alert-circle" Size="16" /></Alert.Icon>
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>Something went wrong.</AlertDescription>
</Alert>

<Alert Variant="AlertVariant.Success">
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>Changes saved.</AlertDescription>
</Alert>
```

### AlertDialog

```razor
<AlertDialog>
    <AlertDialogTrigger>
        <Button Variant="ButtonVariant.Destructive">Delete Account</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

### Dialog

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Open | bool? | null | Controlled open state |
| OpenChanged | EventCallback<bool> | - | Two-way: @bind-Open |
| DefaultOpen | bool | false | Default open (uncontrolled) |
| Modal | bool | true | Dismiss on outside click/Escape |

Sub-components: `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`

```razor
<Dialog>
    <DialogTrigger class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
        Edit Profile
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label For="name" Class="text-right">Name</Label>
                <Input Id="name" @bind-Value="name" Class="col-span-3" />
            </div>
        </div>
        <DialogFooter>
            <DialogClose><Button Variant="ButtonVariant.Outline">Cancel</Button></DialogClose>
            <Button>Save changes</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

### Drawer

```razor
<Drawer>
    <DrawerTrigger><Button>Open Drawer</Button></DrawerTrigger>
    <DrawerContent>
        <DrawerHeader>
            <DrawerTitle>Edit settings</DrawerTitle>
            <DrawerDescription>Configure your preferences.</DrawerDescription>
        </DrawerHeader>
        <div class="p-4">Content here</div>
        <DrawerFooter>
            <Button>Save</Button>
            <DrawerClose><Button Variant="ButtonVariant.Outline">Cancel</Button></DrawerClose>
        </DrawerFooter>
    </DrawerContent>
</Drawer>
```

### Sheet

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Open | bool? | null | Controlled open state |
| OpenChanged | EventCallback<bool> | - | Two-way: @bind-Open |
| Side | SheetSide | Right | Top, Right, Bottom, Left |
| Modal | bool | true | Dismiss on outside click/Escape |

```razor
<Sheet>
    <SheetTrigger><Button>Open Sheet</Button></SheetTrigger>
    <SheetContent>
        <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description text.</SheetDescription>
        </SheetHeader>
        <div class="py-4">Content here</div>
        <SheetFooter>
            <SheetClose><Button>Close</Button></SheetClose>
        </SheetFooter>
    </SheetContent>
</Sheet>
```

### Toast

**Setup required:** Register `ToastService` in DI and add `<ToastProvider />` in layout.

| ToastProvider Parameter | Type | Default | Description |
|------------------------|------|---------|-------------|
| Position | ToastPosition | BottomRight | TopRight, TopLeft, TopCenter, BottomRight, BottomLeft, BottomCenter |
| MaxToasts | int | 5 | Max visible toasts |

```razor
@inject ToastService ToastService

<Button OnClick="@(() => ToastService.Show("Your file has been saved.", "Success"))">
    Show Toast
</Button>

<Button OnClick="@(() => ToastService.Error("Something went wrong.", "Error"))">
    Error Toast
</Button>

@code {
    // ToastService methods:
    // .Show(description, title?, variant?, duration?)
    // .Success(description, title?)
    // .Error(description, title?)
    // .Dismiss(id)
    // .DismissAll()
}
```

### Tooltip

```razor
<Tooltip>
    <TooltipTrigger>
        <Button Variant="ButtonVariant.Outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
        <p>Tooltip text here</p>
    </TooltipContent>
</Tooltip>
```

TooltipContent parameters: `Side` (PopoverSide: Top, Bottom, Left, Right), `Align` (PopoverAlign: Start, Center, End), `Offset` (int, default 8).

### HoverCard

```razor
<HoverCard>
    <HoverCardTrigger>
        <Button Variant="ButtonVariant.Link">@username</Button>
    </HoverCardTrigger>
    <HoverCardContent>
        <div class="flex space-x-4">
            <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
            <div><p class="text-sm font-semibold">John Doe</p></div>
        </div>
    </HoverCardContent>
</HoverCard>
```

### Popover

```razor
<Popover>
    <PopoverTrigger>
        <Button Variant="ButtonVariant.Outline">Open Popover</Button>
    </PopoverTrigger>
    <PopoverContent Class="w-80">
        <div class="grid gap-4">
            <h4 class="font-medium leading-none">Dimensions</h4>
            <div class="grid gap-2">
                <Label For="width">Width</Label>
                <Input Id="width" @bind-Value="width" />
            </div>
        </div>
    </PopoverContent>
</Popover>
```

### ContextMenu

```razor
<ContextMenu>
    <ContextMenuTrigger Class="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed">
        Right click here
    </ContextMenuTrigger>
    <ContextMenuContent Class="w-64">
        <ContextMenuItem>Back</ContextMenuItem>
        <ContextMenuItem>Forward</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Reload</ContextMenuItem>
    </ContextMenuContent>
</ContextMenu>
```

### DropdownMenu

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Open | bool? | null | Controlled open state |
| OpenChanged | EventCallback<bool> | - | Two-way: @bind-Open |
| Modal | bool | true | Dismiss on outside click/Escape |

Sub-components: `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuRadioGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup`, `DropdownMenuShortcut`

```razor
<DropdownMenu>
    <DropdownMenuTrigger>
        <Button Variant="ButtonVariant.Outline">Open</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent Class="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
            <LucideIcon Name="user" Size="16" />
            <span class="ml-2">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
            <LucideIcon Name="settings" Size="16" />
            <span class="ml-2">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
            <LucideIcon Name="log-out" Size="16" />
            <span class="ml-2">Log out</span>
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
```

### Command (Command Palette)

```razor
<Command>
    <CommandInput Placeholder="Type a command..." />
    <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup Heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup Heading="Settings">
            <CommandItem>Profile<CommandShortcut>Ctrl+P</CommandShortcut></CommandItem>
            <CommandItem>Settings<CommandShortcut>Ctrl+S</CommandShortcut></CommandItem>
        </CommandGroup>
    </CommandList>
</Command>
```

---

## 8. Rich Content Components

### Carousel

```razor
<Carousel>
    <CarouselContent>
        <CarouselItem>
            <div class="p-1">
                <Card><CardContent class="flex aspect-square items-center justify-center p-6">
                    <span class="text-4xl font-semibold">1</span>
                </CardContent></Card>
            </div>
        </CarouselItem>
        <CarouselItem>
            <div class="p-1">
                <Card><CardContent class="flex aspect-square items-center justify-center p-6">
                    <span class="text-4xl font-semibold">2</span>
                </CardContent></Card>
            </div>
        </CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
</Carousel>
```

### Chart (ApexCharts wrapper)

Chart types: `AreaChart`, `BarChart`, `LineChart`, `PieChart`, `RadarChart`, `RadialChart`

```razor
<ChartContainer Class="h-[300px]">
    <BarChart TItem="SalesData"
              Items="@salesData"
              XValue="@(d => d.Month)"
              YValue="@(d => d.Revenue)" />
</ChartContainer>
```

### MarkdownEditor

```razor
<MarkdownEditor @bind-Value="markdownContent" />
```

### RichTextEditor

```razor
<RichTextEditor @bind-Value="htmlContent" />
```

---

## 9. Icon Libraries

### LucideIcon (Recommended)

```razor
@using TrBlazeUI.Icons.Lucide.Components
@using TrBlazeUI.Icons.Lucide.Data

<LucideIcon Name="home" Size="24" />
<LucideIcon Name="settings" Size="16" Color="currentColor" StrokeWidth="2" />
<LucideIcon Name="search" Size="20" Class="text-muted-foreground" />
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Name | string | required | Icon name (kebab-case, e.g., "chevron-right") |
| Size | int | 24 | Width/height in pixels |
| Color | string | "currentColor" | Stroke color |
| Fill | string | "none" | Fill color |
| StrokeWidth | string | "2" | Stroke width |
| Class | string? | null | Additional CSS classes |
| AriaLabel | string? | null | Accessible label |

Common icon names: `home`, `house`, `settings`, `user`, `search`, `mail`, `bell`, `calendar`, `folder`, `file`, `file-text`, `trash`, `pencil`, `plus`, `minus`, `x`, `check`, `chevron-right`, `chevron-left`, `chevron-up`, `chevron-down`, `chevrons-up-down`, `arrow-right`, `arrow-left`, `eye`, `eye-off`, `lock`, `unlock`, `star`, `heart`, `download`, `upload`, `share`, `copy`, `filter`, `sort`, `more-horizontal`, `more-vertical`, `menu`, `log-out`, `log-in`, `command`, `layout-dashboard`, `bar-chart-3`, `line-chart`, `inbox`, `box`, `layers`, `zap`, `sparkles`, `life-buoy`, `building`, `briefcase`, `credit-card`, `bold`, `italic`, `underline`, `alert-circle`, `info`, `alert-triangle`, `check-circle`, `x-circle`, `loader`, `panel-left`, `github`

### HeroIcon

```razor
@using TrBlazeUI.Icons.Heroicons.Components

<HeroIcon Name="home" Size="24" Variant="HeroIconVariant.Outline" />
<HeroIcon Name="home" Size="24" Variant="HeroIconVariant.Solid" />
```

### FeatherIcon

```razor
@using TrBlazeUI.Icons.Feather.Components

<FeatherIcon Name="home" Size="24" />
```

---

## 10. Common Page Patterns

### Dashboard Layout

```razor
@page "/dashboard"

<div class="space-y-6">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">Overview of your application metrics.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
                <LucideIcon Name="dollar-sign" Size="16" Class="text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">$45,231.89</div>
                <p class="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Users</CardTitle>
                <LucideIcon Name="users" Size="16" Class="text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">+2,350</div>
                <p class="text-xs text-muted-foreground">+180 this week</p>
            </CardContent>
        </Card>
    </div>

    <!-- Main Content Area -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card Class="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer Class="h-[300px]">
                    <BarChart TItem="MonthlyData" Items="@data"
                              XValue="@(d => d.Month)" YValue="@(d => d.Value)" />
                </ChartContainer>
            </CardContent>
        </Card>
        <Card Class="col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest events in your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <div class="space-y-4">
                    @foreach (var item in recentItems)
                    {
                        <div class="flex items-center gap-4">
                            <Avatar Size="AvatarSize.Small">
                                <AvatarFallback>@item.Initials</AvatarFallback>
                            </Avatar>
                            <div class="flex-1 space-y-1">
                                <p class="text-sm font-medium">@item.Name</p>
                                <p class="text-xs text-muted-foreground">@item.Description</p>
                            </div>
                        </div>
                    }
                </div>
            </CardContent>
        </Card>
    </div>
</div>
```

### Form Page

```razor
@page "/settings/profile"

<div class="space-y-6 max-w-2xl">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">Profile</h1>
        <p class="text-muted-foreground">Manage your account settings.</p>
    </div>

    <Separator />

    <Card>
        <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
            <div class="space-y-4">
                <Field>
                    <FieldLabel>Name</FieldLabel>
                    <FieldContent>
                        <Input @bind-Value="name" Placeholder="Your name" />
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel>Email</FieldLabel>
                    <FieldContent>
                        <Input Type="InputType.Email" @bind-Value="email" Placeholder="you@example.com" />
                        <FieldDescription>This is the email used for notifications.</FieldDescription>
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel>Bio</FieldLabel>
                    <FieldContent>
                        <Textarea @bind-Value="bio" Placeholder="Tell us about yourself" MaxLength="500" />
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel>Role</FieldLabel>
                    <FieldContent>
                        <Select @bind-Value="role" TValue="string" Class="w-full">
                            <SelectTrigger><SelectValue Placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem Value="@("admin")" Text="Admin" TValue="string">Admin</SelectItem>
                                <SelectItem Value="@("user")" Text="User" TValue="string">User</SelectItem>
                                <SelectItem Value="@("viewer")" Text="Viewer" TValue="string">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </FieldContent>
                </Field>

                <div class="flex items-center space-x-2">
                    <Switch @bind-Checked="notifications" Id="notifications" />
                    <Label For="notifications">Email notifications</Label>
                </div>
            </div>
        </CardContent>
        <CardFooter class="flex justify-between">
            <Button Variant="ButtonVariant.Outline">Cancel</Button>
            <Button OnClick="HandleSave">Save Changes</Button>
        </CardFooter>
    </Card>
</div>

@code {
    private string name = "";
    private string email = "";
    private string bio = "";
    private string? role;
    private bool notifications = true;

    private async Task HandleSave()
    {
        // Save logic here
        ToastService.Success("Profile updated successfully.", "Saved");
    }
}
```

### List/Detail Page

```razor
@page "/users"

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Users</h1>
            <p class="text-muted-foreground">Manage user accounts.</p>
        </div>
        <Dialog>
            <DialogTrigger>
                <Button><LucideIcon Name="plus" Size="16" Class="mr-2" />Add User</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account.</DialogDescription>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                    <Field>
                        <FieldLabel>Name</FieldLabel>
                        <FieldContent><Input @bind-Value="newUserName" /></FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <FieldContent><Input Type="InputType.Email" @bind-Value="newUserEmail" /></FieldContent>
                    </Field>
                </div>
                <DialogFooter>
                    <DialogClose><Button Variant="ButtonVariant.Outline">Cancel</Button></DialogClose>
                    <Button OnClick="HandleAddUser">Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>

    <DataTable TData="User" Data="@users" SelectionMode="DataTableSelectionMode.Multiple"
               @bind-SelectedItems="selectedUsers">
        <Columns>
            <DataTableColumn TData="User" TValue="string"
                             Property="@(u => u.Name)" Header="Name" Sortable Filterable />
            <DataTableColumn TData="User" TValue="string"
                             Property="@(u => u.Email)" Header="Email" Sortable Filterable />
            <DataTableColumn TData="User" TValue="string"
                             Property="@(u => u.Role)" Header="Role" Sortable />
            <DataTableColumn TData="User" TValue="string"
                             Property="@(u => u.Status)" Header="Status">
                <CellTemplate Context="user">
                    <Badge Variant="@(user.Status == "Active" ? BadgeVariant.Default : BadgeVariant.Secondary)">
                        @user.Status
                    </Badge>
                </CellTemplate>
            </DataTableColumn>
        </Columns>
    </DataTable>
</div>
```

### Settings Page with Tabs

```razor
@page "/settings"

<div class="space-y-6 max-w-4xl">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-muted-foreground">Manage your application preferences.</p>
    </div>

    <Separator />

    <Tabs DefaultValue="general">
        <TabsList>
            <TabsTrigger Value="general">General</TabsTrigger>
            <TabsTrigger Value="notifications">Notifications</TabsTrigger>
            <TabsTrigger Value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent Value="general">
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic application configuration.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <Field>
                        <FieldLabel>Application Name</FieldLabel>
                        <FieldContent><Input @bind-Value="appName" /></FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel>Language</FieldLabel>
                        <FieldContent>
                            <Select @bind-Value="language" TValue="string" Class="w-full">
                                <SelectTrigger><SelectValue Placeholder="Select language" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem Value="@("en")" Text="English" TValue="string">English</SelectItem>
                                    <SelectItem Value="@("es")" Text="Spanish" TValue="string">Spanish</SelectItem>
                                </SelectContent>
                            </Select>
                        </FieldContent>
                    </Field>
                </CardContent>
                <CardFooter><Button>Save</Button></CardFooter>
            </Card>
        </TabsContent>

        <TabsContent Value="notifications">
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what notifications you receive.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium">Email Notifications</p>
                            <p class="text-xs text-muted-foreground">Receive email about activity.</p>
                        </div>
                        <Switch @bind-Checked="emailNotifs" />
                    </div>
                    <Separator />
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium">Push Notifications</p>
                            <p class="text-xs text-muted-foreground">Receive push notifications.</p>
                        </div>
                        <Switch @bind-Checked="pushNotifs" />
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent Value="security">
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Manage security settings.</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <Field>
                        <FieldLabel>Current Password</FieldLabel>
                        <FieldContent><Input Type="InputType.Password" @bind-Value="currentPwd" /></FieldContent>
                    </Field>
                    <Field>
                        <FieldLabel>New Password</FieldLabel>
                        <FieldContent><Input Type="InputType.Password" @bind-Value="newPwd" /></FieldContent>
                    </Field>
                    <div class="flex items-center space-x-2">
                        <Checkbox @bind-Checked="twoFactor" Id="2fa" />
                        <Label For="2fa">Enable two-factor authentication</Label>
                    </div>
                </CardContent>
                <CardFooter><Button>Update Security</Button></CardFooter>
            </Card>
        </TabsContent>
    </Tabs>
</div>
```

---

## Quick Reference: Two-Way Binding Patterns

| Component | Binding Pattern | Type |
|-----------|----------------|------|
| Input | `@bind-Value="str"` | string? |
| Textarea | `@bind-Value="str"` | string? |
| Checkbox | `@bind-Checked="bln"` | bool |
| Switch | `@bind-Checked="bln"` | bool |
| Select | `@bind-Value="val"` | TValue? |
| RadioGroup | `@bind-Value="val"` | TValue |
| Combobox | `@bind-Value="str"` | string? |
| Slider | `@bind-Value="dbl"` | double |
| Rating | `@bind-Value="int"` | int |
| Toggle | `@bind-Pressed="bln"` | bool |
| DatePicker | `@bind-Value="dt"` | DateTime? |
| TimePicker | `@bind-Value="ts"` | TimeSpan? |
| Dialog | `@bind-Open="bln"` | bool |
| Sheet | `@bind-Open="bln"` | bool |
| DropdownMenu | `@bind-Open="bln"` | bool |
| Tabs | `@bind-Value="str"` | string? |
| Collapsible | `@bind-Open="bln"` | bool |
| DataTable | `@bind-SelectedItems="col"` | IReadOnlyCollection<TData> |
| MultiSelect | `@bind-SelectedValues="list"` | List<string> |

## Quick Reference: Common CSS Utility Classes

Use these Tailwind classes with the `Class` parameter on any component:

```
Layout:    w-full w-[280px] max-w-md flex grid gap-4
Spacing:   p-4 px-6 py-2 m-4 space-y-4 space-x-2
Text:      text-sm text-lg font-bold font-medium text-muted-foreground
Colors:    bg-primary text-primary-foreground bg-muted bg-destructive
Border:    border rounded-lg border-primary border-dashed
Grid:      grid-cols-2 md:grid-cols-3 lg:grid-cols-4 col-span-3
Flex:      flex items-center justify-between flex-1 shrink-0
Display:   hidden md:block lg:flex
Shadow:    shadow-sm shadow-md shadow-lg
```
