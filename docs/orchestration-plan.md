# TrBlazeUI Modernization & AI Integration - Orchestration Plan

**Date:** 2026-02-10
**Prepared by:** Mary (Business Analyst)
**Execution:** BMAD Orchestrator Agent - Parallel Multi-Agent Execution
**Repository:** TrBlazeUI (branch: Dev)

---

## Executive Summary

This document defines **five work streams** to modernize TrBlazeUI and enable AI-driven development. The orchestrator should assign work streams to appropriate agents and execute in parallel where possible.

**Work Streams:**

| # | Work Stream | Agent | Parallelizable | Dependencies |
|---|-------------|-------|----------------|--------------|
| WS-1 | .NET 8 → .NET 10 Full Upgrade + Coding Standards Enforcement | Dev | Yes (start first) | None |
| WS-2 | GitHub Packages CI/CD Workflow | Dev | Yes (after WS-1 build verification) | WS-1 must complete first |
| WS-3 | AI Component Reference Document | Architect / Analyst | Yes | None |
| WS-4 | Claude Code Skill for TrBlazeUI | Dev | After WS-3 | WS-3 (needs reference doc) |
| WS-5 | OpenCode Skill for TrBlazeUI | Dev | After WS-3 | WS-3 (needs reference doc) |

**Execution Order:**
1. Start WS-1 and WS-3 in parallel
2. Start WS-2 after WS-1 completes successfully
3. Start WS-4 and WS-5 in parallel after WS-3 completes

---

## Work Stream 1: .NET 8 → .NET 10 Full Upgrade

### Objective
Upgrade all 10 projects from .NET 8 to .NET 10 (latest LTS), including all NuGet package dependencies. Additionally, enforce the project coding standards defined in `docs/Coding-Standards.md` across the entire C# codebase during this migration. This includes renaming private fields to `obj` prefix convention, adding mandatory XML documentation, enforcing file-scoped namespaces, applying `ConfigureAwait(false)` in library code, and ensuring all naming conventions comply.

### Scope

**10 projects to update:**

#### Library Projects (5)
| Project | File Path | Current TFM |
|---------|-----------|-------------|
| TrBlazeUI.Components | `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj` | net8.0 |
| TrBlazeUI.Primitives | `src/TrBlazeUI.Primitives/TrBlazeUI.Primitives.csproj` | net8.0 |
| TrBlazeUI.Icons.Lucide | `src/TrBlazeUI.Icons.Lucide/TrBlazeUI.Icons.Lucide.csproj` | net8.0 |
| TrBlazeUI.Icons.Heroicons | `src/TrBlazeUI.Icons.Heroicons/TrBlazeUI.Icons.Heroicons.csproj` | net8.0 |
| TrBlazeUI.Icons.Feather | `src/TrBlazeUI.Icons.Feather/TrBlazeUI.Icons.Feather.csproj` | net8.0 |

#### Demo Projects (5)
| Project | File Path | Current TFM |
|---------|-----------|-------------|
| TrBlazeUI.Demo.Server | `demos/TrBlazeUI.Demo.Server/TrBlazeUI.Demo.Server.csproj` | net8.0 |
| TrBlazeUI.Demo.Wasm | `demos/TrBlazeUI.Demo.Wasm/TrBlazeUI.Demo.Wasm.csproj` | net8.0 |
| TrBlazeUI.Demo.Auto | `demos/TrBlazeUI.Demo.Auto/TrBlazeUI.Demo.Auto.csproj` | net8.0 |
| TrBlazeUI.Demo.Auto.Client | `demos/TrBlazeUI.Demo.Auto/TrBlazeUI.Demo.Auto.Client/TrBlazeUI.Demo.Auto.Client.csproj` | net8.0 |
| TrBlazeUI.Demo.Shared | `demos/TrBlazeUI.Demo.Shared/TrBlazeUI.Demo.Shared.csproj` | net8.0 |

### Step-by-Step Instructions

#### Step 1.1: Update TargetFramework in ALL .csproj files

In every `.csproj` file listed above, change:
```xml
<TargetFramework>net8.0</TargetFramework>
```
to:
```xml
<TargetFramework>net10.0</TargetFramework>
```

#### Step 1.2: Update Microsoft.AspNetCore.* Package Versions

Search for and update these packages in all .csproj files where they appear. Find the latest stable 10.x version on NuGet and use that version.

| Package | Current Version | Update To | Found In |
|---------|----------------|-----------|----------|
| `Microsoft.AspNetCore.Components.Web` | 8.0.14 | Latest 10.0.x | Components, Primitives, Icons.Lucide, Icons.Heroicons, Icons.Feather, Demo.Shared |
| `Microsoft.AspNetCore.Components.WebAssembly` | 8.0.14 | Latest 10.0.x | Demo.Wasm, Demo.Auto.Client |
| `Microsoft.AspNetCore.Components.WebAssembly.DevServer` | 8.0.14 | Latest 10.0.x | Demo.Wasm |
| `Microsoft.AspNetCore.Components.WebAssembly.Server` | 8.0.14 | Latest 10.0.x | Demo.Auto |

