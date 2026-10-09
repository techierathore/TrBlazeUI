# TrBlazeUI — Checklist

> Migrated from `docs/TrBlazeUI-Update-plan.md` and `docs/toolbarplan.md` on 2026-06-30. Phase structure, completion %, and status remarks carried over verbatim — verify before building. Both source plans were fully delivered, so nearly every REQ is `Done (pre-existing)`; build agents must NOT rebuild these.

## Table of Contents

1. [Goal](#goal)
2. [Requirements Status](#requirements-status)
3. [UI / Pages](#ui--pages)
4. [Functional requirements](#functional-requirements)
5. [Non-functional](#non-functional)

## Goal

Deliver and maintain TrBlazeUI — a .NET 10 Blazor UI component library (16 headless primitives, ~69 styled components, 3 icon packages, theming, demos, packaging, AI skills) — as defined in `docs/TrBlazeUI-BRD.md`. This single checklist is the whole product's work list; UI/component requirements (`REQ-UI-*`), functional/infrastructure requirements (`REQ-FN-*`), and non-functional requirements (`REQ-NFR-*`) live together, distinguished only by prefix. There are no RAG requirements (no AI runtime in the library). Most requirements are already delivered (migrated from two completed plans); the open work is a clean Release build and full XML-doc coverage.

## Requirements Status

| ID | Requirement | Status | % | Remarks | Details |
|----|-------------|--------|---|---------|---------|
| REQ-UI-001 | Headless primitives (16) | Verified | 100% | 2026-10-02 verify: PASS — test `Rows the fix cycle touched REQ-UI-001 TR-036 leaving a page ` |\| Open`, and the styled wrapper hard-codes `ForceMount="true"` (`Components/Collapsible/CollapsibleContent.razor:3`) to drive the `grid-rows-[0fr]→[1fr]` height animation; `overflow:hidden` clips the paint but never the layout. The primitive's own XML doc (`CollapsibleContent.razor.cs:23,29-33`) claims "conditional rendering via display:none" — that claim is false of the current markup on both layers. Kind: layout. Docs-only triage; no code changed → route to *fix-issues. [REQ-UI-019] | [view](#d-req-ui-001) |
| REQ-UI-002 | Form components (~28) | Verified | 100% | 2026-10-02 verify: PASS — test `Rows the fix cycle touched REQ-UI-002 NativeSelect and the f` | [view](#d-req-ui-002) |
| REQ-UI-003 | Layout & navigation components | Verified | 100% | 2026-10-02 verify: PASS — test `Rows the fix cycle touched REQ-UI-003 the shell composes and` | [view](#d-req-ui-003) |
| REQ-UI-004 | Overlay & feedback components + reactive portal | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-004 ran ⚠ UAT bug 2026-08-31 (TfLens TR-014 + TR-019) — flagged, and FIXED + RE-VERIFIED the same day under [REQ-UI-019]** (`ui-tflens` 44/44, `ui-ui016` 23/23 regression green): **TR-014 (reproduced live, blocker for… | [view](#d-req-ui-004) |
| REQ-UI-005 | Data & content components (DataTable, Markdown/RichText editors) | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-UI-005 the Data` | [view](#d-req-ui-005) |
| REQ-UI-006 | Display components | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-UI-006 a Steppe` | [view](#d-req-ui-006) |
| REQ-UI-007 | Toolbar component family | Done (pre-existing) | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-007 ran | [view](#d-req-ui-007) |
| REQ-UI-008 | Charts (6 types) | Verified | 100% | 2026-10-02 verify: PASS — test `Rows the fix cycle touched REQ-UI-008 each chart type still ` | [view](#d-req-ui-008) |
| REQ-UI-009 | Icon libraries (Lucide/Heroicons/Feather) | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-009 ran ⚠ UAT bug 2026-08-31 (TfLens TR-008, root cause confirmed empirically):** `LucideIcon` does not resolve any pre-rename Lucide name — `check-circle`, `check-circle-2`, `alert-circle`, `alert-triangle`, `x-circle`, `help-circle`, `circle-help` all render nothing (a… | [view](#d-req-ui-009) |
| REQ-UI-010 | Theming & dark mode | Done (pre-existing) | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-010 ran | [view](#d-req-ui-010) |
| REQ-UI-011 | Demo apps (Server/WASM/Auto) + layout toggle | Done (pre-existing) | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-011 ran | [view](#d-req-ui-011) |
| REQ-UI-012 | Universal `CaptureUnmatchedValues` attribute splatting | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-012 ran | [view](#d-req-ui-012) |
| REQ-UI-013 | `ButtonIcon`/`AlertIcon` wrappers (RZ10012-free) | Done (pre-existing) | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-013 ran | [view](#d-req-ui-013) |
| REQ-UI-014 | AstroLyfe consumer-feedback fixes (TR-001…TR-009) incl. Grid/GridItem | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-014 ran ⚠ UAT bug — TR-003 CONFIRMED still broken LIVE (AstroLyfe upgraded 1.0.6→2.0.0 on 2026-07-22 and re-verified the whole file against the running app: 8 of 9 of TR-001…TR-009 confirmed fixed,… | [view](#d-req-ui-014) |
| REQ-UI-015 | TrStudio consumer-feedback fixes (TR-001…TR-011) incl. Mac Catalyst packaging blocker | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-015 ran | [view](#d-req-ui-015) |
| REQ-UI-016 | AstroLyfe UAT-2/UAT-3 feedback (TR-010…TR-012): DataTable default chrome, Dialog vertical clamp, Select popover-token dependency | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-016 ran | [view](#d-req-ui-016) |
| REQ-UI-017 | TechieBlog consumer-feedback fixes (TR-001…TR-065): catalog-wide attribute splatting, accessibility corrections, Blazor Server text entry, full utility layer, contrast-validated tokens, 12 new components | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-UI-017 Sortable` | [view](#d-req-ui-017) |
| REQ-UI-018 | Resolve TechieBlog post-2.0.2 feedback (TR-068…TR-074 and related sub-findings) | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-018 ran | [view](#d-req-ui-018) |
| REQ-UI-019 | TfLens consumer-feedback fixes (TR-001…TR-027) | Verified | 100% | 2026-10-02 verify: not verified — no test named REQ-UI-019 ran | [view](#d-req-ui-019) |
| REQ-FN-001 | .NET 8 → .NET 10 upgrade (all 10 projects) | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-001 every project targets net` | [view](#d-req-fn-001) |
| REQ-FN-002 | Coding-standards enforcement (obj fields, file-scoped ns, ConfigureAwait) | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-002 the coding standards hold` | [view](#d-req-fn-002) |
| REQ-FN-003 | XML documentation on public members | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-003 public members carry XML ` | [view](#d-req-fn-003) |
| REQ-FN-004 | GitHub Packages CI/CD (publish-github-packages.yml + build.yml) | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-004 a published release puts ` | [view](#d-req-fn-004) |
| REQ-FN-005 | Shared versioning from the release tag + Directory.Build.props metadata | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-005 one shared version from t` | [view](#d-req-fn-005) |
| REQ-FN-006 | AI component reference document | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-FN-006 every sc` | [view](#d-req-fn-006) |
| REQ-FN-007 | Claude Code skill (`/trblazeui`) | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-007 the Claude Code skill shi` | [view](#d-req-fn-007) |
| REQ-FN-008 | OpenCode skill (`trblazeui`) | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-008 the OpenCode agent mirror` | [view](#d-req-fn-008) |
| REQ-FN-009 | Clear NU1902 vulnerable-transitive-dependency build failure (AngleSharp via HtmlSanitizer) | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-009 the Release build carries` | [view](#d-req-fn-009) |
| REQ-FN-010 | Package and deploy a native Codex `trblazeui` custom agent | Verified | 100% | 2026-10-02 verify: PASS — test `Functional requirements REQ-FN-010 the Codex agent definitio` | [view](#d-req-fn-010) |
| REQ-NFR-001 | WCAG 2.1 AA accessibility baseline | Verified | 100% | 2026-10-02 verify: PASS — test `Non-functional requirements REQ-NFR-001 interactive componen` | [view](#d-req-nfr-001) |
| REQ-NFR-002 | Zero-config pre-built CSS | Verified | 100% | 2026-10-02 verify: PASS — test `Non-functional requirements REQ-NFR-002 the pre-built styles` | [view](#d-req-nfr-002) |
| REQ-NFR-003 | RichTextEditor HTML sanitization | Verified | 100% | 2026-10-02 verify: PASS — test `Non-functional requirements REQ-NFR-003 rich-text HTML is sa` | [view](#d-req-nfr-003) |
| REQ-NFR-004 | Render-mode parity (Server/WASM/Auto) | Verified | 100% | 2026-10-02 verify: PASS — test `Non-functional requirements REQ-NFR-004 Server, WASM and Aut` | [view](#d-req-nfr-004) |
| REQ-NFR-005 | Clean Release build (0 warnings / 0 errors, warnings-as-errors) | Verified | 100% | 2026-10-02 verify: PASS — test `Non-functional requirements REQ-NFR-005 the Release build is` | [view](#d-req-nfr-005) |
| REQ-UI-020 | TfLens post-2.1.0 consumer-feedback fixes (TR-028…TR-035) | Verified | 100% | 2026-10-02 verify: PASS — test `REQ-UI-020 — TfLens post-2.1.0 consumer-feedback fixes (TR-0` | [d](#d-req-ui-020) |
| REQ-UI-021 | Chatur consumer-feedback fixes (TR-001…TR-004): ScrollArea StickToEnd, TreeView, DiffView, ToggleGroup | Verified | 100% | 2026-10-02 verify: PASS — test `REQ-UI-021 — Chatur consumer-feedback fixes (TR-001…TR-004) ` | [d](#d-req-ui-021) |
| REQ-UI-022 | Editable code area and an open-file tab strip (CodeEditor, EditorTabs) | Verified | 100% | 2026-10-07 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-UI-022 CodeEdit` | [d](#d-req-ui-022) |
| REQ-UI-023 | Inline indicator for work under way with no known end (Typing, Progress.Indeterminate) | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-UI-023 Typing s` | [d](#d-req-ui-023) |
| REQ-UI-024 | Panel for the output of a running command (LogView) | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-UI-024 LogView ` | [d](#d-req-ui-024) |
| REQ-UI-025 | List that drives a detail pane (NavList) | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 2 — consumer-feedback fixes REQ-UI-025 NavList ` | [d](#d-req-ui-025) |
| REQ-UI-026 | DataTable rows, header row and choose-all control take attributes (Chatur TR-011) | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 3 — consumer-feedback fixes (TR-011…TR-013) REQ` | [d](#d-req-ui-026) |
| REQ-UI-027 | ToggleGroup chosen item takes another look through OnVariant (Chatur TR-012) | Verified | 100% | 2026-10-02 verify: PASS — test `Chatur batch 3 — consumer-feedback fixes (TR-011…TR-013) REQ` | [d](#d-req-ui-027) |
| REQ-UI-028 | No control reports an unhandled error when its page stops answering during dispose | Verified | 100% | 2026-10-02 verify: PASS — test `REQ-UI-028 — dispose on a page that has stopped answering RE` | [d](#d-req-ui-028) |
| REQ-UI-029 | Switch that is off can draw a visible border through Outlined (Chatur TR-014) | Verified | 100% | 2026-10-03 verify: PASS — test `REQ-UI-029 — Switch Outlined (Chatur TR-014) REQ-UI-029 an O` | [d](#d-req-ui-029) |
| REQ-UI-030 | Each tab in EditorTabs can carry its own attributes through TabAttributes (Chatur TR-015) | Verified | 100% | 2026-10-07 verify: PASS — test `Chatur batch 5 — consumer-feedback fixes (TR-015…TR-017) REQ` | [d](#d-req-ui-030) |
| REQ-UI-031 | A Stepper step can show an icon in its marker through Icon (Chatur TR-016) | Verified | 100% | 2026-10-07 verify: PASS — test `Chatur batch 5 — consumer-feedback fixes (TR-015…TR-017) REQ` | [d](#d-req-ui-031) |
| REQ-UI-032 | Badge has a soft red Danger variant, and a text colour in Class replaces the variant's (Chatur TR-017) | Verified | 100% | 2026-10-07 verify: PASS — test `Chatur batch 5 — consumer-feedback fixes (TR-015…TR-017) REQ` | [d](#d-req-ui-032) |
| REQ-UI-033 | EditorTabs close mark can be drawn by the consumer through CloseContent (Chatur TR-018) | Verified | 100% | 2026-10-07 verify: PASS — test `Chatur batch 6 — consumer-feedback fix (TR-018) REQ-UI-033 C` | [d](#d-req-ui-033) |
| REQ-UI-034 | AlertDialogAction and AlertDialogCancel take an OnClick that runs before the dialog closes (Sevak TR-044) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak — consumer-feedback fixes (TR-044, TR-043, TR-023) REQ` | [d](#d-req-ui-034) |
| REQ-UI-035 | An empty toast viewport lets clicks through to the page beneath it (Sevak TR-043) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak — consumer-feedback fixes (TR-044, TR-043, TR-023) REQ` | [d](#d-req-ui-035) |
| REQ-UI-036 | ToastVariant gains Success, Info and Warning with matching ToastService methods (Sevak TR-023) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak — consumer-feedback fixes (TR-044, TR-043, TR-023) REQ` | [d](#d-req-ui-036) |
| REQ-UI-037 | NumericInput and Slider emit valid, invariant ARIA range attributes (Sevak TR-033, TR-034) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak feedback — builder B (TR-033, TR-034, TR-039, TR-026, ` | [d](#d-req-ui-037) |
| REQ-UI-038 | NumberInput fails the build with a message naming NumericInput (Sevak TR-039) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak feedback — builder B (TR-033, TR-034, TR-039, TR-026, ` | [d](#d-req-ui-038) |
| REQ-UI-039 | Textarea takes Rows and MaxRows and grows with its content up to the cap (Sevak TR-026) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak feedback — builder B (TR-033, TR-034, TR-039, TR-026, ` | [d](#d-req-ui-039) |
| REQ-UI-040 | Table family for a plain markup table: Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption (Sevak TR-028) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak feedback — table family, heading levels, chart attribu` | [d](#d-req-ui-040) |
| REQ-UI-041 | CardTitle and AlertTitle take an As heading level (Sevak TR-008) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak feedback — table family, heading levels, chart attribu` | [d](#d-req-ui-041) |
| REQ-UI-042 | Select shows its placeholder when the bound value matches no item (Sevak TR-024) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak feedback — builder B (TR-033, TR-034, TR-039, TR-026, ` | [d](#d-req-ui-042) |
| REQ-UI-043 | The six chart components take unmatched attributes like every other component (Sevak TR-044 census) | Verified | 100% | 2026-10-07 verify: PASS — test `Sevak feedback — table family, heading levels, chart attribu`; no code change: the charts already splat through `ChartBase`, the per-file census that logged this row missed the base class (Sevak's 136-component count was 1.0.7) [REQ-UI-043] | [d](#d-req-ui-043) |
| REQ-FN-011 | HtmlSanitizer on a stable 9.1.x release with no vulnerable AngleSharp (Sevak TR-037) | Verified | 100% | 2026-10-07 verify: PASS — test `Functional requirements REQ-FN-011 HtmlSanitizer is a stable` | [d](#d-req-fn-011) |
| REQ-UI-044 | A Select inside a Dialog never freezes the page: a portal or positioning failure is logged and the list falls back, never thrown into the circuit (Sevak TR-041) | Verified | 100% | 2026-10-08 verify: PASS — test `Sevak feedback — a Select inside a Dialog never freezes the ` | [d](#d-req-ui-044) |
| REQ-UI-045 | Chat family: ChatThread, ChatMessage and ChatComposer for a message thread with a composer (Sevak TR-006) | Verified | 100% | 2026-10-08 verify: PASS — test `Sevak feedback — chat family (TR-006) REQ-UI-045 messages al` | [d](#d-req-ui-045) |
| REQ-UI-046 | DataTableColumn hides itself below a screen width through HideBelow (Chatur TR-019) | Verified | 100% | 2026-10-09 verify: PASS — test `Chatur TR-019 — a DataTable column hidden below a screen wid` | [d](#d-req-ui-046) |

**Status values:** `Not Started` · `In Progress` · `Implemented` · `Verified` · `Done (pre-existing)` (migrated as already complete — do NOT rebuild) · `Needs re-verify` · `PARTIAL` · `FAIL` · `Blocked` · `N/A`.

**% guide:** `0` not started · `25` scaffolded · `50` in progress · `75` implemented-unverified · `100` verified.

## UI / Pages

<!-- Component-library "pages" = demo pages under demos/TrBlazeUI.Demo.Shared/Pages. UI REQs map to component families, not mockups (this library predates the mockup flow). -->

<a id="d-req-ui-001"></a>
- **REQ-UI-001** — 16 headless primitives (Accordion, Checkbox, Collapsible, Dialog, DropdownMenu, Floating, HoverCard, Label, Popover, RadioGroup, Select, Sheet, Switch, Table, Tabs, Tooltip), each accessible and unstyled. *Demo:* `/primitives`.
  - *Acceptance:* every primitive demo renders; keyboard nav + ARIA work; services registered via `AddTrBlazeUIPrimitives()`.

<a id="d-req-ui-002"></a>
- **REQ-UI-002** — ~28 form components with two-way binding and validation compatibility. *Demo:* `/components/*`.
  - *Acceptance:* Button, Input, Textarea, Checkbox, Switch, RadioGroup, Toggle, Select, NativeSelect, Combobox, MultiSelect, Calendar, DatePicker, DateRangePicker, TimePicker, NumericInput, CurrencyInput, MaskedInput, InputOTP, InputGroup, Slider, RangeSlider, Rating, ColorPicker, FileUpload, Field, Label all render and bind.

<a id="d-req-ui-003"></a>
- **REQ-UI-003** — Layout & navigation: Sidebar (22 parts, collapsible, variants, mobile sheet, Ctrl/Cmd+B, persistence), Card, Resizable, ScrollArea, AspectRatio, Separator, Item, Breadcrumb, NavigationMenu, Menubar, Pagination, ResponsiveNav, Tabs.
  - *Acceptance:* shell composes; sidebar collapse persists; horizontal nav dropdowns don't clip (FloatingPortal fix). *(The Sidebar analyzer issue that previously blocked the Release build is resolved — see REQ-NFR-005.)*

<a id="d-req-ui-004"></a>
- **REQ-UI-004** — Overlay & feedback: Dialog, AlertDialog, Sheet, Drawer, Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu, Command, Alert, Toast — rendered via reactive PortalHost.
  - *Acceptance:* overlays open with focus trap; internal state changes re-render (portal RefreshPortal fix); ToastService shows success/error/warning/info.

<a id="d-req-ui-005"></a>
- **REQ-UI-005** — DataTable (sort/filter/paginate/select/toolbar), MarkdownEditor (Markdig), RichTextEditor (Quill + sanitized output).
  - *Acceptance:* DataTable demo sorts/paginates/selects; editors produce expected output.

<a id="d-req-ui-006"></a>
- **REQ-UI-006** — Display components: Avatar, Badge, Empty, Item, Kbd, Progress, Skeleton, Spinner, Typography.
  - *Acceptance:* render; `style`/`id`/`data-*` forwarded (attribute splatting).

<a id="d-req-ui-007"></a>
- **REQ-UI-007** — Toolbar family: Toolbar (Default/Compact/Dense, horizontal/vertical), ToolbarGroup, ToolbarButton, ToolbarToggleButton (`@bind-IsPressed`), ToolbarSeparator. *Demo:* `/components/toolbar`.
  - *Acceptance:* all toolbar-plan demo sections render; `role="toolbar"`/`aria-pressed` present; composes Button/DropdownMenu as children. Migrated from toolbarplan.md (16/16 tasks delivered).

<a id="d-req-ui-008"></a>
- **REQ-UI-008** — Charts: Area, Bar, Line, Pie, Radar, Radial via Blazor-ApexCharts, themed by `--chart-*`. *Demo:* `/charts/*`.
  - *Acceptance:* each chart type renders with theme colors.

<a id="d-req-ui-009"></a>
- **REQ-UI-009** — Icon components: `LucideIcon`, `HeroIcon` (4 variants), `FeatherIcon`. *Demo:* `/icons`.
  - *Acceptance:* icon browser renders; typed icon names resolve.

<a id="d-req-ui-010"></a>
- **REQ-UI-010** — Theming: shadcn/tweakcn CSS variables in `theme.css`; `.dark` class dark mode; OKLCH colors.
  - *Acceptance:* swapping theme variables restyles all components; dark mode toggles.

<a id="d-req-ui-011"></a>
- **REQ-UI-011** — Demo apps in Server (5183/7172), WASM (5184/7173), Auto (5185/7174) + horizontal/vertical layout toggle.
  - *Acceptance:* each host boots and shows identical component behavior; layout toggle works.

<a id="d-req-ui-012"></a>
- **REQ-UI-012** — `CaptureUnmatchedValues` attribute splatting on all components.
  - *Acceptance:* passing `id`/`style`/`@onkeydown` to any component does not throw `InvalidOperationException`.

<a id="d-req-ui-013"></a>
- **REQ-UI-013** — `ButtonIcon` / `AlertIcon` wrapper components (warning-free icon child content).
  - *Acceptance:* `<ButtonIcon>`/`<AlertIcon>` compile with no RZ10012; suppression removed from Directory.Build.props.

<a id="d-req-ui-014"></a>
- **REQ-UI-014** — Resolve all AstroLyfe consumer feedback (`docs/AstroLyfe-TrBlazeUI-Feedback.md`, TR-001…TR-009) in the library, not via app-side workarounds.
  - *Acceptance:* Tab/Shift+Tab leave a closed SelectTrigger (WCAG 2.1.2); Select popup renders and operates with **and without** a `PortalHost` in the layout (inline fallback + console warning); trigger has an accessible name at first render (`SelectValue` sync text + raw-value fallback + `id` for `aria-labelledby`); `DropdownMenuTrigger AsChild` slots a `Button` as the trigger with no nested buttons; icons are `aria-hidden` by default and expose `role="img"`+`aria-label` only when `AriaLabel` is set (Feather/Lucide/Heroicons); unknown icon names render an empty size-preserving placeholder (`data-trblazeui-missing-icon`) and log a one-time warning — never an alert-triangle; `.sr-only` in `trblazeui.css` has zero scroll footprint (no page horizontal overflow at 390px); `<Input Label="…">` renders an associated `<label>`; `Grid`/`GridItem` (12-col, `Xs/Sm/Md/Lg/Xl`, `Spacing`/`Gap`/`Columns`) ship with CSS + demo (`/components/grid`) + FluentUI migration note. *Verified 2026-07-02:* Release build 0/0; Playwright/Chromium runtime smoke across `/components/select`, `/components/dropdown-menu`, `/components/input`, `/components/grid`, `/components/datatable` (390px), `/icons/feather` — 18/18 PASS, including a dedicated no-PortalHost build of the demo.
  - **⚠ Re-opened 2026-07-22 (TR-003 only) — `Needs re-verify`.** AstroLyfe's live 2.0.0 re-verification, reproduced today on the demo, shows the "accessible name at first render" acceptance is **not** met: `SelectTrigger` renders `<button role="combobox">` with the value as inner text but no `aria-label`/`aria-labelledby`, and `combobox` is not a name-from-content role, so the accessible name is empty and axe `button-name` (critical) fires. *Revised acceptance to close:* the trigger exposes a non-empty accessible name at first render **via `aria-labelledby` → the `SelectValue` span id (and/or the surrounding `FieldLabel`) or an `AriaLabel` param** — rendering the value as inner text alone does not satisfy it. The other eight fixes (TR-001/002/004/005/006/007/008/009) remain confirmed fixed live in 2.0.0.
  - **✅ Closed 2026-07-22 (`*fix-issues`) → `Verified`.** Primitive `SelectTrigger` now emits a default `aria-labelledby` pointing at the already-rendered `SelectValue` span (`GetDefaultLabelledBy()` returns `objContext.ValueId`), so the `role="combobox"` trigger carries a non-empty accessible name from first render; it defers (returns null, attribute omitted) only when the author splats a **non-empty** `aria-label`/`aria-labelledby` — a null-valued forwarded key no longer counts, which was the first-cut bug caught live. Styled `SelectTrigger` adds an `AriaLabel` parameter (emits `aria-label`) for a descriptive purpose-name that overrides the value-derived default per ARIA precedence. *Verified 2026-07-22:* Release build **0/0**; headless-Chromium **8/8** on the new `/verify-ui014` harness (`tests/verify/ui-ui014.spec.js`) — axe **`button-name` = 0 violations** (@axe-core/playwright), accessible names present for valued ("Patreon") + placeholder-only ("Select a role") triggers, and `AriaLabel="Choose your role"` wins with no default `aria-labelledby`. Regression reconfirm: `tests/verify/ui-ui016.spec.js` **21/21**. Ledger `docs/.last-verify.json`.

<a id="d-req-ui-015"></a>
- **REQ-UI-015** — Resolve all TrStudio consumer feedback (`docs/TrStudio-TrBlazeUI-Feedback.md`, TR-001…TR-011) in the library, not via app-side workarounds.
  - *Acceptance:* `DataTable`, `Alert`, `Checkbox`, `Switch` splat unmatched attributes (`data-testid`/`data-*`/`id`) onto their rendered root without an `InvalidOperationException` (Badge/FieldError already did — TR-001/002/004/008); a controlled `Switch` (`CheckedChanged` bound but the bound `Checked` left unchanged by a gate/interceptor) does NOT flip `aria-checked`, while an uncontrolled `Switch` still toggles (TR-009); a `DataTable` on a ≤400px viewport keeps `document.documentElement.scrollWidth == clientWidth` (root `min-w-0`, footer wraps) with no control clipped (TR-010); `FileUpload.OnFilesSelected` exists as an alias of `FilesChanged` (TR-007); the AI reference compiles as written for the inline Button/Alert icon pattern (TR-003), the flat `Empty` API (TR-005), the composite `Pagination` API + namespace (TR-006), and `FileUpload` (TR-007); and every published nupkg (Components/Primitives/Icons.Lucide) carries **no** `<frameworkReferences>` block, so a MAUI Mac Catalyst consumer resolves them without NETSDK1082 (TR-011, `AddRazorSupportForMvc` removed). *Verified 2026-07-12:* Release build 0/0; `dotnet pack` + `unzip -p *.nuspec | grep -c frameworkReference == 0` on all three packages; headless-Chromium runtime verification (`tests/verify/ui-trstudio.spec.js` on `/verify-trstudio`) — 14/14 incl. §4a splat render-truth + table data, gated-vs-uncontrolled Switch, TR-010 scrollWidth==390, and §4b visual-truth at 1280px + 390px.

<a id="d-req-ui-016"></a>
- **REQ-UI-016** — Resolve the AstroLyfe UAT-2/UAT-3 consumer feedback (`docs/AstroLyfe-TrBlazeUI-Feedback.md`, TR-010…TR-012) in the library, not via app-side workarounds. Logged by triage 2026-07-21; **fixed + verified 2026-07-21**.
  - *Acceptance (TR-010 — DataTable default chrome):* a bare `<DataTable TData="X" Data="@List">` renders **just the table** — the search/Columns toolbar is opt-in (`ShowToolbar` defaults `false`, or search is split out of the toolbar), and the pagination bar auto-suppresses when the row count fits a single page (guard becomes row-count > `PageSize`, not merely `Any()`). Verified by: a ≤`PageSize` grid showing no "Rows per page"/"Page 1 of 1" chrome, and a >`PageSize` grid still paginating.
  - *Acceptance (TR-011 — Dialog vertical clamp):* `DialogContent`/`AlertDialogContent` are clamped inside the visual viewport at every viewport height — `getBoundingClientRect().top >= 0` and the title/header visible — for content taller than the viewport, with internal scrolling (`max-height: calc(100vh - 2×gutter)` + `overflow-y:auto`) rather than overflow in both directions. Must hold at 1366×720 and 1280×600 (currently −245px / −305px) and at 390px width. Sheet/Drawer (`inset-y-0`) must be left untouched. The fix must also be robust across the `transform` vs standalone-`translate` centering mechanisms, since consumers have shipped overrides against both.
  - *Acceptance (TR-012 — popover token dependency):* `SelectContent` (and the other `bg-popover` surfaces) paint an **opaque** panel with legible text even when the host application defines no `--popover`/`--popover-foreground` — e.g. the library ships sensible token fallbacks (`var(--popover, <light>)`) or default `:root` definitions in `trblazeui.css`. Verified by opening a Select with the host tokens stripped and asserting the listbox `background-color` is not `rgba(0,0,0,0)`.
  - *Not in scope:* TR-013 (retracted by the reporter 2026-07-16 — an AstroLyfe-side `ToString("HH:mm")` culture bug, no library defect).
  - *Verified 2026-07-21:* Release build 0/0; headless-Chromium **21/21** (`tests/verify/ui-ui016.spec.js` on `/verify-ui016`, harness `demos/TrBlazeUI.Demo.Shared/Pages/VerifyUi016.razor`). Changed: `DataTable.razor.cs` (`ShowToolbar` default → `false`, new `ShouldShowPagination()` guarding on `TotalItems > PageSize`), `DataTable.razor:177`, `Dialog/DialogContent.razor` + `AlertDialog/AlertDialogContent.razor` (`max-h-[calc(100vh-2rem)] overflow-y-auto`), `wwwroot/css/trblazeui-input.css` (zero-specificity `:where()` token fallbacks in `@layer base`) + regenerated `wwwroot/trblazeui.css`, plus demo/AI-reference doc updates for the new `ShowToolbar` default.
    - TR-010: bare 3-row grid → 0 search inputs, no pagination chrome; 12 rows @PageSize 5 → "Page 1 of 3"; `ShowToolbar="true"` → search box present.
    - TR-011: tall dialog `top=16px` at 1366×720, 1280×600 **and** 390×844 (was −245/−305), title at 41px, `max-height` 688/568px, `overflow-y:auto`, bottom inside the viewport. Clamping *height* rather than overriding `transform`/`translate` makes the fix mechanism-agnostic. Sheet/Drawer untouched (`inset-y-0`, different components).
    - TR-012: with every non-library stylesheet disabled the open listbox measures `background-color: oklch(1 0 0)`, item colour `oklch(0.205 0 0)`; with the demo theme enabled the host still wins (`--popover` = `oklch(1 0 0)` light, `oklch(0.2690 0 0)` dark) — the fallback is a floor, not a ceiling.
    - §4b visual truth: `scrollWidth − clientWidth = 0` at 1366 and 390, 0 console errors; `/components/datatable`, `/components/dialog`, `/components/select`, `/components/alert-dialog` re-swept with no regression.


<a id="d-req-ui-017"></a>
- **REQ-UI-017** — Resolve the TechieBlog consumer feedback (`docs/TechieBlog-TrBlazeUI-Feedback.md`, TR-001…TR-065) in the library, not via app-side workarounds. Logged and fixed 2026-08-11.
  - *Acceptance (splatting):* every public component type in both shipped assemblies declares `[Parameter(CaptureUnmatchedValues = true)]`, verified by reflection, and a `data-testid` on `Label`, `Typography*`, `Breadcrumb*`, `TabsList`, `Rating`, `Select*`, `Alert*` and `Item*` lands on the rendered element instead of throwing. Components with no element of their own accept the attributes without rendering them, and that exception list is published.
  - *Acceptance (Rating):* options are individually focusable with a roving `tabindex`, carry a literal `aria-checked="true"/"false"`, are operable with the arrow keys, and emit no duplicate `<linearGradient>` ids; a `ReadOnly` rating renders `role="img"` + `aria-label` with no radio semantics and no tab stop; `Focusable="false"` removes the tab stop for a decorative rating.
  - *Acceptance (Tabs):* exactly one trigger per group reports `aria-selected="true"`; `aria-controls` either names an element that exists or is absent; no `role="tab"` exists without a `role="tablist"` ancestor, including inside `MarkdownEditor`.
  - *Acceptance (text entry):* typing a 36-character string at 30 ms/char into a bound `Input` on an InteractiveServer circuit yields exactly that string in both the DOM and the bound value; the same for `Textarea` at 15 ms/char.
  - *Acceptance (Select):* a `Select` bound to a value whose `SelectItem` carries a human `Text` shows that text on first paint, before the popover has ever been opened.
  - *Acceptance (utilities):* `max-w-7xl`, `gap-6`, `min-w-3xl`, `top-1`, `w-36` and `lg:grid-cols-3` resolve to real computed values in a running page.
  - *Acceptance (tokens):* `tools/token-contrast.py` reports 0 failing pairings across every foreground/surface combination in both modes, with `--input` at or above 3:1.
  - *Acceptance (Prose):* a three-column table rendered through `<Prose>` at 390 px scrolls inside itself and leaves page horizontal overflow at 0 px.
  - *Acceptance:* every one of the 12 new components renders on its own demo page and meets the per-component acceptance lines above; `SortableList` shows each row's position, moves a row with its up/down buttons, and — with `AllowRemove` — takes a row out, each move and removal announced.
  - *Verified 2026-08-11:* Release build 0/0; headless-Chromium **65/65** (`tests/verify/ui-techieblog.spec.js` on `/verify-techieblog`, harness `demos/TrBlazeUI.Demo.Shared/Pages/VerifyTechieBlog.razor`); 103/103 demo routes clean; `ui-ui014` 8/8 and `ui-ui016` 23/23 unchanged; `tools/splat-audit` 344/344 + 59/59; `tools/token-contrast.py` 0 failures. Screenshots `test-results/techieblog-{1280,390}.png`.
  - *Acceptance (examples):* every new component has its own demo page, every fix has a demonstration on the demo page for the component it touches, and all of them are reachable from the sidebar, the command palette and the components index. *Verified 2026-08-11:* `tests/verify/ui-demo-2-1-0.spec.js` **15/15** on a running Blazor Server demo.
  - *Found while building the examples:* `Stepper` aria-current cascade and `CodeBlock` clipboard fallback — both fixed. **TR-066** (nested `Dialog` inside `DialogContent` never opens) — reproduced, characterised, confirmed pre-existing against the 2.0.1 source, and logged **open** in `docs/TechieBlog-TrBlazeUI-Feedback.md` rather than fixed; two candidate fixes were tried and reverted rather than shipped unproven.
  - *Not in scope (recorded as TechieBlog-side):* the `Tb` component-name prefix in their UIDesign spec and mockups, the Coding-Standards `_variables.css` conflict, the captcha (TR-015), and the `INewsletterService` progress observation.

<a id="d-req-ui-018"></a>
- **REQ-UI-018** — Resolve post-2.0.2 TechieBlog feedback not owned by the closed TR-001…TR-065 acceptance set.
  - *Acceptance:* a styled `Select` can initialize a one-way value without requiring a dummy callback; delayed/stale parent echoes cannot overwrite newer focused text; Rating keyboard movement keeps DOM focus, roving tabindex, and selection aligned; `ItemContent` safely shrinks at 390px; `StatTile` exposes stable value/label hooks; documented standard utility families include the reported min-height, opacity, responsive negative-margin, and gradient-stop cases (or documentation states exact exclusions); and `AnchorNav` preserves the current route when navigating to a fragment under a document `<base>`.
  - *Documentation note:* explain that newly introduced component namespaces require an `_Imports.razor` update; this is expected Razor behavior, not a standalone defect. If the utility-family promise or component API expands beyond the BRD, run `*amend-docs TrBlazeUI` before implementation.

<a id="d-req-ui-019"></a>
- **REQ-UI-019** — Resolve the TfLens consumer feedback in `docs/TfLens-TrBlazeUI-Feedback.md` that is still open against 2.1.0 source. Logged 2026-08-31 by `*triage-issues`; the stale entries (TR-002/003/013/020/023) are explicitly **out of scope — they need a publish, not a fix**.
  - *Acceptance (code):*
    - **TR-009** — with `ShowPagination="false"`, a `DataTable` renders **every** row of `Data` regardless of `InitialPageSize`; a 500-row grid with pagination off renders 500 body rows and no pager.
    - **TR-008** — `LucideIcon` resolves every name in `lucide.json`'s `aliases` map by falling back to the alias's parent in `icons`; `check-circle`, `check-circle-2`, `alert-circle`, `alert-triangle`, `x-circle`, `help-circle` and `circle-help` all render a real `<svg>` with 0 `data-trblazeui-missing-icon` placeholders. `lucide.json` is packed into the nupkg so the documented name lookup works.
    - **TR-014** — `AlertDialogContent` exposes `CloseOnEscape` (default `true`), `Modal` and `OnEscapeKeyDown` and forwards them to the primitive instead of the hard-coded `false`; pressing Escape on an open `AlertDialog` closes it. `Dialog` keeps honouring Escape **after** its content re-renders (document-level registration, not an element handler). `Primitives.Dialog.Dialog.Modal` is either wired up or removed — a documented parameter that nothing reads does not ship.
    - **TR-018** — a **closed** `CollapsibleContent` contributes no layout box: no descendant reports a non-zero `getBoundingClientRect()` height, and it cannot overlap the next sibling.
    - **TR-016** — `BadgeVariant` gains `Success`, `Info` and `Warning`, mapped to the `--alert-*` tokens `Alert` already uses (all of which already ship in `trblazeui.css`, so no Tailwind rebuild is required).
    - **TR-012** — `DataTable` gains `ShowHeader` (default `true`); with it `false` no `<thead>` renders and column metadata is unaffected.
    - **TR-025** — `DataTable` gains a `Density` parameter (`Comfortable` default, `Compact` ≈8-10px) driving both the header and body cell padding.
    - **TR-024** — `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` build their class strings with `ClassNames.cn(...)` instead of raw `$"base {Class}"` interpolation, so a caller's `Class` actually overrides the built-in `h-10`/`p-1`/`rounded-md` rather than losing to stylesheet source order.
    - **TR-027** — `flex-wrap`/`flex-nowrap`/`flex-wrap-reverse` join the `TailwindMerge` group table so a caller can turn wrapping off at all; `Breadcrumb` gains `Wrap` (default `true`) and splits its gap so a wrapped row pays no vertical gap.
    - **TR-011a** — a chart given data but no series is not a silent empty box: either `Items` drives a default series, or the dead `ChartBase.Items` parameter is removed so the mistake is a compile error. The duplicated `@attributes` splat on all six `Chart/Types/*.razor` is removed.
    - **TR-019** — `DialogContent` pins its header and footer and scrolls only the body (or exposes `MaxHeight`/`ScrollBody`), so the close button and primary action stay reachable in a viewport-taller dialog.
    - **TR-001 / TR-021 residual** — `--font-sans`/`--font-mono` are defined (or the `body` reset carries the same fallback stack the utilities already have); the `@source inline` safelist enumerations for `p-*`/`m-*`/`gap-*`/`size-*`/`space-*` are extended to match the w-/h- scale.
  - *Acceptance (docs, tracked on REQ-FN-006):* the §1 `_Imports` block covers every public component namespace (regenerated from the assembly, not hand-edited); `DataTableColumn` and `DialogContent` gain parameter tables; the `Alert`/`Button` icon guidance is corrected to describe the three routes that work and to mention `AlertIcon`/`ButtonIcon`; the `Class` (merged via cn) vs lowercase `class` (wholesale override) distinction is stated once, prominently; `BarChart.razor.cs:30`'s XML example stops showing a chart-level `XValue`.
  - *Out of scope:* TR-002, TR-003, TR-013, TR-020, TR-023 — verified fixed on current source; TfLens should upgrade to 2.1.0 and delete its workarounds.

## Functional requirements

<a id="d-req-fn-001"></a>
- **REQ-FN-001** — All 10 projects target `net10.0`; Microsoft.AspNetCore.* at 10.0.2; third-party packages at .NET-10-compatible versions. *(Phase WS-1)*
  - *Acceptance:* When a developer builds the solution in Release, then every project targets net10.0, ASP.NET Core resolves at 10.0.2 or later, and the build returns 0 errors.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-fn-002"></a>
- **REQ-FN-002** — Coding standards enforced across `src/`+`demos/`: `obj`-prefixed instance fields (0 underscore violations), file-scoped namespaces (0 block-scoped across 356 files), `ConfigureAwait(false)` in library code, specific-exception handling. *(Phase WS-1.5)*
  - *Acceptance:* When a developer builds the solution in Release, then no underscore field, block-scoped namespace or bare library await remains, and warnings are errors.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-fn-003"></a>
- **REQ-FN-003** — XML documentation on all public members. *(Phase WS-1.5.3)* — **Done 2026-06-30.** Un-suppressed CS1591 to enumerate the gap (236 warnings / 34 files, incl. enums, DTOs, demo services, and Blazor lifecycle overrides), documented every member with accurate summaries (+ `<param>`/`<returns>` where applicable), then removed the `<NoWarn>$(NoWarn);CS1591</NoWarn>` suppression from `Directory.Build.props` so docs are now build-enforced. Full Release rebuild: 0 warnings / 0 errors.
  - *Acceptance:* When a developer builds the solution in Release, then CS1591 is unsuppressed, no undocumented-member warning appears, and the build returns 0 warnings.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-fn-004"></a>
- **REQ-FN-004** — `.github/workflows/publish-github-packages.yml` (pack and push all five packages to GitHub Packages when a release is published) and `build.yml` (PR validation) present and functioning. *(Phase WS-2)*
  - *Acceptance:* When the owner publishes a release, then the publish workflow puts all five packages on GitHub Packages at the release tag's version.
  - *(Acceptance line corrected 2026-10-02. GitHub Packages is the source for every application the owner builds; nuget.org is for external users, and what is published there, and when, is the owner's decision. This row never checks nuget.org. `publish-nuget.yml` is the separate, manually run public workflow; its own guards are still asserted by this row's test.)*

<a id="d-req-fn-005"></a>
- **REQ-FN-005** — Per-package MinVer versioning (tag prefixes) + Directory.Build.props metadata (Apache-2.0, repo URLs, strict build flags). *(Phase WS-2)*
  - *Acceptance:* When a developer packs at a given version on the repository, then one shared version stamps all five packages and the props file declares Apache-2.0 and the repository URL.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-fn-006"></a>
- **REQ-FN-006** — `docs/TrBlazeUI-AI-Reference.md` covers all components/primitives/icons/patterns for AI consumption. *(Phase WS-3)*
  - *Acceptance:* When a developer follows the AI reference's imports block on a new page, then every shipped component namespace resolves and no example names a missing API.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-fn-007"></a>
- **REQ-FN-007** — Claude Code `/trblazeui` skill (integrate, generate page/form/dashboard/component/service, setup-theme, list-components) + distributable copy. *(Phase WS-4)*
  - *Acceptance:* When a consumer opens the shipped Claude Code skill, then it offers integrate, generate, setup-theme and list-components, with a distributable copy under docs/skills.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-fn-008"></a>
- **REQ-FN-008** — OpenCode `trblazeui` agent mirroring the Claude Code skill + distributable copy. *(Phase WS-5)*
  - *Acceptance:* When a consumer opens the shipped OpenCode agent, then it offers the same commands as the Claude Code skill, from a distributable copy under docs/skills.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-fn-009"></a>
- **REQ-FN-009** — The strict Release build (`dotnet build TrBlazeUI.sln -c Release -p:CI=true`) must restore and compile with **0 NU1902** audit errors. Currently `HtmlSanitizer 9.0.892` (referenced by `TrBlazeUI.Components` for REQ-NFR-003) drags in `AngleSharp 0.17.1`, which carries a known moderate-severity advisory (GHSA-pgww-w46g-26qg); NuGetAudit raises NU1902 and `TreatWarningsAsErrors` turns it into 6 build errors across the shipped library + all demo hosts. *Logged from triage 2026-07-18.*
  - *Acceptance:* `dotnet build TrBlazeUI.sln -c Release -p:CI=true` returns **0 warnings / 0 errors** again — no NU1902 — achieved by upgrading `HtmlSanitizer` to a version whose transitive `AngleSharp` is patched (or an explicit patched `AngleSharp` PackageReference / a justified, scoped `NuGetAuditSuppress` with a comment); RichTextEditor sanitization (REQ-NFR-003) still functions; then REQ-NFR-005 re-verifies to `Verified`.

<a id="d-req-fn-010"></a>
- **REQ-FN-010** — Ship a library-owned Codex specialist definition with the NuGet package.
  - *Acceptance:* `docs/skills/codex-trblazeui.toml` is packed and deployed to `.codex/agents/trblazeui.toml`; it uses plain `developer_instructions`, reads `.trblazeui/TrBlazeUI-AI-Reference.md`, follows consumer `AGENTS.md`, preserves unrelated consumer files, and is discoverable in a clean NuGet-only Codex consumer after `dotnet build`.

## Non-functional

<a id="d-req-nfr-001"></a>
- **REQ-NFR-001** — WCAG 2.1 AA: keyboard navigation, ARIA roles/states, focus management + trapping, screen-reader support on all interactive components. (Not independently audited — 90%.)
  - *Acceptance:* When a keyboard user tabs through the primitive demo screens, then focus reaches each control and an automated WCAG 2.1 AA scan reports zero violations.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*
  - *Findings 2026-09-12 (first grading against a scanner — this row had no acceptance line before, so nothing had ever been able to fail it).* Scan: axe-core, tags `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`, over `/components/select`, `/components/datatable`, `/components/dialog` and `/components/collapsible` at 1280. Keyboard reach **passes** on all four — Tab moves focus off `<body>` every time. Seven violation types, 37 nodes, every one graded `serious`; full evidence `tests/.artifacts/verify/req-nfr-001/axe.json`.
    1. **`color-contrast` — 4 nodes, one per screen.** The `<kbd>` shortcut hint paints `text-muted-foreground` on `bg-muted`, which does not reach 4.5:1. It is the same element each time, so one token pairing fixes all four.
    2. **`listitem` — 24 nodes.** `<li>` elements that are not inside a `<ul>` or `<ol>`.
    3. **`list` — 6 nodes.** `<ul class="flex-row flex flex-wrap items-center gap-2 sm:gap-6 lg:gap-8">` holding children that are not `<li>`.
    Findings 2 and 3 are one defect in the **Pagination** family: `PaginationContent` renders the `<ul>` while `PaginationItem` and the bare `<div>`s between them break the list structure, so a screen reader announces a list whose item count is wrong.
    4. **`nested-interactive` — 3 nodes.** A `<button>` inside a `<button>` on the DataTable header, where `DropdownMenuTrigger` (`dropdown-menu-384-trigger`) and `PopoverTrigger` (`popover-376-trigger`) wrap controls that are themselves focusable. A keyboard user reaches an inner control that assistive technology cannot address.
    - **Not measured:** the human half. An independent audit is outside this project's means, so this grade covers the automated rules and keyboard reach only and claims nothing beyond them.
  - *Fixed 2026-09-12 (`*fix-issues`) — re-scan reports 0 violations, 0 nodes.*
    1. **Contrast.** `Kbd` moved from `text-muted-foreground` to `text-foreground`. The old pairing was 4.60:1 on the library's own tokens against a 4.5:1 floor, and the demo theme's lighter `--muted-foreground` took it to 4.34:1. Now 18.15:1 light, 14.48:1 dark. The demo theme's `--muted-foreground` also moved `oklch(0.5560)` → `oklch(0.5200)` (5.05:1 on `--muted`).
    2 & 3. **Pagination list structure.** `DataTable` was placing the page-size selector, the page display and two `<div>` spacers inside `PaginationContent`'s `<ul>`. The grouping is now plain `<div>`s and the `<ul>` holds only the four `PaginationItem` buttons. Measured live: 6 lists, 24 items, **0 lists with non-`<li>` children, 0 orphan `<li>`**. No API changed — the library was misusing its own components.
    4. **Nested controls.** The toolbar's Filter and Columns popovers now pass `AsChild="true"`, so the `Button` is the trigger rather than sitting inside one. The select-all header checkbox is decoration, so the accessible name moved to the dropdown trigger and the checkbox uses the new `Checkbox.Decorative`, which renders a `<span>` with no role and nothing focusable. `tabindex="-1"` was tried first and **did not work** — a negative tabindex still leaves an element focusable, so the rule still failed.
    - *Still works:* paging advances (rows 1-5 → 6-10 of 500), both popovers open from their buttons, the select-all menu opens and keeps its name, and the decorative box still paints its state. Regressions green: `ui-tflens-2` 37/37, `ui-tflens` 44/44, `ui-techieblog` 76/76, `ui-ui016` 23/23, `ui-demo-2-1-0` 15/15, `ui-ui014` 8/8, `ui-ui004` PASS, plus 29/30 row-mapped tests (1 skipped: the owner-gated publish).

<a id="d-req-nfr-002"></a>
- **REQ-NFR-002** — Zero-config adoption: pre-built minified CSS (~83 KB) shipped; no Tailwind/Node required by consumers; `-p:CI=true` skips the Tailwind compile.
  - *Acceptance:* When a consumer with no Node installed opens a page, then the pre-built stylesheet is served and paints the components.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-nfr-003"></a>
- **REQ-NFR-003** — Security: RichTextEditor HTML output sanitized (HtmlSanitizer); no secrets in the library.
  - *Acceptance:* When a user submits script-bearing HTML on the rich-text editor screen, then the script is stripped, benign markup survives, and no credential ships in the library.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-nfr-004"></a>
- **REQ-NFR-004** — Render-mode parity: identical component behavior across Server, WASM, Auto from one shared RCL.
  - *Acceptance:* When a developer opens the same component screen on the Server, WASM and Auto hosts, then all three render from one shared project and behave identically.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*

<a id="d-req-nfr-005"></a>
- **REQ-NFR-005** — Clean Release build under `TreatWarningsAsErrors`: `dotnet build TrBlazeUI.sln -c Release -p:CI=true` must report 0 warnings / 0 errors.
  - *Acceptance:* When a developer builds the solution in Release, then it returns 0 warnings and 0 errors under warnings-as-errors.
  - *(Acceptance line written 2026-09-12 by the verifier from this row's own description; no scope changed.)*
  - *Resolved (2026-06-30):* the 5 IDE0031 sites were all `if (x != null) { x.StateChanged += / -= handler; }` guards around an **event** accessor. The analyzer's null-propagation fix (`x?.StateChanged -= h`) is illegal C# (CS0131 — `?.` can't be on the left of `+=`/`-=`), so there is no legal in-code simplification. Resolved by downgrading just that rule — `dotnet_diagnostic.IDE0031.severity = suggestion` in the repo-root `.editorconfig`, with an explanatory comment. Release build now clean (0/0, exit 0) via WSL rung #4.


## Component demos

- <a id="d-req-ui-020"></a> **REQ-UI-020** (BRD-pending) TfLens post-2.1.0 consumer-feedback fixes (TR-028…TR-035)
  - *Acceptance:* When a consumer uses BarChart/ChartContainer, Badge, CollapsibleTrigger, DataTableColumn, NativeSelect, DataTable and SidebarProvider as the TfLens feedback file describes on the component demo screens, then each control exposes the parameter the design needs: a chart's axes/grid/labels are settable and the container can drop its card chrome; a long badge label wraps inside a pill that grows and a badge can render as an inline span; a column header aligns with its figures; a NativeSelect paints its chevron; a grid's search text is bindable and its column chooser optional; and the phone sidebar is --sidebar-width-mobile wide.

- <a id="d-req-ui-021"></a> **REQ-UI-021** (extends BRD-6 ToggleGroup and BRD-16 ScrollArea; TreeView and DiffView BRD-pending) Chatur consumer-feedback fixes (TR-001…TR-004): ScrollArea StickToEnd, TreeView, DiffView, ToggleGroup
  - *Acceptance:* When a consumer builds Chatur's Workbench, Files, Changes and Board screens as docs/Chatur-TrBlazeUI-Feedback.md describes on the component demo screens, then a ScrollArea with StickToEnd follows new lines until the reader scrolls up and resumes at the bottom; a TreeView expands, collapses, selects one row, moves with the arrow keys, shows an icon and trailing badge per row and loads children on demand; a DiffView shows a before and after text side by side or inline with line numbers, themed added/removed tints, foldable unchanged parts and a per-part action slot, compared in .NET; and a ToggleGroup draws its items joined and keeps a single or multiple choice itself.

- <a id="d-req-ui-026"></a> **REQ-UI-026** (extends BRD-25 DataTable) DataTable rows, header row and choose-all control take attributes (Chatur TR-011)
  - *Acceptance:* When a consumer passes RowAttributes, HeaderRowAttributes and SelectAllAttributes on the DataTable demo screen, then each row, the header row and the choose-all control carry them and keep their own styling.

- <a id="d-req-ui-027"></a> **REQ-UI-027** (extends BRD-6 ToggleGroup) ToggleGroup chosen item takes another look through OnVariant (Chatur TR-012)
  - *Acceptance:* When a consumer sets OnVariant to Card or Primary on the Toggle Group demo screen, then the chosen item paints that colour, and a group that sets nothing stays accent.

- <a id="d-req-ui-028"></a> **REQ-UI-028** (extends BRD-53 Reliability) No control reports an unhandled error when its page stops answering during dispose
  - *Acceptance:* When a page holding a control with a script module stops answering during dispose on the component demo screens, then the server log holds no unhandled cancelled-task error.

- <a id="d-req-ui-029"></a> **REQ-UI-029** (extends BRD-6 Switch) Switch that is off can draw a visible border through Outlined (Chatur TR-014)
  - *Acceptance:* When a consumer sets Outlined on the Switch demo screen, then an off switch shows a visible border against its track, and a switch without it looks unchanged.
  - *Mockup:* [mockups/settings-agents.html](mockups/settings-agents.html), the Rights switches (`.sw` in `mockups/chatur.css`); copied unchanged from Chatur's `docs/mockups/` on 2026-10-03 — the consumer's design, not a library screen.

- <a id="d-req-ui-030"></a> **REQ-UI-030** (extends BRD-15 Tabs) Each tab in EditorTabs can carry its own attributes through TabAttributes (Chatur TR-015)
  - *Acceptance:* When a consumer passes TabAttributes on the Code Editor demo screen, then each open-file tab carries its own attributes, such as a data-testid, and keeps its classes.
  - *Mockup:* [mockups/process-run.html](mockups/process-run.html), the main-window tab anchor `tab-process-run`; copied unchanged from Chatur's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-031"></a> **REQ-UI-031** (extends BRD-15 navigation — Stepper) A Stepper step can show an icon in its marker through Icon (Chatur TR-016)
  - *Acceptance:* When a consumer gives a StepperItem an Icon on the Stepper demo screen, then the marker draws that icon in place of the glyph and keeps its accessible name.
  - *Mockup:* [mockups/process-run.html](mockups/process-run.html), the steps panel `run-step-1` to `run-step-7`; copied unchanged from Chatur's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-032"></a> **REQ-UI-032** (extends BRD-28 Badge) Badge has a soft red Danger variant, and a text colour in Class replaces the variant's (Chatur TR-017)
  - *Acceptance:* When a consumer sets Variant Danger on the Badge demo screen, then the badge paints the danger tint, and a text colour in Class replaces the variant's.
  - *Mockup:* [mockups/process-run.html](mockups/process-run.html), the stopped state pill (`.pill.bad`); copied unchanged from Chatur's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-033"></a> **REQ-UI-033** (extends BRD-15 Tabs) EditorTabs close mark can be drawn by the consumer through CloseContent (Chatur TR-018)
  - *Acceptance:* When a consumer passes CloseContent on the Code Editor demo screen, then each tab's close button draws that content in place of the svg and keeps its accessible name.
  - *Mockup:* [mockups/process-run.html](mockups/process-run.html), the main-window tab anchor `tab-process-run` whose close mark is a text × (`.tab .x` in `mockups/chatur.css`); copied unchanged from Chatur's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-034"></a> **REQ-UI-034** (extends BRD-19 Dialog, AlertDialog) AlertDialogAction and AlertDialogCancel take an OnClick that runs before the dialog closes (Sevak TR-044)
  - *Acceptance:* When a consumer sets OnClick on AlertDialogAction on the Alert Dialog demo screen, then the handler runs and the dialog closes.
  - *Mockup:* [mockups/sevak-backup.html](mockups/sevak-backup.html), the restore confirmation; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-035"></a> **REQ-UI-035** (extends BRD-24 Toasts) An empty toast viewport lets clicks through to the page beneath it (Sevak TR-043)
  - *Acceptance:* When no toast is showing on the Toast demo screen, then a click at the bottom-right corner reaches the page, and a shown toast still takes its own clicks.
  - *Mockup:* [mockups/sevak-tasks.html](mockups/sevak-tasks.html), the Add task dialog whose footer sits at the window's bottom edge; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-036"></a> **REQ-UI-036** (extends BRD-24 Toasts) ToastVariant gains Success, Info and Warning with matching ToastService methods (Sevak TR-023)
  - *Acceptance:* When a consumer calls ToastService.Warning on the Toast demo screen, then a toast paints the warning tint, and Success and Info do the same with theirs.
  - *Mockup:* [mockups/sevak-qdrant-admin.html](mockups/sevak-qdrant-admin.html), the caution notice for a plain TCP endpoint; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-037"></a> **REQ-UI-037** (extends BRD-9 NumericInput and BRD-10 Slider) NumericInput and Slider emit valid, invariant ARIA range attributes (Sevak TR-033, TR-034)
  - *Acceptance:* When a NumericInput renders on its demo screen, then it carries role spinbutton with its range attributes, and its numbers and the Slider's use a dot decimal in every culture.
  - *Mockup:* [mockups/sevak-admin-settings.html](mockups/sevak-admin-settings.html), the upload-size numeric field; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-038"></a> **REQ-UI-038** (extends BRD-9 NumericInput) NumberInput fails the build with a message naming NumericInput (Sevak TR-039)
  - *Acceptance:* When a consumer writes NumberInput in a Razor file, then the build fails with an error naming NumericInput instead of rendering an invisible element.
  - *Mockup:* [mockups/sevak-agents.html](mockups/sevak-agents.html), the step-budget numeric field; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-039"></a> **REQ-UI-039** (extends BRD-5 Textarea) Textarea takes Rows and MaxRows and grows with its content up to the cap (Sevak TR-026)
  - *Acceptance:* When a consumer sets Rows and MaxRows on the Textarea demo screen, then the box starts at Rows lines, grows as text is typed, and scrolls once MaxRows is reached.
  - *Mockup:* [mockups/sevak-workspace-chat.html](mockups/sevak-workspace-chat.html), the composer that grows to about twelve lines; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-040"></a> **REQ-UI-040** (extends BRD-25 DataTable) Table family for a plain markup table: Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption (Sevak TR-028)
  - *Acceptance:* When a consumer composes the Table family on the Table demo screen, then a styled table renders from plain markup with no record type, toolbar or pager.
  - *Mockup:* [mockups/sevak-connectors.html](mockups/sevak-connectors.html), the Jobs table; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-041"></a> **REQ-UI-041** (extends BRD-16 Card and BRD-24 Alert) CardTitle and AlertTitle take an As heading level (Sevak TR-008)
  - *Acceptance:* When a consumer sets As on CardTitle or AlertTitle on their demo screens, then that heading element renders with the same classes, and the default is unchanged.
  - *Mockup:* [mockups/sevak-admin-settings.html](mockups/sevak-admin-settings.html), the card and alert headings in one outline; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-042"></a> **REQ-UI-042** (extends BRD-7 Select) Select shows its placeholder when the bound value matches no item (Sevak TR-024)
  - *Acceptance:* When a Select is bound to a value no item carries on the Select demo screen, then the trigger shows the placeholder instead of the raw value.
  - *Mockup:* [mockups/sevak-qdrant-admin.html](mockups/sevak-qdrant-admin.html), the distance-metric picker; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-043"></a> **REQ-UI-043** (extends BRD-32 Charts) The six chart components take unmatched attributes like every other component (Sevak TR-044 census)
  - *Acceptance:* When a consumer puts a data-testid on a chart on the Charts demo screens, then it lands on the chart's root element and the chart still draws.
  - *Mockup:* [mockups/sevak-token-usage.html](mockups/sevak-token-usage.html), the usage charts; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-fn-011"></a> **REQ-FN-011** (extends BRD-27 sanitized rich text) HtmlSanitizer on a stable 9.1.x release with no vulnerable AngleSharp (Sevak TR-037)
  - *Acceptance:* When the Components package is restored on the Rich Text Editor demo screen, then its HtmlSanitizer dependency is a stable 9.1.x release and no transitive package carries an open advisory.

- <a id="d-req-ui-044"></a> **REQ-UI-044** (extends BRD-7 Select and BRD-23 reactive portal) A Select inside a Dialog never freezes the page: a portal or positioning failure is logged and the list falls back, never thrown into the circuit (Sevak TR-041)
  - *Acceptance:* When the floating-position script fails for a Select inside a Dialog on the Dialog demo screen, then the page keeps answering clicks and no error banner shows.
  - *Mockup:* [mockups/sevak-tasks.html](mockups/sevak-tasks.html), the Add task dialog with its pickers; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-045"></a> **REQ-UI-045** (extends BRD-28 display components and BRD-5 Textarea) Chat family: ChatThread, ChatMessage and ChatComposer for a message thread with a composer (Sevak TR-006)
  - *Acceptance:* When a consumer composes the chat family on the Chat demo screen, then messages align by role, a streaming message shows Typing, and Enter sends while Shift+Enter adds a line.
  - *Mockup:* [mockups/sevak-workspace-chat.html](mockups/sevak-workspace-chat.html), the message column and composer; copied unchanged from Sevak's `docs/mockups/` on 2026-10-07 — the consumer's design, not a library screen.

- <a id="d-req-ui-046"></a> **REQ-UI-046** (extends BRD-25 DataTable) DataTableColumn hides itself below a screen width through HideBelow (Chatur TR-019)
  - *Acceptance:* When a consumer sets HideBelow on a column on the DataTable demo screen, then that column is gone at phone width and back at wider screens.
  - *Mockup:* [mockups/run-queue.html](mockups/run-queue.html), the seven-column queue table (`#`, Project, Brief, State, Started, Time, Do); copied unchanged from Chatur's `docs/mockups/` on 2026-10-09 — the consumer's design, not a library screen.


## Editor

- <a id="d-req-ui-022"></a> **REQ-UI-022** (BRD-pending) Editable code area and an open-file tab strip (CodeEditor, EditorTabs)
  - *Acceptance:* When a Chatur developer edits a source file on the Editor screen, then an editable code area binds its text two ways, shows line numbers, indents on Tab instead of moving focus, and a tab strip above it gives each open file a close button and an unsaved mark.


## Chat

- <a id="d-req-ui-023"></a> **REQ-UI-023** (BRD-pending) Inline indicator for work under way with no known end (Typing, Progress.Indeterminate)
  - *Acceptance:* When an answer is still being written on the Chat screen, then a small inline indicator inside the message says the answer is still coming, and a Progress bar can be shown without claiming a percentage.


## Run

- <a id="d-req-ui-024"></a> **REQ-UI-024** (BRD-pending) Panel for the output of a running command (LogView)
  - *Acceptance:* When a build writes lines on the Run screen, then a panel takes the lines one at a time, marks each as ordinary, a warning or a failure, holds its height, and follows the newest line until the reader scrolls back.


## Roles

- <a id="d-req-ui-025"></a> **REQ-UI-025** (BRD-pending) List that drives a detail pane (NavList)
  - *Acceptance:* When a Chatur user picks a role on the roles tab, then a list of multi-line rows carries the choice two ways, moves with the arrow keys, and the rest of the screen follows the chosen row.
