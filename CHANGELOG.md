# Changelog

All notable changes to TrBlazeUI are recorded here. This project follows
[Semantic Versioning](https://semver.org/) as described in `RELEASE.md`.

All five packages share a single version number: **TrBlazeUI.Primitives**,
**TrBlazeUI.Components**, **TrBlazeUI.Icons.Lucide**, **TrBlazeUI.Icons.Heroicons**,
**TrBlazeUI.Icons.Feather**.

---

## [2.1.0] — unreleased

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

## [2.0.0] — unreleased

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
