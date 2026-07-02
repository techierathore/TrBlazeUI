# AstroLyfe — TrBlazeUI Library Feedback

> For the TrBlazeUI team. One file per library so it can be handed to (or picked up by) the owning team directly.
> Schema: `.tfcore/templates/v4custom/app-library-feedback-tmpl.md`. Issue IDs are append-only (`TR-NNN`).

Issues encountered while using TrBlazeUI (`trblazeui.components` / `trblazeui.primitives` / `trblazeui.icons.feather`) in AstroLyfe.
Raised during the REQ-NFR-005 accessibility verification pass (2026-06-12, axe-core 4.x via `@axe-core/playwright`, Chromium) and the 2026-06-28 fix-issues clusters.
Repro environment: AstroBlazeWeb (Blazor Server, .NET 10) + TrBlazeUI 1.0.6.

## Summary
- 2 blockers, 6 majors, 1 minor, 0 nice-to-haves
- Last consolidated: 2026-06-30
- **2026-07-02 — ALL 9 ISSUES RESOLVED by the TrBlazeUI team** (library-side, `[REQ-UI-014]`). Each issue below carries a `Resolution` note. Fixes verified with a Release build (0 warnings / 0 errors) and a headless-Chromium runtime smoke against the Blazor Server demo (Tab order, popup render with & without PortalHost, AsChild, Input Label, Grid, icon fallback/aria, sr-only overflow at 390px). Pick up the next TrBlazeUI package version (> 1.0.6) and re-run the axe pass; the app-side `.sr-only` workaround in `theme.css` and the FeatherIcon name remapping can be kept (harmless) or dropped.
- ~~Open blockers (TR-001, TR-002) gate REQ-NFR-005 (accessibility). All majors/minor have an app-side workaround applied except TR-003/TR-004/TR-005 (no workaround; axe findings on anonymous pages).~~

## Issues

_Sorted by severity: blocker → major → minor. IDs are append-only and stable; order is presentation-only._

### TR-001 — SelectTrigger is a keyboard trap (Tab and Shift+Tab do not move focus)
- **Severity:** blocker
- **Repro:**
  ```razor
  <Select @bind-Value="PageObj.RoleCode" TValue="string" Class="w-full">
      <SelectTrigger><SelectValue Placeholder="Select a role" /></SelectTrigger>
      <SelectContent>
          <SelectItem Value="@("Patreon")" Text="Patreon (Seeker)" TValue="string">Patreon (Seeker)</SelectItem>
      </SelectContent>
  </Select>
  ```
  Focus the trigger (`role="combobox"`, closed state), press Tab — repeatedly.
- **Expected:** Tab moves focus to the next focusable element; Shift+Tab to the previous one (WCAG 2.1.2 No Keyboard Trap).
- **Actual:** Focus stays on the trigger for 6+ consecutive Tab presses and also for Shift+Tab. A keyboard-only user is hard-stuck mid-form (on SignUp they can never reach Password/Terms/Create Account).
- **Encountered in:** REQ-NFR-005 (SignUp page, `src/AstroBlazeUI/Pages/SignUpPage.razor`); evidence in `tests/ui-smoke/KeyboardNav.spec.ts` (SignUpTabOrder fails at the role Select).
- **Workaround:** none applied (auth flows still work because `RoleCode` defaults to "Patreon", so users never have to operate the Select — but they also cannot).
- **Suggested fix:** the trigger's keydown handler appears to `preventDefault()` Tab even while the popup is closed. Only intercept Tab when `data-state="open"`, and let it bubble when closed.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED — exactly the suspected cause: a blanket `@onkeydown:preventDefault="true"` on the trigger button swallowed every key including Tab. Removed it (`src/TrBlazeUI.Primitives/Primitives/Select/SelectTrigger.razor`); Enter/Space now activate via the button's native click, ArrowUp/ArrowDown open the popup, Tab/Shift+Tab bubble normally. Runtime-verified: Tab and Shift+Tab both move focus off the closed trigger; ArrowDown still opens.