**IMPORTANT:** All Microsoft.AspNetCore.* packages must use the **same minor version** (e.g., all 10.0.x).

#### Step 1.3: Update Third-Party NuGet Packages

These are only in `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj`:

| Package | Current Version | Action |
|---------|----------------|--------|
| `Blazor-ApexCharts` | 4.0.0 | Search NuGet for latest version compatible with .NET 10. If latest is still 4.x, keep it - it should work. |
| `HtmlSanitizer` | 9.0.892 | Update to latest stable version |
| `Markdig` | 0.37.0 | Update to latest stable version |
| `MinVer` | 5.0.0 | Update to latest stable version (used in all 5 library projects) |

**Method:** Use `dotnet outdated` or manually check NuGet.org for each package's latest stable version. The agent should search for ".NET 10 compatible" versions.

#### Step 1.4: Check for Breaking Changes

Key areas to verify after upgrade:

1. **Blazor render mode changes** - .NET 10 may have changes to `InteractiveServer`, `InteractiveWebAssembly`, `InteractiveAuto` render mode APIs. Check:
   - `demos/TrBlazeUI.Demo.Server/App.razor`
   - `demos/TrBlazeUI.Demo.Wasm/App.razor`
   - `demos/TrBlazeUI.Demo.Auto/App.razor`

2. **JS Interop** - Verify `IJSRuntime` usage still works. Check files in:
   - `src/TrBlazeUI.Primitives/wwwroot/js/primitives/`
   - `src/TrBlazeUI.Components/wwwroot/js/`

3. **C# language features** - .NET 10 supports C# 14. No changes needed but be aware of new analyzer warnings since `TreatWarningsAsErrors` is enabled.

4. **global.json** - Check if a `global.json` file exists in the root. If it does, update it to specify .NET 10 SDK. If it doesn't exist, create one:
   ```json
   {
     "sdk": {
       "version": "10.0.100",
       "rollForward": "latestMinor"
     }
   }
   ```

#### Step 1.5: Enforce Coding Standards During Migration

**Reference document:** `docs/Coding-Standards.md`

This is a forked codebase that was NOT originally written to our coding standards. The .NET 10 migration is the ideal time to bring ALL C# code into compliance. The agent MUST audit and refactor code across the entire `src/` and `demos/` directories to match these standards.

##### 1.5.1: C# Naming Convention Enforcement

Scan ALL `.cs` and `.razor.cs` files and refactor to comply:

| Element | Convention | Example | Anti-Pattern |
|---------|-----------|---------|-------------|
| Classes | PascalCase | `DatabaseConnection` | `database_connection` |
| Interfaces | `I` prefix + PascalCase | `IQueryExecutor` | `QueryExecutor` |
| Methods | PascalCase verbs | `GetConnection()` | `get_connection()` |
| Async methods | Suffix `Async` | `GetDataAsync()` | `GetData()` for async |
| Properties | PascalCase | `ConnectionString` | `connection_string` |
| Private fields | camelCase with `obj` prefix | `objLogger`, `objIsValid` | `_logger`, `logger` |
| Local variables | camelCase, NO underscores | `connectionString` | `connection_string` |
| Boolean variables | Question form with `obj` prefix (fields) | `objIsValid`, `objHasData` | `_valid`, `valid` |
| Constants | PascalCase, NO underscores | `MaxRetryCount`, `DefaultTimeout` | `MAX_RETRY_COUNT` |
| Parameters | camelCase, NO underscores | `connectionString` | `connection_string` |

**Critical rename patterns to search for across the codebase:**
- `_privateField` → `objPrivateField` (private fields must use `obj` prefix, not underscore prefix)
- `snake_case` anywhere in C# → convert to camelCase or PascalCase as appropriate
- `UPPER_SNAKE_CASE` constants → PascalCase
- Async methods missing `Async` suffix → add the suffix

**Search commands to identify violations:**
```bash
# Find underscore-prefixed private fields (common C# pattern that violates our standards)
grep -rn "private.*_[a-z]" src/ demos/ --include="*.cs"

# Find snake_case variables
grep -rn "[a-z]_[a-z]" src/ demos/ --include="*.cs"

# Find UPPER_SNAKE_CASE constants
grep -rn "const.*[A-Z]_[A-Z]" src/ demos/ --include="*.cs"

# Find async methods missing Async suffix
grep -rn "async Task.*[^c](" src/ demos/ --include="*.cs" | grep -v "Async("
```

**IMPORTANT:** When renaming private fields from `_name` to `objName`:
- Update ALL references to the field within the same class
- Ensure constructor assignments are updated (e.g., `_logger = logger;` → `objLogger = logger;`)
- Ensure Razor files (`.razor`) that reference `@_field` are updated to `@objField`
- Be careful with Blazor `[Parameter]`, `[CascadingParameter]`, `[Inject]` decorated properties - these remain PascalCase
- `EventCallback` fields and `RenderFragment` fields follow the same `obj` prefix rule when private

##### 1.5.2: File Structure Enforcement

