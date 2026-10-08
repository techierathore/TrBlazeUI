# TrBlazeUI Feedback — surfaced during TechieRag

| | |
|---|---|
| App | Sevak |
| Upstream | TrBlazeUI |
| Updated | 2026-10-08 |

## Summary (filled by /flow-master on consolidation)

34 entries: 0 blocking now, 0 open, 0 fixed upstream and not yet re-checked, 34 closed as fixed upstream — 22 already in 2.1.4, 12 in 2.1.5 (TR-041 and TR-006 added on 2026-10-08). **Sevak is on 1.0.7; the action is upgrade to 2.1.5** (see "Replies from TrBlazeUI" at the foot).

Nothing is blocked. Every entry was worked around in the app or left visible and recorded, and the work carried on. TR-001 was resolved app-side on 2026-07-01 and stays as the record; TR-034 has no app-side workaround and is the one remaining WCAG A/AA violation in the app.

#### Summary as last consolidated on 2026-07-17

- 0 blockers · 0 major · 2 open minor (TR-003 SidebarInset min-width; TR-004 DataTable scroll wrapper — both worked around app-side; TR-001 resolved) · 3 nice-to-have (TR-002 css 404; TR-005 no Stepper/Wizard component; TR-006 no Chat/message-thread component)
- **Open for the TrBlazeUI team: TR-003, TR-004** (both minor, app has workarounds; TR-004 is the higher-value fix — DataTable should self-contain its own scroll wrapper, and the shipped Tailwind build should not purge layout utilities used only in consumer `.razor`). Component requests: TR-005, TR-006.
- Last consolidated: 2026-07-17 (TechieDesk mockups pass added TR-005/TR-006 component-gap requests; earlier same day: handoff after REQ-UI-014 TechieDesk rename — no new issues; the pre-existing TR-002 `{Assembly}.styles.css` 404 now presents as `TechieDesk.styles.css`, same behavior. Prior: 2026-07-02 — TR-004 corrected: the `overflow-x-auto` class is purged/inert, real fix is inline style, see TR-004)

## Entries

<!-- Append entries as gaps are found. IDs are append-only, never renumbered.
     TrBlazeUI → TR-NNN -->

### TR-001 — ✅ RESOLVED (app config) — TrBlazeUI overlays (Select/Toast/Dialog) silently fail when the app root isn't interactive

> ℹ️ **Answered upstream 2026-10-07 (documentation)** — the reference's layout setup now says the layout holding `PortalHost` and `ToastProvider` must render interactively, and names the two console messages a static layout gives.
- **Severity:** minor → **RESOLVED 2026-07-01 (app-side, not a library defect)**
- **Blocks:** no — the app switched to global interactivity, and the work carried on.
- **Repro:** host the `PortalHost` in a statically rendered `MainLayout.razor` (`App.razor` renders `<Routes />` + `<HeadOutlet />` with no render mode) while each page sets `@rendermode InteractiveServer`; then open a `Select`, show a toast, or open a `Dialog`.
- **Expected:** the overlay renders.
- **Actual:** nothing renders — no toast, the Source `<Select>` on /llm-settings does not open, the REQ-UI-013 vector-detail modal does not open. Full symptoms under Detail.
- **Encountered in:** /llm-settings and the REQ-UI-013 vector-detail modal, 2026-07-01.
- **Workaround:** global interactivity in `App.razor`; live-verified (see Detail).
- **Suggested fix:** (doc-only) document that `ToastProvider`/`PortalHost`/`Select`/`Dialog` need an interactive hosting layout; optionally emit a clearer diagnostic than "Floating element is not ready".

#### Detail

- **Original repro:** all TrBlazeUI overlays (`Select` dropdown content, `ToastProvider`, `Dialog`) render into a `PortalHost` hosted in `MainLayout.razor`. The sample's `App.razor` rendered `<Routes />` + `<HeadOutlet />` with **no render mode** (static SSR) while each page set `@rendermode InteractiveServer` individually — so the layout + `PortalHost` sat in a static tree while pages were interactive.
- **Symptoms observed:** (1) `ToastService.Success/Error` produced no DOM node app-wide (Save/Reset silent); (2) the **Source `<Select>` dropdown on /llm-settings would not open** — console spammed `Portal select-portal-select-N-content render timeout` + `Floating element is not ready or not in DOM` from `TrBlazeUI.Primitives/js/primitives/positioning.js`, followed by `JSDisconnectedException` in `SelectContent.DisposeAsync`; (3) the REQ-UI-013 vector-detail modal did not open.
- **Root cause:** render-mode boundary — a `PortalHost` in a statically-rendered layout can't host portal content emitted by interactive pages, so positioning runs before the floating element is in the interactive DOM.
- **Fix applied (app-side):** switched the sample to **global interactivity** — `App.razor` now sets `@rendermode="InteractiveServer"` on both `<HeadOutlet>` and `<Routes>`, and the 9 now-conflicting per-page `@rendermode InteractiveServer` declarations were removed. Live-verified 2026-07-01: the Source dropdown opens and all 7 options select correctly, Save shows the "LLM configuration saved and applied" toast, and `portalErrors = 0`.
- **Suggested fix for the library team (doc-only), in full:** document that `ToastProvider`/`PortalHost`/`Select`/`Dialog` require the hosting layout to be in an interactive render tree (global interactivity or an interactive boundary around the PortalHost) — a static layout + per-page interactivity silently breaks all overlays. Optionally emit a clearer diagnostic than "Floating element is not ready" when the PortalHost is non-interactive.

### TR-002 — Dangling `{Assembly}.styles.css` link 404s when a project has no scoped component CSS

> ✅ **Fixed upstream 2026-10-07 (documentation)** — the reference's CSS imports now say to link `{Assembly}.styles.css` only when the project has `.razor.css` files. The library ships no scaffold that adds the link.
- **Severity:** nice-to-have
- **Blocks:** no — the 404 is cosmetic and was left alone; the work carried on.
- **Repro:** the TrBlazeUI sample scaffold's `App.razor` links `<link rel="stylesheet" href="TechieRagWeb.styles.css" />`, but the project has no `.razor.css` companion files, so the scoped-CSS bundle is never generated and `MapStaticAssets()` returns 404 for it on every page load.
- **Expected:** no 404 for an unused scoped bundle.
- **Actual:** `GET /TechieRagWeb.styles.css → 404` on every page (cosmetic — Tailwind theme.css/trblazeui.css/base.css provide all styling; layout is unaffected).
- **Encountered in:** all pages — surfaced 2026-07-01.
- **Workaround:** none needed (benign).
- **Suggested fix:** omit the scoped-bundle `<link>` from the scaffold when no `.razor.css` files exist, or make it conditional.

### TR-003 — `SidebarInset` doesn't contain over-wide page content: whole shell (main + header) stretches past the viewport on mobile

> ✅ **Fixed upstream, in 2.1.4** — `SidebarInset` renders `min-w-0` on its `<main>` (checked in the source 2026-10-07). Upgrade and drop the app-side `main { min-width: 0; }`.
- **Severity:** minor
- **Blocks:** no — the app added `main { min-width: 0; }`, and the work carried on.
- **Repro:** at a 390×844 viewport, load a page whose content min-width exceeds the viewport (e.g. `/tool-demo` at ~455px, `/ingestion` at 560px).
- **Expected:** the inset/main is capped at the viewport (`min-w-0` on the flex item + overflow containment), so over-wide content scrolls *inside* the content region while the header/shell stays fixed.
- **Actual:** `main` has `flex-1` but no `min-w-0`/`overflow-x` containment; measured `main` width 455px (tool-demo) and 560px (ingestion) at a 390px viewport and the header stretches with it, so the whole shell pans horizontally.
- **Encountered in:** `/tool-demo` (REQ-UI-007), `/ingestion` (REQ-UI-004) — surfaced 2026-07-02 (verifier `*verify REQ-UI-007`).
- **Workaround:** (applied, app-side, 2026-07-02) `main { min-width: 0; }` in `wwwroot/styles/base.css` — verified: all pages measure `scrollWidth == viewport` at 390px.
- **Suggested fix:** add `min-w-0` (and consider `overflow-x-hidden` on the header row) to the `SidebarInset` main element so page-content overflow can never widen the shell/header beyond the viewport.

#### Detail

- **Full repro:** at a 390×844 viewport, load a page whose content min-width exceeds the viewport (e.g. TechieRag sample `/tool-demo`: a `flex items-center justify-between` card-header row plus a `Textarea + Button` `flex gap-2` row give ~455px min-content; `/ingestion` reaches 560px). The `SidebarInset`-rendered `<main class="relative flex h-full flex-1 flex-col …">` grows to the content's min-width (455/560px) instead of staying at viewport width — `document.scrollWidth > window.innerWidth`, and the `<header>` (with the `SidebarTrigger`) stretches with it, so the whole app shell pans horizontally and right-side controls ("Add Custom Tool", "Run Agent Loop") sit off-canvas.
- **Expected, in full:** matching shadcn sidebar behavior where the inset can't push the layout wider than the screen.
- **Evidence:** verifier §4b VISUAL-FAIL evidence: `test-results/screens/req-ui-007-freshload-mobile.png`, probe 2026-07-02.
- **Earlier workaround (app-side):** make the offending page rows wrap at narrow widths (`flex-wrap` / `flex-col sm:flex-row` on ToolDemo.razor:20 and :84) so the page's min-content stays under 390px. The app owns its responsive layout — this entry is about the shell amplifying the problem to the header.

### TR-004 — `DataTable` ships no contained scroll wrapper; its pagination's `sr-only` spans escape scroll containers and widen the page

> ✅ **Fixed upstream, in 2.1.4** — `DataTable` renders its own `relative w-full overflow-x-auto` wrapper and `.sr-only` has a zero scroll footprint (checked in the source 2026-10-07). Upgrade and drop the inline wrappers.
- **Severity:** minor
- **Blocks:** no — the app put inline `overflow-x:auto` wrappers around its tables, and the work carried on.
- **Repro:** render a `DataTable` whose table (or pagination bar) is wider than a narrow viewport.
- **Expected:** a `DataTable` never widens the page; wide content scrolls within the component.
- **Actual:** `/ingestion` panned to 487-560px at a 390px viewport until worked around: the component has no `overflow-auto` wrapper, and its pagination `sr-only` spans escape any consumer scroll container. Verifier probe evidence 2026-07-02 (REQ-UI-004/REQ-UI-007).
- **Encountered in:** `/ingestion` (REQ-UI-004/REQ-UI-007), 2026-07-02; `/qdrant-admin` (REQ-UI-011), 2026-07-02.
- **Workaround:** (applied, app-side, 2026-07-02) inline `style="overflow-x:auto;max-width:100%"` on the wrapper divs; a Tailwind `overflow-x-auto` class wrapper does not work (see Detail).
- **Suggested fix:** render the shadcn-style `relative w-full overflow-auto` wrapper inside `DataTable` itself (covering table + pagination), and make the Tailwind build keep layout utilities used only in consumer `.razor`, or document that it purges them.

#### Detail