### TR-002 — SelectContent / SelectItems never render into the DOM when the Select is opened
- **Severity:** blocker
- **Repro:** same markup as TR-001. Click the trigger (mouse) or press Enter/Space/ArrowDown while it is focused.
- **Expected:** the listbox popup renders with the three `role="option"` items visible.
- **Actual:** `aria-expanded` flips to `true` and `data-state` to `open`, but no element with `role="listbox"`/`role="option"` ever enters the DOM (page HTML does not contain the item texts "Astrologer"/"Numerologist" after opening; screenshot shows no popup). Affects mouse users too — the control is effectively inoperable.
- **Encountered in:** REQ-NFR-005 (SignUp page role selector).
- **Workaround:** none; the form is only usable because the bound default value is acceptable.
- **Suggested fix:** verify the popup portal/JS interop for `SelectContent` in Blazor Server interactive render mode — the open state propagates but the content subtree is never materialized.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED — root cause: Select (and every floating component) renders its popup through a `PortalHost` component that must sit in the app's root layout; without an attached (interactive) `PortalHost`, the open state propagated but nothing ever rendered. `FloatingPortal` now detects the missing host and **falls back to rendering the popup inline** at the declaration site (still JS-positioned at the trigger), and logs a one-time warning telling you to add `<PortalHost />` for correct stacking. Runtime-verified with `PortalHost` removed from the demo layout: listbox renders, positions at the trigger, and selection works. Recommended for AstroBlazeWeb: add `<PortalHost />` (from `TrBlazeUI.Primitives.Services`) at the end of `MainLayout.razor` inside the interactive root.

### TR-003 — SelectTrigger has no accessible name at initial render (axe `button-name`, critical)
- **Severity:** major
- **Repro:** same markup as TR-001 with `RoleCode = "Patreon"` pre-set; run axe immediately after page load (`networkidle`).
- **Expected:** the trigger exposes the selected value text (or the `SelectValue` placeholder) as its accessible name from the first render; ideally also supports `aria-label`/`aria-labelledby` wiring from the surrounding `FieldLabel`.
- **Actual:** axe flags `button-name` (impact: critical) on the trigger reproducibly across runs — at initial render the trigger's text content is empty (the bound value's display text appears only after a later render pass), and no `aria-label`/`aria-labelledby` is present.
- **Encountered in:** REQ-NFR-005 (`tests/ui-smoke/AxeScan.spec.ts`, `/signup` scan).
- **Workaround:** none applied.
- **Suggested fix:** resolve `SelectValue` display text synchronously on first render (fall back to the raw bound value), and/or emit `aria-labelledby` referencing the associated `FieldLabel`.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED — `SelectValue` now resolves its text fully synchronously: registered item display text → **raw bound value `ToString()` fallback** → placeholder, and always renders inside a `<span id="select-N-value">` so it can be referenced from `aria-labelledby`. The prerendered HTML of the demo Select page shows the trigger text present in the very first server response. For label wiring, `aria-label`/`aria-labelledby` set on `SelectTrigger` pass through to the underlying button (attribute splatting). A `DisplayTextSelector` parameter on `Select` also lets you supply display text for pre-selected values whose `ToString()` isn't presentable.

### TR-004 — DropdownMenuTrigger wraps children in its own `<button>`, producing nested interactive controls (axe `nested-interactive`, serious)
- **Severity:** major
- **Repro:**
  ```razor
  <DropdownMenu>
      <DropdownMenuTrigger>
          <Button Variant="ButtonVariant.Ghost">Insights</Button>
      </DropdownMenuTrigger>
      ...
  </DropdownMenu>
  ```