Every `.cs` file must follow this order:
1. Using directives
2. Namespace (file-scoped: `namespace X;`)
3. Class/Interface declaration
4. Fields (private)
5. Constructors
6. Properties
7. Methods

**Check and convert** any non-file-scoped namespace declarations:
```csharp
// WRONG (block-scoped)
namespace TrBlazeUI.Components
{
    public class MyComponent { }
}

// CORRECT (file-scoped)
namespace TrBlazeUI.Components;

public class MyComponent { }
```

**Search command:**
```bash
# Find block-scoped namespaces (lines with "namespace" followed by "{" on next line)
grep -rn "^namespace " src/ demos/ --include="*.cs" -A1 | grep "{"
```

##### 1.5.3: XML Documentation Enforcement

**ALL public classes, methods, and properties MUST have XML documentation comments.** This is the most labor-intensive part of the migration.

Required XML elements for each public member:

| Member Type | Required Elements |
|-------------|------------------|
| Classes | `<summary>` |
| Methods | `<summary>`, `<remarks>` (with step-by-step logic), `<param>` (each parameter), `<returns>`, `<exception>` (each thrown exception) |
| Properties | `<summary>` |
| Enums | `<summary>` on the enum and each value |
| Interfaces | `<summary>` on the interface and each member |

**Example of compliant documentation:**
```csharp
/// <summary>
/// Executes a SQL query and returns results.
/// </summary>
/// <remarks>
/// This method performs the following steps:
/// 1. Validates the input query
/// 2. Opens a database connection
/// 3. Executes the query with timeout handling
/// 4. Returns results in a DataTable format
/// </remarks>
/// <param name="query">The SQL query to execute.</param>
/// <returns>Query results as DataTable.</returns>
/// <exception cref="ArgumentNullException">Thrown when query is null or empty.</exception>
public async Task<DataTable> ExecuteQueryAsync(string query)
```

**Scope:** This applies to ALL public members in:
- `src/TrBlazeUI.Primitives/` - All primitive components, services, utilities, contexts, extensions
- `src/TrBlazeUI.Components/` - All 68 component folders
- `src/TrBlazeUI.Icons.Lucide/` - Icon component and data
- `src/TrBlazeUI.Icons.Heroicons/` - Icon component and data
- `src/TrBlazeUI.Icons.Feather/` - Icon component and data
- `demos/` - All demo services and extensions (demo pages are lower priority)

**Note:** The project already has `<GenerateDocumentationFile>true</GenerateDocumentationFile>` in `Directory.Build.props` and suppresses `CS1591` (missing XML comments). Once XML docs are fully added, consider removing the `CS1591` suppression from `Directory.Build.props` to enforce documentation at build time. However, do NOT remove it until ALL public members have documentation, or the build will fail due to `TreatWarningsAsErrors`.

##### 1.5.4: Async/Await Pattern Enforcement

For all library projects (`src/`), ensure:

1. **All async methods end with `Async` suffix**
2. **Use `ConfigureAwait(false)` in library code** (NOT in demo Blazor components):
   ```csharp
   // Library code (src/) - CORRECT
   var result = await GetDataAsync().ConfigureAwait(false);

   // Blazor component code (demos/) - DO NOT add ConfigureAwait
   var result = await GetDataAsync();
   ```
3. **No `async void`** except for event handlers
4. **All I/O operations use async/await**

**Search for violations:**
```bash
# Find async void (potential violations)
grep -rn "async void" src/ demos/ --include="*.cs"

# Find await without ConfigureAwait in library code
grep -rn "await " src/ --include="*.cs" | grep -v "ConfigureAwait"
```

##### 1.5.5: Error Handling Pattern Enforcement

Ensure all try-catch blocks:
1. Catch **specific exceptions**, not bare `catch` or `catch (Exception)`
2. Use logging: `objLogger.LogError(ex, "message")`
3. Re-throw with `throw;` (not `throw ex;`) to preserve stack traces

```csharp
// CORRECT
try
{
    // Operation
}
catch (SpecificException ex)
{
    objLogger.LogError(ex, "Specific error occurred");
    throw;
}

// WRONG
try { } catch (Exception ex) { throw ex; }
```

##### 1.5.6: General Code Quality Checks