- **The two defects that compound:**
  1. The component renders `div.w-full > div.rounded-md > table` with **no `overflow-auto` wrapper** (shadcn's Table renders `<div class="relative w-full overflow-auto">` around the table), so the table's min-content width propagates to the page.
  2. Even when the consumer adds their own `overflow-x-auto` wrapper, the pagination buttons' **`sr-only` spans are `position:absolute`**, so their containing block is the nearest *positioned* ancestor (the `SidebarInset` `<main>`, which is `relative`) — they escape every unpositioned scroll container and extend the document's scroll area (measured: spans at x=414/450/486 at a 390px viewport → `document.scrollWidth=487`).
- **Pagination bar named in the repro:** "Rows per page … Page N of M … first/prev/next/last".
- **First workaround applied (app-side, 2026-07-02):** wrap every `<DataTable>` in `<div class="relative overflow-x-auto">` — `relative` makes the wrapper the containing block for the sr-only spans so the scroll container clips them.
- **First suggested fix:** render the shadcn-style `relative w-full overflow-auto` wrapper inside `DataTable` itself (covering table + pagination), and/or use the standard sr-only recipe with `clip`/`clip-path` inside a positioned parent so hidden labels can't extend the page's scrollable area.
- **⚠ CORRECTION 2026-07-02 (flow-master `*build-phase`, REQ-UI-011):** the `overflow-x-auto` wrapper class above is **INERT in this app** — the `.overflow-x-auto` Tailwind utility is **purged from the shipped `_content/TrBlazeUI.Components/trblazeui.css`** (it appears only in the sample's `.razor` markup, which TrBlazeUI's own Tailwind build does not scan), so the wrapper computes `overflow-x: visible` and never clips. Proven on `/qdrant-admin` with a **running** Qdrant container: the 6-column containers `DataTable` (long image name `docker.io/qdrant/qdrant:v1.15.5`) reaches ~488px min-content, escapes its 374px wrapper, and drives `document.scrollWidth=496` at a 390px viewport (the Stop/connect buttons sit off-canvas). Earlier pages "passed" only because their tables were narrow enough to fit 374px without needing the (non-functional) scroll. **Additional trap:** an app-owned `base.css` rule reviving `.overflow-x-auto` did NOT reach the browser either — `MapStaticAssets` served a **0-byte `base.css` to any client sending `Accept-Encoding: br, gzip`** (stale/empty precompressed companion after editing the source `wwwroot/styles/base.css`), so CSS-file fixes are unreliable mid-session.
- **Real fix applied (app-side, 2026-07-02):** put the containment **inline on the wrapper divs** in `QdrantAdmin.razor` — `style="overflow-x:auto;max-width:100%"` (rendered into the Blazor HTML, immune to Tailwind purge and the static-asset compression pipeline). Verified live: `document.scrollWidth` 496→**390** at 390px, wrapper computed `overflow-x: auto`, the wide table now scrolls **inside** its local container; desktop 1280 no regression (`tests/verify/req-ui-011-mobile-fix.spec.ts`, both cases pass).
- **Two suggested fixes for the library team:** (1) ship the `relative w-full overflow-auto` wrapper **inside** `DataTable` (self-contained — consumers shouldn't need any wrapper class); (2) ensure TrBlazeUI's Tailwind build safelists/scans consumer markup, or documents that layout utilities like `overflow-x-auto` used only in consumer `.razor` are purged from the shipped bundle and must be supplied by the app.

### TR-005 — No Stepper/Wizard component (nice-to-have, found 2026-07-17 during TechieDesk mockups)

> ✅ **Fixed upstream, in 2.1.4** — `Stepper` + `StepperItem` exist, with `Status` (pending, running, waiting, done, retried, failed), `Orientation`, `Icon` and `Trailing`.

- **Severity:** nice-to-have
- **Blocks:** no — the mockup composes `Progress` + a custom step-label row + `Card`, and the work carried on.
- **Repro:** build TechieDesk's first-run onboarding wizard (`/setup`, `docs/mockups/setup-wizard.html`): a multi-step flow with step states (done/current/pending), a progress indication, and back/continue navigation.
- **Expected:** a Stepper/Wizard control in the catalog.
- **Actual:** the catalog has no Stepper/Wizard control. Composition is replicable, but every consumer app will hand-roll the same thing.
- **Encountered in:** TechieDesk mockups (`docs/mockups/setup-wizard.html`), 2026-07-17.
- **Workaround:** compose `Progress` + a custom step-label row + `Card`. Impact: none on the build (composition works); design-system consistency only.
- **Suggested fix:** a `Stepper` component (horizontal step indicators with done/current/pending states, optional content slots per step, Back/Next wiring) in the shadcn idiom.

### TR-006 — No Chat/message-thread component (nice-to-have, found 2026-07-17 during TechieDesk mockups)

> ✅ **Fixed upstream 2026-10-08, in 2.1.5** — `ChatThread`, `ChatMessage` and `ChatComposer` in `TrBlazeUI.Components.Chat`: a `role="log"` thread that follows the newest message, bubbles aligned by `Role` with `Author`, `Trace`, `Attachments`, `Footer`, `Avatar` and a `Streaming` state that shows `Typing`, and a composer with `@bind-Value`, `OnSend`, `Rows`/`MaxRows`, `Actions` above the box, where Enter sends and Shift+Enter adds a line. The body is yours (`Prose` for markdown). Demo at `/components/chat`.

- **Severity:** nice-to-have
- **Blocks:** no — the mockup composes existing components, and the work carried on.
- **Repro:** build TechieDesk's core screen, a workspace chat (`docs/mockups/workspace-chat.html`): scrollable message list (user/assistant alignment), markdown body, citation chips, expandable citation panels, a tool-execution trace block, and a composer (textarea + mode select + mic/send).
- **Expected:** chat-oriented components, since chat UIs are now a mainstream Blazor need (every LLM app).
- **Actual:** no chat-oriented components exist.
- **Encountered in:** TechieDesk mockups (`docs/mockups/workspace-chat.html`), 2026-07-17.
- **Workaround:** compose `ScrollArea` + styled blocks + `Badge` + `Textarea` + `Button`. Workable. Impact: none on the build (composition works); a library family would materially reduce boilerplate for TechieDesk and any TechieRag consumer.
- **Suggested fix:** a `ChatThread`/`ChatMessage`/`ChatComposer` family (message alignment variants, streaming-cursor state, attachment/citation chip slot, composer with send-on-Enter + Shift+Enter newline).

### TR-011 — `Input` cannot participate in a plain HTML form post (major, found 2026-07-25 during REQ-FN-032)

> ✅ **Fixed upstream, in 2.1.4** — every form component splats unmatched attributes, so `name="email"` lands on the element, and `Button` has `Type="ButtonType.Submit"`.

- **Severity:** major
- **Blocks:** no — the pages use raw `<input>` elements styled like `Input`, and the work carried on.
- **Repro:** build a Blazor Server login form that must POST to a plain endpoint (`<form method="post" action="/auth/login">`) and try to use `<Input @bind-Value="email" />` for the fields.
- **Expected:** `Input` forwards a `Name` attribute (or splats unmatched attributes) so the browser includes the field in the form payload.
- **Actual:** `Input` exposes no `Name` parameter and does not declare `CaptureUnmatchedValues`, so the rendered `<input>` has no `name` and the posted form body is empty. `Button` has the same problem for `type="submit"`. (Partly corrected 2026-07-29: `Input` does splat in 1.0.7 — see Detail.)
- **Encountered in:** REQ-FN-032 / REQ-UI-007 (`/login`, `/register`).
- **Workaround:** hand-copied `Input`'s emitted class string onto raw `<input>` elements so the pages stay pixel-identical. Fragile — it silently drifts the moment TrBlazeUI restyles `Input`.
- **Suggested fix:** add a `Name` parameter to `Input`/`Textarea`/`Select`, add `type` to `Button`, or (best) declare `[Parameter(CaptureUnmatchedValues = true)]` on all form primitives.

#### Detail

- **Why this matters more than it looks:** in Blazor Server an authentication cookie **cannot** be written from inside an interactive circuit — the response has already started. The only correct pattern is a real form post to an HTTP endpoint. Any consumer implementing cookie auth therefore hits this immediately.

#### Amended 2026-07-29 (`*build-phase`) — `Input` **does** have `AdditionalAttributes` in 1.0.7

Re-tested in the 2026-07-29 phase, which found three previously-recorded findings partly wrong; the original report above is left intact for history.

- **Original claim:** *"`<Input>` exposes no `Name` parameter and no `CaptureUnmatchedValues`, so it cannot participate in an HTML form POST"* — which is why `/login` and `/register` hand-copied `Input`'s class string onto raw `<input>` elements.
- **Actual (reflection, 1.0.7):** `Input` **does** declare `[Parameter(CaptureUnmatchedValues = true)] AdditionalAttributes`, as do `Textarea`, `Field`, `FieldContent`, `FieldLabel`, `CardTitle`, `CardDescription`, `Separator`, `Pagination`, `PaginationItem`, `PaginationLink`, `DialogContent`, `SheetContent`, `DropdownMenuTrigger` and `Tabs`. A raw `name="email"` attribute would therefore splat onto the rendered `<input>`. `Switch`, `Checkbox` and `RadioGroupItem` still have no splat but do expose `AriaLabel` and `Id`. Components with **neither** splat nor `AriaLabel`: `Slider`, `FileUpload`, `TabsTrigger`, `TabsContent`, `Label`, `SelectValue`.
- **Caveat:** only the parameter surface was verified — this was **not** re-tested end-to-end against a real form POST, and the `Button type="submit"` half of TR-011 was not checked. Flagged because the raw-`<input>` workaround may no longer be necessary. *(Note: on the current Mac Catalyst head there is no HTML form POST at all — sign-in is an in-process call — so this matters only if a web head returns.)*

### TR-012 — Select option accessible names match on substring (minor, found 2026-07-25)

> ✅ **Fixed upstream 2026-10-07 (documentation)** — the reference's Select section now carries the `exact: true` note. It is Playwright's matching rule, not the component's.

- **Severity:** minor (test ergonomics)
- **Blocks:** no — consumer specs pass `exact: true`, and the work carried on.
- **Repro:** `page.getByRole('option', { name: 'OpenAI (Cloud)' })` in a Select that also contains "Azure OpenAI (Cloud)".
- **Expected:** only the "OpenAI (Cloud)" option matches.
- **Actual:** both options match; every consumer spec needs `exact: true`.
- **Encountered in:** consumer Playwright specs against the LLM provider Select, 2026-07-25.
- **Workaround:** `exact: true` in every spec.
- **Suggested fix:** none required in the library — but worth documenting, since it silently makes consumer tests select the wrong provider.

### TR-013 — 49 `RZ10012` warnings from sub-component syntax (minor, found 2026-07-25)

> ✅ **Fixed upstream, in 2.1.4** — `AlertIcon` and `ButtonIcon` are real components and the reference documents them; `Alert.Icon` / `Button.Icon` were never components, which is what RZ10012 was saying.

- **Severity:** minor
- **Blocks:** no — the warnings are harmless at runtime and were left in place; the work carried on.
- **Repro:** use the documented `Alert.Icon` / `Button.Icon` sub-component syntax and build.
- **Expected:** a clean build.
- **Actual:** the build emits 49 warnings of the form *"Found markup element with unexpected name 'Alert.Icon' / 'Button.Icon'. If this is intended to be a component, add a @using directive for its namespace."* across `apps/TechieDesk/Components/**`. Harmless at runtime, but it buries genuine warnings in build output.
- **Encountered in:** `apps/TechieDesk/Components/**`, 2026-07-25.
- **Workaround:** none.
- **Suggested fix:** ship the sub-components as real nested component types, or document the required `@using` so consumers can silence them.

### TR-021 — `Tabs` in controlled mode (`Value` + `ValueChanged`) renders no active trigger and no panel content (major, found 2026-07-26 during REQ-UI-043)

> ✅ **Fixed upstream, in 2.1.4** — a controlled `Tabs` renders its active trigger and panel and follows `Value`; measured live on /components/tabs on 2026-10-07 (active trigger `aria-selected="true"`, a click moved the bound value).

- **Severity:** major
- **Blocks:** no — the page reverted to uncontrolled `DefaultValue` plus a page-level `Alert`, and the work carried on.
- **Repro:** replace `<Tabs DefaultValue="provider">` with `<Tabs Value="activeTab" ValueChanged="OnTabChanged">`, `activeTab` initialised to `"provider"`, `OnTabChanged(string? value) => activeTab = value;`, same children.
- **Expected:** the trigger whose `Value` equals `Value` renders active, and its matching `TabsContent` renders — same as `DefaultValue`. The reference documents `Value` as "Active tab (controlled)".
- **Actual:** no trigger is marked active and no `TabsContent` renders; on `/llm-settings` the page body below the header went blank. Clicking a trigger does not help.
- **Encountered in:** `apps/TechieDesk/Components/Pages/LlmSettings.razor` (REQ-UI-043 / BRD-136), 2026-07-26.
- **Workaround:** (applied) reverted to the uncontrolled `<Tabs DefaultValue="provider">`; save-time failures are also shown in a page-level `Alert` (see Detail).
- **Suggested fix:** honour `Value` in the controlled path — seed the internal active-tab state from `Value` on parameter set, and re-render triggers/content when `Value` changes; keep `DefaultValue` as the uncontrolled fallback only when `Value` is null.

#### Detail

- **Repro, in full:** keep the same `TabsList`/`TabsTrigger`/`TabsContent` children. The reference is `.trblazeui/TrBlazeUI-AI-Reference.md`, Tabs.
- **Actual, in full:** the trigger strip renders with **no** trigger marked active and **no** `TabsContent` at all. On `/llm-settings` the entire page body below the header went blank — only the header, buttons and the three tab labels rendered. Clicking a trigger does not help; `ValueChanged` appears never to reconcile back into the rendered state. Evidence: `test-results/req-ui-043-llm-provider-fi-bd226-igured-provider-still-saves/test-failed-1.png` (empty body under the tab strip).
- **Workaround, in full:** the page therefore cannot programmatically switch the user back to the Provider tab when a save is refused, so the save-time failures are ALSO rendered in a page-level `Alert` above the tab strip (visible from any tab) in addition to the per-field `FieldError`.

### TR-022 — `Alert` does not splat unmatched attributes; an `id` kills the whole Blazor circuit (major, found 2026-07-26 during REQ-UI-043)

> ✅ **Fixed upstream, in 2.1.4** — `Alert` and the whole catalogue splat unmatched attributes (the sweep shipped in 2.0.3; the 2026-10-07 census of the source finds only the six charts without it, and they gain it in 2.1.5).

- **Severity:** major
- **Blocks:** no — the `Alert` is wrapped in a `<div id>`, and the work carried on.
- **Repro:** `<Alert Variant="AlertVariant.Danger" AccentBorder="true" id="llm-validation-summary"> … </Alert>` inside a Blazor Server page, then trigger the branch that renders it.
- **Expected:** the `id` lands on the rendered element, as the TrBlazeUI agent guidance promises for every component.
- **Actual:** `System.InvalidOperationException: Object of type 'TrBlazeUI.Components.Alert.Alert' does not have a property matching the name 'id'` — an **unhandled circuit exception**, so the circuit is torn down and the page silently stops responding.
- **Encountered in:** `apps/TechieDesk/Components/Pages/LlmSettings.razor` (REQ-UI-043 / BRD-136), 2026-07-26.
- **Workaround:** (applied) wrap the component — `<div id="llm-validation-summary"><Alert …>…</Alert></div>`.
- **Suggested fix:** declare `[Parameter(CaptureUnmatchedValues = true)] public IDictionary<string, object>? AdditionalAttributes` on `Alert` (and audit the rest of the catalogue for the same omission), or correct the agent guidance to list exactly which components splat.

#### Detail

- **The guidance quoted:** *"All components support CaptureUnmatchedValues — arbitrary HTML attributes (id, style, data-\*, aria-\*) … can be passed directly to any component"*, so `id` should be safe on `Alert`.
- **Actual, in full:** thrown from `ComponentProperties.ThrowForUnknownIncomingParameterName`. The user sees the click do nothing; nothing renders. It cost a full smoke cycle to find, because the only symptom in the browser is "the button did nothing".
- `SelectTrigger` in the same file DOES accept `id`, so the behaviour is inconsistent across the catalogue.
- Given the failure mode is a dead circuit rather than a compile error, this is worth a catalogue-wide sweep.

### TR-023 — no warning-severity toast; `ToastVariant` is only `Default` | `Destructive` (minor, found 2026-07-26 during REQ-UI-042)

> ✅ **Fixed upstream 2026-10-07, in 2.1.5** — `ToastVariant.Success`, `Info` and `Warning` on the alert tokens, with `ToastService.Warning(description, title?)` and `.Info(...)`.

- **Severity:** minor (but security-relevant in this consumer)
- **Blocks:** no — a destructive toast plus a durable warning `Alert` were used, and the work carried on.
- **Repro:** `ToastService.Warning("…", "…")` — no such overload. `ToastVariant` exposes exactly two members: `Default` and `Destructive`.
- **Expected:** a warning/caution variant, matching `AlertVariant` which *does* have `Warning` alongside `Info`/`Success`/`Danger`. The two families should agree.
- **Actual:** a caution — "this endpoint is plain, unauthenticated TCP and hands root on that host to the network" — can only be shown as a success-toned toast or as a hard error toast. Neither tone is correct: `Default` under-sells a security warning, `Destructive` reads as "the operation failed" when the operation actually succeeded.
- **Encountered in:** `apps/TechieDesk/Components/Pages/QdrantAdmin.razor` (REQ-UI-042 / REQ-FN-040, BRD-134), 2026-07-26.
- **Workaround:** (applied) `ToastService.Show(message, title, ToastVariant.Destructive, 10000)` for the transient notice, plus a durable `Alert Variant="AlertVariant.Warning"` on the card which carries the correct tone and does not disappear.
- **Suggested fix:** add `ToastVariant.Warning` (and ideally `Info`/`Success`) so `ToastVariant` mirrors `AlertVariant`, and add `ToastService.Warning(string description, string? title)`.

### TR-024 — `Select` trigger shows the raw bound value, not the matching `SelectItem`'s `Text` (minor, found 2026-07-26 during REQ-UI-042)

> ✅ **Fixed upstream, in 2.1.4 and 2.1.5** — the trigger shows the matching item's `Text` on first paint (items register their text before the list opens, 2.1.4; measured live 2026-10-07: a `Select` seeded with `"0"` reads `-- Select Category --`). A value no item carries now shows the placeholder instead of the raw value (2.1.5). Drop the `DisplayTextSelector` call-backs after upgrading if they only repeat the items' text.

- **Severity:** minor (cosmetic, but it leaks internal identifiers into the UI); raised 2026-07-31 to a **localization defect** (see Detail)
- **Blocks:** no — the app uses `DisplayTextSelector` where it matters, and the work carried on.
- **Repro:** bind `<Select @bind-Value="kind" TValue="string">` with `kind` initialised in `OnInitializedAsync` to `"LocalSocket"`, and declare `<SelectItem Value="@("LocalSocket")" Text="Local socket" TValue="string">Local socket</SelectItem>`.
- **Expected:** the trigger renders `Local socket` — the item's `Text`/`ChildContent` — as it does after the user picks an option by hand.
- **Actual:** the trigger renders the raw bound value `LocalSocket` on first paint, while the open list shows `Local socket` — the state every user sees on first paint.
- **Encountered in:** `apps/TechieDesk/Components/Pages/QdrantAdmin.razor` (REQ-UI-042 / REQ-FN-040, BRD-134), 2026-07-26; 7 localized sites 2026-07-31; `WorkspaceFlows.razor` 2026-08-01.
- **Workaround:** first label-as-value (no longer usable once localized), now `Select`'s `DisplayTextSelector` per site (see Detail).
- **Suggested fix:** resolve the trigger's display text from the registered `SelectItem` whose `Value` equals the current `Value`, re-resolving when items register (items are registered after the parent's first render, which is why the seeded value loses).

#### Detail

- **Evidence:** first smoke screenshot of `/qdrant-admin` showed `LocalSocket` in the trigger while the open list showed `Local socket`. Picking an option by hand then displays the correct `Text`, so the mismatch only affects the programmatically-seeded initial value — which is the state every user sees on first paint.
- **Original workaround (applied):** made the option *values* the human labels (`"Local socket"`, `"Network host"`, `"Remote (TCP + TLS)"`) and mapped them back to the enum in the page. Ugly — the wire value is now display text — but it renders correctly at first paint.

#### Amended 2026-07-31 (REQ-UI-050) — severity raised from cosmetic to **localization defect**

TR-024 was filed as "leaks internal identifiers into the UI", and the applied workaround was to make the option **values** the human labels. Once the app is localized that workaround stops working, and the underlying bug stops being cosmetic.

- **Repro (new):** a `<SelectItem Value="@("Cosine")" Text="@Localizer["QdrantDistanceCosine"]">` whose `Value` must stay the API constant Qdrant expects. The list renders the Hindi text; the trigger renders `Cosine`.
- **Why the workaround cannot be reapplied:** making the value the label means sending a *translated* string on the wire — a Hindi user would post `कोसाइन` as the Qdrant distance metric, or `मेल सर्वर (IMAP)` as a connector's mail-source discriminator. The value and the label are now necessarily different strings, which is exactly the case TR-024 gets wrong.
- **Encountered in:** 7 sites across `QdrantAdmin.razor` (3 distance metrics), `ConnectorEdit.razor` (2 mail sources), `WorkspaceAgents.razor` (1), `Support.razor` (1), 2026-07-31.
- **Symptom in the shipped app:** on first paint of a Hindi window, those seven triggers show English while their open lists show Hindi. Picking an option by hand corrects it, so it is first-paint only — but first paint is the state every user sees.
- **Workaround:** none applied. Reverting to label-as-value is not available (see above), so this is accepted and visible until the library fixes it. **This is the one thing on the six converted pages that a Hindi screenshot will legitimately show as English.**
- **Suggested fix:** unchanged from TR-024 — resolve the trigger's display text from the registered `SelectItem` whose `Value` equals the current `Value`, re-resolving when items register.

#### Confirmed workaround 2026-08-01 (`*build-phase`, REQ-UI-040 flow builder) — `DisplayTextSelector` fixes the first-paint trigger, and it is the only fix available to a localized app

The 2026-07-31 amendment recorded "workaround: none applied" and concluded that seven triggers would
legitimately render English on a Hindi window. `Select` **does** carry a `DisplayTextSelector`
parameter — `WorkspaceAgents.razor` was already using it for the model picker — and it is exactly the
seam TR-024 needs.

- **Repro of the bug, from this pass:** a start-step picker whose values are node identifiers rendered
  its trigger as `agent-e5e018887f5f4f63b2` on first paint, with the open list correctly reading
  `Agent` / `End`. Photographed on the Catalyst head, 2026-08-01.
- **Fix applied:** `DisplayTextSelector="StepTextFor"`, where `StepTextFor(string nodeId)` returns the
  step's display name. Same trigger now reads `End`. Nine sites in `WorkspaceFlows.razor` use it
  (step pickers ×4, agent picker, handoff mode, condition operator, condition source, link ends).
- **Why this does not close TR-024:** it is a per-site opt-in with a per-site callback, so it fixes the
  screens somebody remembers to write it on. Every `Select` still renders its raw value by default,
  which is the wrong default for a localized product — the library already knows the registered
  `SelectItem` whose `Value` matches and should use its `Text`. **Severity unchanged; the suggested
  fix is unchanged.** What changes is the guidance: the seven sites named in the 2026-07-31 amendment
  are fixable today with `DisplayTextSelector` and should be, rather than waiting for the library.

### TR-025 — `Textarea` truncates fast input on Blazor Server: `value` is always re-rendered and the bind event is not configurable (major, found 2026-07-26 during REQ-UI-044)

> ✅ **Fixed upstream, in 2.1.4** — `Textarea` and `Input` render their value through a sync that never writes a stale echo back over newer typing, and take `DebounceMilliseconds` to cut the per-keystroke round trips. Drop `composer.js` after upgrading and re-run your fast-typing spec.

- **Severity:** major (silent data loss in the user's own typing)
- **Blocks:** no — `wwwroot/js/composer.js` guards the composer's `value`, and the work carried on.
- **Repro:** put `<Textarea @bind-Value="text" />` on a Blazor **Server** page and type into it faster than the circuit round-trips (Playwright `keyboard.type` with no delay reproduces it every run).
- **Expected:** what the user typed. A late echo carrying a stale, shorter value must not overwrite characters typed since.
- **Actual:** the echo lands after later keystrokes and truncates them: typing `first line` arrived as `ft line`. Reproduced on Chromium via `tests/verify/req-ui-044-composer.spec.ts`.
- **Encountered in:** `apps/TechieDesk/Components/Pages/WorkspaceChat.razor` (REQ-UI-044 / BRD-137), 2026-07-26.
- **Workaround:** (applied) `apps/TechieDesk/wwwroot/js/composer.js` drops a stale echo that is a strict prefix of the live value while the element has focus (details below).
- **Suggested fix:** (1) give `Textarea`/`Input` a `BindEvent`/`UpdateOn` parameter (`oninput` | `onchange` | debounce ms); (2) skip emitting `value` when the incoming parameter equals the component's own last-known value, so a stale server render cannot clobber the DOM.

#### Detail

- **Repro, in full:** a fast typist or type-immediately-after-paste reproduces it by hand. `Textarea` hardcodes `oninput` for its binding and unconditionally emits `value` in `BuildRenderTree`, so every keystroke round-trips and the server's echo is patched back onto the element.
- **Actual, in full:** observed in the workspace chat composer: typing `first line` arrived as `ft line` — the render carrying `"f"` overwrote the DOM after `firs` had been typed.
- **Workaround, in full:** `apps/TechieDesk/wwwroot/js/composer.js` redefines the `value` property on that one element and drops a programmatic write that is a strict *prefix* of the live value while the element has focus (a stale echo is always a prefix); the app's own writes go through the captured raw setter. It also suppresses the in-flight echo for one turn after the composer is cleared on send, or the sent question reappears in the box.
- **Suggested fix, in full:** (1) so a consumer can stop the per-keystroke round-trip; (2) the fix Blazor's own `InputTextArea` needs and that every chat-style composer on Blazor Server hits.

### TR-026 — `Textarea` has no `Rows` / auto-grow / max-rows support, so a chat composer needs JS (nice-to-have, found 2026-07-26 during REQ-UI-044)

> ✅ **Fixed upstream 2026-10-07, in 2.1.5** — `Textarea Rows="3" MaxRows="12"`: starts at three lines, grows with its content, scrolls past twelve. Growth is CSS `field-sizing: content` (Chromium 123+, Safari 18); in WKWebView without it the box stays at `Rows`, so keep your JS auto-grow on the Catalyst head until that engine supports it.

- **Severity:** nice-to-have
- **Blocks:** no — CSS in `base.css` plus a JS auto-grow give the composer its cap, and the work carried on.
- **Repro:** build the composer BRD-137 specifies — "grows to roughly 12 lines, then scrolls". `Textarea` exposes no `Rows`, no `MinRows`/`MaxRows`, and no auto-grow.
- **Expected:** `Rows`/`MinRows`/`MaxRows` parameters (or an `AutoGrow` flag) that grow the box with its content up to a cap and then scroll, working in every browser rather than only Chromium 123+.
- **Actual:** `rows` only reaches the element because `AdditionalAttributes` captures it, and the cap has to be added by the consumer. Sizing utilities passed via `Class` are silently inert (prebuilt Tailwind bundle, no JIT — same root cause as TR-004).
- **Encountered in:** `apps/TechieDesk/Components/Pages/WorkspaceChat.razor` (REQ-UI-044 / BRD-137), 2026-07-26.
- **Workaround:** (applied) real CSS declarations under `.td-composer-input` in `apps/TechieDesk/wwwroot/styles/base.css` (which loads after `trblazeui.css`, so it beats `min-h-16`), plus a JS auto-grow in `wwwroot/js/composer.js` that reads its cap back from the stylesheet's `max-height`.
- **Suggested fix:** add `Rows`/`MinRows`/`MaxRows`/`AutoGrow` to `Textarea` and implement the growth in the component (JS-free where `field-sizing` is available, with a scroll-height fallback otherwise).

#### Detail

- Its base classes carry `field-sizing-content` + `min-h-16`, which grows without any cap and is unsupported in WKWebView (the MAUI head this app is moving to).
- Sizing utilities cannot be passed via `Class` either: the shipped CSS is a prebuilt Tailwind bundle with no JIT, so arbitrary values such as `min-h-[84px] max-h-[272px]` are never emitted and are silently inert (the same root cause as TR-004). The composer this replaced carried exactly those two classes and had no effect from either.

### TR-027 — `BadgeVariant` has no success/warning/info tone, so a status badge cannot be green or amber (minor, found 2026-07-26 during REQ-UI-041)

> ✅ **Fixed upstream, in 2.1.4** — `BadgeVariant.Success`, `Info`, `Warning` (2.0.6) and `Danger` (2.1.3), on the same tokens as `AlertVariant`.

- **Severity:** minor (semantic colour is lost from every status badge)
- **Blocks:** no — outline and destructive badges were used, and the work carried on.
- **Repro:** render a health badge — `<Badge Variant="BadgeVariant.Success">Healthy</Badge>`. No such member. `BadgeVariant` exposes exactly four: `Default`, `Secondary`, `Destructive`, `Outline`.
- **Expected:** the same tonal family `AlertVariant` already has — `Success`, `Warning`, `Info`, `Danger` — so a badge can carry the meaning its text claims.
- **Actual:** "Healthy" can only be rendered in the neutral outline tone or in the destructive tone; the green `Healthy` and violet `Location` badges in `docs/mockups/data-storage.html` cannot be expressed.
- **Encountered in:** `apps/TechieDesk/Components/Pages/DataStorage.razor` (REQ-UI-041 / BRD-133), 2026-07-26.
- **Workaround:** (applied) `BadgeVariant.Outline` for the healthy state and `BadgeVariant.Destructive` for the missing state. The distinction survives (outline vs. red) but the positive state reads as neutral rather than as good.
- **Suggested fix:** add `Success`, `Warning` and `Info` to `BadgeVariant` with the tokens `AlertVariant` already uses, so the three variant enums line up and a status badge means what it says.

#### Detail

- The three families (`AlertVariant`, `BadgeVariant`, `ToastVariant`) currently disagree with each other; see TR-023 for the `ToastVariant` half of the same problem.
- `docs/mockups/data-storage.html` specifies a green `Healthy` badge beside a violet `Location` badge; neither colour is expressible. The Tailwind escape hatch does not work either — the shipped CSS is a prebuilt bundle with no JIT, so `Class="bg-emerald-100 text-emerald-700"` is silently inert (same root cause as TR-004).
- The neutral reading of the healthy state loses exactly the tone the mockup uses to say "nothing is wrong here".

### TR-028 — no plain `Table` primitive; a static, non-paginated table must be built out of the generic `DataTable` (minor, found 2026-07-27 during REQ-RAG-016/017/018)

> ✅ **Fixed upstream 2026-10-07, in 2.1.5** — `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` in `TrBlazeUI.Components.Table`, styled like `DataTable`, inside their own scroll container. Import the namespace in the page, not globally.

- **Severity:** minor (works, but the ceremony is disproportionate and it drags in machinery the screen does not want)
- **Blocks:** no — a `DataTable` with toolbar and pagination switched off was used, and the work carried on.
- **Repro:** render a fixed, already-ordered result list as a table — the Jobs table `docs/mockups/connectors.html` draws. TrBlazeUI ships no `Table`/`TableHeader`/`TableRow`/`TableCell`; the only table is `DataTable`.
- **Expected:** a headless-ish `Table` family (`Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`) for tables that are just markup, with `DataTable` reserved for the sortable/filterable/paged case — which is how shadcn/ui splits it.
- **Actual:** a four-column table needs a purpose-built record type, four `Property` lambdas that exist only to satisfy the generic constraint, and `ShowToolbar="false" ShowPagination="false"`. It also inherits TR-004.
- **Encountered in:** `apps/TechieDesk/Components/Pages/AddFromWeb.razor` (REQ-RAG-016/017/018 / BRD-60/61/62), 2026-07-27.
- **Workaround:** (applied) `DataTable TData="ResultRow"` with the toolbar and pagination disabled, a private `ResultRow` record, and the scroll wrapper added by hand. Behaviour is correct; only the amount of scaffolding is wrong.
- **Suggested fix:** ship the shadcn `Table` sub-component family, and/or let `DataTableColumn` omit `Property` when a `CellTemplate` is supplied.

#### Detail

- **Repro, in full:** the shape every shadcn/ui consumer gets from `Table` / `TableHeader` / `TableRow` / `TableCell`. `DataTable` is generic over `TData`, requires one `DataTableColumn TData="…" TValue="…" Property="@(row => …)"` per column even when the cell is a `CellTemplate` that never reads the property, and defaults to a toolbar + pagination that must both be switched off.
- **Actual, in full:** a four-column, N-row result table — three of the four `Property` lambdas are `row => row.Xxx` for a value the `CellTemplate` renders itself. It also inherits TR-004: the consumer still has to supply the `relative overflow-x-auto` wrapper.

### TR-029 — `Progress` has no indeterminate state, so "the total is not known yet" cannot be drawn (minor, found 2026-07-28 during REQ-FN-020)

> ✅ **Fixed upstream, in 2.1.4** — `Progress Indeterminate="true"` (2.0.9) sweeps without claiming a percentage and omits `aria-valuenow`.

- **Severity:** minor (but it pushes consumers toward inventing a percentage, which is the dishonest option)
- **Blocks:** no — the bar is hidden until a real percentage exists, and the work carried on.
- **Repro:** `<Progress Value="@percent" />` where `percent` is `double?` and the job's total is not known yet. `Value` is a non-nullable `double` defaulting to `0`, with no `Indeterminate` flag.
- **Expected:** either `Value` as `double?` (null ⇒ indeterminate) or an `Indeterminate="true"` parameter that renders the usual sweeping/striped bar.
- **Actual:** `Value="0"` renders an *empty* bar, which reads as "nothing has happened" — the opposite of the truth for a job that is actively walking a source.
- **Encountered in:** `apps/TechieDesk/Components/Pages/ConnectorsHub.razor` (REQ-FN-020 / BRD-65), 2026-07-28.
- **Workaround:** (applied) the bar is not rendered at all while `PercentComplete` is null; the live counters and the status line carry the state instead, with an explicit "Nothing listed yet, so there is no percentage to show." The bar appears only once a real number exists.
- **Suggested fix:** add `Indeterminate` to `Progress` (or make `Value` nullable with null ⇒ indeterminate), and set `aria-valuenow` only when a value is present so assistive tech is told the same truth.

#### Detail

- **Repro, in full:** render progress for a job whose denominator is not known until it has listed something. The only expressible states are "0%" and "some number".
- **Expected, in full:** matching what every other progress control offers for "working, total unknown".
- **Actual, in full:** the alternative a consumer is nudged toward is to fabricate a total so the bar always has a number, which is exactly the failure `JobProgressSnapshot.PercentComplete` documents itself as avoiding ("Null rather than a guess. A progress bar that invents a percentage from an unknown total is a bar that jumps backwards, and a user learns within one run to stop believing it").

### TR-030 — `Alert.Icon` is not aligned with `AlertTitle`; the icon sits on its own line, overlapping the title (minor, found 2026-07-28 during REQ-FN-020)

> ✅ **Fixed upstream, in 2.1.4** — measured live on /components/alert on 2026-10-07: the icon's top equals the title's top, the title starts 12px right of the icon, no overlap. Use `<AlertIcon>` (or `<Icon>`), not `<Alert.Icon>`.

- **Severity:** minor (cosmetic, but it affects every alert in the app and reads as a broken layout)
- **Blocks:** no — left as-is deliberately; the work carried on.
- **Repro:** the documented pattern — `<Alert Variant="AlertVariant.Info"><Alert.Icon><LucideIcon Name="info" Size="16" /></Alert.Icon><AlertTitle>…</AlertTitle><AlertDescription>…</AlertDescription></Alert>`.
- **Expected:** what shadcn/ui's alert does — a two-column grid with the icon in a narrow left column and the title and description sharing the right column, the icon optically aligned to the title's first line.
- **Actual:** the icon renders *above and slightly left of* the title, on its own line, so its glyph overlaps the title's line box and the title/description block starts at the same x as the icon rather than beside it.
- **Encountered in:** `apps/TechieDesk/Components/Pages/ConnectorsHub.razor` (REQ-FN-020 / BRD-65), 2026-07-28. Present app-wide since alerts were first used.
- **Workaround:** none — it is legible, and the alternative (hand-building the alert out of divs) would lose the variant tokens. Left as-is deliberately rather than papered over per-page.
- **Suggested fix:** lay `Alert` out as `grid-cols-[auto_1fr]` with the icon in the first column spanning both rows, as shadcn/ui does, so the title starts beside the icon rather than beneath it.

#### Detail

- **Evidence:** reproduced on `/workspace/{slug}/connectors` at 1800 px and at 789 px, on the "Connector runs cannot be shown in this build" alert and the "No confluence space has been set up on this machine" alert; screenshots `test-results/connectors-06-hub-final.png` and `test-results/connectors-10-hub-narrow-final.png`. The repro pattern is verbatim from the reference.
- **Not a consumer override:** this app's `wwwroot/styles/theme.css` touches only the `--alert-*` colour tokens and defines no alert layout rule, and the same rendering appears on the pre-existing alerts in `AddFromWeb.razor`, so it is the shipped component's own grid.

### TR-031 — `AlertDialog` in controlled mode (`@bind-Open`) never renders its content; the dialog simply does not appear (major, found 2026-07-28 during REQ-RAG-019/020)

> ✅ **Fixed upstream, in 2.1.4** — a controlled `AlertDialog @bind-Open` opens from a button elsewhere on the page, with no trigger; measured live on /components/alert-dialog on 2026-10-07. Re-smoke the three confirmations named below after upgrading.

- **Severity:** major (the component is unusable for the confirm-before-destroy case it exists for, and it fails *silently* — no exception, no console error, nothing in the log)
- **Blocks:** no — the confirmation was rebuilt inline in the row, and the work carried on.
- **Repro:** the documented controlled-mode pattern, `<AlertDialog @bind-Open="isDeleteOpen">`, with no `AlertDialogTrigger`, opened from a row's own button (full snippet under Detail).
- **Expected:** pressing the button opens the alert dialog, as `Dialog`/`Sheet` do from a controlled `Open`.
- **Actual:** nothing renders, although a live probe showed the bound field was `true`. Not the portal, and not TR-001: toasts render through `PortalHost` on the same page.
- **Encountered in:** `apps/TechieDesk/Components/Pages/ConnectorsHub.razor` (REQ-RAG-019/020 / BRD-63/64), 2026-07-28. The same pattern is in `Automations.razor:580` and `Billing.razor:335,370` — **very likely dead too; re-smoke them.**
- **Workaround:** (applied) an inline danger `Alert` plus a `Yes, delete the connector` / `Keep it` button pair inside the connector's own row; live-proven end to end.
- **Suggested fix:** make `AlertDialog` mount its content from `Open` alone, independently of whether an `AlertDialogTrigger` is present (as `Dialog` does), and — until then — emit a development-mode warning when `Open` is set true with no trigger, so this fails loudly instead of silently.

#### Detail

- **Repro snippet** — a delete confirmation opened from a row's own button:
  ```razor
  <Button OnClick="@(() => { pendingDelete = row; isDeleteOpen = true; })">Delete</Button>
  ...
  <AlertDialog @bind-Open="isDeleteOpen">
      <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete "@pendingDelete?.Name"?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction OnClick="DeleteConfirmedAsync">Delete</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
  </AlertDialog>
  ```
- **Actual, in full:** nothing renders. **Proven live, not inferred:** a temporary probe `<p>DELETE-STATE: @isDeleteOpen / @(pendingDelete?.DisplayName ?? "none")</p>` placed immediately above the `<AlertDialog>` rendered `DELETE-STATE: True / Spoon-Knife (smoke)` on the running app — so the click handler ran, the bound field was `true`, and the component still emitted no content. Evidence: `test-results/connectors-w3-18-tr031-alertdialog-does-not-open.png` (Delete pressed, no dialog anywhere on the page) and `test-results/connectors-w3-18b-tr031-probe-open-is-true.png` (the probe reading `DELETE-STATE: True / Spoon-Knife (smoke)` at the foot of that same page).
- **Not the portal, and not TR-001:** in the same app instance, on the same page, `ToastService` toasts render correctly through `PortalHost` (`test-results/connectors-w3-21-after-delete.png` shows the "Connector deleted" toast), and the app is globally interactive. Whatever `AlertDialog` needs, it is not the portal being unavailable.
- **Suspected cause:** `AlertDialog` appears to mount its portal/overlay only via `AlertDialogTrigger`. A controlled dialog opened from a button elsewhere on the page has no trigger, so nothing is ever mounted for the `Open` state to reveal. If that is the design, controlled mode is not usable without a hidden trigger and the reference should say so.
- **Encountered in, in full:** the same pattern is already written into `apps/TechieDesk/Components/Pages/Automations.razor:580` and `apps/TechieDesk/Components/Pages/Billing.razor:335,370` — **those three confirmations are very likely dead in the shipped app too and should be re-smoked.**
- **Workaround, in full:** the confirmation was rebuilt as an inline block inside the connector's own row — a danger `Alert` stating the consequence plus a `Yes, delete the connector` / `Keep it` button pair, gated on `pendingDelete?.ConnectorId == saved.ConnectorId`. Live-proven end to end: the connector and its stored token were deleted and the row disappeared (`test-results/connectors-w3-20-delete-confirmation.png`, `test-results/connectors-w3-21-after-delete.png`). It is arguably better here — the confirmation stays attached to the row it is about — but it should not have been forced.

### TR-032 — `LucideIcon` does not resolve `lucide.json` **aliases**, so aliased icon names render as literal `Icon not found: {name}` text in the UI (major, found 2026-07-28 during `*verify all`)

> ✅ **Fixed upstream, in 2.1.4** — `LucideIcon` resolves all 212 Lucide aliases (2.0.6); an unknown name renders an empty, `aria-hidden` placeholder of the same size and logs once, never text.

- **Severity:** major (it is not a missing glyph — it prints raw diagnostic text *into the running UI*, where a user sees it. 30 instances across 20 files in this app alone.) Raised 2026-07-29 to an **accessibility** defect (see Detail).
- **Blocks:** no — the call sites were left as they are and the defect recorded; the work carried on.
- **Repro:** `<Alert.Icon><LucideIcon aria-hidden="true" Name="alert-circle" Size="16" /></Alert.Icon>` — an aliased Lucide name.
- **Expected:** the `circle-alert` glyph. `alert-circle` is Lucide's own long-standing alias for it, and the shipped icon pack **already contains the mapping**.
- **Actual:** the component emits the literal string `Icon not found: alert-circle` as visible text, and as the element's accessible label. Observed live on the Mac Catalyst head on `/qdrant-admin` and `/login`.
- **Encountered in:** app-wide — `QdrantAdmin.razor:125,325`, `Support.razor:112,222`, `AdminEvents.razor:35`, `AdminSettings.razor:51`, `WorkspaceAgents.razor:17,27` and 13 more. 2026-07-28.
- **Workaround:** (NOT applied — no source edits in a verify run) rename each call site to the canonical name (`alert-circle` → `circle-alert` etc.). Cheap, but it makes the app carry the library's bug and breaks if the alias direction ever flips.
- **Suggested fix:** on lookup miss, follow `aliases[name].parent` before giving up; never render a diagnostic string as user-visible content — fall back to an `aria-hidden` placeholder glyph with an empty accessible name and log the miss to the console.

#### Detail

- **Actual, in full:** observed live on the running Mac Catalyst head at 1800 px on `/qdrant-admin` (the "Docker daemon unreachable" alert) and on `/login` (the "No licence server is configured" alert) — evidence `.verify/shots/qdrant-admin.xml`, `.verify/shots/sign-in.xml`, screenshots alongside.
- **Root cause (confirmed in the shipped package, not inferred):** `trblazeui.icons.lucide/1.0.7/content/lucide.json` has **two** maps — `icons` (1,665 entries) and `aliases` (212 entries). `alert-circle` is absent from `icons` and present in `aliases` as `{"parent": "circle-alert"}`. The component evidently looks up `icons` only and never follows `aliases[name].parent`.
- **Every alias-only name used by this app** (checked all 74 distinct `LucideIcon Name=` values against both maps — all four resolve fine through `aliases`, none is genuinely missing):

  | Name used | Alias of | Usages | Files |
  |---|---|---|---|
  | `alert-circle` | `circle-alert` | 23 | 17 |
  | `check-circle` | `circle-check` | 5 | 5 |
  | `alert-triangle` | `triangle-alert` | 1 | 1 |
  | `more-horizontal` | `ellipsis` | 1 | 1 |

- **Suggested fix, as first filed:** on lookup miss, follow `aliases[name].parent` before giving up. Also: never render a diagnostic string as user-visible content — fall back to an empty/placeholder glyph and log the miss to the console instead, so a typo'd icon name can't leak developer text into a shipped UI.

#### Amended 2026-07-29 (`*build-phase`) — severity raised from cosmetic to **accessibility**

The `Icon not found: {name}` fallback is not merely visible text — it becomes the element's **accessible label**. Read from the live AX tree on `/login`: `<XCUIElementTypeGroup label="Icon not found: alert-circle, alert" x="734" y="629" width="20" height="21">`. Visually a fallback triangle renders, so a screenshot review *passes* it; a screen-reader user on the account-free banner hears *"Icon not found: alert-circle"*. **Add to the suggested fix:** the not-found fallback must render `aria-hidden` with an empty accessible name rather than emitting the diagnostic as text.

### TR-033 — `Progress` formats `aria-valuenow` with the **current culture**, emitting an invalid ARIA number in any comma-decimal locale (major, found 2026-07-29 during `*build-phase`)

> ✅ **Fixed upstream, in 2.1.4 and 2.1.5** — `Progress` writes `aria-valuenow` invariantly since 2.0.9; `NumericInput` and `Slider` do the same from 2.1.5. Drop the `Math.Round` call-site workaround after upgrading.

- **Severity:** major (critical axe violation `aria-valid-attr-value`, WCAG 4.1.2; it fires in *any* localized build of *any* consumer, so every library user shipping a non-English locale is affected).
- **Blocks:** no — every call site rounds its value, and the work carried on.
- **Repro:** run the host with UI language = German (or any comma-decimal culture) and render `<Progress Value="0.0003876" />` — e.g. `/settings/data` with a nearly-empty volume.
- **Expected:** `aria-valuenow="0.0003876"` — ARIA numeric attributes are invariant-formatted by specification.
- **Actual:** `aria-valuenow="0,0003876151543899885"`. A comma is not a valid ARIA numeric value, so assistive tech cannot parse the progress value and axe reports a critical violation. **Observed live** on `/settings/data` during the in-app axe sweep, with the app's UI language set to `de`.
- **Encountered in:** `apps/TechieDesk/Components/Pages/DataStorage.razor:90`, 2026-07-29 (REQ-NFR-005). `Slider` almost certainly shares the bug — it emits `aria-valuenow`/`valuemin`/`valuemax` the same way.
- **Workaround:** (applied) every `<Progress>` call site now passes `Math.Round(...)`, so the value is always integral and formats identically in every culture. **This is a workaround, not a fix** — it costs sub-percent precision and only holds while every caller remembers to round.
- **Suggested fix:** format all ARIA numeric attributes with `CultureInfo.InvariantCulture` (`Value.ToString(CultureInfo.InvariantCulture)`) in `Progress`, `Slider`, and anything else emitting `aria-valuenow`/`valuemin`/`valuemax`.

#### Detail

- After the workaround, the node is gone from the final sweep.

### TR-034 — `NumericInput<T>` emits range ARIA attributes on a plain text input and exposes no attribute splat, so the resulting violation is unfixable from app code (major, found 2026-07-29 during `*build-phase`)

> ✅ **Fixed upstream 2026-10-07, in 2.1.5** — the input is `role="spinbutton"` whether or not `ShowButtons` is set (confirmed live on 2.1.4 that only the buttoned one carried the role), and the component splats unmatched attributes since 2.0.3.

- **Severity:** major (critical axe violation `aria-allowed-attr`, WCAG 4.1.2, with **no app-side workaround** — the two properties compound).
- **Blocks:** no — the violation was left unfixed and recorded, and the work carried on.
- **Repro:** `<NumericInput TValue="int" @bind-Value="x" Min="1" Max="2048" Step="1" Id="defaults-upload" />` and inspect the rendered element.
- **Expected:** either the element carries a role that permits range attributes (`role="spinbutton"`), or it does not emit them.
- **Actual:** it renders `<input type="text" inputmode="numeric">` carrying `aria-valuemin="1" aria-valuemax="2048" aria-valuenow="50"`. Those three attributes are only allowed on a range widget role; on a plain text input they are invalid.
- **Encountered in:** `apps/TechieDesk/Components/Pages/AdminSettings.razor:167` (`#defaults-upload`), 2026-07-29 (REQ-NFR-005). **This is the single remaining WCAG A/AA violation in the whole 30-route app.**
- **Workaround:** none exists. Left unfixed and recorded rather than churned.
- **Suggested fix:** add `role="spinbutton"` to the rendered input (which legitimises the attributes it already emits), and give the component `AdditionalAttributes` so consumers can repair ARIA themselves.

#### Detail

- **Why it cannot be repaired app-side (reflection-verified against `TrBlazeUI.Components` 1.0.7):** `NumericInput<T>` has **no** `[Parameter(CaptureUnmatchedValues = true)]`. Its full parameter surface is `Value, ValueChanged, Min, Max, Step, DecimalPlaces, AllowNegative, ShowButtons, Placeholder, Disabled, Required, Class, Id, AriaLabel, AriaDescribedBy, AriaInvalid, Format`. So `role="spinbutton"` **cannot** be splatted on — attempting it throws `ComponentProperties.ThrowForUnknownIncomingParameterName` at runtime and dead-circuits the screen (the same failure mode as TR-022/TR-035). The obvious fix is therefore actively harmful to attempt.

### TR-035 — the **styled** `Tabs` family drops `AdditionalAttributes` that its own primitives declare, so any splatted attribute kills the circuit (major, found 2026-07-29 during `*build-phase`)

> ✅ **Fixed upstream, in 2.1.4** — the styled `Tabs`, `TabsList`, `TabsTrigger` and `TabsContent` splat unmatched attributes; the demo's triggers carry their own `data-testid`.

- **Severity:** major (silent dead-circuit at runtime; second component family found with this exact gap after TR-022 on `Alert`).
- **Blocks:** no — triggers are targeted by accessible label and `?tab=` instead, and the work carried on.
- **Repro:** `<TabsTrigger Value="branding" id="td-tab-branding">Branding</TabsTrigger>`, or any `aria-*`/`data-*`/`id` on `<TabsList>` or `<TabsContent>`.
- **Expected:** the attribute lands, as the TrBlazeUI agent guidance promises for every component; the **primitives** underneath do declare `AdditionalAttributes`.
- **Actual:** the styled wrappers do not, so any splatted attribute throws `ThrowForUnknownIncomingParameterName` at runtime, and a tab strip **cannot be given stable automation ids or an `aria-label`** from app code.
- **Encountered in:** `apps/TechieDesk/Components/Pages/AdminSettings.razor` while trying to give the three triggers stable ids for a smoke run, 2026-07-29.
- **Workaround:** (applied) do not splat onto the styled Tabs family; target triggers by accessible label instead (`XCUIElementTypeTab[label == "…"]`), and reach a specific tab via the app's own `?tab=` query parameter, which is widget-independent.
- **Suggested fix:** add `[Parameter(CaptureUnmatchedValues = true)] Dictionary<string, object>? AdditionalAttributes` to the styled `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` and forward to the primitive — and run the catalogue-wide sweep TR-022 already proposed.

#### Detail

- **Expected, in full:** per the TrBlazeUI agent guidance — *"All components support CaptureUnmatchedValues — arbitrary HTML attributes (id, style, data-*, aria-*) can be passed directly to any component."* The **primitives do**: `TrBlazeUI.Primitives.Tabs`, `TabsList`, `TabsTrigger` and `TabsContent` all declare `AdditionalAttributes`.
- **Actual (reflection-verified against 1.0.7):** the styled wrappers do not. `TabsTrigger` exposes only `Value, Disabled, ChildContent, Class`; `TabsList` only `ChildContent, Class`; `TabsContent` only `Value, ForceMount, ChildContent, Class`. Only the styled `Tabs` root has a splat. So any splatted attribute throws `ThrowForUnknownIncomingParameterName` at runtime. It also means a tab strip **cannot be given stable automation ids or an `aria-label`** from app code even though the primitive underneath supports both.
- **Suggested fix, in full:** run the sweep since this is now the second family with the same gap and the same symptom.

### TR-036 — `TabsTrigger` emits `aria-selected` as a **bool**, so inactive tabs get no `aria-selected` attribute at all (minor/accessibility, found 2026-07-29 during `*build-phase`)

> ✅ **Fixed upstream, in 2.1.4** — `aria-selected` is the string `"true"` or `"false"` on every trigger; measured live on 2026-10-07.

- **Severity:** minor (WAI-ARIA 1.2 tabs-pattern violation; not app-fixable, since the styled `TabsTrigger` has no splat — see TR-035).
- **Blocks:** no — nothing app-side can fix it, so it was recorded and the work carried on.
- **Repro:** render any `<Tabs>` with three `<TabsTrigger>`s and inspect the DOM of the two inactive ones.
- **Expected:** `role="tab"` requires `aria-selected` on **every** tab; inactive tabs must carry `aria-selected="false"`.
- **Actual:** (decompiled from `TrBlazeUI.Primitives` 1.0.7) the attribute is emitted as `__builder.AddAttribute(4, "aria-selected", objIsSelected)` with a **bool** value. Blazor treats a bool attribute value as a presence flag, so the active tab gets a valueless `aria-selected` and the inactive tabs get **no `aria-selected` attribute at all**.
- **Encountered in:** read while diagnosing TR-008 against `apps/TechieDesk/Components/Pages/AdminSettings.razor`, 2026-07-29.
- **Workaround:** none available app-side (no splat on the styled trigger).
- **Suggested fix:** emit the string form — `AddAttribute(4, "aria-selected", objIsSelected ? "true" : "false")`. Belongs with TR-008's `aria-controls` bullet: same component, same audit.

### TR-037 — `TrBlazeUI.Components` 1.0.7 pins a **vulnerable** `AngleSharp 0.17.1` transitively, so every consumer must add a manual package override to build clean (major, found 2026-07-30 during `*build-phase`)

> ✅ **Fixed upstream, in 2.1.4 and 2.1.5** — 2.0.x onward depends on `HtmlSanitizer 9.1.949-beta`, which already pulls the patched AngleSharp; 2.1.5 moves to the stable `9.1.982`. Drop the app-side pin after upgrading.

- **Severity:** major (a published security advisory reaches every consumer through the library's own dependency graph, and no consumer can fix it without editing their `.csproj`).
- **Blocks:** no — the app pins `HtmlSanitizer 9.1.973` directly, and the work carried on.
- **Repro:** reference `TrBlazeUI.Components` 1.0.7 from any project and run `dotnet list package --vulnerable --include-transitive`.
- **Expected:** the library's transitive graph carries no package with an open advisory.
- **Actual:** `TrBlazeUI.Components 1.0.7 → HtmlSanitizer 9.0.892 → AngleSharp [0.17.1]` — an **exact** pin, so NuGet cannot resolve forward. AngleSharp 0.17.1 carries GHSA-pgww-w46g-26qg, which surfaced as NU1902 in TechieDesk.
- **Encountered in:** `apps/TechieDesk/TechieDesk.csproj`, originally 2026-07-20 (REQ-NFR-004), re-confirmed and resolved app-side 2026-07-30.
- **Workaround:** (applied) TechieDesk pins `HtmlSanitizer 9.1.973` directly, which resolves `AngleSharp 1.6.0` + `AngleSharp.Css 1.0.0`. ⚠ The rule is `>= 9.1.973`, **not** "latest stable" (see Detail).
- **Suggested fix:** raise TrBlazeUI's floor to `HtmlSanitizer >= 9.1.973`. Until then every consumer inherits an advisory they did not choose.

#### Detail

- **Workaround, in full:** `AngleSharp 1.6.0` + `AngleSharp.Css 1.0.0` are **both stable as of 2026-07-30**, so the consumer no longer ships pre-release packages either. ⚠ **Trap for anyone repeating this:** `HtmlSanitizer 9.0.967` is also stable but reverts to the vulnerable `AngleSharp [0.17.1]` exact pin. The correct rule is `>= 9.1.973`, **not** "latest stable". Runtime-verified rather than assumed: TrBlazeUI 1.0.7 was compiled against AngleSharp 0.17.1 and is now bound against 1.6.0 — a major-version jump whose failure mode is a load-time `TypeLoadException`, invisible to the compiler — and all 744 TrBlazeUI types load clean with both `Ganss.Xss` member signatures resolving and sanitization behaviour intact.
- ⚠ **Bookkeeping note:** the TechieDesk checklist cited this issue as **"TR-009"** on `REQ-NFR-004`. **No TR-009 entry has ever existed in this file** — the ID was a phantom and the gap went formally unlogged from 2026-07-20 to 2026-07-30. It is recorded here as TR-037; re-cite it.

### TR-008 — AMENDED: three specific claims are false, and the "Branding tab is unreachable" symptom was a harness artefact

> ✅ **Fixed upstream, in 2.1.4 and 2.1.5** — `Slider` and `FileUpload` splat unmatched attributes and take `AriaLabel`; `LucideIcon` is `aria-hidden` unless named (2.1.4). `CardTitle` and `AlertTitle` take `As` for the heading level (2.1.5). `Pagination`'s list markup was not re-checked here; say if it still fails `list`.

- **Severity:** not recorded in this file (the original TR-008 report is not in it); what remains confirmed is a set of accessibility gaps in `Slider`, `FileUpload`, `CardTitle`/`AlertTitle` and `LucideIcon`.
- **Blocks:** no — the 9 unnameable comboboxes were fixed with a raw `aria-label`, the rest is recorded, and the work carried on.
- **Repro:** re-tested by reflection over the shipped 1.0.7 assemblies, a live axe run against a probe app (net10.0 Blazor Server + TrBlazeUI.Components 1.0.7), and live Appium/mac2 probing of the Catalyst head.
- **Expected:** the earlier TR-008 claims hold.
- **Actual:** three are false — `SelectTrigger` can be named with a raw `aria-label`; `FieldLabel` has `For`; `Progress` forwards `aria-label` — and the "Branding tab is unreachable" symptom was a harness gap. Still open: `Slider` and `FileUpload` are unnameable, `CardTitle`/`AlertTitle` hardcode heading levels, `LucideIcon` emits an unnamed `role="img"`.
- **Encountered in:** `*build-phase` 2026-07-29 (`/admin/settings`, REQ-UI-037/038/039); clarified 2026-08-01 (REQ-UI-050 tranche 3).
- **Workaround:** raw lowercase `aria-label` on components that splat; none for `Slider`, `FileUpload`, heading levels.
- **Suggested fix:** correct the TR-008 record upstream, then give `Slider` and `FileUpload` `AdditionalAttributes` (or `AriaLabel`); make `LucideIcon` `aria-hidden` by default with an opt-in `Label`; fix `Pagination` so the `<ul>` contains only `<li>` and the rows-per-page select is labelled; give `CardTitle`/`AlertTitle` a `Level`/`As` parameter.

#### Detail

From the 2026-07-29 `*build-phase` amendments: three previously-recorded findings were **re-tested this phase and are partly wrong**. The corrections are recorded with each entry; the originals are left intact for history.

Re-tested by reflection over the shipped 1.0.7 assemblies **plus** a live axe run against a purpose-built probe app (net10.0 Blazor Server + TrBlazeUI.Components 1.0.7), and by live Appium/mac2 probing of the running Catalyst head.

- **FALSE — "6 critical unnameable `Select` triggers; `SelectTrigger` silently ignores `AriaLabel`, and `role=combobox` is `nameFrom:author`, so they are unnameable from app code."** `SelectTrigger<T>` **has** `[Parameter(CaptureUnmatchedValues = true)] AdditionalAttributes`, and a raw `aria-label="…"` attribute lands directly on the rendered `<button role="combobox">`. Verified in the probe DOM and by axe (the labelled trigger passes `button-name`, the bare one fails); `aria-labelledby` works too. **The original diagnosis confused the ATTRIBUTE with a PARAMETER:** `AriaLabel="x"` is not a parameter on `SelectTrigger`, so Blazor splatted it verbatim as `arialabel="x"` — which is not an ARIA attribute. Hence "compiles, runs, never emitted". All 9 unnameable app comboboxes were fixed this way.
- **FALSE — "`FieldLabel` renders `<label>` with no `for` and no `For` parameter (98 sites app-wide)."** `FieldLabel` **has** a `For` parameter *and* `AdditionalAttributes`; `<FieldLabel For="x">` emits `<label for="x">`.
- **FALSE in effect — "`Progress` accepts `AriaLabel` but never forwards it."** `Progress` has no `AriaLabel` parameter but **does** have `AdditionalAttributes`, so `aria-label="…"` forwards correctly.
- **FALSE — "the `/admin/settings` Branding tab cannot be opened / is not exposed to assistive tech."** It is. WebKit maps `role="tab"` to AXRadioButton/AXTabButton, which XCUITest surfaces as **`XCUIElementTypeTab`** — a type the 2026-07-28 DevGuide probe never queried (it tried Button/Link/RadioButton/Other). `**/XCUIElementTypeTab[`label == "Branding"`]` returns exactly one enabled element; clicking it activates the tab and both panels render. **Three requirements (REQ-UI-037/038/039) were demoted on this harness gap, not on a product defect.**
- **CONFIRMED and still open:** `Slider` has neither `AriaLabel` nor `AdditionalAttributes` and is genuinely unnameable (wrapping it in `role=group aria-label` does **not** name it — tested, still fails `aria-input-field-name`). `FileUpload` has no splat and its `<input type=file>` gets a random GUID id; wrapping it in a `<label>` does **not** satisfy axe (tested). `CardTitle` hardcodes `<h3>` and `AlertTitle` `<h5>`, and `AlertTitle` has no splat at all, so a correct document outline is impossible — this is the whole of the 25 remaining `heading-order` nodes. `LucideIcon` emits `role="img"` unconditionally with no name.

#### Clarification 2026-08-01 (`*build-phase`, REQ-UI-050 tranche 3) — the five named components do not *throw* on an `AriaLabel` parameter; they silently no-op, and two of them do not need it

Recorded because the "these components THROW on `AriaLabel`" phrasing is circulating in build-phase task briefs and is not what the 1.0.7 assemblies do.

- Verified against `TrBlazeUI.Components.xml` 1.0.7 this pass:
  - `SelectTrigger<T>` — no `AriaLabel`, **has `AdditionalAttributes`** → a raw lowercase `aria-label` lands correctly. Not unnameable.
  - `Progress` — no `AriaLabel`, **has `AdditionalAttributes`** → same. Not unnameable.
  - `FieldLabel` — no `AriaLabel`, **has `AdditionalAttributes`** and `For` → same.
  - `FileUpload` — no `AriaLabel` and **no `AdditionalAttributes`** → genuinely unnameable. Still open.
  - `Slider` — no public parameters documented at all → genuinely unnameable. Still open.
- An `AriaLabel="…"` written against any of the first three is splatted verbatim as the meaningless `arialabel="…"`: **no exception, no build warning, no accessible name.** The failure is silence, which is why it survives review.
- **Net:** the standing guidance ("write the raw `aria-label` attribute, never an `AriaLabel` parameter, on components that do not declare one") is correct and should be kept. Only the stated failure *mode* — throwing — is wrong, and describing it as a crash invites builders to believe a green run proves the name was emitted.

### TR-038 — `TrBlazeUI-AI-Reference.md`'s component parameter tables are materially incomplete, and the agents told to treat it as the source of truth misdiagnose the library because of it (major, found 2026-08-01)

> ✅ **Fixed upstream 2026-10-07 (documentation)** — the reference now states that every component takes unmatched attributes and `Class`, that the tables list only what a component adds, how to tell `AriaLabel` the parameter from `aria-label` the attribute, and that the packaged `TrBlazeUI.Components.xml` is the complete parameter list. The tables are still written by hand.

- **Severity:** major. A *documentation* defect with a *code-quality* blast radius: the `trblazeui` skill tells every generating agent to load and obey the reference, so an omission in it propagates into whatever those agents write next.
- **Blocks:** no — the real parameter surface was checked against the shipped XML docs, and the work carried on.
- **Repro:** open `.trblazeui/TrBlazeUI-AI-Reference.md`, read the parameter table for `Input` (§5). Then read `P:TrBlazeUI.Components.Input.Input.*` out of the shipped `TrBlazeUI.Components.xml` in the 1.0.7 package.
- **Expected:** the table lists the component's public parameters.
- **Actual:** `Input`, `Textarea` and `DataTable<T>` tables omit `AriaLabel` and `AdditionalAttributes`, among others (full table under Detail); `AdditionalAttributes` is absent from essentially every table.
- **Encountered in:** REQ-UI-050 tranche 3, 2026-08-01 — five of ten agents localizing pages concurrently misdiagnosed working `AriaLabel` sites.
- **Workaround:** (applied) verified the real parameter surface against the shipped `TrBlazeUI.Components.xml` rather than the reference, and left all 49 sites as they were.
- **Suggested fix:** generate the reference's parameter tables **from the XML docs** instead of maintaining them by hand. A hand-written API table for a 744-type library is stale the day it is written, and this one is now wrong in a way that specifically misleads on accessibility.

#### Detail

- **Actual (1.0.7 XML docs, read this pass):**

  | Component | Reference table says | Actually declares (additional) |
  |---|---|---|
  | `Input` | Type, Value, ValueChanged, Placeholder, Disabled, Required, Id, AriaInvalid, AriaDescribedBy, Class | **`AriaLabel`**, `AdditionalAttributes`, `CssClass`, `HtmlType` |
  | `Textarea` | Value, ValueChanged, Placeholder, MaxLength, Disabled, Required, Class | **`AriaLabel`**, `AdditionalAttributes`, `AriaInvalid`, `AriaDescribedBy`, `Id`, `CssClass` |
  | `DataTable<T>` | TData, Data, SelectionMode, ShowToolbar, ShowPagination, IsLoading, InitialPageSize, PageSizes, SelectedItems, Class | **`AriaLabel`**, `OnSort`, `OnFilter`, `PreprocessData`, `EmptyTemplate`, `LoadingTemplate`, `ToolbarActions`, `EnableKeyboardNavigation`, 4 × `*CssClass` |
  | `RadioGroup<T>` | (AriaLabel listed — correct) | `IsInvalid`, `CascadedEditContext`, `ValueExpression` |

  `AdditionalAttributes` in particular is absent from essentially every table, even though TR-011's 2026-07-29 amendment established that it is the single most load-bearing fact about this library's accessibility story.
- **Encountered in, in full:** REQ-UI-050 tranche 3, 2026-08-01. Ten pages were localized concurrently; the app has **49 `AriaLabel=` parameter sites** (32 `Input`, 7 `DataTable`, 4 `RadioGroup`, 3 `Button`, 3 `Textarea`), 35 of which now carry a translated string. Because the reference omits `AriaLabel` from three of those five components, **five of ten agents independently wrote defensive notes** reasoning about whether they had just fed a translated accessible name into TR-008's silent-drop path. They had not — all 49 sites are correct — but the cost was five separate misdiagnoses, and the plausible worse outcome is an agent "fixing" a working `AriaLabel` into a raw `aria-label`, or refusing to name a control at all.
- **Severity, in full:** the reference is the artefact the `trblazeui` skill instructs every generating agent to load and obey.

### TR-039 — there is no `NumberInput`; the natural guess for `NumericInput` compiles clean and renders an invisible control (major, found 2026-08-01)

> ✅ **Fixed upstream 2026-10-07, in 2.1.5** — `<NumberInput>` is now a build error (CS0619) that names `NumericInput`; the reference has a `NumericInput` section.

- **Severity:** major, and it is a *naming* defect with a *silent-failure* blast radius — exactly the class TR-038 was filed about, arriving through a different door.
- **Blocks:** no — the sites now use `NumericInput`, and the work carried on.
- **Repro:**
  ```razor
  @using TrBlazeUI.Components.NumericInput
  <NumberInput TValue="int" Value="@budget" ValueChanged="OnBudgetChanged" Min="1" Max="200" />
  ```
- **Expected:** a build error naming the unknown component, or a working control.
- **Actual:** `dotnet build` → **Build succeeded, zero warnings.** The page shows the `FieldLabel` and the `FieldDescription` and **nothing between them**: no box, no spinner, no value. The live AX tree contains no node for it at all.
- **Encountered in:** REQ-UI-040, 2026-08-01. Two sites (`Step budget`, link `Checked at`), found **only** by looking at the running app on the Catalyst head.
- **Workaround:** (applied) use `NumericInput`, which is what `WorkspaceAgents.razor` already used.
- **Suggested fix:** ship a `NumberInput` type-forward or an `[Obsolete]` shim that errors at compile time with "did you mean `NumericInput`?", or name the namespace after the library area rather than the single type in it (details below).

#### Detail

- **Cause:** the shipped assembly declares exactly one type here — `TrBlazeUI.Components.NumericInput.NumericInput<T>`.
  The *namespace* is `NumericInput`, so `@using TrBlazeUI.Components.NumericInput` is what a builder
  writes, and `<NumberInput …>` then looks like a perfectly ordinary component reference. Razor
  resolves no component of that name, falls back to treating it as an **unknown HTML element**, and
  emits `<numberinput tvalue="int" value="25" …>` — which every browser renders as a zero-height
  inline box. Nothing in the toolchain objects.
- **Encountered in, in full:** both sites compiled, both shipped into a Release Mac Catalyst bundle, and both were found **only** by looking
  at the running app on the Catalyst head — the `dotnet build`, the 1,358-test suite and the
  localization scanner were all green with an invisible control on the screen.
- **Suggested fix, in full:** two independent asks, either of which closes it.
  1. **Ship a `NumberInput` type-forward or an `[Obsolete]` shim** that errors at compile time with
     "did you mean `NumericInput`?". A one-line alias converts a silent visual failure into a build
     error.
  2. **Name the namespace after the library area, not after the single type in it**
     (`TrBlazeUI.Components.Numeric`, say). Namespace-equals-type is what makes the wrong guess feel
     right.
- **Note for whoever owns `TrBlazeUI-AI-Reference.md`:** the reference has **no entry for
  `NumericInput` at all** (`grep -n NumericInput` over the 1.0.7 reference returns nothing), so an
  agent told to treat it as the source of truth has nothing to check the name against and will guess.
  That is TR-038's argument again, and this is its first shipped consequence.

### TR-040 — the reference documents `EmptyIcon` / `EmptyTitle` / `EmptyDescription` / `EmptyAction` children that 1.0.7 does not ship; they compile with only a warning and render as unknown HTML (minor, found 2026-10-05 during REQ-UI-060)

> ✅ **Fixed upstream, in 2.1.4** — the reference's Empty section describes the flat API and says plainly that there is no sub-component family.

- **Severity:** minor (a documentation defect with a silent-render consequence; same family as TR-038 and TR-039).
- **Blocks:** no. `Empty`'s real parameters were used, and the work carried on.
- **Repro:** follow `.trblazeui/TrBlazeUI-AI-Reference.md` §6 "Empty", which shows `<Empty><EmptyIcon>…</EmptyIcon><EmptyTitle>…</EmptyTitle><EmptyDescription>…</EmptyDescription><EmptyAction>…</EmptyAction></Empty>`.
- **Expected:** those sub-components exist, or the reference shows the real API.
- **Actual:** 1.0.7's `TrBlazeUI.Components.xml` declares only `Empty.Title`, `Empty.Description`, `Empty.Icon`, `Empty.ChildContent`, `Empty.Class`, `Empty.Size` and `AdditionalAttributes`. The documented children raise `RZ10012` warnings only. Razor then emits them as unknown elements (`<emptytitle>`), so the build passes and the empty state has no styled title.
- **Encountered in:** `apps/Sevak/Components/Pages/Life/Today.razor` (REQ-UI-060, the "No tasks for today yet" state), 2026-10-05.
- **Workaround:** (applied) `<Empty Title="…" Description="…">` with `<Icon>` and `<ChildContent>` parameter elements.
- **Suggested fix:** correct the reference's Empty section, or ship the four sub-components to match it (shadcn/ui has them).

### TR-041 — A Select inside a Dialog never opens its list and then freezes the page

> ✅ **Fixed upstream 2026-10-08, in 2.1.5** — the happy path already worked on 2.1.4, but the freeze was reproduced by making the Select's script fail to load inside a Dialog: the import ran outside any catch, the circuit died, the error banner showed and the page stopped answering (Escape no longer closed the dialog). Now the import failure is caught and logged, a positioning failure places the list directly under its trigger instead of off-screen, and a portal render timeout renders the list inline. All three are covered by injected-failure tests. Upgrade and re-check on the Windows head; if it still freezes, the cause is in the server log, not this component.

- **Severity:** major
- **Blocks:** no — the Family page uses NativeSelect inside its dialogs instead; the build carried on.
- **Repro:** put a `Select` inside an open `Dialog` (TrBlazeUI 1.0.7, MAUI Windows head) and click it.
- **Expected:** the option list opens next to the control.
- **Actual:** the list stays off-screen with a "Portal … render timeout" message, and the page stops answering clicks until the app restarts.
- **Encountered in:** Sevak phase 3 build, 2026-10-05 (Family page; Tasks "Add task" dialog showed the same freeze).
- **Workaround:** `NativeSelect` in dialogs, with a page-scoped arrow because NativeSelect draws none.
- **Suggested fix:** let the Select popover portal render into the open Dialog's layer, and time out without blocking input.

### TR-042 — `Combobox` exposes a public `Id` property that is not a `[Parameter]`; setting it kills the circuit (minor, found 2026-10-05 during REQ-UI-066)

> ✅ **Fixed upstream, in 2.1.4** — `Combobox` keeps `Id` private and splats unmatched attributes, so a lowercase `id="task-goal-picker"` lands on its root.

- **Severity:** minor (silent dead circuit, same family as TR-022 / TR-035)
- **Blocks:** no — the attribute was removed; the Tasks dialogs now use `NativeSelect` anyway (TR-041).
- **Repro:** `<Combobox TItem="Option" Items="options" @bind-Value="key" ValueSelector="@(o => o.Key)" DisplaySelector="@(o => o.Text)" Id="task-goal-picker" />` inside a `Dialog`, then open the dialog.
- **Expected:** `Id` lands on the trigger, as the XML docs (`P:TrBlazeUI.Components.Combobox.Combobox`1.Id`) suggest.
- **Actual:** `Object of type 'Combobox`1[...]' has a property matching the name 'Id', but it does not have [Parameter]` — an unhandled circuit exception; the page shows "An unhandled error has occurred".
- **Encountered in:** `apps/Sevak/Components/Pages/Life/Tasks.razor` (REQ-UI-066), 2026-10-05.
- **Workaround:** do not set `Id`; put any anchor on a wrapper element.
- **Suggested fix:** mark `Id` `[Parameter]` (and forward it to the trigger), or make it non-public.

### TR-043 — the empty toast viewport still takes pointer events, so it blocks clicks along the bottom edge of the window (minor, found 2026-10-05 during REQ-UI-066)

> ✅ **Fixed upstream 2026-10-07, in 2.1.5** — reproduced on 2.1.4 (the empty 420×32 viewport took the click at the bottom-right corner); the viewport is now `pointer-events: none` and each toast `auto`. `md:max-w-[420px]` is in the shipped bundle since 2.0.x. Remove the `.td-toast-anchor` rule after upgrading.

- **Severity:** minor (a dialog footer button near the bottom edge cannot be clicked until the window is taller)
- **Blocks:** no — the smoke clicked the footer buttons through the DOM; nothing app-side was changed.
- **Repro:** Windows head at 1425×861; open the Add task dialog on `/tasks` (its footer sits in the bottom 40 px) and click **Add task**.
- **Expected:** with no toast showing, the toast viewport lets clicks through.
- **Actual:** Playwright reports `<div class="fixed z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px] bottom-0 right-0"></div> ... intercepts pointer events` with no toast inside it; `md:max-w-[420px]` is not in the shipped bundle, so the empty viewport spans the full window width.
- **Encountered in:** `/tasks` Add task dialog (REQ-UI-066), 2026-10-05.
- **Workaround:** applied 2026-10-05 in `apps/Sevak/Components/Layout/MainLayout.razor.css` (`.td-toast-anchor`): the empty viewport gets `pointer-events: none`, each toast `auto`. Remove it when the library ships the fix.
- **Cause (checked 2026-10-05):** the library's viewport, not Sevak's `<div data-testid="toast">` wrapper — the wrapper is a plain static block with no box of its own; the fixed `z-[100]` element with `p-4` padding is rendered by `ToastProvider` itself.
- **Suggested fix:** `pointer-events: none` on the viewport and `pointer-events: auto` on each toast (the shadcn pattern), and ship the `md:max-w-[420px]` rule.

### TR-044 — the TR-022 sweep, done app-side: 136 styled components take no unmatched attributes, and `AlertDialogAction` has no `OnClick` (major, found 2026-10-05 during the phase-3 smoke fixes)

> ✅ **Fixed upstream, in 2.1.4 and 2.1.5** — the splat sweep shipped in 2.0.3; a census of the 2.1.4 source finds every public component with it. `AlertDialogAction` and `AlertDialogCancel` take `OnClick` (and `PreventClose`) from 2.1.5. Move the `data-testid`s back onto the components and the handlers back onto the action parts after upgrading.

- **Severity:** major (each one is a silent dead circuit the moment the branch renders; `/review` was unrecoverable on open)
- **Blocks:** no — every call site in `apps/Sevak` was moved onto a wrapper element or a plain `Button`.
- **Repro:** `<TypographyMuted data-testid="review-no-goal">…</TypographyMuted>` on `/review` (or `<AlertDialogAction OnClick="RestoreAsync">` once its dialog renders).
- **Expected:** the attribute lands on the rendered element, as the agent guidance promises for every component; an action button takes a click handler.
- **Actual:** `ThrowForUnknownIncomingParameterName` → unhandled circuit exception. Reflection over `TrBlazeUI.Components` 1.0.7 finds **136** styled components with no `[Parameter(CaptureUnmatchedValues = true)]`, among them all of `Typography*`, `Alert*`, and every `AlertDialog*` part except `AlertDialogContent`. `AlertDialogAction` declares only `ChildContent, AsChild`, so it cannot take `OnClick` at all.
- **Encountered in:** `Life/Review.razor` (`TypographyMuted`, `Alert`), `Life/Tools.razor` (`TypographyMuted`, `Alert`), `BackupRestore.razor` (`TypographyMuted` ×2, `AlertDialogAction OnClick`), `Automations.razor` (`AlertDialogAction OnClick`), 2026-10-05.
- **Workaround:** (applied) `data-testid` moved to a wrapping `<div>`; `AlertDialogAction OnClick` replaced by `<Button OnClick>` (both handlers already close their dialog). The census and the scanner that checks every `.razor` against it are in `tests/.artifacts/verify/phase3-fix/probe/` (`splat.cs`, `scan.py`, `out.tsv`, `nosplat-styled.txt`); after the fix the scanner finds no unknown attributes.
- **Suggested fix:** add `AdditionalAttributes` with `CaptureUnmatchedValues` to every styled component and splat it onto the root element; give `AlertDialogAction` an `OnClick` that runs before it closes the dialog; add a build-time test that fails when a public component lacks the splat.

## Replies from TrBlazeUI

<!-- The upstream team's answers, newest block first. Left in full: this is the record. -->

### 2026-10-07 — all 34 entries answered; the action is upgrade from 1.0.7 to 2.1.5

Sevak is on **1.0.7**. Eleven releases have shipped since (2.0.0 to 2.1.4, all on GitHub Packages,
`https://nuget.pkg.github.com/techierathore/index.json`; nuget.org stops at 2.0.6). Twenty-two of
the entries in this file were fixed in those releases, before the file was written or re-checked;
twelve more are fixed on 2026-10-07 and 2026-10-08 and ship in **2.1.5**, which was built and
verified but not yet cut when this reply was written. Each entry above now carries a line saying
which.

| State | Entries |
|---|---|
| **Fixed before this file was re-checked, in 2.1.4 or earlier** | TR-003, TR-004, TR-005, TR-011, TR-013, TR-021, TR-022, TR-025, TR-027, TR-029, TR-030, TR-031, TR-032, TR-035, TR-036, TR-040, TR-042; the 2.1.4 half of TR-008, TR-024, TR-033, TR-037, TR-044 |
| **Fixed today, in 2.1.5** | TR-023 toast variants · TR-026 `Textarea Rows`/`MaxRows` · TR-028 `Table` family · TR-033/TR-034 `NumericInput` and `Slider` ARIA · TR-037 stable `HtmlSanitizer` · TR-039 `NumberInput` build error · TR-043 toast viewport · TR-044 `AlertDialogAction`/`Cancel` `OnClick` · TR-008 `CardTitle`/`AlertTitle` `As` · TR-024 placeholder when no item matches |
| **Documentation, in the reference that 2.1.5 deploys** | TR-001 interactive layout, TR-002 scoped-CSS link, TR-012 Playwright `exact`, TR-038 what the tables list |
| **Fixed on 2026-10-08, in 2.1.5** | TR-041 — the freeze was reproduced by making the Select's script fail inside a Dialog (the import ran outside any catch and killed the circuit); now caught and logged, with the list placed under its trigger when positioning fails and rendered inline when the portal host times out · TR-006 — `ChatThread`, `ChatMessage`, `ChatComposer` in `TrBlazeUI.Components.Chat`, demo at `/components/chat` |

```razor
@using TrBlazeUI.Components.Table
<Table>
    <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>State</TableHead></TableRow></TableHeader>
    <TableBody>
        @foreach (var vJob in objJobs) { <TableRow><TableCell>@vJob.Name</TableCell><TableCell>@vJob.State</TableCell></TableRow> }
    </TableBody>
</Table>

<AlertDialogAction OnClick="RestoreAsync">Restore</AlertDialogAction>
<Textarea @bind-Value="objDraft" Rows="3" MaxRows="12" />
<CardTitle As="h2">Data storage</CardTitle>
@code { void Warn() => ToastService.Warning("This endpoint is plain TCP.", "Unauthenticated"); }
```

Things to know before you upgrade:

1. **Go straight to 2.1.5; do not stop at 2.0.x.** The behaviour changes between 1.0.7 and 2.1.4 are
   listed in `CHANGELOG.md` under each release; the ones that will show on your screens are: `Badge`
   renders a `<span>` (set `As="div"` where a selector depends on the old tag); a text colour in
   `Class` now replaces a component's own; an Outline `Toggle` hovers with `--accent-foreground`
   text; a `NavList` selected row uses `--accent-foreground`.
2. **Workarounds to remove**, each named in its entry: `main { min-width: 0 }` (TR-003), the inline
   `overflow-x:auto` wrappers (TR-004), the hand-copied `Input` classes on `/login` (TR-011),
   `composer.js` (TR-025; keep the auto-grow half on the Catalyst head until WKWebView supports
   `field-sizing`), `Math.Round` on `Progress` values (TR-033), the `HtmlSanitizer` pin (TR-037),
   `.td-toast-anchor` (TR-043), the wrapper `<div>`s carrying `data-testid` and the `<Button>`
   inside `AlertDialogAction` (TR-044), `NativeSelect` in dialogs if TR-041 does not reproduce for
   you either.
3. **TR-041 is fixed at the cause we could reproduce.** On 2.1.4 the Select in a Dialog works until
   its script fails to load, and then the whole page died — the symptom you saw. 2.1.5 survives a
   failed script, a failed positioning call and a portal timeout; each one logs a warning to the
   server log. If anything still freezes after the upgrade, the server log names it.
4. **TR-006 is built from your mockup.** `ChatThread`, `ChatMessage` and `ChatComposer` follow
   `workspace-chat.html`: bubbles by role, a trace block, citation chips, a streaming state, and a
   composer with a row of controls above the box. Your `.td-composer-input` CSS and `composer.js`
   can go once you use `ChatComposer`.
5. **Your agent's reference describes all of it.** After the upgrade the build refreshes
   `.trblazeui/TrBlazeUI-AI-Reference.md`; start at "Which control do I use for…" and "Which version
   added what".

#### What we need from you

Upgrade `TrBlazeUI.Components` and `TrBlazeUI.Icons.Lucide` to 2.1.5 once it is on the feed,
remove the workarounds in point 2, run your screen checks and the axe sweep again, then close each
entry here (`bash .tfcore/utils/tf-feedback.sh Sevak --close <ID> "<what you ran and what it showed>"`)
or tell us what does not fit.
