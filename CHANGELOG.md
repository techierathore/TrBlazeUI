# Changelog

All notable changes to TrBlazeUI are recorded here. This project follows
[Semantic Versioning](https://semver.org/) as described in `RELEASE.md`.

All five packages share a single version number: **TrBlazeUI.Primitives**,
**TrBlazeUI.Components**, **TrBlazeUI.Icons.Lucide**, **TrBlazeUI.Icons.Heroicons**,
**TrBlazeUI.Icons.Feather**.

---

## [Unreleased]

Closes TfLens TR-039 and TR-040 (`docs/TfLens-TrBlazeUI-Feedback.md`), both filed against 2.0.6,
and Chatur TR-001 to TR-004 (`docs/Chatur-TrBlazeUI-Feedback.md`), filed against 2.0.7.

### ⚠ Behaviour changes to review before upgrading

- **Side borders and border styles now survive `Class` merging.** `cn()` used to read `border-l`,
  `border-b`, `border-s` (and the other sides) and `border-dashed`/`border-solid`/… as border
  *colours*, so a later colour class deleted them. `Timeline`'s vertical line (`border-s`) and
  `FieldSeparator`'s rule (`border-t`) are drawn again, and a consumer `Class="border-b border-input"`
  now gets its bottom border. Measured: Timeline rail 0px before, 1px after.
- **A height given to `ScrollArea` through `Class` now bounds the scrolling viewport.**
  `<ScrollArea Class="h-[300px]">` used to let the inner viewport grow with its content, so nothing
  scrolled. A `ScrollArea` sized through `Height` / `MaxHeight`, or not sized at all, is unchanged.

### Added — Chatur TR-001…TR-004

- **`ScrollArea.StickToEnd` (TR-001)** keeps a growing log or chat at its newest line, stops
  following when the reader scrolls up, and resumes when they scroll back to the end.
  `AtEndChanged` reports both; `ScrollToEndAsync()` jumps back. Content changes are watched in the
  browser, so text a child component updates on its own is followed too.
- **`TreeView` and `TreeItem` (TR-002)**: expand and collapse, one selected row
  (`@bind-SelectedValue`), the WAI-ARIA tree keyboard (arrows, Home/End, Enter/Space, type-ahead),
  an `Icon` and a `Trailing` slot per row, indentation per level, and children loaded on demand
  (`HasChildren` + `OnExpand` + `Loading`).
- **`DiffView` and `TextDiff` (TR-003)**: before and after texts side by side or inline, line
  numbers, added/removed lines tinted from `--success`/`--destructive` and marked `+`/`-`,
  unchanged stretches folded, and a `HunkActions` slot on each part. The comparison is Myers'
  algorithm in .NET: no script library. Checked against a reference comparison on 20,000 random
  cases with 0 differences; a 20,000-line file compares in about 6 ms.
- **`ToggleGroup.Joined`, `ToggleGroup.AllowDeselect` and `ToggleGroup.AriaLabel` (TR-004)**: one
  joined control for a view switch that keeps exactly one choice. A single-choice group is now a
  `radiogroup` of `radio` items with one Tab stop and arrow-key movement; a multiple-choice group
  keeps `aria-pressed`. The AI reference now documents `ToggleGroup`, which it never listed.

### Fixed

- **Leaving a page that holds a chart no longer logs an unobserved `JSDisconnectedException` (TR-039).**
  Blazor-ApexCharts releases its JavaScript module from `Dispose` without awaiting it (6.1.0 and
  still 7.0.0), so every chart on a Blazor Server page faulted one orphaned task when the circuit
  ended. All six chart types now render an internal `ApexChart` subclass whose teardown ignores a
  closed connection on that release. Nothing changes while a chart is alive, and WebAssembly is
  untouched. Measured: 5 charts left → 5 unobserved exceptions before, 0 after.

### Added

- **`InputGroupInput.DebounceMilliseconds` (TR-040)**, with the behaviour `Input` already has: 0 (the
  default) raises `ValueChanged` per keystroke; any other value raises it once typing pauses. The box
  itself still shows every keystroke immediately.

## [2.0.6] — 2026-09-13

> Published to nuget.org on 2026-09-13 from the release tag `v2.0.6`. All five packages are listed
> at 2.0.6 and each was packed from the commit that tag points at. Everything in this section,
> including the TfLens TR-036…TR-038 fixes, was confirmed present in the published packages.

Consumer-feedback release closing the TfLens findings in `docs/TfLens-TrBlazeUI-Feedback.md`.
Verified 2026-08-31: Release build 0 warnings / 0 errors; **44/44** headless-Chromium checks
(`tests/verify/ui-tflens.spec.js`), with every regression suite still green —
`ui-ui016` 23/23, `ui-ui014` 8/8, `ui-ui004` PASS, `ui-techieblog` 76/76, `ui-demo-2-1-0` 15/15
(**166/166** executed checks), 0 console errors and 0 horizontal overflow across 8 routes at
1280 and 390.

> **Five of TfLens's 24 findings were already fixed in 2.1.0** (TR-002, TR-003, TR-013, TR-020,
> TR-023) — they were reported against **2.0.0**. Nothing was changed for those; the action there
> is to upgrade.

### ⚠ Behaviour changes to review before upgrading

