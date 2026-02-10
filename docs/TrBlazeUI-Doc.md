# TrBlazeUI - Comprehensive Project Documentation

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Technology Stack](#2-technology-stack)
3. [Required Frameworks & Tools](#3-required-frameworks--tools)
4. [Step-by-Step Setup & Execution Guide](#4-step-by-step-setup--execution-guide)
5. [Appendix: Project Structure Reference](#5-appendix-project-structure-reference)

---

## 1. Application Overview

### 1.1 What is TrBlazeUI?

**TrBlazeUI** is a comprehensive **Blazor UI component library** built with **.NET 10**, styled using **Tailwind CSS**, and inspired by the **shadcn/ui** design system. It is a renamed fork of the open-source **Blazor Blueprint** project (original author: Mathew Taylor), licensed under **Apache 2.0**.

The library provides a complete set of production-ready, accessible, and themeable UI components for building modern web applications with Blazor. It follows a **layered architecture** with headless primitives at the base and pre-styled components on top.

### 1.2 Core Purpose

TrBlazeUI solves the problem of building beautiful, accessible, and consistent user interfaces in Blazor without needing to design components from scratch. It offers:

- **Zero-configuration styling** - Pre-built CSS included; no Tailwind setup required by consumers
- **shadcn/ui theme compatibility** - Works with any theme from shadcn/ui or tweakcn.com
- **WCAG 2.1 AA accessibility** - Built-in keyboard navigation, ARIA attributes, focus management
- **Dark mode** - Built-in light/dark theme support via CSS class toggling
- **Three Blazor render modes** - Server, WebAssembly, and Auto (hybrid)

### 1.3 Solution Structure

The solution (`TrBlazeUI.sln`) contains **10 projects** organized into two groups:

```
TrBlazeUI/
├── src/                              # Library source code (5 projects)
│   ├── TrBlazeUI.Primitives/        # Headless, unstyled primitive components
│   ├── TrBlazeUI.Components/        # Pre-styled components (depends on Primitives)
│   ├── TrBlazeUI.Icons.Lucide/      # 1,640+ Lucide SVG icons
│   ├── TrBlazeUI.Icons.Heroicons/   # 1,288 Heroicons (4 variants)
│   └── TrBlazeUI.Icons.Feather/     # 286 Feather icons
│
├── demos/                            # Demo applications (5 projects)
│   ├── TrBlazeUI.Demo.Shared/       # Shared pages, layouts, services
│   ├── TrBlazeUI.Demo.Server/       # Server-side rendering demo
│   ├── TrBlazeUI.Demo.Wasm/         # WebAssembly demo
│   ├── TrBlazeUI.Demo.Auto/         # Auto (hybrid) demo - server host
│   └── TrBlazeUI.Demo.Auto.Client/  # Auto (hybrid) demo - WASM client
│
├── tools/                            # Build tooling
│   ├── tailwindcss.exe               # Standalone Tailwind CSS compiler
│   └── icon-generation/              # Icon data generation scripts
│
├── Directory.Build.props             # Shared MSBuild properties
├── .editorconfig                     # Code style rules
├── LICENSE                           # Apache 2.0 license
└── NOTICE                            # Original project attribution (required)
```

### 1.4 Component Library Overview

#### Primitives Layer (16 primitives)

Headless, unstyled components providing behavior and accessibility:

| Primitive | Purpose |
|-----------|---------|
| Accordion | Collapsible content sections |
| Checkbox | Binary selection control |
| Collapsible | Expandable/collapsible content |
| Dialog | Modal dialog windows |
| DropdownMenu | Dropdown menu with keyboard navigation |
| Floating | Floating portal positioning |
| HoverCard | Hover-triggered preview cards |
| Label | Accessible form labels |
| Popover | Floating content panels |
| RadioGroup | Single-selection radio buttons |
| Select | Dropdown selection control |
| Sheet | Slide-out side panels |
| Switch | Toggle switch control |
| Table | Data table with sorting, pagination, selection |
| Tabs | Tabbed interface navigation |
| Tooltip | Tooltip popups |

#### Styled Components Layer (68 components)

Pre-styled components built on top of Primitives:

| Category | Components |
|----------|------------|
| **Layout** | AspectRatio, Card, Resizable, ScrollArea, Separator, Sidebar |
| **Navigation** | Breadcrumb, Menubar, NavigationMenu, Pagination, ResponsiveNav, Tabs |
| **Forms** | Button, ButtonGroup, Calendar, Checkbox, ColorPicker, Combobox, CurrencyInput, DatePicker, DateRangePicker, Field, FileUpload, Input, InputGroup, InputOTP, Label, MaskedInput, MultiSelect, NativeSelect, NumericInput, RadioGroup, RangeSlider, Rating, Select, Slider, Switch, Textarea, TimePicker, Toggle |
| **Data Display** | Avatar, Badge, DataTable, Empty, Item, Kbd, Progress, Skeleton, Spinner, Typography |
| **Feedback** | Alert, AlertDialog, Dialog, Drawer, HoverCard, Popover, Sheet, Toast, Tooltip |
| **Overlay** | ContextMenu, Command, DropdownMenu |
| **Media** | Carousel |
| **Rich Content** | Chart (Area, Bar, Line, Pie, Radar, Radial), MarkdownEditor, RichTextEditor |

#### Icon Libraries (3 libraries)

| Library | Icon Count | License |
|---------|-----------|---------|
| Lucide | 1,640+ | ISC |
| Heroicons | 1,288 (4 variants: outline, solid, mini, micro) | MIT |
| Feather | 286 | MIT |

### 1.5 Demo Application

The demo application showcases every component with interactive examples. It is available in three Blazor render modes:

| Demo App | Render Mode | Port (HTTP) | Port (HTTPS) |
|----------|-------------|-------------|---------------|
| Demo.Server | Interactive Server | 5183 | 7172 |
| Demo.Wasm | WebAssembly | 5184 | 7173 |
| Demo.Auto | Auto (Hybrid) | 5185 | 7174 |

The demo includes **90+ pages**: component demos, primitive demos, chart demos, icon library demos, architecture overview, and a getting started guide.

---

## 2. Technology Stack

### 2.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **.NET** | 8.0 | Runtime and SDK |
| **Blazor** | .NET 10 | Web UI framework (Server, WASM, Auto modes) |
| **C#** | 14 | Primary programming language |
| **Razor** | .NET 10 | Component templating syntax |
| **Tailwind CSS** | v4 (standalone) | Utility-first CSS framework |
| **JavaScript** | ES6+ | Browser interop (JS Interop) |

### 2.2 NuGet Package Dependencies

#### TrBlazeUI.Components

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.AspNetCore.Components.Web` | 10.0.2 | Blazor web component framework |
| `Blazor-ApexCharts` | 6.1.0 | Chart/data visualization (ApexCharts wrapper) |
| `HtmlSanitizer` | 9.0.892 | HTML sanitization for security (RichTextEditor) |
| `Markdig` | 0.44.0 | Markdown parsing (MarkdownEditor) |
| `MinVer` | 7.0.0 | Semantic versioning from git tags |

#### TrBlazeUI.Primitives

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.AspNetCore.Components.Web` | 10.0.2 | Blazor web component framework |
| `MinVer` | 7.0.0 | Semantic versioning from git tags |

#### Icon Libraries (all three)

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.AspNetCore.Components.Web` | 10.0.2 | Blazor web component framework |
| `MinVer` | 7.0.0 | Semantic versioning from git tags |

#### Demo Apps (additional)

| Package | Version | Purpose |
|---------|---------|---------|
| `Microsoft.AspNetCore.Components.WebAssembly` | 10.0.2 | Blazor WASM runtime (Wasm/Auto demos) |
| `Microsoft.AspNetCore.Components.WebAssembly.DevServer` | 10.0.2 | Dev server for WASM (Wasm demo only) |
| `Microsoft.AspNetCore.Components.WebAssembly.Server` | 10.0.2 | WASM server-side hosting (Auto demo) |

### 2.3 CSS & Styling

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS v4** | Utility-first CSS compilation |
| **CSS Custom Properties** | Theming via CSS variables (shadcn/ui compatible) |
| **OKLCH Color Space** | Modern, perceptually uniform color definitions |
| **Dark Mode** | Class-based toggling (`.dark` CSS class) |

**Theme Variables** (CSS custom properties):
- Colors: `--primary`, `--secondary`, `--destructive`, `--muted`, `--accent`, `--popover`, `--card`, `--sidebar`, `--alert-*`, `--chart-*`
- Typography: `--font-sans`, `--font-serif`, `--font-mono`
- Spacing: `--radius`, `--spacing`, `--sidebar-width`, `--sidebar-width-mobile`, `--sidebar-width-icon`
- Shadows: `--shadow-2xs` through `--shadow-2xl`

### 2.4 JavaScript Interop

The library uses **Blazor JS Interop** for browser-specific functionality:

**Components JS (12 files):**
- `file-upload.js` - File upload handling
- `markdown-editor.js` - Markdown editor functionality
- `masked-input.js` - Input format masking
- `multiselect.js` - Multi-select dropdown behavior
- `navigation-menu.js` - Navigation menu interactions
- `quill-interop.js` - Rich text editor (Quill.js integration)
- `range-slider.js` - Range slider behavior
- `resizable.js` - Resizable panel logic
- `responsive-nav.js` - Responsive navigation
- `sidebar.js` - Sidebar interactions
- `slider.js` - Slider control
- `virtualization-scroll.js` - Virtual scrolling

**Primitives JS (12 files):**
- `click-outside.js` - Click-outside detection
- `element-utils.js` - DOM element utilities
- `focus-trap.js` - Focus trapping for modals/dialogs
- `keyboard-nav.js` - Keyboard navigation handling
- `keyboard-shortcuts.js` - Keyboard shortcut processing
- `match-trigger-width.js` - Match trigger element width
- `portal.js` - DOM portal manipulation
- `positioning.js` - Floating-UI positioning logic
- `select.js` - Select component interactions
- `table-row-nav.js` - Table row keyboard navigation
- `dropdown-menu.js` - Dropdown positioning
- `select.js` (component-level) - Select behavior

### 2.5 Build & Versioning

| Tool | Purpose |
|------|---------|
| **MSBuild** | .NET project build system |
| **MinVer** | Git tag-based semantic versioning |
| **Tailwind CSS Standalone** | CSS compilation (pre-built binary, no Node.js needed) |
| **TreatWarningsAsErrors** | Strict code quality enforcement |
| **EnforceCodeStyleInBuild** | Build-time code style checks |
| **AnalysisLevel: latest-recommended** | Latest C# code analysis rules |

### 2.6 Architectural Patterns

| Pattern | Description |
|---------|-------------|
| **Headless + Styled layers** | Primitives provide behavior; Components add styling |
| **Cascading Parameter Context** | Parent-child state via `CascadingParameter` (13 context types) |
| **AsChild / TriggerContext** | Allows trigger behavior on custom elements |
| **Service-based DI** | Portal, Focus, Keyboard, Positioning services |
| **Enum-based Configuration** | Variants/sizes as C# enums (e.g., `ButtonVariant`, `ButtonSize`) |
| **Component Composition** | Multi-part components (e.g., Dialog = 8 sub-components) |
| **CSS Variable Theming** | All colors/spacing via CSS custom properties |

---

## 3. Required Frameworks & Tools

### 3.1 Mandatory Requirements

| Requirement | Minimum Version | Download |
|-------------|----------------|----------|
| **.NET SDK** | 8.0 (latest patch recommended) | https://dotnet.microsoft.com/download/dotnet/10.0 |
| **Operating System** | Windows 10/11 (native), or WSL2 for Linux | - |

### 3.2 Recommended Development Tools

| Tool | Purpose | Download |
|------|---------|----------|
| **Visual Studio 2022** | Full IDE with Blazor support | https://visualstudio.microsoft.com/ |
| **Visual Studio Code** | Lightweight editor | https://code.visualstudio.com/ |
| **C# Dev Kit** (VS Code extension) | C# language support for VS Code | VS Code Marketplace |
| **Git** | Version control | https://git-scm.com/ |

### 3.3 Included Tooling (No Additional Install Needed)

The following tools are **already included** in the repository:

| Tool | Location | Purpose |
|------|----------|---------|
| **tailwindcss.exe** | `tools/tailwindcss.exe` | Standalone Tailwind CSS compiler (no Node.js required) |
| **Icon generation scripts** | `tools/icon-generation/` | Regenerate icon data files (only needed for icon updates) |

### 3.4 Optional Tools

| Tool | Purpose | When Needed |
|------|---------|-------------|
| **Node.js** | Icon data regeneration scripts | Only if updating icon libraries |
| **PowerShell** | Lucide icon generation script | Only if updating Lucide icons |
| **Web browser** | Viewing the demo application | Chrome, Edge, Firefox, Safari |

### 3.5 Verified .NET Workloads

No additional .NET workloads are required beyond the base SDK. The project uses the standard ASP.NET Core components included with .NET 10.

---

## 4. Step-by-Step Setup & Execution Guide

### Step 1: Install Prerequisites

#### 1a. Install .NET 10 SDK

Download and install the .NET 10 SDK from Microsoft:

**Windows:**
- Download the installer from https://dotnet.microsoft.com/download/dotnet/10.0
- Run the installer and follow prompts
- Verify installation:
  ```bash
  dotnet --version
  # Should output: 10.0.x
  ```

**WSL2 (Ubuntu/Debian):**
- The project uses the **Windows dotnet** executable from WSL. Ensure .NET 10 SDK is installed on the Windows side.
- The path used is: `"/mnt/c/Program Files/dotnet/dotnet.exe"`

#### 1b. Install Git

```bash
# Windows (via winget)
winget install Git.Git

# Verify
git --version
```

### Step 2: Clone the Repository

```bash
git clone <repository-url> TrBlazeUI
cd TrBlazeUI
```

Or if you already have the repository:

```bash
cd /path/to/TrBlazeUI
git checkout Dev
```

### Step 3: Restore NuGet Packages

```bash
dotnet restore TrBlazeUI.sln
```

**WSL2 Note:** Use the Windows dotnet executable:
```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" restore "C:\3AIGenCode\TrBlazeUI\TrBlazeUI.sln"
```

This downloads all NuGet package dependencies for all 10 projects.

### Step 4: Build the Solution

```bash
dotnet build TrBlazeUI.sln
```

**WSL2 Note:**
```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" build "C:\3AIGenCode\TrBlazeUI\TrBlazeUI.sln"
```

**Build Notes:**
- The Tailwind CSS build step runs automatically on Windows during build (compiles `trblazeui-input.css` to `trblazeui.css`)
- To skip the Tailwind build (e.g., in CI or if `tools/tailwindcss.exe` is unavailable), add `-p:CI=true`:
  ```bash
  dotnet build TrBlazeUI.sln -p:CI=true
  ```
- Pre-built CSS is committed to the repo, so skipping the Tailwind step still works
- `TreatWarningsAsErrors` is enabled -- all compiler warnings must be resolved
- MinVer warnings about missing git tags are expected and can be ignored

### Step 5: Run a Demo Application

Choose one of the three demo applications to run:

#### Option A: Server-Side Rendering Demo (Recommended for First Run)

```bash
dotnet run --project demos/TrBlazeUI.Demo.Server
```

**WSL2:**
```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" run --project "C:\3AIGenCode\TrBlazeUI\demos\TrBlazeUI.Demo.Server"
```

**Access:** Open your browser to:
- HTTP: http://localhost:5183
- HTTPS: https://localhost:7172

#### Option B: WebAssembly Demo

```bash
dotnet run --project demos/TrBlazeUI.Demo.Wasm
```

**Access:**
- HTTP: http://localhost:5184
- HTTPS: https://localhost:7173

**Note:** First load may be slower as the WASM runtime downloads.

#### Option C: Auto (Hybrid) Demo

```bash
dotnet run --project demos/TrBlazeUI.Demo.Auto
```

**Access:**
- HTTP: http://localhost:5185
- HTTPS: https://localhost:7174

**Note:** This mode starts with server rendering and transitions to WASM after download.

### Step 6: Explore the Demo Application

Once running, the demo application presents a sidebar navigation with the following sections:

| Section | URL Path | Content |
|---------|----------|---------|
| **Home** | `/` | Landing page with project overview |
| **Architecture** | `/architecture` | Library architecture explanation |
| **Getting Started** | `/getting-started` | Quick start guide |
| **Components** | `/components` | 68 styled component demos |
| **Primitives** | `/primitives` | 16 headless primitive demos |
| **Charts** | `/charts/*` | 6 chart type demos (Area, Bar, Line, Pie, Radar, Radial) |
| **Icons** | `/icons` | Icon library browser (Lucide, Heroicons, Feather) |

### Step 7: Build for Release (Optional)

```bash
dotnet build TrBlazeUI.sln -c Release
```

### Step 8: Create NuGet Packages (Optional)

```bash
dotnet pack src/TrBlazeUI.Components/TrBlazeUI.Components.csproj -c Release
dotnet pack src/TrBlazeUI.Primitives/TrBlazeUI.Primitives.csproj -c Release
dotnet pack src/TrBlazeUI.Icons.Lucide/TrBlazeUI.Icons.Lucide.csproj -c Release
dotnet pack src/TrBlazeUI.Icons.Heroicons/TrBlazeUI.Icons.Heroicons.csproj -c Release
dotnet pack src/TrBlazeUI.Icons.Feather/TrBlazeUI.Icons.Feather.csproj -c Release
```

Packages will be output to `bin/Release/*.nupkg`.

---

## 5. Appendix: Project Structure Reference

### 5.1 Complete Directory Tree

```
TrBlazeUI/
│
├── src/
│   ├── TrBlazeUI.Components/
│   │   ├── Components/                    # 68 component folders
│   │   │   ├── Accordion/                 # Accordion, AccordionContent, AccordionItem, AccordionTrigger
│   │   │   ├── Alert/                     # Alert, AlertDescription, AlertTitle, AlertVariant
│   │   │   ├── AlertDialog/               # AlertDialog + 8 sub-components
│   │   │   ├── AspectRatio/
│   │   │   ├── Avatar/                    # Avatar, AvatarFallback, AvatarImage, AvatarSize
│   │   │   ├── Badge/                     # Badge, BadgeVariant
│   │   │   ├── Breadcrumb/                # 7 sub-components
│   │   │   ├── Button/                    # Button, ButtonSize, ButtonType, ButtonVariant, IconPosition
│   │   │   ├── ButtonGroup/               # ButtonGroup, Separator, Text
│   │   │   ├── Calendar/
│   │   │   ├── Card/                      # Card + 6 sub-components
│   │   │   ├── Carousel/                  # Carousel + 4 sub-components
│   │   │   ├── Chart/                     # 7 chart types + config classes
│   │   │   ├── Checkbox/
│   │   │   ├── Collapsible/               # Collapsible + Content, Context, Trigger
│   │   │   ├── ColorPicker/               # ColorPicker, ColorFormat, ColorUtils
│   │   │   ├── Combobox/
│   │   │   ├── Command/                   # Command + 8 sub-components
│   │   │   ├── ContextMenu/               # ContextMenu + 6 sub-components
│   │   │   ├── CurrencyInput/             # CurrencyInput, CurrencyCatalog, CurrencyDefinition
│   │   │   ├── DataTable/                 # DataTable, Column, SelectionMode, Toolbar
│   │   │   ├── DatePicker/
│   │   │   ├── DateRangePicker/           # DateRangePicker, DateRange
│   │   │   ├── Dialog/                    # Dialog + 7 sub-components
│   │   │   ├── Drawer/                    # Drawer + 7 sub-components, DrawerDirection
│   │   │   ├── DropdownMenu/              # DropdownMenu + 8 sub-components
│   │   │   ├── Empty/                     # Empty, EmptySize
│   │   │   ├── Field/                     # Field + 9 sub-components
│   │   │   ├── FileUpload/                # FileUpload, FileUploadItem, FileValidationError
│   │   │   ├── HoverCard/                 # HoverCard, Content, Trigger
│   │   │   ├── Input/                     # Input, InputType
│   │   │   ├── InputGroup/                # InputGroup + 6 sub-components
│   │   │   ├── InputOTP/                  # InputOTP, InputOTPSize
│   │   │   ├── Item/                      # Item + 10 sub-components
│   │   │   ├── Kbd/                       # Kbd, KbdSize
│   │   │   ├── Label/
│   │   │   ├── MarkdownEditor/
│   │   │   ├── MaskedInput/
│   │   │   ├── Menubar/                   # Menubar + 6 sub-components
│   │   │   ├── MultiSelect/
│   │   │   ├── NativeSelect/
│   │   │   ├── NavigationMenu/            # NavigationMenu + 6 sub-components
│   │   │   ├── NumericInput/
│   │   │   ├── Pagination/                # Pagination + 5 sub-components
│   │   │   ├── Popover/                   # Popover + Content, Trigger
│   │   │   ├── Progress/
│   │   │   ├── RadioGroup/                # RadioGroup, RadioGroupItem
│   │   │   ├── RangeSlider/
│   │   │   ├── Rating/
│   │   │   ├── Resizable/                 # Resizable, Handle, Panel
│   │   │   ├── ResponsiveNav/
│   │   │   ├── RichTextEditor/
│   │   │   ├── ScrollArea/                # ScrollArea + Scrollbar, Thumb, Viewport
│   │   │   ├── Select/                    # Select + Content, Item, Trigger, Value
│   │   │   ├── Separator/                 # Separator, SeparatorOrientation
│   │   │   ├── Sheet/                     # Sheet + 9 sub-components
│   │   │   ├── Sidebar/                   # Sidebar + 22 sub-components
│   │   │   ├── Skeleton/                  # Skeleton, SkeletonShape
│   │   │   ├── Slider/
│   │   │   ├── Spinner/
│   │   │   ├── Switch/
│   │   │   ├── Tabs/                      # Tabs + Content, List, Trigger
│   │   │   ├── Textarea/
│   │   │   ├── TimePicker/
│   │   │   ├── Toast/                     # Toast + 6 sub-components + ToastService
│   │   │   ├── Toggle/                    # Toggle, ToggleSize, ToggleVariant
│   │   │   ├── Tooltip/                   # Tooltip + Content, Provider, Trigger
│   │   │   └── Typography/               # Typography, TypographyVariant
│   │   ├── wwwroot/
│   │   │   ├── css/
│   │   │   │   └── trblazeui-input.css    # Tailwind input source
│   │   │   ├── js/                        # 12 JS interop files
│   │   │   └── trblazeui.css              # Pre-built Tailwind output (~83 KB)
│   │   ├── tailwind.config.js
│   │   ├── _Imports.razor
│   │   ├── README.md
│   │   └── TrBlazeUI.Components.csproj
│   │
│   ├── TrBlazeUI.Primitives/
│   │   ├── Primitives/                    # 16 primitive component folders
│   │   │   ├── Accordion/
│   │   │   ├── Checkbox/
│   │   │   ├── Collapsible/
│   │   │   ├── Dialog/
│   │   │   ├── DropdownMenu/
│   │   │   ├── Floating/
│   │   │   ├── HoverCard/
│   │   │   ├── Label/
│   │   │   ├── Popover/
│   │   │   ├── RadioGroup/
│   │   │   ├── Select/
│   │   │   ├── Sheet/
│   │   │   ├── Switch/
│   │   │   ├── Table/
│   │   │   ├── Tabs/
│   │   │   └── Tooltip/
│   │   ├── Services/                      # Portal, Focus, Keyboard, Positioning services
│   │   ├── Utilities/                     # AriaBuilder, IdGenerator, KeyboardNavigator, etc.
│   │   ├── Contexts/                      # PrimitiveContext base class
│   │   ├── Extensions/                    # ServiceCollectionExtensions (DI registration)
│   │   ├── wwwroot/
│   │   │   ├── Components/                # Component-specific JS (DropdownMenu, Select)
│   │   │   └── js/primitives/             # 10 core JS utility files
│   │   ├── _Imports.razor
│   │   ├── README.md
│   │   └── TrBlazeUI.Primitives.csproj
│   │
│   ├── TrBlazeUI.Icons.Lucide/
│   │   ├── Components/                    # LucideIcon.razor, LucideIcon.razor.cs
│   │   ├── Data/                          # LucideIconData.cs (auto-generated, 1640+ icons)
│   │   └── TrBlazeUI.Icons.Lucide.csproj
│   │
│   ├── TrBlazeUI.Icons.Heroicons/
│   │   ├── Components/                    # HeroIcon.razor, HeroIcon.razor.cs
│   │   ├── Data/                          # HeroIconData.cs (auto-generated, 1288 icons)
│   │   └── TrBlazeUI.Icons.Heroicons.csproj
│   │
│   └── TrBlazeUI.Icons.Feather/
│       ├── Components/                    # FeatherIcon.razor, FeatherIcon.razor.cs
│       ├── Data/                          # FeatherIconData.cs (auto-generated, 286 icons)
│       └── TrBlazeUI.Icons.Feather.csproj
│
├── demos/
│   ├── TrBlazeUI.Demo.Shared/
│   │   ├── Pages/
│   │   │   ├── Index.razor                # Home page
│   │   │   ├── Architecture.razor         # Architecture overview
│   │   │   ├── GettingStarted.razor       # Getting started guide
│   │   │   ├── Components/                # 77+ component demo pages
│   │   │   ├── Charts/                    # 6 chart demo pages
│   │   │   ├── Icons/                     # 4 icon demo pages
│   │   │   └── Primitives/                # 14+ primitive demo pages
│   │   ├── Shared/
│   │   │   └── MainLayout.razor           # Sidebar-based layout
│   │   ├── Services/                      # ThemeService, CollapsibleStateService, MockDataService
│   │   ├── Extensions/                    # ServiceCollectionExtensions
│   │   ├── wwwroot/
│   │   │   ├── css/
│   │   │   │   ├── app-input.css          # Tailwind input
│   │   │   │   └── app.css                # Tailwind output (generated)
│   │   │   └── styles/
│   │   │       ├── theme.css              # OKLCH theme variables (light + dark)
│   │   │       └── base.css               # Base layer styles
│   │   ├── Routes.razor
│   │   ├── _Imports.razor
│   │   ├── tailwind.config.js
│   │   └── TrBlazeUI.Demo.Shared.csproj
│   │
│   ├── TrBlazeUI.Demo.Server/
│   │   ├── Program.cs                     # Server-side Blazor setup
│   │   ├── App.razor                      # Root component (InteractiveServer)
│   │   ├── Properties/launchSettings.json # Ports: 5183 / 7172
│   │   └── TrBlazeUI.Demo.Server.csproj
│   │
│   ├── TrBlazeUI.Demo.Wasm/
│   │   ├── Program.cs                     # WebAssembly host setup
│   │   ├── App.razor                      # Root component
│   │   ├── Properties/launchSettings.json # Ports: 5184 / 7173
│   │   └── TrBlazeUI.Demo.Wasm.csproj
│   │
│   └── TrBlazeUI.Demo.Auto/
│       ├── Program.cs                     # Hybrid (Server + WASM) setup
│       ├── App.razor                      # Root component (InteractiveAuto)
│       ├── Properties/launchSettings.json # Ports: 5185 / 7174
│       ├── TrBlazeUI.Demo.Auto.csproj
│       └── TrBlazeUI.Demo.Auto.Client/
│           ├── Program.cs                 # WASM client entry point
│           ├── _Imports.razor
│           └── TrBlazeUI.Demo.Auto.Client.csproj
│
├── tools/
│   ├── tailwindcss.exe                    # Standalone Tailwind CSS compiler
│   └── icon-generation/
│       ├── README.md                      # Icon generation documentation
│       └── data/                          # Source icon JSON data
│
├── Directory.Build.props                  # Shared MSBuild properties
├── .editorconfig                          # Code style enforcement
├── .gitignore                             # Git ignore rules
├── TrBlazeUI.sln                          # Visual Studio solution file
├── LICENSE                                # Apache 2.0 license
├── NOTICE                                 # Original project attribution
└── CLAUDE.md                              # AI assistant instructions
```

### 5.2 Key Configuration Files

#### Directory.Build.props
Applies to all projects in the solution:
- **Authors:** TrBlazeUI Contributors
- **License:** Apache-2.0
- **TreatWarningsAsErrors:** true
- **EnforceCodeStyleInBuild:** true
- **AnalysisLevel:** latest-recommended
- **GenerateDocumentationFile:** true

#### .editorconfig
Enforces consistent code style:
- 4-space indentation for C#, 2-space for XML/JSON/JS
- PascalCase for public types and members
- camelCase for private fields and local variables
- `I` prefix for interfaces
- Nullable reference types enforced at ERROR severity
- Braces always required

### 5.3 Service Registration

To use TrBlazeUI in a new Blazor project, register services in `Program.cs`:

```csharp
// Register primitive services (required)
builder.Services.AddTrBlazeUIPrimitives();

// Register toast service (if using Toast component)
builder.Services.AddScoped<ToastService>();
```

The `AddTrBlazeUIPrimitives()` extension method registers:
- `IPortalService` / `PortalService` - Portal management
- `IPositioningService` / `PositioningService` - Floating element positioning
- `IFocusManager` / `FocusManager` - Focus trap management
- `IKeyboardShortcutService` / `KeyboardShortcutService` - Keyboard shortcuts
- `DropdownManagerService` - Dropdown menu state

### 5.4 Versioning Strategy

Each library uses independent **MinVer** semantic versioning from git tags:

| Package | Tag Prefix | Example Tag |
|---------|------------|-------------|
| TrBlazeUI.Components | `components/v` | `components/v1.0.0` |
| TrBlazeUI.Primitives | `primitives/v` | `primitives/v1.0.0` |
| TrBlazeUI.Icons.Lucide | `icons-lucide/v` | `icons-lucide/v1.0.0` |
| TrBlazeUI.Icons.Heroicons | `icons-heroicons/v` | `icons-heroicons/v1.0.0` |
| TrBlazeUI.Icons.Feather | `icons-feather/v` | `icons-feather/v1.0.0` |

---

*This document was generated by analyzing the complete TrBlazeUI codebase.*
