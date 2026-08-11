# AstroLyfe — TrBlazeUI Library Feedback

> For the TrBlazeUI team. One file per library so it can be handed to (or picked up by) the owning team directly.
> Schema: `.tfcore/templates/v4custom/app-library-feedback-tmpl.md`. Issue IDs are append-only (`TR-NNN`).

Issues encountered while using TrBlazeUI (`trblazeui.components` / `trblazeui.primitives` / `trblazeui.icons.feather`) in AstroLyfe.
Raised during the REQ-NFR-005 accessibility verification pass (2026-06-12, axe-core 4.x via `@axe-core/playwright`, Chromium) and the 2026-06-28 fix-issues clusters.
Repro environment: AstroBlazeWeb (Blazor Server, .NET 10) + **TrBlazeUI 2.0.0** (upgraded from 1.0.6 on 2026-07-22).

## Summary
- 2 blockers, 10 majors, 1 minor, 0 nice-to-haves (13 issues; TR-013 retracted)
- **Open: 0.** All 13 addressed library-side: 11 fixed in 2.0.0, TR-003 fixed in 2.0.1, TR-014 defensively hardened in 2.0.1 (auto-margin dialog centering — the double-offset clip is now structurally impossible); TR-013 retracted.
- Last consolidated: **2026-08-11** (`*handoff-phase` — re-confirmed 0 open; no disposition changed since 2026-07-22. The 2.1.0 release adds no AstroLyfe-specific fixes, but **TR-003's `SelectTrigger` and TR-010's `DataTable` are both touched by it** — see the CHANGELOG's "Behaviour changes to review before upgrading" before you upgrade past 2.0.1.) · previously 2026-07-22 (TrBlazeUI `*fix-issues` — TR-003 fixed + verified; TR-014 hardened + verified)
- **AstroLyfe upgraded 1.0.6 → 2.0.0 on 2026-07-22 and re-verified every issue live** (headless Chromium against the running app; axe-core 4.x on the anonymous pages). Result: **11 of 13 confirmed FIXED**, **1 still open (TR-003)**, **1 NEW defect found (TR-014)**.
- **➤ TrBlazeUI update 2026-07-22 (`*fix-issues`, REQ-UI-014 + REQ-UI-016):** **TR-003 is now FIXED library-side** — `SelectTrigger` emits a default `aria-labelledby` → the `SelectValue` span and gains an `AriaLabel` param; axe `button-name` verified 0 violations on the demo. **TR-014 is now DEFENSIVELY HARDENED** — `DialogContent`/`AlertDialogContent` center with auto margins (`inset-0 m-auto h-fit`) instead of translate/transform, so no stray −50% offset can ever clip the dialog (verified settled `transform:none` **and** `translate:none`, `top=16px`); this was done at the owner's request even though the double-offset couldn't be reproduced on current source. **After the next publish (2.0.1), AstroLyfe can drop BOTH app-side workarounds: the per-Select `aria-label` splat (TR-003) and the one-line `translate:none` dialog override (TR-014) — the latter's selector no longer even matches, since the library dropped the `left-[50%]`/`top-[50%]` tokens.**
- ✅ **Confirmed fixed live in 2.0.0:** TR-001 (Tab now escapes the trigger), TR-002 (3 `role=option` items materialise, was 0), TR-004 (`nested-interactive` gone), TR-006 (0px page overflow @390), TR-007, TR-008, TR-009, TR-010 (0 search boxes; `ShowToolbar` now defaults `false`), TR-011 (partially — see TR-014), TR-012 (open listbox now paints `rgb(255,255,255)` panel with `rgb(26,35,126)` text, was `rgba(0,0,0,0)`), TR-005.
- ❌ **TR-003 is NOT fixed** — reopened below with root cause. 2.0.0 renders the selected value as inner text of the trigger, but the trigger carries `role="combobox"`, which is **not a name-from-content role** in ARIA. Inner text therefore can never supply the accessible name. axe still reports `button-name` (critical). Needs `aria-label`/`aria-labelledby`.
- 🆕 **TR-014 (major, NEW)** — 2.0.0's TR-011 fix is incomplete: `DialogContent` applies the −50% centering offset **twice** (via both `transform` and the standalone `translate` property), so tall dialogs still clip above the viewport. Details below.
- ⚠ Behavioural breaking change confirmed: `DataTable.ShowToolbar` now defaults to `false`. Harmless for AstroLyfe (it already passed `ShowToolbar="false"` everywhere and uses `ShowToolbar="true"` nowhere).

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

### TR-002 — SelectContent / SelectItems never render into the DOM when the Select is opened
- **Severity:** blocker
- **Repro:** same markup as TR-001. Click the trigger (mouse) or press Enter/Space/ArrowDown while it is focused.
- **Expected:** the listbox popup renders with the three `role="option"` items visible.
- **Actual:** `aria-expanded` flips to `true` and `data-state` to `open`, but no element with `role="listbox"`/`role="option"` ever enters the DOM (page HTML does not contain the item texts "Astrologer"/"Numerologist" after opening; screenshot shows no popup). Affects mouse users too — the control is effectively inoperable.
- **Encountered in:** REQ-NFR-005 (SignUp page role selector).
- **Workaround:** none; the form is only usable because the bound default value is acceptable.
- **Suggested fix:** verify the popup portal/JS interop for `SelectContent` in Blazor Server interactive render mode — the open state propagates but the content subtree is never materialized.

### TR-003 — SelectTrigger has no accessible name at initial render (axe `button-name`, critical)
- **Severity:** major
- **Repro:** same markup as TR-001 with `RoleCode = "Patreon"` pre-set; run axe immediately after page load (`networkidle`).
- **Expected:** the trigger exposes the selected value text (or the `SelectValue` placeholder) as its accessible name from the first render; ideally also supports `aria-label`/`aria-labelledby` wiring from the surrounding `FieldLabel`.
- **Actual:** axe flags `button-name` (impact: critical) on the trigger reproducibly across runs — at initial render the trigger's text content is empty (the bound value's display text appears only after a later render pass), and no `aria-label`/`aria-labelledby` is present.
- **Encountered in:** REQ-NFR-005 (`tests/ui-smoke/AxeScan.spec.ts`, `/signup` scan).
- **Workaround:** none applied.
- **Suggested fix:** resolve `SelectValue` display text synchronously on first render (fall back to the raw bound value), and/or emit `aria-labelledby` referencing the associated `FieldLabel`.
- **❌ REOPENED 2026-07-22 — still failing in 2.0.0, and the "render the value as inner text" approach cannot fix it.** Re-scanned `/SignUp` with axe-core on 2.0.0: `button-name` (critical, 1 node, `#select-165-trigger`) still fires. Root cause, from a live DOM probe:
  - The trigger DOES now contain the value: `innerHTML = <span id="select-168-value">Patreon</span>`, `display:block`, `visibility:visible`, no `aria-hidden`, and it is present at `networkidle` **and** 3 s later (so this is **not** the render-timing race the original report hypothesised — we tested that explicitly; the text is there the whole time and axe fails at both moments).
  - It fails because the element is `<button role="combobox">`. Per ARIA, `combobox` is **not** a *name-from-content* role — so descendant text is ignored by the accessible-name computation. `aria-label` and `aria-labelledby` are both absent (`null`).
  - Net: the accessible name is empty no matter what is rendered inside the trigger.
  - **Confirmed a library-render issue, not consumer markup:** AstroLyfe uses the library's own documented Select pattern (`<Select><SelectTrigger><SelectValue Placeholder=…/></SelectTrigger>…`) with no customisation of the trigger. The rendered `<button role="combobox">` with `aria-labelledby=null` and no native `aria-label` is entirely the library's output. (The `aria-label="I am a..."` now visible on the trigger is the app-side workaround below, added in the `.razor` markup — it is the *only* accessible name present; remove it and the name is empty again.)