- **`Badge` renders a `<span>`, not a `<div>` (TR-034).** It is still `inline-flex`, so nothing
  about the appearance changes — but a `div` could not sit inside a `<p>` without the parser
  reshaping the markup, and a design that draws its pills as `<span class="badge">` could never be
  matched element for element. **A CSS selector, a Playwright locator or a stylesheet that keys on
  `div` will stop matching.** Pass `As="div"` to keep the old tag.
- **A long `Badge` label no longer wraps by default (TR-029).** It is held on one line and
  overflows, which is visible; it used to wrap while the pill kept its `rounded-full` geometry, so
  at a phone width a three-line label sat inside 33,554,432px end caps that cut into its first and
  last lines and read as two overlapping shapes. **A badge you relied on wrapping will now
  overflow its container** — set `Wrap="true"` (the pill grows, left-aligned, corner radius) or
  `Truncate="true"` (clipped with an ellipsis) to say which you meant.
- **`ClassNames.cn` no longer deletes classes containing `url(` (TR-032).** The injection guard
  rejected the whole class, which silently dropped the library's own chevron on `NativeSelect` —
  `appearance-none` with no arrow at all — and any arbitrary value a consumer passed with a
  `url()` in it. Arbitrary values (the text inside `[…]`) are now validated against their own
  charset, and only payload forms that could execute (`url(javascript`, `url(data:text/html`,
  `expression(`, `javascript:`, `@import`) are rejected. **A class you were passing that used to
  vanish will now take effect**, so a `NativeSelect` (or anything given a `bg-[url(…)]`) paints
  what it was always asking for.
- **`text-left` / `text-center` / `text-right` / `text-justify` / `text-start` / `text-end` are a
  `text-align` conflict group in `TailwindMerge`, not a colour one.** They previously fell through
  to the bare `text-([a-z]+)` colour pattern, so `text-right` and `text-muted-foreground`
  conflicted: setting a colour silently un-aligned an element and setting an alignment silently
  uncoloured it. **Both now survive together**, which changes the rendering of any element that
  passed one of each.
- **`text-ellipsis` / `text-clip` and `text-wrap` / `text-nowrap` / `text-balance` / `text-pretty`
  are now their own conflict groups too (TR-038).** They had the same fall-through as the alignment
  classes, so `Badge Variant="Outline" Truncate="true"` lost `text-foreground` and inherited its
  parent's colour. **An element that passed one of these beside a text colour now keeps both.**
- **A shorthand chart (`Items` + `XValue` + `YValue`) now draws the data labels it asks for
  (TR-037).** `ShowDataLabels="true"`, `Options.DataLabels.Enabled` and `OptionsConfigurator` were
  all silently ignored in that form. **A chart that passed any of them will now show values on its
  bars, slices or points**; drop the setting if you did not mean it.
- **The phone sidebar is 18rem wide, not 16rem (TR-035).** `SidebarProvider`'s slid-out menu was
  sized with `--sidebar-width`; it now reads `--sidebar-width-mobile`, the token the stylesheet has
  always declared at 18rem and nothing ever read. Any app that compensated by redefining
  `--sidebar-width` inside a mobile media query should drop that rule, or it will now compound.
- **`DataTable ShowPagination="false"` now renders every row.** It previously still applied
  `InitialPageSize` (default **5**) to the data while hiding the pager, so a grid with pagination
  turned off was silently truncated with no pager, no count and no warning — the page looked
  complete. `ShowPagination` is now a data switch, not only a chrome switch. **A page that looked
  correct at 5 rows will now paint the whole collection**, so check any grid you turned pagination
  off over. This library's own demo was relying on the bug (500 records bound with
  `ShowPagination="false"`) and has been rebound.
- **`AlertDialog` now closes on Escape by default.** It previously had no Escape handling at all
  and no parameter to opt in — `AlertDialogContent` passed a hard-coded `CloseOnEscape="false"`
  to the Dialog primitive. Opt out with `CloseOnEscape="false"` on `AlertDialogContent`.
- **`AlertDialog` no longer closes on overlay click by default.** It previously did, which
  contradicted its own documentation and the shadcn/ui AlertDialog it mirrors. Opt back in with
  `Modal="false"` on `AlertDialogContent`.
- **`Dialog.Modal` is now live.** It was declared and read by nothing while the AI reference
  documented it as "Dismiss on outside click/Escape". It is now a master switch that can only
  *remove* dismissal: `Modal="false"` disables both overlay-click and Escape. Nothing in this repo
  passed `false`, but a consumer who set it expecting Radix's "blocking" semantics will now get
  "not dismissible".
- **A closed `CollapsibleContent` no longer contributes a layout box.** It now carries `hidden`
  plus an inline `display:none` while collapsed. Previously the children stayed in normal flow
  inside a zero-height `overflow:hidden` wrapper, so they still reported their full height and
  overlapped whatever followed — invisible in a screenshot, real to hit-testing, geometry gates
  and the accessibility tree. Any layout that had absorbed that phantom box will shift.
- **`DialogContent` is a flex column, not a grid**, and `DialogHeader`/`DialogFooter` now carry
  `shrink-0`. A consumer relying on grid-specific placement inside the panel is affected.
- **The `Tabs` family now merges `Class` through `ClassNames.cn`** instead of appending it to a
  raw string. A caller's conflicting utility now genuinely wins by conflict-deletion rather than
  losing to stylesheet source order. Any `Class` you passed to `Tabs`/`TabsList`/`TabsTrigger`/
  `TabsContent` that was previously inert **will now take effect**.

### Fixed — accessibility (REQ-NFR-001)

