# TrBlazeUI — Usage Guide (Test Users · Test Plan · Setup)

> The single source for **how to test and run** this app. Every agent (flow-master self-smoke, the verifier) **and** the human UAT use the SAME walkthrough listed here. TrBlazeUI is a **component library with a demo application** — it has **no authentication and no user accounts**, so the test-user table below is N/A; testing means walking the demo app's pages and exercising each component.

## Test users (canonical — use THESE for all smoke / verify / UAT)

**Not applicable — TrBlazeUI has no login, no database, and no user accounts.** The demo apps (Server/WASM/Auto) are open and require no credentials. No accounts are created or needed.

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
- **Covers:** F-DEMO / BRD-40

### Getting Started (`/getting-started`)
- **Steps:** open from sidebar.
- **Expected:** quick-start guide renders with setup snippets.
- **Covers:** BRD-40

### Components index (`/components`)
- **Steps:** open `/components` → click into each component demo.
- **Expected:** 79 component demo cards link to working demo pages (117 demo pages in total across components, primitives, charts, icons and top-level); each renders interactive examples.
- **Covers:** REQ-UI-002, REQ-UI-003, REQ-UI-004, REQ-UI-005, REQ-UI-006

### Forms (e.g. `/components/button`, `/components/input`, `/components/select`, `/components/date-picker`)
- **Steps:** type into Input/Textarea; toggle Checkbox/Switch; open Select/Combobox/MultiSelect; pick a date; adjust Slider/Rating.
- **Expected:** two-way binding updates shown state; dropdowns open; pickers select values.
- **Covers:** BRD-4…BRD-12 (REQ-UI-002)

### Layout & navigation (Sidebar, `/components/sidebar`, NavigationMenu, Tabs, Pagination)
- **Steps:** collapse/expand the Sidebar (and Ctrl/Cmd+B); reload to confirm persistence; open a horizontal NavigationMenu dropdown; switch Tabs; page through Pagination.
- **Expected:** sidebar collapse persists across reload; nav dropdown does not clip; tabs/pagination work.
- **Covers:** BRD-13…BRD-18 (REQ-UI-003)

### Overlays & feedback (Dialog, Sheet, Drawer, Popover, Toast, Command)
- **Steps:** open a Dialog; interact with controls *inside* it (toggle/select); open a Sheet/Drawer; trigger a Toast; open the Command palette and filter.
- **Expected:** overlays open with focus trap; **internal state changes re-render** (reactive-portal fix); Toasts appear; Command filters.
- **Covers:** BRD-19…BRD-24 (REQ-UI-004)

### Data & content (`/components/datatable`, MarkdownEditor, RichTextEditor)
- **Steps:** sort/filter/paginate/select rows in DataTable; edit markdown and view preview; type in RichTextEditor.
- **Expected:** DataTable operations work; editors render/preview; rich-text HTML is sanitized.
- **Covers:** BRD-25…BRD-27 (REQ-UI-005)

### What's new — 2.1.0 release page (`/whats-new`)
- **Steps:** open `/whats-new`; run the splatting, utility-scale and retuned-token examples on the page.
- **Expected:** every 2.1.0 change has a live, runnable example; no console errors.
- **Covers:** REQ-UI-017

### New components — 2.1.0 (9 pages)
- **Steps:** open each of `/components/prose`, `/components/stat`, `/components/timeline`, `/components/stepper`, `/components/anchor-nav`, `/components/sortable-list`, `/components/password-strength`, `/components/code-block`, `/components/centered-panel`; reach each one from the sidebar **and** the command palette.
- **Expected:** each page renders its examples; `AnchorNav` scrollspy tracks the active section; `Stepper` moves `aria-current="step"` as the step changes; `SortableList` reorders with its buttons (keyboard-operable); `CodeBlock`'s copy button works, and reports "Press Ctrl+C" rather than failing silently on a plain-HTTP origin; `Prose` keeps a wide table scrolling inside itself at 390px with no page overflow.
- **Covers:** REQ-UI-017