- **Workaround (applied app-side 2026-07-22):** splat an explicit `aria-label` onto the trigger — `<SelectTrigger aria-label="I am a...">` in `SignUpPage.razor`. Attribute splatting works, and this takes `/SignUp` from 1 critical violation to **0**. Every consumer must currently do this on every Select.
- **Suggested fix (revised):** emit `aria-labelledby` on the trigger pointing at the `SelectValue` span (and/or the surrounding `FieldLabel`), or expose an `AriaLabel` parameter on `SelectTrigger`. Rendering the text inside a `role="combobox"` element is not sufficient on its own.
- **✅ FIXED library-side 2026-07-22 (REQ-UI-014, ships in 2.0.1).** The primitive `SelectTrigger` now emits a default **`aria-labelledby`** pointing at the `SelectValue` span id (`GetDefaultLabelledBy()` → `SelectContext.ValueId`), so the `role="combobox"` trigger has a non-empty accessible name from the very first render — no name-from-content dependency. It defers automatically when you supply your own name: if a **non-empty** `aria-label` or `aria-labelledby` is splatted onto the trigger, the default is omitted so yours wins (a null/unset forwarded value does not count). The styled `SelectTrigger` also gains an **`AriaLabel`** parameter that emits `aria-label` for a descriptive purpose-name (e.g. `AriaLabel="Role"`), which overrides the value-derived default per ARIA precedence. Verified on the demo (`/verify-ui014`, headless Chromium, Release 0/0): **axe `button-name` = 0 violations**; accessible name resolves to the bound value ("Patreon") for a valued trigger, to the placeholder ("Select a role") when empty, and to the `AriaLabel` when set (with no default `aria-labelledby` in that case). **Action for AstroLyfe:** on upgrade to 2.0.1 you can remove the per-Select `aria-label="…"` workaround splat in `SignUpPage.razor` (and anywhere else) — the trigger is now named by default; keep an explicit `AriaLabel` only where you want a purpose-name better than the current value.

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