The accessibility row had carried "Not independently audited — 90%" and **no acceptance line**
since the project began, so nothing had ever been able to fail it. It was graded against a scanner
for the first time on 2026-09-12 (axe-core, WCAG 2.1 A/AA, over `/components/select`,
`/components/datatable`, `/components/dialog`, `/components/collapsible` at 1280) and reported
**7 violation types across 37 nodes, every one `serious`**. All are fixed; the re-scan reports
**0 violations, 0 nodes**, with the four controls smoke-tested to confirm they still work.

- **`Kbd` used a colour pairing with no headroom.** The shortcut hint painted
  `text-muted-foreground` on `bg-muted` at 12px. The library's own tokens give **4.60:1** against a
  4.5:1 floor — one hundredth of a step from failing — and this project's own demo theme lightens
  `--muted-foreground` by 0.014, which drops it to **4.34:1** and fails. `Kbd` now uses
  `text-foreground`: **18.15:1** light, **14.48:1** dark, so no consumer theme can break it. The
  demo theme's `--muted-foreground` also moves from `oklch(0.5560)` to `oklch(0.5200)` (**5.05:1**
  on `--muted`), because muted-on-muted needs real headroom wherever it is used, not just here.
- **The pagination bar was not a valid list — 30 of the 37 nodes.** `PaginationContent` renders the
  `<ul>` and `PaginationItem` the `<li>`, but `DataTable` was wrapping the page-size selector, the
  page display and two plain `<div>` spacers *inside* that `<ul>`. The result was **6 lists holding
  non-list children and 24 list items outside any list**, so a screen reader announced a list whose
  item count was wrong. The grouping is now done by plain `<div>`s and the `<ul>` holds only the
  four page buttons. No API changed — the library was misusing its own components.
- **Three controls were nested inside other controls.** The toolbar's *Filter* and *Columns*
  popovers rendered a `<Button>` inside `PopoverTrigger`'s own `<button>`; both now pass
  `AsChild="true"`, so the `Button` *is* the trigger. The DataTable's select-all header rendered a
  real `role="checkbox"` inside the dropdown trigger's `<button>`, where it was decoration — the
  trigger owns the click. The accessible name moved to the trigger and the checkbox is now
  decorative.

### Added

- **`Checkbox.Decorative`** (styled and primitive, default `false`). Renders a plain `<span>` — no
  role, nothing focusable, `aria-hidden` — keeping the box, the tick and the `data-state` hook but
  no behaviour. For a checkbox drawn inside something that already owns the click and the name.
  `tabindex="-1"` is **not** a substitute: a negative tabindex still leaves an element focusable, so
  the nesting rule still fails on it — which is how this was first mis-fixed and caught.

### Fixed — TfLens TR-036…TR-038 (filed 2026-09-12 against 2.1.0-ci.10)

Verified 2026-09-13: build 0 warnings / 0 errors; **70/70** headless-Chromium checks
(`tests/verify/ui-tflens-3.spec.js` on `/verify-tflens-3`) at 1280 and 390, the TR-028…TR-035
suite `ui-tflens-2` still **37/37**, and REQ-UI-001 and REQ-UI-020 re-verified through their
acceptance tests.

- **Leaving a page that holds a `Select` logged an unhandled circuit exception (TR-036).**
  `SelectContent.DisposeAsync` released two JavaScript module references with nothing around them,
  so when the circuit had already gone, which is the ordinary way a Blazor Server page ends,
  both threw `JSDisconnectedException`. It is now caught, as `DialogContent` already did. The same
  unguarded release was also in `DropdownMenuContent`, `PopoverContent`, `SheetContent`,
  `FocusManager` and `PositioningService`, and is fixed there as well.
- **The chart shorthand could not draw data labels (TR-037).** ApexCharts takes the label switch
  from its series, and the built-in series behind `Items`/`XValue`/`YValue` was never given one, so
  it switched labels off after the wrapper had set them. The built-in series in all six chart
  types now receives the final decision, resolved after `Options` and `OptionsConfigurator` have run.
  The `OptionsConfigurator` example in the XML docs, which shows exactly this form, now works as written.
- **`Truncate` removed the `Outline` badge's text colour (TR-038).** See the behaviour change above.

### Fixed — TfLens TR-028…TR-035 (filed after the 2026-08-31 reply)

Verified 2026-09-12: Release build 0 warnings / 0 errors; **37/37** headless-Chromium checks
(`tests/verify/ui-tflens-2.spec.js` on `/verify-tflens-2`), with every runnable regression suite
still green — `ui-tflens` 44/44, `ui-techieblog` 76/76, `ui-ui016` 23/23, `ui-demo-2-1-0` 15/15,
`ui-ui014` 8/8, `ui-ui004` PASS desktop+mobile; 0 console/page errors and 0 horizontal overflow at
1280 and 390.

- **A chart could not be made to match a design (TR-028)** — `BarChart` and its five siblings
  exposed `ShowLegend`/`ShowTooltip`/`ShowDataLabels`/`Height`/`Width`/`BarWidth` and nothing else,
  so ApexCharts' defaults were the only chart available: a linear y axis printing raw unseparated
  counts, gridlines a design has none of, and no value labels. Changing three options meant giving
  up the wrapper for a raw `ApexChart`. New **`Options`** takes a real `ApexChartOptions<TItem>`
  merged **over** the wrapper's defaults — every member you set wins, every member you leave null
  the wrapper still fills — and new **`OptionsConfigurator`** runs last for values that have to be
  computed, such as a data-label formatter. Each chart type's own defaults became `??=`, which is
  what makes the merge real rather than decorative. Measured: `Grid`+`Yaxis` through `Options`
  takes the same chart from 5 gridlines / 2 grid borders / 5 y-axis labels to **0 / 0 / 0** while
  still drawing its 3 bars, and a chart passing no `Options` keeps every default unchanged.
