# TrBlazeUI — Usage Guide (Test Users · Test Plan · Setup)

> The single source for **how to test and run** this library. Every agent (flow-master self-smoke, the verifier) **and** the human UAT use the SAME walkthrough listed here. TrBlazeUI is a **component library with a demo application**. It has **no authentication and no user accounts**, so the test-user table below is N/A. Testing means walking the demo app's pages and exercising each component. Released version: **2.0.6** on nuget.org.

## Test users (canonical — use THESE for all smoke / verify / UAT)

**Not applicable — TrBlazeUI has no login, no database, and no user accounts.** The demo apps (Server/WASM/Auto) are open and require no credentials.

| # | Username / Email | Password | Role / Permission | Created? | Notes |
|---|------------------|----------|-------------------|----------|-------|
| — | (none) | (none) | Anonymous demo visitor | N/A | No auth anywhere in the product; open the demo URL and browse |

## How to test — screen by screen / menu by menu

The demo app exposes the whole library through a sidebar navigation. Walk these sections in order; no login is required for any of them.

### Home (`/`)
- **Log in as:** n/a (anonymous)
- **Steps:** 1) Run a demo host → 2) open the root URL → 3) read the landing/overview.
- **Expected:** landing page renders styled (sidebar visible, not bullet-point links — confirms `trblazeui.css` loaded correctly).
- **Covers:** BRD-37, REQ-NFR-002

### Architecture (`/architecture`)
- **Steps:** open from sidebar.
- **Expected:** architecture overview page renders.
- **Covers:** BRD-40

### Getting Started (`/getting-started`)
- **Steps:** open from sidebar.
- **Expected:** quick-start guide renders with setup snippets.
- **Covers:** BRD-40

### Components index (`/components`)
- **Steps:** open `/components` → click into each component demo.
- **Expected:** every component card links to a working demo page with interactive examples.
- **Covers:** REQ-UI-002, REQ-UI-003, REQ-UI-004, REQ-UI-005, REQ-UI-006

### Forms (e.g. `/components/button`, `/components/input`, `/components/select`, `/components/native-select`, `/components/date-picker`)
- **Steps:** type into Input/Textarea; toggle Checkbox/Switch; open Select/Combobox/MultiSelect; pick a date; adjust Slider/Rating.
- **Expected:** two-way binding updates shown state; dropdowns open; pickers select values; the Select trigger shows the selected item's text before it is first opened; NativeSelect shows its arrow.
- **Covers:** BRD-4…BRD-12 (REQ-UI-002)

### Layout & navigation (Sidebar, `/components/sidebar`, NavigationMenu, Tabs, Pagination)
- **Steps:** collapse/expand the Sidebar (and Ctrl/Cmd+B); reload; open a horizontal NavigationMenu dropdown; switch Tabs; page through Pagination; at 390px wide, open the phone menu.
- **Expected:** sidebar collapse persists across reload; nav dropdown does not clip; tabs/pagination work; the phone menu is 288px (18rem) wide.
- **Covers:** BRD-13…BRD-18 (REQ-UI-003)

### Overlays & feedback (Dialog, AlertDialog, Sheet, Drawer, Popover, Toast, Command)
- **Steps:** open a Dialog and change a control inside it; open a tall Dialog; open an AlertDialog and press Escape; open a Sheet/Drawer; trigger a Toast; open the Command palette and filter.
- **Expected:** overlays open with focus trap; internal state changes re-render; a tall dialog scrolls inside itself with header and footer visible; Escape closes the AlertDialog; Toasts appear; Command filters.
- **Covers:** BRD-19…BRD-24 (REQ-UI-004)

### Data & content (`/components/datatable`, MarkdownEditor, RichTextEditor)
- **Steps:** sort/filter/paginate/select rows in DataTable; edit markdown and view preview; type in RichTextEditor.
- **Expected:** DataTable operations work; a grid with pagination off shows every row; editors render/preview; rich-text HTML is sanitized.
- **Covers:** BRD-25…BRD-27 (REQ-UI-005)

### Display components (`/components/badge`, Avatar, Empty, Progress, Typography)
- **Steps:** open each demo; inspect a Badge inside a sentence; view the long-label Badge examples.
- **Expected:** components render; a Badge is an inline `<span>`; `Wrap` and `Truncate` badges keep their colour.
- **Covers:** REQ-UI-006

### What's new page (`/whats-new`)
- **Steps:** open `/whats-new`; run the splatting, utility-scale and retuned-token examples on the page.
- **Expected:** every example runs; no console errors.
- **Covers:** REQ-UI-017