### TR-006 — DataTable `.sr-only` header spans use inline `left` in a body-level portal, forcing page horizontal-overflow on narrow viewports
- **Severity:** major
- **Repro:** render any `<DataTable>` with several columns inside a width-constrained card on a ≤390px viewport (e.g. the AstroLyfe ReferenceData grids, ManageUsers, the Index/Admin-Dashboard embedded Kundali List).
- **Expected:** visually-hidden screen-reader spans must have zero layout/scroll footprint — they should not extend the document's scroll width.
- **Actual:** each `.sr-only` span is emitted with an **inline `left: <N>px`** and rendered into a **body-level portal** (its `offsetParent` is `<body>`, outside the consuming app's layout). The inline `left` places the span at its table-relative x (≈485px on a single grid; ≈1185px when the grid sits in a pushed-right column), so `document.documentElement.scrollWidth` exceeds the viewport and the whole page scrolls horizontally on mobile. Measured on AstroLyfe: 63–793px of spurious horizontal overflow across ~13 grid screens.
- **Encountered in:** REQ-NFR-005 (Index, Admin Dashboard, ManageUsers, Places, all 10 ReferenceData grids).
- **Workaround (applied app-side):** global `.sr-only` override in `theme.css` forcing the standard zero-footprint visually-hidden box (`position:absolute; left:0!important; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); clip-path:inset(50%); margin:-1px`), which neutralizes the inline `left`. Also clamped the app `<main>` (`min-width:0; max-width:100%; overflow-x:auto`) so wide tables scroll within their card rather than the page.
- **Suggested fix:** the DataTable's screen-reader spans should use the standard clipped visually-hidden pattern (no inline `left`, no body-portal placement at a content-relative offset). Either keep them in-flow next to their control, or render them with `left:0`/clipped so they can never contribute to scroll width.

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

### TR-008 — No grid/column components ship, so partial FluentUI→TrBlazeUI migrations leave inert `xs`/`sm`/`md`/`Spacing` attributes that silently collapse layout
- **Severity:** major (migration-trap / guidance gap)
- **Repro:** a page migrated from FluentUI keeps `<div class="grid grid-cols-12 gap-3" Spacing="3"><div xs="12" sm="6">…</div></div>`.
- **Expected:** either a TrBlazeUI Grid/Column component that consumes `xs/sm/Spacing`, or migration guidance that these FluentUI/Blazorise attributes MUST be rewritten to Tailwind `col-span-*`.
- **Actual:** `xs`/`sm`/`md`/`lg`/`Spacing` on a plain `<div>` are inert HTML attributes — they do nothing. With a `grid-cols-12` parent, every child lands in a single 1/12-width column, collapsing the page into a ~115px strip with overlapping controls and one-word-per-line wrapping (and runaway page height). Silent: no error, just broken layout. Hit on **11 pages** in this codebase.
- **Encountered in:** fix-issues Cluster A 2026-06-28 (PlacesList, DocumentUpload, AstrologerDashboard, AstrologerRegister, AstrologerWelcome, InsightHistory, InsightsDashboard, + the MarkupString/clipping outliers).
- **Workaround (applied app-side):** migrated children to Tailwind responsive `col-span-12 sm:col-span-6` etc.; removed inert `Spacing` (use container `gap-*`).
- **Suggested fix:** ship a documented `Grid`/`GridItem` (or `Stack`/`Row`/`Col`) component, or publish a FluentUI→TrBlazeUI migration cheatsheet flagging `xs/sm/md/lg/Spacing` as must-rewrite.

### TR-009 — `<FeatherIcon Name="…">` silently renders an alert-triangle fallback for any invalid icon id
- **Severity:** major
- **Repro:** `<FeatherIcon Name="add" />` (or any non-Feather id, e.g. `lockclosed`, `weathermoon`, `print`, `checkmark`).
- **Expected:** an unknown icon id should fail loudly (build/analyzer warning) or render nothing — so a wrong name is caught.
- **Actual:** the component renders a **yellow warning/alert-triangle** glyph for any unrecognized `Name`. This looks like a real (error) icon, so wrong names hide in plain sight. In AstroLyfe this masked **24 distinct invalid names across 51 `.razor` files** (legacy FluentUI ids like `lockclosed`/`checkmark`/`dismiss`/`add`/`people`/`personcircle` carried through the migration) — every access-denied panel, etc., showed a triangle instead of its intended icon.
- **Encountered in:** fix-issues Cluster D 2026-06-28 (FeedNQueryList, AstrologerWorkspace, ManageConsents, AstrologerWelcome, PatreonRegister + ~46 more).
- **Workaround (applied app-side):** mapped every invalid name to its canonical Feather id (`add`→`plus`, `lockclosed`→`lock`, `weathermoon`→`moon`, `print`→`printer`, etc.).
- **Suggested fix:** emit a build-time or dev-console warning for an unrecognized `Name`, and/or render an empty/placeholder box rather than the alert-triangle (which reads as a real warning icon). Ideally ship the valid id list (or a source-generator/analyzer) so wrong names are a compile error.

### TR-010 — DataTable ships gratuitous chrome by default: `ShowToolbar`/`ShowPagination` default `true` and pagination never auto-hides when rows ≤ page size
- **Severity:** major (owner-visible on every grid — flagged on BOTH UAT rounds, 2026-07-14 and 2026-07-15)
- **Repro:** `<DataTable TData="X" Data="@List">` with 1–10 rows.
- **Expected:** a bare DataTable renders just the table; a search toolbar is opt-in; pagination renders only when `Data.Count > PageSize`.
- **Actual:** every instance renders a "Search..." box + Columns button + a full pagination bar ("Showing 1-1 of 1 / Rows per page / Page 1 of 1 / « ‹ › »") even for a single row. Consumers must remember `ShowToolbar="false"` + a conditional `ShowPagination` on every one of ~40 instances; any missed instance is a UAT finding.
- **Encountered in:** UAT-2 (REQ-UI-009/011/012/013, REQ-FN-032 — Index Kundali List, /Astrology/Charts, Predictions, Life Events, Solutions, Places, all Astro Sutras lists).
- **Workaround:** app-wide sweep setting `ShowToolbar="false"` and `ShowPagination="@(List?.Count > PageSize)"`.
- **Suggested fix:** default `ShowToolbar` to `false` (or split search out of the toolbar), and auto-suppress the pagination bar when the row count fits one page.
- **✅ FIXED library-side 2026-07-21 (REQ-UI-016, ships in 2.0.0).** `ShowToolbar` now defaults to `false` — the toolbar is opt-in via `ShowToolbar="true"`. `ShowPagination` still defaults `true` but the bar now renders only when `TotalItems > PageSize` (new `ShouldShowPagination()` guard, replacing the old `objProcessedData.Any()`); set `ShowPagination="false"` to suppress it unconditionally. Verified: a 3-row grid @PageSize 5 renders 0 search boxes and no pagination chrome; 12 rows @PageSize 5 still shows "Page 1 of 3". **Your app-side sweep stays correct and needs no change** — `ShowToolbar="false"` is now redundant-but-harmless, and `ShowPagination="@(List?.Count > PageSize)"` simply agrees with the new built-in guard. ⚠ Note the default flip is a **behavioural breaking change** for any consumer that relied on the toolbar appearing implicitly.

### TR-011 — Dialog/DialogContent can render vertically off-viewport (negative `top`), overlapping the app's fixed header
- **Severity:** major
- **Repro:** `<Dialog Modal="true" @bind-Open>...<DialogContent>` with content taller than ~60% of the viewport (ManagePlace add/edit form, 14 fields).
- **Expected:** the dialog is clamped inside the viewport (centered, internal scroll if taller than the viewport), never under the app top-bar.
- **Actual:** measured `getBoundingClientRect().top = -142px` on open at 1280×720 — the DialogHeader is pushed above the viewport so the popup appears headerless and "merged with the top menu" (owner words, UAT-2 6B, AddPlace.png).
- **Encountered in:** REQ-FN-032 / REQ-UI-023 (`/Admin/Places` ManagePlace dialog).
- **Workaround:** component-local corrective style (max-height + overflow-y auto on DialogContent, top clamp).
- **⚠ UAT-3 2026-07-16 — workaround INEFFECTIVE, reconfirmed live across the whole dialog family.** The `style="max-height:90vh; overflow-y:auto"` already applied to `DialogContent` in ManagePlace.razor:8 / ManagePredict.razor:3 does NOT clamp the box — TrBlazeUI's own `DialogContent` positioning (`position:fixed; top:50%; translateY(-50%)`) still pushes the top of any tall dialog above `y=0`. Measured header/first-control `top` at 1366×720: ManagePlace Country `<select>` **-25px**; ManagePredict "Edit Prediction Details" header **-39px**; GenUpay "Add New Upaaye Details" **-131px**; "Select General Upay List" (From Library) **-263px**. The clipped region sits **behind the app's fixed top-menu**, so the header and the top form controls (e.g. the Country/State dropdowns) are invisible AND unclickable — the user reads the dialog as "no header, dropdowns/buttons don't work" even though binding + Save are wired correctly (proven: selecting a country then Save advances past the country validation to the lat/long validation). Clipping scales with viewport height (worse on shorter windows). **A real fix must clamp DialogContent to the viewport (e.g. `top:0; transform:none; max-height:100vh; overflow:auto` or flex-center within a full-height backdrop) at the library level** — component-local overrides are being defeated by the library's inline positioning.
- **Suggested fix:** clamp DialogContent to `max-height: calc(100vh - 2*gutter)` with internal scrolling and center within the visual viewport.
- **Resolution (2026-07-16) — fixed at the app level, no library edit. LIVE-VERIFIED.** `DialogContent`/`AlertDialogContent` render the shadcn/Tailwind class string `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]`. A **live DOM probe** (Playwright, /Admin/Places Add dialog) showed the vertical push comes from the **`transform` property**: computed `transform: matrix(1,0,0,1,-256,-248)` (i.e. `translate-x/y-[-50%]` compile to `transform: translate(var(--tw-translate-x), var(--tw-translate-y))`), NOT the standalone `translate` property. ⚠ A first pass overrode the `translate` property and the dialog **stayed clipped at `top=-232px`** — the override did nothing because the library uses `transform`. The working clamp overrides **`transform`** (and neutralises `translate`) in the app's linked override sheet `src/AstroBlazeWeb/wwwroot/css/trblazeui-theme.css` (loaded after `trblazeui.css`; cache-buster in `App.razor` — since 2026-07-17 the `?v=` token is derived from the newest `wwwroot/css/*.css` mtime, replacing the date-only `?v=20260716` token whose same-day collisions made this already-fixed clamp still look clipped to the owner across UAT-3c). An external `!important` rule beats the library's non-important utility classes:
  ```css
  [class~="left-[50%]"][class~="top-[50%]"] {
    top: 1rem !important;                        /* never above the viewport top */
    transform: translateX(-50%) !important;      /* center horizontally, cancel the library's -50% Y transform */
    translate: none !important;                  /* neutralise the standalone `translate` property */
    max-height: calc(100vh - 2rem) !important;   /* fit within the visual viewport */
    overflow-y: auto !important;                 /* scroll internally when taller */
  }
  ```
  **Live-verified 2026-07-16** (desktop 1440×900 + mobile 390): ManagePlace Add dialog and a tall ShowKundali dialog both measure `getBoundingClientRect().top = 16px` (was -46/-232), header + top controls fully visible, no horizontal overflow at 390px.
- **✅ FIXED library-side 2026-07-21 (REQ-UI-016, ships in 2.0.0).** `DialogContent` and `AlertDialogContent` now carry `max-h-[calc(100vh-2rem)] overflow-y-auto`. Because the box is centered with a −50% Y offset, a height capped at `viewport − 2rem` **cannot** place the top above `y=0` — so the fix clamps *height* instead of fighting the centering property, and is therefore immune to the `transform`-vs-`translate` distinction that made your app-side override version-fragile. Measured after the fix: `top = 16px` at 1366×720, 1280×600 **and** 390×844 (was −245px / −305px), header visible at 41px, internal scroll when taller. Sheet/Drawer (`inset-y-0`) deliberately untouched.
  **Action for AstroLyfe on upgrade:** your `[class~="left-[50%]"][class~="top-[50%]"]` override in `trblazeui-theme.css` can be **removed**. If you keep it, it remains compatible (it top-anchors at 1rem rather than centering) — but the `transform`-property concern raised above is now moot either way.

  The `[class~="left-[50%]"][class~="top-[50%]"]` selector matches ONLY the centered Dialog/AlertDialog content (both tokens present); Sheet/Drawer content carry `role="dialog"` too but position with `inset-y-0` and lack these tokens, so they are deliberately untouched. The dialog is now top-anchored at 1rem (top always ≥ 0) with internal scroll when taller than the viewport. Component-local `max-height:90vh;overflow-y:auto` on `ManagePlace.razor`/`ManagePredict.razor` retained as harmless defense-in-depth.

### TR-012 — Select dropdown items render illegibly (transparent background, mid-grey text) when open — white-on-white panel
- **Severity:** major (follow-on to TR-001/TR-002)
- **Repro:** `<Select>` + `<SelectContent><SelectItem .../></SelectContent>` opened inside a Card/EditForm (ManagePredict House/Bhav dropdown, ShowKundali-Predictions-2.png).
- **Expected:** the open listbox paints an opaque panel with legible item text in both themes.
- **Actual:** computed style of the open items: `color: rgb(97,97,97)`, `background-color: rgba(0,0,0,0)` — items float transparent over whatever is behind them and read as blank white rows.
- **Encountered in:** UAT-2 (REQ-UI-011 ManagePredict; REQ-FN-032 ManagePlace direction/timezone dropdowns).
- **Workaround:** replaced affected `<Select>`s with native `<select>` elements carrying the same classes (same conversion as the earlier CalcRule TR-001/002 workaround).
- **Suggested fix:** ship opaque `--popover`-token-backed styles on SelectContent and stop depending on host-defined tokens being present.
- **✅ FIXED library-side 2026-07-21 (REQ-UI-016, ships in 2.0.0).** `trblazeui.css` now ships default definitions for the core design tokens (`--popover`, `--popover-foreground`, `--background`, `--foreground`, `--border`, `--muted`, `--accent`, … light + `.dark`), declared inside `@layer base` and wrapped in `:where()` so they carry **zero specificity** — any host declaration, layered or not, still wins. Verified both directions: with every non-library stylesheet disabled the open listbox measures `background-color: oklch(1 0 0)` with `oklch(0.205 0 0)` text (was `rgba(0,0,0,0)`); with a themed host present the host's values still resolve (`--popover` = its own light/dark values, not the fallback). **Action for AstroLyfe:** the `<Select>` → native `<select>` conversions can be reverted on upgrade if you want the styled control back.

### TR-014 — DialogContent applies the −50% centering offset TWICE (`transform` AND `translate`), so tall dialogs still render above the viewport
- **Severity:** major (NEW 2026-07-22 — found while verifying the 2.0.0 upgrade; makes the TR-011 fix incomplete)
- **Repro:** open any `<Dialog>` whose content is taller than half the viewport — e.g. `/Admin/Places` → "Add New Place" at 1280×720 — on TrBlazeUI **2.0.0** with no app-side dialog CSS.
- **Expected:** the dialog is vertically centered; `getBoundingClientRect().top >= 0`.
- **Actual:** `rect.top = -136px` — the header sits above the viewport, behind the app's fixed top menu (the exact TR-011 symptom). Settled computed style on the `[role=dialog]` element (`animationName: none`, stable — not an in-flight enter animation):
  ```
  position : fixed
  top      : 360px                            /* = 50% of 720 */
  transform: matrix(1, 0, 0, 1, -256, -248)   /* == translate(-50%,-50%)  — offset #1 */
  translate: -50% -50%                         /* == translate(-50%,-50%)  — offset #2 */
  maxHeight: 648px                            /* the 2.0.0 max-h-[calc(100vh-2rem)] fix */
  height   : 496px
  ```
  **Both the `transform` and the `translate` property independently carry a −50%/−50% offset, and they stack**, so the box shifts by its **full height** rather than half: `360 − 496 = −136`.
- **Proof it is a library defect, not consumer CSS (this was checked explicitly, because AstroLyfe ships its own theme sheets):**
  - **Isolation:** with **all 7 AstroLyfe stylesheets disabled at runtime — only `_content/TrBlazeUI.Components/trblazeui.css` active** — the dialog still measures `rect.top = -136` (`animationName: none`, stable across a 2s re-measure). Zero consumer CSS is involved.
  - **Rule origin:** walking every matched CSSRule on the element, the *only* rules touching these properties are the library's own `.translate-x-\[-50%\]` / `.translate-y-\[-50%\]` (which set the **`translate` property**). No consumer rule and no inline style contributes a transform/translate.
  - **Independent-offset toggle (library-only, settled):** setting `translate: none` alone → `top = 112` (perfectly centered); setting `transform: none` alone → `top = 112` (perfectly centered). Each property carries exactly one −50%; killing *either* fixes it; leaving both is the bug.
- **⚠ Correction to an earlier draft of this note:** a first write-up said the `transform` −50% "compiles from the `translate-x/y-[-50%]` utilities." That is **wrong** — in Tailwind v4 those utilities emit the standalone **`translate`** property (verified in the shipped `trblazeui.css`: `.translate-x-\[-50%\]{--tw-translate-x:-50%;translate:var(--tw-translate-x)var(--tw-translate-y)}`). The **second** −50%, carried by the `transform` property, originates elsewhere in the library's own DialogContent styling (its shadcn centering / enter-animation path), not from those utilities. Net effect is unchanged — two −50% offsets — but the attribution is now correct.
- **Why the 2.0.0 TR-011 fix does not cover this:** capping the height at `100vh - 2rem` only guarantees `top >= 0` if the shift is a *single* −50%. With the doubled shift the effective top is `50%vh − height`, which goes negative for **any** dialog taller than half the viewport — 496 > 360 here, and the dialog is well within the 648px cap, so the clamp never engages.
- **Encountered in:** REQ-UI-023 / REQ-FN-032 (`/Admin/Places` ManagePlace dialog), immediately after upgrading 1.0.6 → 2.0.0 and removing the app-side TR-011 override.
- **Workaround (applied app-side):** neutralise one of the two offsets, leaving the other to center the dialog correctly:
  ```css
  [class~="left-[50%]"][class~="top-[50%]"] { translate: none !important; }
  ```
  Verified after this one line: `rect.top = 112px`, exactly centered for a 496px box in a 720px viewport.
- **Suggested fix:** apply the centering offset **once** — either via the `translate` property (the `.translate-x/y-[-50%]` utilities) or via `transform` in the DialogContent component styling, but not both. The `max-h-[calc(100vh-2rem)]` cap should stay, but it is not sufficient on its own; the double-offset is the actual cause of the clipping.
- **⚠ COULD NOT REPRODUCE on current library source 2026-07-22 (REQ-UI-016 held `Verified`; re-checked under `*fix-issues`).** Booted the demo (Release build 0/0) and probed the settled `[role=dialog]` (headless Chromium, waited to `animationName:none`) on the deliberately over-tall dialog at `/verify-ui016`. At 1280×720 the box measures `transform: none` + a **single** `translate: -50% -50%`, `maxHeight: 688px`, `top: +16px` — fully on-screen, header visible — **not** the doubled `transform`+`translate` offset the report measured. Confirmed at the CSS level too: the shipped `trblazeui.css` emits `.translate-x/y-[-50%]` as the standalone **`translate`** property (`translate:var(--tw-translate-x)var(--tw-translate-y)`) and contains **zero** `transform:translate(…)` rules, so no second −50% offset exists in this build. The REQ-UI-016 height-cap + single offset already guarantees `top ≥ 16` at every viewport height (reconfirmed 21/21 at 1366×720, 1280×600, 390×844). No library code changed for TR-014.
- **❓ Owner question (now moot for the fix, still nice to know):** this report is filed against a *published* "TrBlazeUI 2.0.0", but per the library's PROJECT-STATUS the 2.0.0 packages were staged, not yet published. The doubled offset with a `transform`-carried `matrix(1,0,0,1,-256,-248)` cannot originate from the current library CSS, so it points to a different/older build or a host stylesheet contributing a `transform`-based translate. Knowing the exact build would confirm the root cause, but the fix below makes it irrelevant.
- **✅ FIXED library-side 2026-07-22 (REQ-UI-016, ships in 2.0.1) — defensively hardened.** Rather than rely on the height-cap absorbing a single −50% offset, `DialogContent` and `AlertDialogContent` now **center with auto margins instead of translate/transform**: the class string changed from `fixed left-[50%] top-[50%] … translate-x/y-[-50%]` to `fixed inset-0 z-50 m-auto grid h-fit w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto`. Because auto margins are never negative, the dialog top can never sit above `y=0` **no matter how many stray `transform`/`translate` −50% offsets stack** (a host sheet, a future refactor, anything) — the whole TR-014 class of clipping is structurally impossible now, not just absorbed. The slide-in/out animations (which were built around the old −50% translate base) were dropped in favour of zoom+fade; `Sheet`/`Drawer` (`inset-y-0`) are untouched. Verified on `/verify-ui016` (`tests/verify/ui-ui016.spec.js`, Release 0/0): the settled tall dialog measures `transform: none` **and** `translate: none`, `top = 16px` at 1366×720, 1280×600 and 390×844; AlertDialog centers on-screen (`top=269`, no offset). **Action for AstroLyfe:** on upgrade to 2.0.1 you can drop the one-line `[class~="left-[50%]"][class~="top-[50%]"] { translate: none !important; }` override entirely — that selector no longer matches (the library dropped the `left-[50%]`/`top-[50%]` tokens), and the dialog is correctly centered with no app-side CSS.

### TR-005 — FeatherIcon renders `role="img"` SVGs with no accessible text (axe `svg-img-alt`, serious)
- **Severity:** minor
- **Repro:** `<FeatherIcon Name="calendar" Size="16" />` (package `trblazeui.icons.feather`).
- **Expected:** decorative icons should render `aria-hidden="true"` (no `role="img"`); informative icons should accept an accessible-name parameter (`Title`/`AriaLabel`).
- **Actual:** the SVG is emitted with `role="img"` and no `<title>`/`aria-label`, so axe flags `svg-img-alt` (serious) on every icon (4+ nodes on `/Index`).
- **Encountered in:** REQ-NFR-005 (`/Index`, TopMenu icons).
- **Workaround:** none applied.
- **Suggested fix:** default to `aria-hidden="true"` and drop `role="img"` unless an accessible name is supplied; add an optional `AriaLabel` parameter that emits `role="img"` + `aria-label` together.

<!-- TR-013 (retracted 2026-07-16): an earlier pass logged "<Input Type=InputType.Time> ignores
     post-render values". That was a MISDIAGNOSIS — the TrBlazeUI Time input is fine. The birth-time
     prefill blanked because the app's `TimeOBirthStr` getter used `ToString("HH:mm")` under the host
     culture, whose time separator is "." -> it emitted "11.45", which any <input type=time> rejects.
     Fixed app-side with InvariantCulture (NatalPage/HoraryPage.razor.cs). No library defect. -->