- **`ChartContainer` drew a card inside a card (TR-028, second half)** — it paints
  `rounded-lg border bg-card shadow-sm p-6`, and a chart almost always sits in a `Card` already.
  New **`Bare`** drops that chrome and keeps the flex column the chart sizes against. Measured:
  border 1px→0, shadow→none, padding 24px→0, with the default container untouched.
- **A long `Badge` label collapsed into an unreadable shape (TR-029)** — see the behaviour-change
  note above. New **`Wrap`** and **`Truncate`**. Measured in a 180px box: `Wrap="true"` gives 3
  lines at 54px with an **8px** radius (was 33,554,432px) and start-aligned text;
  `Truncate="true"` gives one clipped line; the default holds one line with `white-space: nowrap`.
- **`Badge` was always a `<div>` (TR-034)** — new **`As`**, defaulting to `"span"`. Measured: the
  pill stays inside its `<p>` instead of being parsed out of it, `display` is still `inline-flex`,
  and `As="div"` still renders the old tag.
- **A column header would not align over its figures (TR-031)** — `HeaderClass="text-right"` set
  `text-align` on the `<th>`, but the label sits inside its own `flex` box where that moves
  nothing, so the cells aligned and the header did not. New **`Align`** (`Start`/`Center`/`End`)
  reaches the header cell, the label's flex box and the body cells together. Markup written before
  `Align` still works: a `text-right`/`text-center` in `HeaderClass` is read as the same intent.
  Measured: the label box goes `normal` → `flex-end`, and alignment now survives a `CellClass`
  colour on the same column (see the `text-align` grouping note above).
- **`NativeSelect` painted no arrow at all (TR-032)** — the root cause was not in `NativeSelect`.
  Its chevron is a `bg-[url('data:image/svg+xml;…')]` background image, and
  `TailwindMerge.IsValidClassName` rejected any class containing `url(`, so `cn()` silently deleted
  the library's own class and left `appearance-none` with nothing to replace the native arrow.
  Measured: the class is on the rendered element and computed `background-image` is the data URI
  (was `none`). See the behaviour-change note — this fixes every consumer class it was eating too.
- **A grid's filter could only live in the grid's own toolbar (TR-033)** — `ShowToolbar` was
  all-or-nothing: `true` drew the search box *and* a `Columns` dropdown inside its own box,
  `false` drew neither and exposed no filter state, so a design that puts the filter in the card
  header needed a second hand-written filter the grid's `Filterable` columns would not feed. New
  two-way **`SearchText`** is the same state the built-in box drives, and new
  **`ShowColumnChooser`** separates the dropdown from the search box. Measured: typing in a
  card-header input narrows the grid 3 rows → 1 with no toolbar rendered, the built-in box writes
  back to the bound field, and `ShowColumnChooser="false"` leaves 1 search box and 0 Columns
  buttons.
- **The phone menu ignored the mobile width the library defines (TR-035)** — see the
  behaviour-change note. `SidebarProvider` also gains **`Width`**, **`MobileWidth`** and
  **`IconWidth`** so a shell can set all three without redefining tokens globally; `MobileWidth`
  travels on `SidebarContext` because the phone menu is a portalled Sheet under `<body>` that
  cannot inherit a custom property from the provider's element. Measured at 390px: the slid-out
  menu is **288px** (was 256px), and one element now reads `--sidebar-width-mobile` where none did.

**Not a library change — TR-030.** The entry reports that `CollapsibleTrigger` takes no `Class`
parameter. It does, and has since 2.1.0; TfLens filed against 2.0.0. Measured live: `Class` lands
on the real `<button>`, a `w-full text-left` trigger fills its 502px row and a spacer pushes the
badge flush to the right edge. The default is deliberately left shrink-to-fit — widening every
existing trigger would be a silent breaking change — and the row recipe is now in the reference.

### Fixed

- **`DataTable` row truncation (TR-009)** — `ProcessDataAsync` gates the page window on
  `ShowPagination`; `ShouldRender()` also tracks the new parameters so a runtime toggle is not
  suppressed.
- **Lucide alias names (TR-008)** — `check-circle`, `check-circle-2`, `alert-circle`,
  `alert-triangle`, `x-circle`, `help-circle` and `circle-help` rendered **nothing**: a
  `data-trblazeui-missing-icon` placeholder that occupied the box and drew nothing, with no build
  or runtime error. The names were never missing from the package — `lucide.json` ships an
  `aliases` map of 212 entries alongside its 1,665 `icons`, and `GenerateIconData.ps1` only ever
  read `icons`, so the generated C# had no map to fall back to. The generator now emits an
  `Aliases` dictionary and `GetIcon`/`IconExists` resolve through it. `GetAvailableIcons()` and
  `IconCount` stay canonical-only by design; `GetAliases()` and `AliasCount` expose the alias side.
  A missing name now also suggests the closest match in its warning. (`lucide.json` was already
  being packed to `content/lucide.json` by the SDK's default Content glob — an earlier claim that
  it had stopped being packed was incorrect and no packaging change was needed.)