### 2.1.0 fix demonstrations (existing pages)
- **Steps:** `/components/rating` — arrow-key through the stars, then check the `ReadOnly` and `Focusable="false"` examples. `/components/tabs` — switch tabs. `/components/select` — load the page and read the trigger before opening it. `/components/input` + `/components/textarea` — type fast (Server host), and try the `DebounceMilliseconds` example. `/components/navigation-menu` — Tab through the top-level links. `/components/item` — inspect the list. `/components/typography` — the `Size` examples. `/components/datatable` — `Refresh()` after an in-place edit, and the `MinWidth` example. `/components/dialog` — the **stacked dialogs as siblings** example.
- **Expected:** Rating options are focusable `<button role="radio">` with `aria-checked="true"/"false"`; exactly one tab reports `aria-selected="true"` and its `aria-controls` resolves; Select shows the selected item's text on first paint; fast typing yields exactly the typed string with nothing dropped or reordered; NavigationMenu links are Tab reachable; `Item` announces as a list; `Typography Size` overrides the baked-in size; `Refresh()` repaints edited rows and `MinWidth` scrolls instead of clipping; the second dialog opens on top and is clickable.
- **Covers:** REQ-UI-017, REQ-NFR-001

### Toolbar (`/components/toolbar`)
- **Steps:** click ToolbarButtons; toggle ToolbarToggleButtons (Bold/Italic); try Default/Compact/Dense and vertical orientation; open a toolbar dropdown.
- **Expected:** buttons fire actions; toggles reflect pressed state (`aria-pressed`); variants/orientation render; IDE/editor examples work.
- **Covers:** BRD-30, BRD-31 (REQ-UI-007)

### Charts (`/charts/area`, `/bar`, `/line`, `/pie`, `/radar`, `/radial`)
- **Steps:** open each chart demo.
- **Expected:** each of the 6 chart types renders with theme colors.
- **Covers:** BRD-32 (REQ-UI-008)

### Icons (`/icons`)
- **Steps:** open the icon browser; switch between Lucide / Heroicons / Feather; search.
- **Expected:** icon grids render; typed names resolve; Heroicons shows 4 variants.
- **Covers:** BRD-33, BRD-34 (REQ-UI-009)

### Theming & dark mode (any page)
- **Steps:** toggle the theme (adds/removes `.dark` on `<html>`); switch demo theme if available.
- **Expected:** all components restyle; dark mode applies; no contrast breakage.
- **Covers:** BRD-35, BRD-36 (REQ-UI-010)

### Render-mode parity
- **Steps:** repeat a few of the above in Server (5183/7172), WASM (5184/7173), and Auto (5185/7174).
- **Expected:** identical component behavior across all three hosts.
- **Covers:** REQ-NFR-004 (BRD-40), REQ-UI-011

## Prerequisites
- .NET 10 SDK (Windows side; reference machine builds via Windows dotnet from WSL)
- A web browser (Chrome/Edge/Firefox/Safari)
- Node.js — ONLY for the automated runtime specs (`tests/verify/*.spec.js`); resolve Playwright via `NODE_PATH`, this repo ships no `node_modules`
- Python 3 — ONLY for `tools/token-contrast.py` (the palette contrast gate)
- PowerShell — ONLY if regenerating icon data (not needed to run/test)

## Setup / Deployment steps (runbook — one command per line, in order)