### Components added in the TechieBlog pass (9 pages)
- **Steps:** open each of `/components/prose`, `/components/stat`, `/components/timeline`, `/components/stepper`, `/components/anchor-nav`, `/components/sortable-list`, `/components/password-strength`, `/components/code-block`, `/components/centered-panel`; reach each from the sidebar **and** the command palette.
- **Expected:** each page renders its examples; `AnchorNav` tracks the active section; `Stepper` moves `aria-current="step"`; `SortableList` reorders with its buttons; `CodeBlock` copy works or reports "Press Ctrl+C"; `Prose` keeps a wide table scrolling inside itself at 390px.
- **Covers:** REQ-UI-017

### Toolbar (`/components/toolbar`)
- **Steps:** click ToolbarButtons; toggle Bold/Italic; try Default/Compact/Dense and vertical orientation; open a toolbar dropdown.
- **Expected:** buttons fire actions; toggles show `aria-pressed`; variants/orientation render.
- **Covers:** BRD-30, BRD-31 (REQ-UI-007)

### Charts (`/charts/area`, `/bar`, `/line`, `/pie`, `/radar`, `/radial`)
- **Steps:** open each chart demo.
- **Expected:** each of the 6 chart types renders with theme colours.
- **Covers:** BRD-32 (REQ-UI-008)

### Icons (`/icons`)
- **Steps:** open the icon browser; switch between Lucide / Heroicons / Feather; search.
- **Expected:** icon grids render; typed names resolve; Heroicons shows 4 variants.
- **Covers:** BRD-33, BRD-34 (REQ-UI-009)

### Theming & dark mode (any page)
- **Steps:** toggle the theme; switch demo theme if available.
- **Expected:** all components restyle; dark mode applies; no contrast breakage.
- **Covers:** BRD-35, BRD-36 (REQ-UI-010)

### TfLens consumer-feedback fixes (`/verify-tflens-2`, `/verify-tflens-3`)
- **Steps:** open `/verify-tflens-2`; open `/verify-tflens-3`; open its Select, then leave the page.
- **Expected:** the Options chart has no grid and shows value labels; every short-form chart that asks for labels shows them; every Badge variant keeps its colour under `Wrap` and `Truncate`; the money column header aligns right; the card-header filter narrows the table; leaving the page logs no server error.
- **Covers:** REQ-UI-020, REQ-UI-001

### Render-mode parity
- **Steps:** repeat a few of the above in Server (5183), WASM (5184) and Auto (5185).
- **Expected:** identical component behaviour across all three hosts.
- **Covers:** REQ-NFR-004 (BRD-40), REQ-UI-011

## Prerequisites
- .NET 10 SDK
- A web browser
- Node.js — only for the browser tests
- Python 3 — only for `tools/token-contrast.py`
- PowerShell 7 — only for the release-tag version tests

## Setup / Deployment steps (runbook — one command per line, in order)

1. `git clone https://github.com/techierathore/TrBlazeUI && cd TrBlazeUI`
2. `dotnet restore TrBlazeUI.sln`
3. `dotnet build TrBlazeUI.sln -c Release -p:CI=true`
4. `dotnet run --project demos/TrBlazeUI.Demo.Server --urls http://localhost:5183`
5. Open `http://localhost:5183` in a browser.

## Test (automated)
```bash
npm install
BASE_URL=http://localhost:5183 npx playwright test tests/verify
SMOKE_URL=http://localhost:5183 node tests/verify/ui-tflens-3.spec.js
python3 tools/token-contrast.py
dotnet run --project tools/splat-audit
bash tests/package/codex-agent-deployment.sh
```

## Smoke checklist (quick capability pass)
- [ ] Start the demo and open the home page — it is styled, with a sidebar
- [ ] Open Button, Input and Select — they render and keep what you type or pick
- [ ] Open a Dialog and change a control inside it — the dialog updates
- [ ] Open an AlertDialog and press Escape — it closes
- [ ] Open the DataTable demo — sort, page and select rows
- [ ] Open the bar chart and pie chart demos — both draw with theme colours
- [ ] Open the icon browser and switch icon library — icons show
- [ ] Toggle dark mode — every component restyles
- [ ] At phone width, open the menu — it slides out and every link works
- [ ] Open the Badge demo — pills sit inside sentences and long labels wrap or truncate as asked

## Consumer integration notes

### Added 2026-09-13 (TfLens passes — REQ-UI-019, REQ-UI-020 — shipped in 2.0.6)

- **Read the CHANGELOG's "Behaviour changes to review before upgrading" under `[2.0.6]` before upgrading.**
- **⚠ `Badge` renders a `<span>`**; set `As="div"` where a selector depends on the old tag. A long label no longer wraps unless `Wrap="true"`; `Truncate="true"` clips it.
- **⚠ `DataTable ShowPagination="false"` renders every row.** A grid that looked right at 5 rows now shows the whole collection.
- **⚠ `AlertDialog` closes on Escape and no longer on overlay click.** Opt out with `CloseOnEscape="false"`; opt back into overlay click with `Modal="false"`.
- **⚠ The phone sidebar is 18rem wide.** Drop any app rule that redefined `--sidebar-width` in a mobile media query.
- **Charts** take `Options` (merged over the defaults) and `OptionsConfigurator` (runs last), and data labels work in the `Items`/`XValue`/`YValue` form. `ChartContainer Bare="true"` drops the card.
- **`DataTableColumn.Align`** aligns header and cells together; **`@bind-SearchText`** lets a page host the grid's filter anywhere; **`ShowColumnChooser="false"`** keeps search without the Columns button.
- **Class merging:** classes containing `url(` are no longer deleted, and text alignment, overflow and wrapping no longer remove a text colour.
- **Workarounds consumers can delete:** property-order chart projections, `::deep` Badge/Collapsible/NativeSelect rules, and page-level Escape listeners.