- **Escape lost after a dialog re-renders (TR-014)** — Escape was an *element* handler on the
  panel, so it stopped working as soon as a re-render replaced the focused child and focus fell
  back to `<body>`. A document-level listener (`click-outside.js onEscapeKey`, which had shipped
  with zero call sites) is now wired, with a stack so nested dialogs close inner-first and a guard
  that defers to an open floating layer.
- **`DialogContent` scrolled its header and footer away (TR-019)** — new `DialogBody` is the
  scrolling region; header and footer are pinned. New `DialogContent.MaxHeight`. Omitting
  `DialogBody` keeps the previous behaviour.
- **`Badge` had no status semantics (TR-016)** — `Success`, `Info` and `Warning` added, measured
  at 13.00:1 / 13.53:1 / 11.50:1 contrast.
- **`Breadcrumb` always wrapped (TR-027)** — `flex-wrap`/`flex-nowrap`/`flex-wrap-reverse` were in
  no `TailwindMerge` conflict group, so `flex-nowrap` could not be applied through any public
  parameter; they are now, `Breadcrumb.Wrap` is exposed, and the two-axis `gap` is split so a
  wrapped row no longer pays its column spacing again vertically.
- **Charts rendered a silent empty box (TR-011a)** — `ChartBase.Items` was a parameter nothing
  read, so passing data without nested `ApexPointSeries` children produced a legal, empty chart.
  `Items` is now wired, with `XValue`/`YValue`/`SeriesName`; a chart with no series renders a
  visible placeholder. The duplicated `@attributes` splat on all six chart types is removed.
- **Missing font tokens and safelist holes (TR-001, TR-021 residual)** — `--font-sans`,
  `--font-serif` and `--font-mono` were referenced by the base reset and never defined. The
  `p-*`/`m-*`/`gap-x`/`gap-y`/`size-*`/`space-*` safelist enumerations, which stopped short of the
  scale `w-*`/`h-*` already covered, are brought level. Bundle 956 KB → ~1,013 KB.

### Added

- `DataTable.ShowHeader`, `DataTable.Density` + `DataTableDensity` enum (TR-012, TR-025).
- `DialogBody`; `DialogContent.MaxHeight`.
- `AlertDialogContent.CloseOnEscape` / `.Modal` / `.OnEscapeKeyDown`.
- `CollapsibleContent.Unmount`.
- `BadgeVariant.Success` / `.Info` / `.Warning`.
- `Breadcrumb.Wrap`; `BreadcrumbList.Class`.
- `ChartBase.XValue` / `.YValue` / `.SeriesName` / `.EmptyText`.
- `LucideIconData.GetAliases()` / `.AliasCount` / `.ResolveName()`.
- `ChartBase.Options` / `.OptionsConfigurator`; `ChartContainer.Bare` (TR-028).
- `Badge.As` / `.Wrap` / `.Truncate` (TR-029, TR-034).
- `DataTableColumn.Align` + `DataTableColumnAlign` enum (TR-031).
- `DataTable.SearchText` (two-way) / `.ShowColumnChooser` (TR-033).
- `SidebarProvider.Width` / `.MobileWidth` / `.IconWidth`; `SidebarContext.MobileWidth` (TR-035).

### Documentation

- The AI reference's §1 `_Imports.razor` block was missing **30** real component namespaces,
  including `TrBlazeUI.Components.Empty` while the same file documented `<Empty>`. Following the
  reference verbatim produced an RZ10012 *warning* and a literal `<empty>` element — the page
  compiled, rendered unstyled text and never failed. All 30 added; the block is now the full 79.
- New parameter tables for `DataTableColumn`, `DialogContent` and `AlertDialogContent`, none of
  which had one. `CellClass`/`HeaderClass` had zero mentions in the entire reference.
- The `Alert`/`Button` icon guidance told readers a named `Icon` slot was a compile error. It is
  not, and `AlertIcon`/`ButtonIcon` were undocumented. All three working routes are now described.