1. `git clone <repo> TrBlazeUI && cd TrBlazeUI`
2. `dotnet restore TrBlazeUI.sln`
3. `cmd.exe /c "dotnet build TrBlazeUI.sln -c Release -p:CI=true"`  *(WSL rung #4; `-p:CI=true` skips Tailwind, uses committed CSS)*
4. `./scripts/run-demo.sh server`  *(or `wasm` / `auto`; or `dotnet run --project demos/TrBlazeUI.Demo.Server`)*
5. Open `http://localhost:5183` (Server) — no login; browse the sidebar to exercise every component.

## Test (automated)
```bash
cmd.exe /c "dotnet build TrBlazeUI.sln -c Release -p:CI=true"
NODE_PATH=<path-to-any-repo-with-playwright>/node_modules node tests/verify/ui-techieblog.spec.js
python3 tools/token-contrast.py
dotnet run --project tools/splat-audit
```
> No unit-test project is checked into the solution. Runtime verification is the plain-Playwright specs under `tests/verify/` — `ui-techieblog.spec.js` (65 checks, the 2.1.0 gate), `ui-demo-2-1-0.spec.js` (15, demo coverage), `ui-ui016.spec.js` (23), `ui-ui014.spec.js` (8), `ui-trstudio.spec.js` (14) — each run against a booted demo with `SMOKE_URL` pointing at it. `tools/token-contrast.py` must report 0 failing pairings and `tools/splat-audit` 344/344 + 59/59. This repo intentionally ships no `node_modules` — resolve Playwright via `NODE_PATH` from another repo that has it. Boot the demo with an explicit `--urls` argument (`launchSettings.json` otherwise binds `localhost` only, which WSL cannot reach):
> `cmd.exe /c "dotnet run -c Release --no-build --project demos/TrBlazeUI.Demo.Server/TrBlazeUI.Demo.Server.csproj --urls http://0.0.0.0:5213"`

## Smoke checklist (quick capability pass)
- [ ] Demo host boots and the home page renders **styled** (sidebar, not bullet links) — confirms CSS path
- [ ] Open a few component demos (Button, Input, Select) — they render and bind
- [ ] Open a Dialog and change a control inside it — content re-renders (portal fix)
- [ ] Open `/components/toolbar` — toggle a button, confirm pressed state
- [ ] Open `/charts/bar` — chart renders with theme colors
- [ ] Open `/icons` — switch icon library, icons render
- [ ] Toggle dark mode — components restyle without breakage
- [ ] Open `/components/datatable` — the Basic Table shows **no search box** (toolbar is opt-in as of 2.0.0) and paginates only because it has 500 rows
- [ ] Open a tall Dialog — its header is visible at the top of the viewport and long content scrolls inside the dialog
- [ ] Open `/components/select` — the trigger has an accessible name (axe reports 0 `button-name` violations) and shows the selected item's text **before** the listbox is first opened
- [ ] Open `/whats-new` and the 9 new component pages from the sidebar — each renders its examples
- [ ] Open `/components/rating` — arrow-key through the stars; the selection follows the keyboard
- [ ] Type a long string fast into `/components/input` on the **Server** host — no characters are dropped or reordered

## Consumer integration notes

### Added 2026-08-11 (TechieBlog feedback pass — REQ-UI-017, ships in 2.1.0)

- **⚠ Design tokens retuned for contrast.** Light `--input`/`--ring` move from `oklch(0.922)`/`oklch(0.708)` to `oklch(0.66)` (form-control borders were **1.26:1**, below the 3:1 WCAG 1.4.11 floor; now **3.11:1**); dark `--input` → `oklch(0.55)`, dark `--accent` → `oklch(0.30)`, dark `--destructive-foreground` → near-black. Apps that override these tokens are unaffected — the library declares its own at zero specificity. Re-check any custom palette with `tools/token-contrast.py`.
- **⚠ `Rating` markup changed.** Options are `<button role="radio">`, not `<span role="radio">`; a `ReadOnly` rating is `role="img"` with no radio semantics. CSS or test selectors matching `span[role=radio]` need updating. New `Focusable` parameter removes the tab stop for a decorative rating.
- **⚠ `TabsContent` always renders its panel element** (hidden when inactive; child content still renders only for the active tab). This is what makes each trigger's `aria-controls` resolve.
- **⚠ `trblazeui.css` is now ~906 KB minified / ~97 KB gzipped** (was ~88 KB) because it ships the standard Tailwind utility scale with `sm:`/`md:`/`lg:`/`xl:`/`2xl:` variants. Utilities like `max-w-7xl`, `gap-6`, `min-w-3xl`, `top-1`, `w-36` and `lg:grid-cols-3` now resolve — previously they silently did nothing. Arbitrary values (`min-w-[720px]`) still cannot be pre-generated; use the scale or `DataTable.MinWidth`.
- **Attribute splatting is now catalog-wide** — 344/344 public components in `TrBlazeUI.Components` and 59/59 in `TrBlazeUI.Primitives` (measured by `tools/splat-audit`). Wrapper elements added purely to carry a `data-testid` can be deleted. Components with no element of their own (context roots, the config-only `DataTableColumn`) accept the attributes without rendering them — that exception list is in the AI reference.
- **`Input`/`Textarea` no longer lose keystrokes on a Blazor Server circuit**, and gain optional `DebounceMilliseconds`. Raw `<textarea>` workarounds can be removed.
- **`SelectValue` shows the selected item's `Text` on first paint**, before the listbox has ever opened.
- **New components:** `Prose`, `StatTile`/`StatGroup`, `Timeline`, `Stepper`, `AnchorNav`, `SortableList`, `PasswordStrength`, `CodeBlock`, `CenteredPanel` — each with a demo page. Also `Typography.Size`, `DataTable.Refresh()`, `DataTable.MinWidth`, and library defaults for `--success`/`--alert-*`/`--chart-1…5`/`--sidebar*`.
- **Accessibility corrections** to `Rating`, `Tabs`, `NavigationMenu`, `MarkdownEditor` and `Item`/`ItemGroup`; consumer-side `MutationObserver` ARIA patches for these can be deleted.

### Added 2026-07-22 (AstroLyfe post-upgrade feedback — REQ-UI-014 / TR-003, ships in 2.0.1)

- **Select triggers now carry an accessible name by default.** `SelectTrigger` (a `<button role="combobox">`) emits `aria-labelledby` pointing at the `SelectValue` span, so screen readers and axe (`button-name`) see a non-empty name from first render — no per-Select workaround needed. If you previously splatted `aria-label="…"` onto every `<SelectTrigger>` to satisfy accessibility, you can **remove it** on upgrade.
- **New `AriaLabel` parameter on `SelectTrigger`** for a descriptive purpose-name (e.g. `<SelectTrigger AriaLabel="Role">`), which overrides the default value-derived name. Splatting your own `aria-label`/`aria-labelledby` also still wins — the library only supplies the default when you provide no name.
- **Dialog centering is now offset-free (TR-014 hardening).** `DialogContent`/`AlertDialogContent` center with auto margins (`inset-0 m-auto h-fit`) instead of `translate-x/y-[-50%]`, so a tall dialog can never clip above the viewport no matter what `transform`/`translate` your app CSS contributes. **If you shipped a `translate:none`/`transform` dialog override, remove it** — its `[class~="left-[50%]"][class~="top-[50%]"]` selector no longer matches (those tokens are gone). `Sheet`/`Drawer` positioning is unchanged.

### Added 2026-07-21 (AstroLyfe UAT feedback pass — REQ-UI-016, ships in 2.0.0)

- **⚠ `DataTable.ShowToolbar` now defaults to `false`.** The search box + Columns button are opt-in — add `ShowToolbar="true"` where you want them. This changes the rendered output of every `DataTable` that did not set it explicitly.
- **DataTable pagination auto-hides.** The bar renders only when `TotalItems > PageSize`; a grid whose rows fit one page shows no pagination chrome. `ShowPagination="false"` still suppresses it unconditionally. Consumer-side guards like `ShowPagination="@(List?.Count > PageSize)"` are now redundant but harmless.
- **Dialogs are clamped to the viewport.** `DialogContent`/`AlertDialogContent` carry `max-h-[calc(100vh-2rem)] overflow-y-auto`, so a tall dialog can no longer render its header above `y=0`. If you shipped a CSS override to work around this, you can remove it. `Sheet`/`Drawer` are unaffected.
- **Theme tokens have library defaults.** `trblazeui.css` now ships `--popover`, `--background`, `--border`, … (light + `.dark`) at zero specificity via `:where()` inside `@layer base`. Popovers and Select listboxes stay opaque and legible even if your app defines no token set; if it does define them, yours still win.

### Added 2026-07-02 (AstroLyfe feedback pass — REQ-UI-014)

- **PortalHost:** add `<PortalHost />` (namespace `TrBlazeUI.Primitives.Services`) at the end of your root layout, inside the interactive render root. Overlay content (Select, Popover, DropdownMenu, Tooltip, …) renders through it for correct stacking. If it's missing, the library now **falls back to rendering popups inline** (fully functional, JS-positioned) and logs a one-time console warning — but the host is still the recommended setup.
- **Interactive triggers in DropdownMenu:** never slot a `Button` (or any interactive element) inside a plain `DropdownMenuTrigger` — that nests buttons. Use `AsChild="true"` so the slotted `Button` becomes the trigger itself (see `/components/dropdown-menu` → "Button As Trigger").
- **Input labels:** `<Input Label="Full Name" …>` renders a visible, `for`/`id`-associated `<label>`.
- **Icons & screen readers:** icons are decorative by default (`aria-hidden="true"`). Pass `AriaLabel="…"` to expose `role="img"` + accessible name. Unknown icon names render an empty placeholder (`data-trblazeui-missing-icon="<name>"`) and log a one-time warning — grep the DOM or logs for stragglers after migrations.
- **FluentUI migration cheatsheet:** FluentUI/Blazorise `xs`/`sm`/`md`/`lg`/`Spacing` attributes are **inert on plain HTML elements** — they silently collapse layouts. Rewrite them either as TrBlazeUI `<Grid Spacing="3"><GridItem Xs="12" Sm="6">…</GridItem></Grid>` (12-column, breakpoints 640/768/1024/1280px, demo at `/components/grid`) or as Tailwind `grid grid-cols-12 gap-*` + `col-span-* sm:col-span-*` classes.

## Known limitations
- **TR-066 (open) — a `Dialog` declared inside another `Dialog`'s `DialogContent` never opens.** Pre-existing (reproduces against the 2.0.1 `PortalService` source), not a 2.1.0 regression. Workaround: compose stacked dialogs as **siblings**, each with its own `@bind-Open`, opening the second from a handler inside the first — the pattern shown on `/components/dialog`. Write-up in `docs/TechieBlog-TrBlazeUI-Feedback.md` (TR-066).
- **REQ-NFR-001 accessibility is at 90% — no independent third-party audit** has been run. The consumer-reported WCAG defects are fixed and verified live; the remaining 10% closes only on an external audit.
- **Arbitrary Tailwind values are not pre-generated.** The 2.1.0 bundle ships the standard utility scale, but `min-w-[720px]`-style arbitrary values still cannot be. Use the scale or the component parameter (e.g. `DataTable.MinWidth`).
- **NativeSelect inside MAUI Blazor Hybrid overlays** — native `<select>` popup is clipped in WebView2 `position: fixed` overlays (platform limitation). Use `<Select>` instead inside dialogs/sheets. See `docs/OldDocs/TrBlazeUI-Issues-Report-1.md` (Issue #2).
- **`HtmlSanitizer 9.1.949-beta` is a pre-release dependency** of `TrBlazeUI.Components`. It is the only line pulling `AngleSharp >= 1.5.0`, which patches CVE-2026-54570 (mXSS bypass defeating DOM sanitizers — the protection `RichTextEditor`/`MarkdownEditor` depend on). Revisit when `HtmlSanitizer 9.1.x` reaches stable.
- **Consumer feedback is resolved in source but not published.** TechieBlog's TR-001…TR-065 ship in **2.1.0** (all 65 fixed library-side); AstroLyfe's TR-003 + TR-014 in 2.0.1, TR-010/011/012 in 2.0.0, their other 8 in 1.0.7; TrStudio's 11 in 1.0.7. **None of 2.0.0 / 2.0.1 / 2.1.0 is released** — publishing is owner-manual (tag `2.1.0`, paste the CHANGELOG 2.1.0 section as the release body, and carry its "Behaviour changes to review before upgrading" list into the notes). Until then consumers keep their workarounds. See the per-consumer feedback files in `docs/`.
- _(Resolved 2026-06-30: the strict Release build is clean 0/0, and XML-doc coverage is 100% with CS1591 build-enforced — previously-listed limitations cleared.)_