### Added 2026-08-11 (TechieBlog feedback pass — REQ-UI-017, shipped in 2.0.3)

- **⚠ Design tokens retuned for contrast.** Light `--input`/`--ring` move to `oklch(0.66)`; dark `--input` → `oklch(0.55)`, dark `--accent` → `oklch(0.30)`, dark `--destructive-foreground` → near-black. Re-check any custom palette with `tools/token-contrast.py`.
- **⚠ `Rating` markup changed.** Options are `<button role="radio">`; a `ReadOnly` rating is `role="img"`. New `Focusable` parameter.
- **⚠ `TabsContent` always renders its panel element** (hidden when inactive).
- **⚠ `trblazeui.css` is ~906 KB minified / ~97 KB gzipped** because it ships the standard Tailwind utility scale with responsive variants.
- **Attribute splatting is catalog-wide** — 344/344 public components in `TrBlazeUI.Components` and 59/59 in `TrBlazeUI.Primitives` (`tools/splat-audit`).
- **`Input`/`Textarea` no longer lose keystrokes on a Blazor Server circuit**, and gain optional `DebounceMilliseconds`.
- **New components:** `Prose`, `StatTile`/`StatGroup`, `Timeline`, `Stepper`, `AnchorNav`, `SortableList`, `PasswordStrength`, `CodeBlock`, `CenteredPanel`.

### Added 2026-07-22 (AstroLyfe post-upgrade feedback — REQ-UI-014)

- **Select triggers carry an accessible name by default.** Remove per-Select `aria-label` workarounds.
- **`SelectTrigger.AriaLabel`** sets a descriptive name.
- **Dialog centering is offset-free.** Remove any `translate:none`/`transform` dialog override.

### Added 2026-07-21 (AstroLyfe UAT feedback — REQ-UI-016, shipped in 2.0.0)

- **⚠ `DataTable.ShowToolbar` defaults to `false`.** Add `ShowToolbar="true"` where you want search and Columns.
- **DataTable pagination auto-hides** when every row fits one page.
- **Theme tokens have library defaults** at zero specificity; your own tokens still win.

### Added 2026-07-02 (AstroLyfe feedback pass — REQ-UI-014)

- **PortalHost:** add `<PortalHost />` (namespace `TrBlazeUI.Primitives.Services`) at the end of your root layout, inside the interactive render root.
- **Interactive triggers in DropdownMenu:** use `AsChild="true"` so a slotted `Button` becomes the trigger.
- **Input labels:** `<Input Label="Full Name" …>` renders an associated `<label>`.
- **Icons:** decorative by default; pass `AriaLabel="…"` for `role="img"`. Unknown names render an empty placeholder (`data-trblazeui-missing-icon`).
- **FluentUI migration:** rewrite `xs`/`sm`/`md`/`lg`/`Spacing` attributes as `<Grid>`/`<GridItem>` or Tailwind grid classes.

## Known limitations
- **Accessibility is checked by an automated scan only** (axe, 4 pages, 0 violations — REQ-NFR-001). No person has tested with assistive technology.
- **Arbitrary Tailwind values are not pre-generated** (`min-w-[720px]`). Use the utility scale or a component parameter such as `DataTable.MinWidth`.
- **NativeSelect inside MAUI Blazor Hybrid overlays** — the native popup is clipped in WebView2. Use `<Select>` inside dialogs and sheets. `docs/OldDocs/TrBlazeUI-Issues-Report-1.md` #2.
- **`HtmlSanitizer 9.1.949-beta` is a pre-release dependency**, taken for the AngleSharp CVE-2026-54570 fix. Revisit when 9.1.x is stable.
- **REQ-UI-015's harness page `/verify-trstudio` is missing**, so its 14 checks cannot be re-run. Its verdict rests on the 2026-07-12 run.
- **Consumer feedback fixed library-side, waiting for the consumer's own re-check:** TfLens TR-036/TR-037/TR-038 (fixed 2026-09-13, in 2.0.6); TrStudio TR-011 (fixed 2026-07-12); AstroLyfe TR-001…TR-012 and TechieRag TR-001…TR-004 (fixed under REQ-UI-014/015/016, their files carry no closing mark).