- **Expected:** a way to render the child `Button` as the trigger itself (shadcn `AsChild` pattern), or guidance that only non-interactive content may be slotted.
- **Actual:** the trigger renders its own `<button id="dropdown-menu-N-trigger">` around the app `Button`, yielding `<button><button>…</button></button>`. axe flags `nested-interactive` (serious) on all four TopMenu dropdown triggers; screen-reader/keyboard focus order becomes ambiguous.
- **Encountered in:** REQ-NFR-005 (`/Index` via `src/AstroBlazeUI/UiControls/TopMenu.razor`).
- **Workaround:** none applied (changing TopMenu markup is a UI-phase decision; plain text/icon children inside the trigger would avoid the nesting).
- **Suggested fix:** add an `AsChild`-style parameter to `DropdownMenuTrigger` (and document that interactive elements must not be slotted), or detect a single `Button` child and merge attributes onto it instead of double-wrapping.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED — `DropdownMenuTrigger` supports `AsChild="true"`: the slotted TrBlazeUI `Button` becomes the trigger element itself (it consumes the cascaded `TriggerContext` and takes on the trigger id, `aria-haspopup`, `aria-expanded`, `aria-controls`, click/keyboard behavior). No wrapper `<button>` is rendered, so there is no nested-interactive violation. Runtime-verified (1 button, 0 nested, menu opens and items fire). For TopMenu: `<DropdownMenuTrigger AsChild="true"><Button Variant="ButtonVariant.Ghost">Insights</Button></DropdownMenuTrigger>`. Documented in the demo (`/components/dropdown-menu` → "Button As Trigger (AsChild)") with guidance that interactive content must use AsChild.

