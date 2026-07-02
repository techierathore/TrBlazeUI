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
| REQ-UI-001 | Headless primitives (16) | Done (pre-existing) | 100% | 2026-06-30 — migrated; primitives + portal/focus/keyboard/positioning services present per TrBlazeUI-Doc.md | [view](#d-req-ui-001) |
| REQ-UI-002 | Form components (~28) | Done (pre-existing) | 100% | 2026-06-30 — migrated; all form controls present | [view](#d-req-ui-002) |
| REQ-UI-003 | Layout & navigation components | Done (pre-existing) | 100% | 2026-06-30 — Sidebar (22 parts) + nav set present; see REQ-NFR-005 re: Sidebar build error | [view](#d-req-ui-003) |
| REQ-UI-004 | Overlay & feedback components + reactive portal | Done (pre-existing) | 100% | 2026-06-30 — portal reactive-refresh fix applied per Issues-Report-1 | [view](#d-req-ui-004) |
| REQ-UI-005 | Data & content components (DataTable, Markdown/RichText editors) | Done (pre-existing) | 100% | 2026-06-30 — migrated; runtime-smoke PASS: `/components/datatable` renders 47 rows of real data (screenshot) | [view](#d-req-ui-005) |
| REQ-UI-006 | Display components | Done (pre-existing) | 100% | 2026-06-30 — attribute splatting added per issues-report-2 | [view](#d-req-ui-006) |
| REQ-UI-007 | Toolbar component family | Done (pre-existing) | 100% | 2026-06-30 — migrated from toolbarplan.md (all 16 plan tasks delivered; folder present in src) | [view](#d-req-ui-007) |
| REQ-UI-008 | Charts (6 types) | Done (pre-existing) | 100% | 2026-06-30 — Blazor-ApexCharts 6.1.0; runtime-smoke PASS: `/charts/bar` renders a grouped bar chart (JS) — screenshot | [view](#d-req-ui-008) |
| REQ-UI-009 | Icon libraries (Lucide/Heroicons/Feather) | Done (pre-existing) | 100% | 2026-06-30 — 3,200+ icons, 3 packages | [view](#d-req-ui-009) |
| REQ-UI-010 | Theming & dark mode | Done (pre-existing) | 100% | 2026-06-30 — CSS vars/OKLCH, shadcn+tweakcn, `.dark` toggle | [view](#d-req-ui-010) |
| REQ-UI-011 | Demo apps (Server/WASM/Auto) + layout toggle | Done (pre-existing) | 100% | 2026-06-30 — 90+ pages; horizontal/vertical nav toggle added | [view](#d-req-ui-011) |
| REQ-UI-012 | Universal `CaptureUnmatchedValues` attribute splatting | Done (pre-existing) | 100% | 2026-06-30 — all affected components fixed per issues-report-2 #1 | [view](#d-req-ui-012) |
| REQ-UI-013 | `ButtonIcon`/`AlertIcon` wrappers (RZ10012-free) | Done (pre-existing) | 100% | 2026-06-30 — wrappers created; RZ10012 suppression removed | [view](#d-req-ui-013) |
| REQ-FN-001 | .NET 8 → .NET 10 upgrade (all 10 projects) | Done (pre-existing) | 100% | WS-1 — all `net10.0`, packages 10.0.2; build green 0/0 per plan | [view](#d-req-fn-001) |
| REQ-FN-002 | Coding-standards enforcement (obj fields, file-scoped ns, ConfigureAwait) | Done (pre-existing) | 100% | WS-1.5 — 0 underscore fields, 0 block-scoped ns across 356 files | [view](#d-req-fn-002) |
| REQ-FN-003 | XML documentation on public members | Verified | 100% | 2026-06-30 — documented all 236 CS1591 members (incl. lifecycle overrides) across 34 files; removed CS1591 suppression from Directory.Build.props; Release build clean 0/0 | [view](#d-req-fn-003) |
| REQ-FN-004 | GitHub Packages CI/CD (publish-nuget.yml + build.yml) | Done (pre-existing) | 100% | WS-2 — both workflows present; pack/push with error handling | [view](#d-req-fn-004) |
| REQ-FN-005 | Per-package MinVer versioning + Directory.Build.props metadata | Done (pre-existing) | 100% | WS-2 — tag prefixes per package; repo URLs set | [view](#d-req-fn-005) |
| REQ-FN-006 | AI component reference document | Done (pre-existing) | 100% | WS-3 — docs/TrBlazeUI-AI-Reference.md (~1,785 lines) | [view](#d-req-fn-006) |
| REQ-FN-007 | Claude Code skill (`/trblazeui`) | Done (pre-existing) | 100% | WS-4 — skill + distributable copy in docs/skills/ | [view](#d-req-fn-007) |
| REQ-FN-008 | OpenCode skill (`trblazeui`) | Done (pre-existing) | 100% | WS-5 — skill + distributable copy in docs/skills/ | [view](#d-req-fn-008) |
| REQ-NFR-001 | WCAG 2.1 AA accessibility baseline | Done (pre-existing) | 90% | 2026-06-30 — patterns library-wide; not independently audited | [view](#d-req-nfr-001) |
| REQ-NFR-002 | Zero-config pre-built CSS (~83 KB) | Done (pre-existing) | 100% | 2026-06-30 — committed trblazeui.css; `-p:CI=true` skips Tailwind | [view](#d-req-nfr-002) |
| REQ-NFR-003 | RichTextEditor HTML sanitization | Done (pre-existing) | 100% | 2026-06-30 — HtmlSanitizer 9.0.892 | [view](#d-req-nfr-003) |
| REQ-NFR-004 | Render-mode parity (Server/WASM/Auto) | Done (pre-existing) | 100% | 2026-06-30 — shared RCL hosted in 3 modes | [view](#d-req-nfr-004) |
| REQ-NFR-005 | Clean Release build (0 warnings / 0 errors, warnings-as-errors) | Verified | 100% | 2026-06-30 — fixed: IDE0031 on event-accessor null guards can't use `?.` (CS0131), so downgraded that one rule to `suggestion` in `.editorconfig` with justification. Release build clean 0/0 (WSL rung #4) | [view](#d-req-nfr-005) |

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

## Functional requirements

<a id="d-req-fn-001"></a>
- **REQ-FN-001** — All 10 projects target `net10.0`; Microsoft.AspNetCore.* at 10.0.2; third-party packages at .NET-10-compatible versions. *(Phase WS-1)*

<a id="d-req-fn-002"></a>
- **REQ-FN-002** — Coding standards enforced across `src/`+`demos/`: `obj`-prefixed instance fields (0 underscore violations), file-scoped namespaces (0 block-scoped across 356 files), `ConfigureAwait(false)` in library code, specific-exception handling. *(Phase WS-1.5)*

<a id="d-req-fn-003"></a>
- **REQ-FN-003** — XML documentation on all public members. *(Phase WS-1.5.3)* — **Done 2026-06-30.** Un-suppressed CS1591 to enumerate the gap (236 warnings / 34 files, incl. enums, DTOs, demo services, and Blazor lifecycle overrides), documented every member with accurate summaries (+ `<param>`/`<returns>` where applicable), then removed the `<NoWarn>$(NoWarn);CS1591</NoWarn>` suppression from `Directory.Build.props` so docs are now build-enforced. Full Release rebuild: 0 warnings / 0 errors.

<a id="d-req-fn-004"></a>
- **REQ-FN-004** — `.github/workflows/publish-nuget.yml` (pack+push 5 packages on master) and `build.yml` (PR validation) present and functioning. *(Phase WS-2)*

<a id="d-req-fn-005"></a>
- **REQ-FN-005** — Per-package MinVer versioning (tag prefixes) + Directory.Build.props metadata (Apache-2.0, repo URLs, strict build flags). *(Phase WS-2)*

<a id="d-req-fn-006"></a>
- **REQ-FN-006** — `docs/TrBlazeUI-AI-Reference.md` covers all components/primitives/icons/patterns for AI consumption. *(Phase WS-3)*

<a id="d-req-fn-007"></a>
- **REQ-FN-007** — Claude Code `/trblazeui` skill (integrate, generate page/form/dashboard/component/service, setup-theme, list-components) + distributable copy. *(Phase WS-4)*

<a id="d-req-fn-008"></a>
- **REQ-FN-008** — OpenCode `trblazeui` agent mirroring the Claude Code skill + distributable copy. *(Phase WS-5)*

## Non-functional

<a id="d-req-nfr-001"></a>
- **REQ-NFR-001** — WCAG 2.1 AA: keyboard navigation, ARIA roles/states, focus management + trapping, screen-reader support on all interactive components. (Not independently audited — 90%.)

<a id="d-req-nfr-002"></a>
- **REQ-NFR-002** — Zero-config adoption: pre-built minified CSS (~83 KB) shipped; no Tailwind/Node required by consumers; `-p:CI=true` skips the Tailwind compile.

<a id="d-req-nfr-003"></a>
- **REQ-NFR-003** — Security: RichTextEditor HTML output sanitized (HtmlSanitizer); no secrets in the library.

<a id="d-req-nfr-004"></a>
- **REQ-NFR-004** — Render-mode parity: identical component behavior across Server, WASM, Auto from one shared RCL.

<a id="d-req-nfr-005"></a>
- **REQ-NFR-005** — Clean Release build under `TreatWarningsAsErrors`: `dotnet build TrBlazeUI.sln -c Release -p:CI=true` must report 0 warnings / 0 errors.
  - *Resolved (2026-06-30):* the 5 IDE0031 sites were all `if (x != null) { x.StateChanged += / -= handler; }` guards around an **event** accessor. The analyzer's null-propagation fix (`x?.StateChanged -= h`) is illegal C# (CS0131 — `?.` can't be on the left of `+=`/`-=`), so there is no legal in-code simplification. Resolved by downgrading just that rule — `dotnet_diagnostic.IDE0031.severity = suggestion` in the repo-root `.editorconfig`, with an explanatory comment. Release build now clean (0/0, exit 0) via WSL rung #4.