- New rule documenting `Class` (merged via `cn`, conflict-aware) versus a raw lowercase `class`
  (splatted after, overwriting the component's own classes). Nine occurrences of the latter in the
  reference's own examples — including the KPI-card recipe, which silently lost its padding — were
  corrected.
- Parameter rows and worked examples for everything added for TR-028…TR-035: `Badge`'s `As`/`Wrap`/
  `Truncate` with the "a badge is an inline element" rule, `DataTableColumn.Align` with the reason
  `HeaderClass="text-right"` appears to do nothing, `DataTable.SearchText`/`ShowColumnChooser` with
  the card-header filter recipe, a *Steering a chart with `Options`* section, a first
  `ChartContainer` parameter table (it had none) covering `Bare`, `SidebarProvider`'s three width
  parameters with the three-tokens note, the `CollapsibleTrigger Class="w-full"` row recipe
  (TR-030), and a line stating that `NativeSelect` draws its own chevron.

---

## [2.1.0] — never published under this number; shipped in 2.0.3 (2026-08-25)

Consumer-feedback release closing the TechieBlog findings recorded in
`docs/TechieBlog-TrBlazeUI-Feedback.md` (TR-001 … TR-065).
Verified 2026-08-11: Release build 0 warnings / 0 errors; 65/65 headless-Chromium checks
(`tests/verify/ui-techieblog.spec.js` on `/verify-techieblog`), 103/103 demo routes clean,
regression specs 8/8 (`ui-ui014`) and 23/23 (`ui-ui016`) still green.

### ⚠ Behaviour changes to review before upgrading

- **Design tokens retuned for contrast.** The shipped defaults were validated as a full matrix —
  every foreground token against every surface token (`--muted`, `--secondary`, `--accent`,
  `--card`, `--popover`), not just `--background` — and 18 failing pairings were fixed.
  The visible ones: light `--input` and `--ring` move from `oklch(0.922)` / `oklch(0.708)` to
  `oklch(0.66)` (form-control borders were at **1.26:1**, below the 3:1 WCAG 1.4.11 floor, and are
  now **3.11:1**); dark `--input` moves to `oklch(0.55)`; dark `--accent` darkens to `oklch(0.30)`;
  dark `--destructive-foreground` becomes near-black so text on a destructive surface clears 4.5:1.
  Applications that already override these tokens are unaffected — the library still declares them
  through zero-specificity `:where()` selectors. Re-check any palette with `tools/token-contrast.py`.
- **`Rating` markup changed.** Each option is now a `<button role="radio">` instead of a
  `<span role="radio">`, and a `ReadOnly` rating renders `role="img"` with no radio semantics.
  CSS or tests that selected `span[role=radio]` need updating.
- **`TabsContent` always renders its panel element**, hidden when inactive (child content is still
  only rendered for the active tab). This is what makes each trigger's `aria-controls` resolve.
- **`trblazeui.css` is now ~906 KB minified (~97 KB gzipped)**, up from ~88 KB, because it ships the
  full Tailwind utility scale rather than only the utilities the library itself uses.

### Fixed — attribute splatting (TR-021, TR-030, TR-040, TR-046, TR-047, TR-048, TR-051)

- **`[Parameter(CaptureUnmatchedValues = true)]` added across the whole catalog.** Passing
  `data-testid` (or any `data-*`/`aria-*`/event handler) to `Label`, `Typography*`, `Breadcrumb*`,
  `Tabs*`, `Select*`, `Alert*`, `AlertDialog*`, `Carousel*`, `DropdownMenuContent/Item`,
  `RadioGroup*`, `DataTableColumn`, `DataTableToolbar`, `ButtonIcon` and ~120 other types used to
  throw `InvalidOperationException` at render time — which, inside the standard `ErrorBoundary`,
  took the whole page down while still returning HTTP 200. Reflection over the built assemblies now
  reports **344/344** public components in `TrBlazeUI.Components` and **59/59** in
  `TrBlazeUI.Primitives` declaring it (`tools/splat-audit`).
- Components that own no element — the context roots and the config-only `DataTableColumn` —
  accept the attributes without throwing and do not render them; this is now stated in the
  AI reference rather than left to be discovered. `BreadcrumbList` forwards its attributes onto the
  `<ol>` that `Breadcrumb` renders.

### Fixed — accessibility

- **`Rating` is keyboard operable (TR-031, TR-045, TR-052).** Options are real buttons with a roving
  `tabindex` and a literal `aria-checked="true"/"false"` (it was an empty, invalid token before, so
  no selection was exposed at all). `ReadOnly` now renders `role="img"` + `aria-label` with the
  stars `aria-hidden` and no tab stop; a new `Focusable` parameter takes a decorative rating out of
  the tab order. Each icon's `<linearGradient>` id includes the star index, so a five-star control
  no longer emits four duplicate DOM ids.
- **`Tabs` ARIA corrected (TR-054, TR-063, TR-064).** `aria-selected` is serialised as
  `"true"`/`"false"`; `aria-controls` is emitted only when a `TabsContent` panel for that value
  exists, and the panel element now stays in the DOM (hidden) so the reference resolves; the
  `MarkdownEditor` Write/Preview pair is rendered through `TabsList`, so it emits `role="tablist"`
  and inherits arrow-key navigation instead of being two orphan `role="tab"` buttons.
- **`NavigationMenu` links are Tab reachable (TR-044).** Top-level links no longer render
  `role="menuitem"` with `tabindex="-1"`; the menu-item semantics are applied only to links inside a
  `NavigationMenuContent` popup, which is a real `role="menu"`.
- **`ItemGroup` / `Item` (TR-055, TR-061).** An `Item` inside an `ItemGroup` emits
  `role="listitem"`, and `ItemSeparator` leaves the accessibility tree, so a list built from the
  pair is no longer announced as empty.
- **Bool-valued ARIA state attributes serialised correctly** across `Calendar`, `Collapsible`,
  `MenubarTrigger`, `RangeSlider`, `SidebarMenuButton`, `Slider`, `Toggle` and `ToggleGroupItem` —
  a raw `bool` renders as an empty attribute, which ARIA resolves to *undefined*.
- **`Input` / `Textarea` document `AriaLabel` (TR-062)**, and the reference states plainly that
  `Placeholder` is a hint, not an accessible name.

### Fixed — behaviour

- **`Input` / `Textarea` no longer lose or reorder keystrokes on a Blazor Server circuit
  (TR-053, TR-057).** The DOM value, the render-tree value and the value the parent supplied are
  now tracked separately, so the server's echo of the user's own typing never overwrites what has
  been typed since. Affects fast typists and, more seriously, anyone whose assistive technology
  injects text. New optional `DebounceMilliseconds` reduces per-keystroke round trips.
- **`SelectValue` shows the selected item's `Text` on first paint (TR-049, TR-058).** Items now
  register their `Value`/`Text` pair with the context even while the listbox is closed, and
  registration is keyed on the value, which also stops the keyboard-navigation list from
  duplicating every time the listbox is reopened.
- **Nested `Dialog`s stack correctly (TR-060).** Portals are rendered in the order they were opened
  instead of in the arbitrary order of a `ConcurrentDictionary`, so a dialog opened from inside
  another one is on top — and clickable — by construction rather than by luck.
- **`Typography*` gains `Size` (TR-020).** It replaces the component's baked-in size classes,
  including the responsive step on `TypographyH1`, so a smaller size is as reliable as a larger one.
  `ClassNames.cn` is also variant-aware now, so `lg:text-5xl` no longer survives every merge.
- **`DataTable.Refresh()` (TR-065)** repaints rows and `CellTemplate`s after an in-place edit to a
  bound item, and **`DataTable.MinWidth`** lets a wide table keep its natural width so its wrapper
  scrolls instead of clipping the right-hand columns (TR-043).

### Fixed — the shipped stylesheet (TR-019, TR-043, TR-050)

- **`trblazeui.css` now ships the standard Tailwind utility scale**, with the `sm:`/`md:`/`lg:`/
  `xl:`/`2xl:` responsive variants, not just the ~777 utilities the library's own components
  happened to reference. Previously `max-w-7xl`, `gap-6`, `py-8`, `grid-cols-2`, every responsive
  grid variant, `min-w-*`, `sm:basis-*`, `top-1`, `w-36`, `divide-y`, `backdrop-blur`,
  `no-underline`, `leading-relaxed`, `list-disc`, `object-contain` and `aspect-video` were absent
  and did nothing — with no error, no warning and no visual hint.
  Arbitrary values (`min-w-[720px]`) still cannot be pre-generated; use the scale or
  `DataTable.MinWidth`.
- **Library defaults added for `--chart-1…5`, `--sidebar*` and the `--alert-*` families**, which
  previously resolved to nothing unless the host defined them, plus a new
  **`--success` / `--success-foreground`** token pair and `bg-success` / `text-success` utilities.

### Added — components (TR-002, TR-003, TR-004, TR-005, TR-007, TR-009, TR-012, TR-022, TR-059)

`Prose`, `StatTile` + `StatGroup`, `Timeline` + `TimelineItem`, `Stepper` + `StepperItem`,
`AnchorNav` (in-page navigation with scrollspy), `SortableList` (button-driven reordering, so it is
keyboard and screen-reader operable), `PasswordStrength`, `CodeBlock` and `CenteredPanel`.

### Fixed — found by the demo pages

- **`Stepper` did not move its `aria-current="step"` marker** when `Current` changed. The component
  reference was cascaded with `IsFixed="true"`, so items never saw the new value. `Current` now
  cascades separately by value.
- **`CodeBlock`'s copy button silently did nothing on a non-secure origin.** `navigator.clipboard`
  only exists in a secure context, which excludes every plain-HTTP intranet or LAN deployment. It
  now falls back to `document.execCommand('copy')` and, if even that is refused, says so
  ("Press Ctrl+C") instead of failing silently.

### Added — demo coverage

Every fix and every new component is demonstrated in the demo apps, not just described:

- New pages: `/components/prose`, `/components/stat`, `/components/timeline`, `/components/stepper`,
  `/components/anchor-nav`, `/components/sortable-list`, `/components/password-strength`,
  `/components/code-block`, `/components/centered-panel` — registered in the sidebar, the command
  palette and the components index.
- Fix demonstrations added to the existing pages for `Rating` (keyboard operation, `ReadOnly`,
  `Focusable`), `Tabs` (ARIA, and the panel-less `Value`-driven pattern), `Select` (first-paint
  display text), `Input` / `Textarea` (fast typing, `DebounceMilliseconds`, `AriaLabel`),
  `Item` (list semantics), `NavigationMenu` (Tab reachability), `Typography` (`Size`),
  `DataTable` (`Refresh()`, `MinWidth`) and `Dialog` (stacked dialogs).
- A new **`/whats-new`** page covering the whole release, with live examples of the splatting sweep,
  the utility bundle and the retuned contrast tokens.

### Known issue

- **A `Dialog` declared inside another `Dialog`'s `DialogContent` does not open.** Found while
  building the demo pages and recorded as TR-066 in
  `docs/TechieBlog-TrBlazeUI-Feedback.md`. It is **pre-existing** — it reproduces against the 2.0.1
  `PortalService` source — and is unrelated to the portal-ordering fix above. Compose stacked
  dialogs as siblings, each with its own `@bind-Open`, which is what `/components/dialog` now shows.

### Added — tooling

- `tools/token-contrast.py` — validates the shipped palette as a contrast matrix.
- `tools/splat-audit` — reflects over the built assemblies and lists any component missing
  `CaptureUnmatchedValues`.
- `tests/verify/ui-techieblog.spec.js` + `/verify-techieblog` harness page.

---

## [2.0.0] — published to nuget.org

Consumer-feedback release closing the AstroLyfe UAT-2/UAT-3 findings (`REQ-UI-016`).
Verified 2026-07-21: Release build 0 warnings / 0 errors; 21/21 headless-Chromium checks.

> **Why a major bump:** `DataTable.ShowToolbar` changes its default value, which alters the
> rendered output of every existing `<DataTable>` that did not set it explicitly. No API
> signature changed and existing code still compiles — but per `RELEASE.md` ("Major: breaking
> changes") a default that changes what users see on screen is a breaking change. If you judge
> this cosmetic rather than contractual, `1.1.0` is defensible; only this heading needs editing.

### ⚠ Breaking

- **`DataTable.ShowToolbar` now defaults to `false`** (was `true`). The search box and
  Columns button are now **opt-in**. A bare `<DataTable TData="X" Data="@List">` renders
  just the table.
  **Migration:** add `ShowToolbar="true"` to any `DataTable` where you want the toolbar.
  No action needed if you were already passing `ShowToolbar="false"` — that becomes a
  harmless no-op.

### Fixed

- **DataTable no longer renders pagination chrome for a single page.** The bar was previously
  gated on `objProcessedData.Any()`, so a one-row grid still painted
  "Showing 1-1 of 1 / Rows per page / Page 1 of 1 / « ‹ › »". The guard is now
  `TotalItems > PageSize`, so pagination appears only when there is more than one page.
  `ShowPagination="false"` still suppresses it unconditionally. *(AstroLyfe TR-010)*

- **`DialogContent` / `AlertDialogContent` can no longer render above the top of the viewport.**
  A dialog taller than the viewport used to position its header off-screen — measured
  `top: -245px` at 1366×720 and `-305px` at 1280×600 — where it sat behind the host app's
  fixed header, invisible and unclickable. Both components now carry
  `max-h-[calc(100vh-2rem)] overflow-y-auto`; tall content scrolls inside the dialog.
  Measured after the fix: `top: 16px` at 1366×720, 1280×600 and 390×844.

  This clamps the dialog's *height* rather than overriding its centering property, so it is
  immune to the `transform`-vs-standalone-`translate` distinction that made consumer-side CSS
  overrides version-fragile. **If you shipped such an override, you can remove it** — it is no
  longer needed, and it remains compatible if you keep it. `Sheet`/`Drawer` position with
  `inset-y-0` and are deliberately untouched. *(AstroLyfe TR-011)*

- **Popover surfaces are opaque without host-defined theme tokens.** `SelectContent` and the
  other `bg-popover` surfaces resolve `var(--popover)`, which the library never defined — so an
  application that shipped no token set got `background-color: rgba(0, 0, 0, 0)`: an open
  `Select` painted a transparent panel with unreadable text over whatever sat behind it.

  `trblazeui.css` now ships default definitions for the core design tokens (`--popover`,
  `--popover-foreground`, `--background`, `--foreground`, `--border`, `--muted`, `--accent`,
  `--ring`, … in both light and `.dark`). They are declared inside `@layer base` **and** wrapped
  in `:where()` so they carry zero specificity — **any** host declaration still wins, layered or
  not. This is a floor, not a ceiling: themed applications are unaffected. *(AstroLyfe TR-012)*

### Changed

- `DataTable` gained an internal `ShouldShowPagination()` guard consolidating the
  `ShowPagination` / `IsLoading` / row-count conditions.
- Demo and AI-reference documentation updated for the new `ShowToolbar` default.

### Notes

- `TrBlazeUI.Components` depends on **`HtmlSanitizer 9.1.949-beta`** (pre-release). This is
  deliberate: it is the only line pulling `AngleSharp >= 1.5.0`, which patches
  **CVE-2026-54570** (mutated-XSS bypass defeating DOM-based sanitizers — the exact protection
  `RichTextEditor`/`MarkdownEditor` rely on). No stable `HtmlSanitizer` yet ships the patched
  `AngleSharp`. Revisit when 9.1.x reaches stable.

---

## [1.0.7]

Consumer-feedback release closing the TrStudio findings (`REQ-UI-015`) and the earlier
AstroLyfe findings (`REQ-UI-014`).

### Fixed

- `DataTable`, `Alert`, `Checkbox`, `Switch` splat `CaptureUnmatchedValues` onto their rendered
  root, so `id` / `data-*` / `aria-*` no longer throw `InvalidOperationException`.
- A controlled `Switch` no longer optimistically flips `aria-checked` when the bound `Checked`
  value is held unchanged by a gate or interceptor.
- `DataTable` self-contains at ≤400px (root `min-w-0`, wrapping footer) without forcing page
  horizontal scroll.
- `FileUpload.OnFilesSelected` added as an alias of `FilesChanged`.
- **Mac Catalyst packaging blocker:** `AddRazorSupportForMvc` removed, so published nuspecs carry
  no `<frameworkReferences>` and MAUI Mac Catalyst consumers resolve the packages without
  `NETSDK1082`.
- `Select` keyboard trap removed (Tab/Shift+Tab escape a closed trigger); inline popup fallback
  when no `PortalHost` is attached; accessible name resolved on first render.
- `DropdownMenuTrigger` gained an `AsChild` pattern to avoid nested interactive controls.
- Icons default to `aria-hidden="true"`; unknown icon ids render an empty placeholder marked
  `data-trblazeui-missing-icon` with a one-time logger warning, instead of a misleading
  alert-triangle glyph.
- `.sr-only` hardened to a zero-scroll-footprint visually-hidden box.
- `Input.Label` renders a real associated `<label>` instead of silently doing nothing.
- New `Grid` / `GridItem` components + `/components/grid` demo.

---

## [1.0.4] and earlier

See `docs/OldDocs/` for the archived consumer issue reports covering the `0.0.0-beta.*` line.