### TR-006 — DataTable `.sr-only` header spans use inline `left` in a body-level portal, forcing page horizontal-overflow on narrow viewports
- **Severity:** major
- **Repro:** render any `<DataTable>` with several columns inside a width-constrained card on a ≤390px viewport (e.g. the AstroLyfe ReferenceData grids, ManageUsers, the Index/Admin-Dashboard embedded Kundali List).
- **Expected:** visually-hidden screen-reader spans must have zero layout/scroll footprint — they should not extend the document's scroll width.
- **Actual:** each `.sr-only` span is emitted with an **inline `left: <N>px`** and rendered into a **body-level portal** (its `offsetParent` is `<body>`, outside the consuming app's layout). The inline `left` places the span at its table-relative x (≈485px on a single grid; ≈1185px when the grid sits in a pushed-right column), so `document.documentElement.scrollWidth` exceeds the viewport and the whole page scrolls horizontally on mobile. Measured on AstroLyfe: 63–793px of spurious horizontal overflow across ~13 grid screens.
- **Encountered in:** REQ-NFR-005 (Index, Admin Dashboard, ManageUsers, Places, all 10 ReferenceData grids).
- **Workaround (applied app-side):** global `.sr-only` override in `theme.css` forcing the standard zero-footprint visually-hidden box (`position:absolute; left:0!important; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); clip-path:inset(50%); margin:-1px`), which neutralizes the inline `left`. Also clamped the app `<main>` (`min-width:0; max-width:100%; overflow-x:auto`) so wide tables scroll within their card rather than the page.
- **Suggested fix:** the DataTable's screen-reader spans should use the standard clipped visually-hidden pattern (no inline `left`, no body-portal placement at a content-relative offset). Either keep them in-flow next to their control, or render them with `left:0`/clipped so they can never contribute to scroll width.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED — root cause: these are the DataTable pagination's `.sr-only` spans ("Go to first/last page" etc.). Tailwind's stock `.sr-only` is `position:absolute` **without** `left`, so the span keeps its static x-position; because no ancestor is positioned, its containing block is the `<body>`, it escapes the card's `overflow` clip, and its resolved position reads back as the table-relative "inline left" you measured. `trblazeui.css` now ships a hardened `.sr-only` (`left:0 !important` + the standard clipped pattern with `clip-path:inset(50%)`), identical in spirit to your `theme.css` workaround, so visually-hidden text can never extend the document scroll width. Runtime-verified at 390px: all `.sr-only` rects at x≤0, `scrollWidth == clientWidth == 390`. Your app-side override can be removed once on the new package (keeping it is harmless).

### TR-007 — `<Input Label="…">` silently accepts the Label param but renders no visible label
- **Severity:** major
- **Repro:**
  ```razor
  <Input Label="Full Name" @bind-Value="Model.Name" Placeholder="Enter your full name" />
  ```
  Render the page; inspect the DOM around the input.
- **Expected:** the `Label` parameter renders a visible `<label>` associated with the input (and an accessible name for it).
- **Actual:** the param is accepted (no compile/runtime error) but **no visible label element is produced** — the field shows only its placeholder. Pages that relied on `<Input Label="…">` (e.g. PatreonRegister Account-Details fields) rendered as unlabeled inputs. This is a silent no-op: it reads as "labelled" in source but isn't at runtime, and also fails the accessible-name expectation.
- **Encountered in:** fix-issues Cluster A 2026-06-28 (`src/AstroBlazeUI/Pages/Profile/PatreonRegister.razor`).
- **Workaround (applied app-side):** replaced each `<Input Label="…">` with an explicit preceding `<label class="fluent-label">…</label>` + bare `<Input>`, matching the working SignUpPage pattern.
- **Suggested fix:** either render the `Label` param as a real associated `<label>` (preferred), or remove the param so the omission is a compile error rather than a silent runtime no-op.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED (preferred option) — `Input` now has a real `Label` parameter: it renders a visible `<label>` immediately before the input, associated via `for`/`id` (an id is generated when the `Id` parameter isn't set), giving the field a visible label AND an accessible name. Previously the attribute fell into `CaptureUnmatchedValues` and rendered as an inert HTML attribute — that silent no-op is gone. Runtime-verified: `<Input Label="Full Name" …>` renders an associated label. The explicit-`<label class="fluent-label">` pattern you applied app-side keeps working; you can migrate back to `Label="…"` at leisure.

### TR-008 — No grid/column components ship, so partial FluentUI→TrBlazeUI migrations leave inert `xs`/`sm`/`md`/`Spacing` attributes that silently collapse layout
- **Severity:** major (migration-trap / guidance gap)
- **Repro:** a page migrated from FluentUI keeps `<div class="grid grid-cols-12 gap-3" Spacing="3"><div xs="12" sm="6">…</div></div>`.
- **Expected:** either a TrBlazeUI Grid/Column component that consumes `xs/sm/Spacing`, or migration guidance that these FluentUI/Blazorise attributes MUST be rewritten to Tailwind `col-span-*`.
- **Actual:** `xs`/`sm`/`md`/`lg`/`Spacing` on a plain `<div>` are inert HTML attributes — they do nothing. With a `grid-cols-12` parent, every child lands in a single 1/12-width column, collapsing the page into a ~115px strip with overlapping controls and one-word-per-line wrapping (and runaway page height). Silent: no error, just broken layout. Hit on **11 pages** in this codebase.
- **Encountered in:** fix-issues Cluster A 2026-06-28 (PlacesList, DocumentUpload, AstrologerDashboard, AstrologerRegister, AstrologerWelcome, InsightHistory, InsightsDashboard, + the MarkupString/clipping outliers).
- **Workaround (applied app-side):** migrated children to Tailwind responsive `col-span-12 sm:col-span-6` etc.; removed inert `Spacing` (use container `gap-*`).
- **Suggested fix:** ship a documented `Grid`/`GridItem` (or `Stack`/`Row`/`Col`) component, or publish a FluentUI→TrBlazeUI migration cheatsheet flagging `xs/sm/md/lg/Spacing` as must-rewrite.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED (both options) — new `Grid` / `GridItem` components ship in `TrBlazeUI.Components.Grid`: `<Grid Spacing="3"><GridItem Xs="12" Sm="6">…</GridItem></Grid>` maps 1:1 onto the FluentUI mental model (12-column, mobile-first; `Sm/Md/Lg/Xl` breakpoints at 640/768/1024/1280px; `Spacing` uses the 0.25rem scale; `Gap`/`Columns` for custom layouts). Backing CSS is shipped in `trblazeui.css` (no Tailwind JIT dependency). Documented with a live demo at `/components/grid`, including a "Migrating From FluentUI" note flagging `xs/sm/md/lg/Spacing` on plain divs as inert must-rewrites; the UsageGuide carries the same cheatsheet. Runtime-verified: 12-track grid, 3-per-row at desktop (`Lg="4"`), 1-per-row at 390px.

### TR-009 — `<FeatherIcon Name="…">` silently renders an alert-triangle fallback for any invalid icon id
- **Severity:** major
- **Repro:** `<FeatherIcon Name="add" />` (or any non-Feather id, e.g. `lockclosed`, `weathermoon`, `print`, `checkmark`).
- **Expected:** an unknown icon id should fail loudly (build/analyzer warning) or render nothing — so a wrong name is caught.
- **Actual:** the component renders a **yellow warning/alert-triangle** glyph for any unrecognized `Name`. This looks like a real (error) icon, so wrong names hide in plain sight. In AstroLyfe this masked **24 distinct invalid names across 51 `.razor` files** (legacy FluentUI ids like `lockclosed`/`checkmark`/`dismiss`/`add`/`people`/`personcircle` carried through the migration) — every access-denied panel, etc., showed a triangle instead of its intended icon.
- **Encountered in:** fix-issues Cluster D 2026-06-28 (FeedNQueryList, AstrologerWorkspace, ManageConsents, AstrologerWelcome, PatreonRegister + ~46 more).
- **Workaround (applied app-side):** mapped every invalid name to its canonical Feather id (`add`→`plus`, `lockclosed`→`lock`, `weathermoon`→`moon`, `print`→`printer`, etc.).
- **Suggested fix:** emit a build-time or dev-console warning for an unrecognized `Name`, and/or render an empty/placeholder box rather than the alert-triangle (which reads as a real warning icon). Ideally ship the valid id list (or a source-generator/analyzer) so wrong names are a compile error.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED — an unrecognized `Name` now renders an **empty, size-preserving, `aria-hidden` placeholder** (`<span data-trblazeui-missing-icon="add">`, no glyph — nothing that reads as a real warning icon) and logs a one-time `ILogger` warning per bad name, e.g. `TrBlazeUI FeatherIcon: unknown icon name 'add'. … Check the Feather icon id (e.g. 'plus' not 'add', 'lock' not 'lockclosed').` — visible in the server console (Blazor Server) or browser console (WASM). Applied to all three icon packages (Feather, Lucide, Heroicons). The `data-trblazeui-missing-icon` attribute makes a DOM/Playwright sweep for stragglers trivial. Runtime-verified (placeholder rendered, warning logged). A compile-time analyzer remains a good future enhancement; noted under Deferred in PROJECT-STATUS.

### TR-005 — FeatherIcon renders `role="img"` SVGs with no accessible text (axe `svg-img-alt`, serious)
- **Severity:** minor
- **Repro:** `<FeatherIcon Name="calendar" Size="16" />` (package `trblazeui.icons.feather`).
- **Expected:** decorative icons should render `aria-hidden="true"` (no `role="img"`); informative icons should accept an accessible-name parameter (`Title`/`AriaLabel`).
- **Actual:** the SVG is emitted with `role="img"` and no `<title>`/`aria-label`, so axe flags `svg-img-alt` (serious) on every icon (4+ nodes on `/Index`).
- **Encountered in:** REQ-NFR-005 (`/Index`, TopMenu icons).
- **Workaround:** none applied.
- **Suggested fix:** default to `aria-hidden="true"` and drop `role="img"` unless an accessible name is supplied; add an optional `AriaLabel` parameter that emits `role="img"` + `aria-label` together.
- **Resolution (2026-07-02, TrBlazeUI):** FIXED — exactly as suggested, across all three icon packages: with no `AriaLabel`, icons render `aria-hidden="true"` and **no** `role`/`aria-label` (decorative); with `AriaLabel="…"`, they render `role="img"` + `aria-label` (informative). Runtime-verified on the Feather demo page (333 SVGs, zero `role="img"`-without-label) and on a labelled icon (`role="img"` + `aria-label="Calendar"`). This clears the `svg-img-alt` findings.