- **Nullable reference types** - Verify all projects have `<Nullable>enable</Nullable>` (already present in all .csproj files, but verify code compliance)
- **One class per file** - Split any files containing multiple public classes
- **File names match class names** - Rename files where they don't match
- **Method length** - Flag methods > 20 lines for potential refactoring (log but don't block migration)
- **Max nesting depth** - Flag code with > 3 levels of nesting
- **Remove commented-out code** - Search for and remove any `//` blocks of dead code
- **Remove unused usings** - Run code cleanup or verify IDE settings handle this

##### 1.5.7: Prioritization Strategy

Given the large scope, prioritize in this order:

1. **P0 - Build-breaking:** Naming changes that cause compile errors (do all renames atomically)
2. **P1 - Private field renames** (`_field` → `objField`): Highest-impact convention change, affects most files
3. **P2 - File-scoped namespaces:** Quick mechanical change across all files
4. **P3 - Async suffix enforcement:** Rename async methods, update all call sites
5. **P4 - ConfigureAwait(false) in libraries:** Add to all `await` in `src/` projects
6. **P5 - XML documentation:** Most time-consuming, do after build is green
7. **P6 - Error handling & code quality:** Audit and fix incrementally

**CRITICAL:** After each priority level, rebuild and verify the solution compiles with 0 errors before proceeding to the next level.

#### Step 1.6: Build and Verify

Build the entire solution using:
```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" build "C:\3AIGenCode\TrBlazeUI\TrBlazeUI.sln" -p:CI=true
```

**Note:** Use `-p:CI=true` to skip Tailwind CSS build step (pre-built CSS is committed). The Windows dotnet path is required when running from WSL.

**Success criteria:** Build completes with 0 errors. Warnings from MinVer (about missing git tags) are expected and acceptable.

#### Step 1.7: Update Documentation References

Update `docs/TrBlazeUI-Doc.md`:
- Change all references from ".NET 8" to ".NET 10"
- Update package version numbers in the technology stack tables
- Update any `net8.0` references to `net10.0`

---

## Work Stream 2: GitHub Packages CI/CD Workflow

### Objective
Create a GitHub Actions workflow that automatically builds and publishes NuGet packages for all 5 library projects to GitHub Packages on every push to the `master` branch.

### Prerequisites
- WS-1 must be completed (solution builds on .NET 10)

### Deliverables

#### Step 2.1: Create GitHub Actions Workflow File

Create file: `.github/workflows/publish-nuget.yml`

```yaml
name: Build and Publish NuGet Packages

on:
  push:
    branches:
      - master

env:
  DOTNET_VERSION: '10.0.x'
  NUGET_SOURCE: 'https://nuget.pkg.github.com/OWNER/index.json'

jobs:
  build-and-publish:
    runs-on: windows-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history needed for MinVer

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore TrBlazeUI.sln

      - name: Build solution
        run: dotnet build TrBlazeUI.sln -c Release --no-restore -p:CI=true

      - name: Pack TrBlazeUI.Primitives
        run: dotnet pack src/TrBlazeUI.Primitives/TrBlazeUI.Primitives.csproj -c Release --no-build -o ./nupkgs

      - name: Pack TrBlazeUI.Components
        run: dotnet pack src/TrBlazeUI.Components/TrBlazeUI.Components.csproj -c Release --no-build -o ./nupkgs

      - name: Pack TrBlazeUI.Icons.Lucide
        run: dotnet pack src/TrBlazeUI.Icons.Lucide/TrBlazeUI.Icons.Lucide.csproj -c Release --no-build -o ./nupkgs

      - name: Pack TrBlazeUI.Icons.Heroicons
        run: dotnet pack src/TrBlazeUI.Icons.Heroicons/TrBlazeUI.Icons.Heroicons.csproj -c Release --no-build -o ./nupkgs

      - name: Pack TrBlazeUI.Icons.Feather
        run: dotnet pack src/TrBlazeUI.Icons.Feather/TrBlazeUI.Icons.Feather.csproj -c Release --no-build -o ./nupkgs

      - name: Publish to GitHub Packages
        run: dotnet nuget push ./nupkgs/*.nupkg --source ${{ env.NUGET_SOURCE }} --api-key ${{ secrets.GITHUB_TOKEN }} --skip-duplicate
```

**IMPORTANT:** Replace `OWNER` in the `NUGET_SOURCE` URL with the actual GitHub organization or username that owns the repository.

#### Step 2.2: Update Directory.Build.props

Update `Directory.Build.props` to set the repository URL and package source for GitHub Packages:

```xml
<Project>
  <PropertyGroup>
    <!-- Package Metadata - Common to all TrBlazeUI packages -->
    <Authors>TrBlazeUI Contributors</Authors>
    <Company>TrBlazeUI</Company>
    <Copyright>Copyright (c) 2025 TrBlazeUI Contributors</Copyright>

    <!-- License and Repository -->
    <PackageLicenseExpression>Apache-2.0</PackageLicenseExpression>
    <PackageProjectUrl>https://github.com/OWNER/TrBlazeUI</PackageProjectUrl>
    <RepositoryUrl>https://github.com/OWNER/TrBlazeUI</RepositoryUrl>
    <RepositoryType>git</RepositoryType>

    <!-- Build Configuration -->
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <GeneratePackageOnBuild>false</GeneratePackageOnBuild>
    <NoWarn>$(NoWarn);CS1591</NoWarn>

    <!-- Code Style Enforcement -->
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
  </PropertyGroup>
</Project>
```

**IMPORTANT:** Replace `OWNER` with the actual GitHub organization or username.

#### Step 2.3: Create NuGet.Config for Consumers

Create a `nuget.config` file in the repository root to document how consumers should configure their NuGet sources:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="TrBlazeUI" value="https://nuget.pkg.github.com/OWNER/index.json" />
  </packageSources>
  <packageSourceCredentials>
    <TrBlazeUI>
      <add key="Username" value="GITHUB_USERNAME" />
      <add key="ClearTextPassword" value="GITHUB_TOKEN" />
    </TrBlazeUI>
  </packageSourceCredentials>
</configuration>
```

**IMPORTANT:** Replace `OWNER` and credential placeholders. This file serves as a template; consumers should configure their own credentials.

#### Step 2.4: Create a Build-Only Workflow (Optional but Recommended)

Create file: `.github/workflows/build.yml`

This runs on PRs and branches (non-master) to validate the build:

```yaml
name: Build Validation

on:
  push:
    branches-ignore:
      - master
  pull_request:
    branches:
      - master

env:
  DOTNET_VERSION: '10.0.x'

jobs:
  build:
    runs-on: windows-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore dependencies
        run: dotnet restore TrBlazeUI.sln

      - name: Build solution
        run: dotnet build TrBlazeUI.sln -c Release --no-restore -p:CI=true
```

### Acceptance Criteria
- [ ] Workflow file exists at `.github/workflows/publish-nuget.yml`
- [ ] Build validation workflow exists at `.github/workflows/build.yml`
- [ ] Directory.Build.props has repository URLs populated
- [ ] nuget.config template exists in repo root
- [ ] Workflow uses `windows-latest` runner (matches Tailwind CSS build target OS)
- [ ] `--skip-duplicate` flag prevents re-publishing existing versions
- [ ] `fetch-depth: 0` ensures MinVer can compute versions from git tags
- [ ] `-p:CI=true` is used to skip Tailwind build (pre-built CSS is in repo)

---

## Work Stream 3: AI Component Reference Document

### Objective
Create a concise, structured reference document designed for AI agents to generate TrBlazeUI-based UIs. This document must cover theme setup, all components, layout patterns, and common compositions in a format optimized for AI consumption (not human tutorial-style).

### Deliverable

Create file: `docs/TrBlazeUI-AI-Reference.md`

### Document Structure

The document should follow this exact structure:

```
# TrBlazeUI AI Component Reference

## 1. Quick Start Setup
   - NuGet package installation commands
   - Program.cs service registration (AddTrBlazeUIPrimitives, AddScoped<ToastService>)
   - _Imports.razor required using statements
   - App.razor/Host page setup for each render mode

## 2. Theme Setup
   - CSS import order (trblazeui.css, theme.css, app.css)
   - Theme CSS variable reference (full list of --primary, --secondary, etc.)
   - OKLCH color format explanation with examples
   - Dark mode: add/remove .dark class on <html>
   - shadcn/ui theme compatibility (tweakcn.com themes work directly)
   - Example complete theme.css file (light + dark)

## 3. Layout Components
   ### Sidebar
   - SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter
   - SidebarMenu, SidebarMenuItem, SidebarMenuButton
   - SidebarGroup, SidebarGroupLabel, SidebarGroupContent
   - SidebarTrigger, SidebarSeparator, SidebarRail
   - Complete sidebar layout example with navigation

   ### Card
   - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
   - Example compositions

   ### Other Layout
   - AspectRatio, Resizable (Panel, Handle), ScrollArea, Separator

## 4. Navigation Components
   - Breadcrumb (+ sub-components)
   - Menubar (+ sub-components)
   - NavigationMenu (+ sub-components)
   - Pagination (+ sub-components)
   - ResponsiveNav
   - Tabs (TabsList, TabsTrigger, TabsContent)

## 5. Form Components
   For EACH form component, provide:
   - Component name and purpose (1 line)
   - Key parameters with types
   - Event callbacks
   - Minimal usage example (3-8 lines of Razor)

   Components to cover:
   - Button (variants: Default, Destructive, Outline, Secondary, Ghost, Link; sizes: Default, Sm, Lg, Icon)
   - ButtonGroup
   - Calendar
   - Checkbox (@bind-Checked)
   - ColorPicker
   - Combobox
   - CurrencyInput
   - DatePicker, DateRangePicker
   - Field (FieldLabel, FieldInput, FieldDescription, FieldMessage)
   - FileUpload
   - Input (@bind-Value, InputType enum)
   - InputGroup
   - InputOTP
   - Label
   - MaskedInput
   - MultiSelect
   - NativeSelect
   - NumericInput
   - RadioGroup + RadioGroupItem
   - RangeSlider
   - Rating
   - Select (SelectTrigger, SelectValue, SelectContent, SelectItem)
   - Slider
   - Switch (@bind-Checked)
   - Textarea
   - TimePicker
   - Toggle

## 6. Data Display Components
   - Avatar (AvatarImage, AvatarFallback, AvatarSize)
   - Badge (BadgeVariant)
   - DataTable (Column, SelectionMode, Toolbar)
   - Empty (EmptySize)
   - Item (+ sub-components)
   - Kbd (KbdSize)
   - Progress (Value, Max)
   - Skeleton (SkeletonShape)
   - Spinner
   - Typography (TypographyVariant: H1-H4, P, Lead, Large, Small, Muted, etc.)

## 7. Feedback & Overlay Components
   - Alert (AlertTitle, AlertDescription, AlertVariant)
   - AlertDialog (+ 8 sub-components)
   - Dialog (DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose)
   - Drawer (+ sub-components, DrawerDirection)
   - HoverCard
   - Popover
   - Sheet (SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose; Side enum)
   - Toast (ToastService injection, ShowSuccess/ShowError/ShowWarning/ShowInfo)
   - Tooltip (TooltipProvider, TooltipTrigger, TooltipContent)
   - ContextMenu (+ sub-components)
   - Command (+ sub-components)
   - DropdownMenu (+ sub-components)

## 8. Rich Content Components
   - Carousel (+ sub-components)
   - Chart (AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialChart)
   - MarkdownEditor
   - RichTextEditor

## 9. Icon Libraries
   - LucideIcon: <LucideIcon Name="LucideIconName.Search" Size="24" />
   - HeroIcon: <HeroIcon Name="HeroIconName.Home" Variant="HeroIconVariant.Outline" Size="24" />
   - FeatherIcon: <FeatherIcon Name="FeatherIconName.Activity" Size="24" />
   - List of commonly used icon names per library

## 10. Common Page Patterns
   ### Dashboard Layout
   - Sidebar + main content area
   - Card grid with stats
   - DataTable with toolbar

   ### Form Page
   - Card wrapping Field components
   - Validation pattern
   - Submit with Button

   ### List/Detail Page
   - DataTable with selection
   - Sheet or Dialog for detail view

   ### Settings Page
   - Tabs for categories
   - Toggle/Switch groups
   - Save with Toast feedback
```

### Content Guidelines

1. **Concise over verbose** - Use code examples, not paragraphs of explanation
2. **Every component must have a Razor code example** - Minimal but complete
3. **Parameter tables** - Show Type and Default for each parameter
4. **Event callbacks** - Show the EventCallback signature
5. **No tutorial prose** - This is a reference, not a getting-started guide
6. **Namespace prefixes NOT needed** - Components are available via `_Imports.razor`
7. **Two-way binding patterns** - Always show `@bind-Value` or `@bind-Checked` where applicable

### Source Material

The agent creating this document should read:
1. All component `.razor` and `.razor.cs` files in `src/TrBlazeUI.Components/Components/`
2. All primitive files in `src/TrBlazeUI.Primitives/Primitives/`
3. The demo pages in `demos/TrBlazeUI.Demo.Shared/Pages/Components/` for usage examples
4. Theme files: `demos/TrBlazeUI.Demo.Shared/wwwroot/styles/theme.css` and `base.css`
5. Service registration: `src/TrBlazeUI.Primitives/Extensions/ServiceCollectionExtensions.cs`
6. `_Imports.razor` files for namespace patterns

### Acceptance Criteria
- [ ] Document exists at `docs/TrBlazeUI-AI-Reference.md`
- [ ] All 68 styled components are covered with at least a usage example
- [ ] All 16 primitives are referenced
- [ ] Theme setup section includes a complete example theme.css
- [ ] All 3 icon libraries are covered with usage patterns
- [ ] At least 4 common page patterns are included with full Razor code
- [ ] Document is under 5,000 lines (concise, not bloated)
- [ ] No tutorial prose - pure reference format

---

## Work Stream 4: Claude Code Skill for TrBlazeUI

### Objective
Create a Claude Code skill that enables any developer using Claude Code to generate TrBlazeUI-based UI pages and components by invoking a simple command.

### Deliverable

Create file: `.bmad-core/agents/trblazeui-skill.md`

Also register the skill in Claude Code configuration so it's available as a slash command.

### Skill Definition

The skill file should follow the BMAD agent pattern already established in `.bmad-core/agents/`. Here is the specification:

```yaml
agent:
  name: TrBlazeUI Designer
  id: trblazeui-designer
  title: TrBlazeUI UI Generator
  icon: "🎨"
  whenToUse: "Use when generating Blazor UI pages, components, or layouts using the TrBlazeUI component library. Covers theme setup, component composition, page generation, and styling."

persona:
  role: Expert Blazor UI Developer specializing in TrBlazeUI component library
  style: Precise, code-focused, follows TrBlazeUI patterns and conventions
  identity: UI generation specialist that produces production-ready Blazor Razor pages using TrBlazeUI components
  focus: Generating correct, accessible, themeable Blazor UI code using TrBlazeUI

activation-instructions:
  - STEP 1: Read the AI Component Reference at docs/TrBlazeUI-AI-Reference.md
  - STEP 2: Understand the user's UI requirements
  - STEP 3: Generate Razor code using TrBlazeUI components
  - STEP 4: Follow the established patterns for the project

capabilities:
  - Generate complete Blazor pages with TrBlazeUI components
  - Create layouts using Sidebar, Card, Tabs patterns
  - Build forms with proper Field components, validation, and two-way binding
  - Set up themes (CSS custom properties, OKLCH colors, dark mode)
  - Create data tables with sorting, pagination, selection
  - Compose complex UIs from multiple TrBlazeUI components
  - Add icons from Lucide, Heroicons, or Feather libraries
  - Generate toast notifications, dialogs, sheets, and other overlays
  - Build responsive navigation with Sidebar and ResponsiveNav
  - Create chart dashboards using Chart components (Area, Bar, Line, Pie, Radar, Radial)

rules:
  - ALWAYS use TrBlazeUI components instead of raw HTML when a component exists
  - ALWAYS use @bind-Value or @bind-Checked for two-way binding
  - NEVER use inline styles - use Tailwind CSS utility classes
  - ALWAYS wrap forms with Field components for proper labeling and validation
  - Use ToastService for user feedback (success, error, warning, info)
  - Use Dialog/Sheet for modal interactions, not custom implementations
  - Follow the shadcn/ui design patterns - minimal, clean, accessible
  - Use Typography component for text hierarchy (H1-H4, P, Lead, Muted)
  - Include proper @using statements or rely on _Imports.razor
  - Register services in Program.cs: AddTrBlazeUIPrimitives() and AddScoped<ToastService>()

commands:
  - generate-page {description}: Generate a complete Blazor page
  - generate-component {description}: Generate a reusable component
  - generate-layout {description}: Generate a page layout
  - generate-form {description}: Generate a form with validation
  - generate-dashboard {description}: Generate a dashboard with cards and charts
  - setup-theme: Generate theme.css with customizable colors
  - list-components: Show available TrBlazeUI components
  - help: Show available commands

dependencies:
  data:
    - docs/TrBlazeUI-AI-Reference.md
```

### Claude Code Integration

To make this skill available as a Claude Code slash command, add it to the BMAD configuration. The skill should be accessible via:
- `/trblazeui-designer` - Activate the TrBlazeUI designer persona
- Or integrate as a task that can be invoked

### Registration Steps

1. Create the agent file at `.bmad-core/agents/trblazeui-designer.md` following the exact YAML-in-markdown format used by other agents in `.bmad-core/agents/` (see `analyst.md`, `dev.md` as examples)

2. Register the agent in the team files that should have access to it:
   - `.bmad-core/agent-teams/team-all.yaml` - Add to the agents list
   - `.bmad-core/agent-teams/team-fullstack.yaml` - Add to the agents list
   - `.bmad-core/agent-teams/team-ide-minimal.yaml` - Add to the agents list

3. The skill must be registered in the Claude Code MCP or slash command configuration. Check the existing pattern in:
   - `.claude/settings.json` or equivalent Claude Code config
   - Follow whatever pattern the existing BMAD skills use (e.g., `BMad:agents:analyst` → `BMad:agents:trblazeui-designer`)

### Acceptance Criteria
- [ ] Agent file exists at `.bmad-core/agents/trblazeui-designer.md`
- [ ] Agent follows the exact format of existing BMAD agents (YAML block in markdown)
- [ ] Agent references `docs/TrBlazeUI-AI-Reference.md` as its knowledge base
- [ ] Agent is registered in team YAML files
- [ ] Skill is available as a Claude Code slash command
- [ ] Agent can generate pages, components, forms, layouts, dashboards, and themes
- [ ] All generated code uses TrBlazeUI components correctly

---

## Work Stream 5: OpenCode Skill for TrBlazeUI

### Objective
Create an equivalent skill/agent definition for OpenCode (open-source AI coding tool) so developers using OpenCode can also leverage TrBlazeUI for AI-assisted UI generation.

### Background on OpenCode

OpenCode is an open-source terminal-based AI coding assistant (similar to Claude Code). It supports custom agents/personas through configuration files. The agent should research the current OpenCode configuration format.

### Deliverable

Create file: `.opencode/agents/trblazeui-designer.md` (or appropriate format for OpenCode)

### Specification

The OpenCode skill should mirror the Claude Code skill (WS-4) in capability but adapt to OpenCode's configuration format:

1. **Research OpenCode agent/skill format** - Check OpenCode documentation for how custom agents are defined. Common patterns include:
   - `.opencode/agents/` directory with YAML or Markdown files
   - `opencode.yaml` or `opencode.toml` configuration file with agent definitions
   - System prompt files that define agent behavior

2. **Create the skill definition** with the same capabilities as the Claude Code skill:
   - Generate complete Blazor pages using TrBlazeUI
   - Theme setup and customization
   - Component composition patterns
   - Form generation with validation
   - Dashboard and layout generation

3. **Reference the same knowledge base** - `docs/TrBlazeUI-AI-Reference.md`

4. **Include activation instructions** that tell the agent to:
   - Read the AI reference document first
   - Follow TrBlazeUI component patterns
   - Use Tailwind CSS utilities (never inline styles)
   - Apply proper two-way binding
   - Register required services

### Content Template

The skill content should follow this structure (adapt format to OpenCode requirements):

```markdown
# TrBlazeUI Designer - OpenCode Agent

## Role
Expert Blazor UI Developer specializing in the TrBlazeUI component library.

## Knowledge Base
Read and follow: docs/TrBlazeUI-AI-Reference.md

## Capabilities
[Same as Claude Code skill - see WS-4]

## Rules
[Same as Claude Code skill - see WS-4]

## Commands
[Same as Claude Code skill - see WS-4]
```

### Research Required

The implementing agent should:
1. Search for OpenCode documentation on custom agents/skills
2. Check if there's a standard format (YAML, TOML, Markdown)
3. Adapt the skill definition to match OpenCode's expected format
4. If OpenCode doesn't have a standard agent format, create a system prompt file that can be loaded manually

### Acceptance Criteria
- [ ] OpenCode skill file exists in the appropriate location
- [ ] Skill matches the capabilities of the Claude Code skill (WS-4)
- [ ] Skill references the AI reference document (WS-3 output)
- [ ] Format matches OpenCode's expected configuration format
- [ ] Instructions are included for how to activate/use the skill in OpenCode

---

## Cross-Cutting Concerns

### Git Strategy
- **All work happens on the `Dev` branch** (current branch)
- **Do NOT commit unless explicitly instructed by the user**
- Each work stream's changes should be logically grouped

### Build Verification
After all work streams are complete, perform a final build:
```bash
"/mnt/c/Program Files/dotnet/dotnet.exe" build "C:\3AIGenCode\TrBlazeUI\TrBlazeUI.sln" -p:CI=true
```

### File Summary - All Files Created/Modified

#### New Files
| File | Work Stream | Purpose |
|------|-------------|---------|
| `.github/workflows/publish-nuget.yml` | WS-2 | NuGet publish workflow |
| `.github/workflows/build.yml` | WS-2 | Build validation workflow |
| `nuget.config` | WS-2 | NuGet source configuration template |
| `global.json` | WS-1 | .NET SDK version pinning |
| `docs/TrBlazeUI-AI-Reference.md` | WS-3 | AI component reference document |
| `.bmad-core/agents/trblazeui-designer.md` | WS-4 | Claude Code skill |
| `.opencode/agents/trblazeui-designer.md` | WS-5 | OpenCode skill |

#### Modified Files
| File | Work Stream | Change |
|------|-------------|--------|
| `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj` | WS-1 | TFM + package versions |
| `src/TrBlazeUI.Primitives/TrBlazeUI.Primitives.csproj` | WS-1 | TFM + package versions |
| `src/TrBlazeUI.Icons.Lucide/TrBlazeUI.Icons.Lucide.csproj` | WS-1 | TFM + package versions |
| `src/TrBlazeUI.Icons.Heroicons/TrBlazeUI.Icons.Heroicons.csproj` | WS-1 | TFM + package versions |
| `src/TrBlazeUI.Icons.Feather/TrBlazeUI.Icons.Feather.csproj` | WS-1 | TFM + package versions |
| `demos/TrBlazeUI.Demo.Server/TrBlazeUI.Demo.Server.csproj` | WS-1 | TFM |
| `demos/TrBlazeUI.Demo.Wasm/TrBlazeUI.Demo.Wasm.csproj` | WS-1 | TFM + package versions |
| `demos/TrBlazeUI.Demo.Auto/TrBlazeUI.Demo.Auto.csproj` | WS-1 | TFM + package versions |
| `demos/TrBlazeUI.Demo.Auto/TrBlazeUI.Demo.Auto.Client/TrBlazeUI.Demo.Auto.Client.csproj` | WS-1 | TFM + package versions |
| `demos/TrBlazeUI.Demo.Shared/TrBlazeUI.Demo.Shared.csproj` | WS-1 | TFM + package versions |
| `src/**/*.cs`, `src/**/*.razor.cs` | WS-1 | Coding standards: private field renames (`_x` → `objX`), file-scoped namespaces, ConfigureAwait(false), XML docs |
| `demos/**/*.cs`, `demos/**/*.razor.cs` | WS-1 | Coding standards: private field renames, file-scoped namespaces, XML docs (services/extensions) |
| `Directory.Build.props` | WS-2 | Repository URLs |
| `docs/TrBlazeUI-Doc.md` | WS-1 | .NET version references |
| `.bmad-core/agent-teams/team-all.yaml` | WS-4 | Register new agent |
| `.bmad-core/agent-teams/team-fullstack.yaml` | WS-4 | Register new agent |
| `.bmad-core/agent-teams/team-ide-minimal.yaml` | WS-4 | Register new agent |

### Orchestrator Execution Notes

1. **Parallel Execution:** WS-1 and WS-3 have no dependencies and should start simultaneously
2. **WS-1 is now the largest effort** - it includes the .NET 10 TFM/package upgrade PLUS full coding standards enforcement across all C# files (private field renames, file-scoped namespaces, XML documentation, ConfigureAwait, async suffix enforcement). Follow the prioritization strategy in Step 1.5.7 - build after each priority level
3. **WS-3 is the second largest effort** - it requires reading many component files to document them all
4. **WS-4 and WS-5 are quick** once WS-3 is done - they're primarily configuration files
5. **WS-2 is straightforward** once WS-1 confirms the build passes
6. **The GitHub owner/username** must be provided by the user before WS-2 can be finalized - use placeholder `OWNER` and note it needs replacement
7. **Build verification** should be the final step after all work streams complete
8. **Coding standards reference:** The complete coding standards are defined in `docs/Coding-Standards.md` - the agent executing WS-1 MUST read this file first before starting Step 1.5

---

*Document prepared by Mary (Business Analyst) using the BMAD brainstorming framework*
