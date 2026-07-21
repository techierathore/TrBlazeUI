---
project: TrBlazeUI
stack: .NET 10 / Blazor (Server·WASM·Auto) / Tailwind CSS v4 / shadcn-compatible
last_updated: 2026-07-21
current_phase: Handoff
last_verified_build: PASS (Release 0/0, 2026-07-21 fix-issues run)
last_verified_date: 2026-07-21
---

# TrBlazeUI — Status

## Where I am
**Handoff.** All REQ-* are `Verified`/`Done`/`N/A`; awaiting owner UAT per `docs/TrBlazeUI-UsageGuide.md`. Release **2.0.0** is staged in source with notes written (`CHANGELOG.md`) — it is a major bump because `DataTable.ShowToolbar` flips its default, changing rendered output for existing consumers. Publishing is owner-manual (git/gh are agent-blocked).

Docs reconciled this run: the two Feb-2026 raw consumer reports (fully resolved, against `beta.0.8`) moved to `docs/OldDocs/`, and every stale citation of the deleted `docs/trblazeui-issues-report.md` repointed. `docs/` now carries exactly one feedback file per consumer.

*(This run, 2026-07-21)* Ran `*fix-issues` against AstroLyfe's feedback and **closed REQ-UI-016** — the last open requirement. All three UAT-2/3 defects were fixed library-side (no app-side workarounds) and verified live: Release build **0/0**, headless-Chromium **21/21** (`tests/verify/ui-ui016.spec.js` on the new `/verify-ui016` harness), ledger `docs/.last-verify.json`.

- **TR-010** — `DataTable.ShowToolbar` now defaults `false` (opt-in), and pagination renders only when `TotalItems > PageSize` (new `ShouldShowPagination()`, replacing `objProcessedData.Any()`). ⚠ The default flip is a **behavioural breaking change** for consumers relying on an implicit toolbar — call it out in the release notes.
- **TR-011** — `DialogContent`/`AlertDialogContent` gained `max-h-[calc(100vh-2rem)] overflow-y-auto`. Clamping *height* (not overriding `transform`/`translate`) means a −50% Y offset can never push the top above `y=0`, so the fix is immune to the `transform`-vs-`translate` mechanism split that made AstroLyfe's app-side override version-fragile. Tall dialog now `top=16px` at 1366×720, 1280×600 and 390×844 (was −245 / −305).
- **TR-012** — the library now ships default design tokens (`--popover` et al., light + `.dark`) in `@layer base` wrapped in `:where()` (zero specificity). Verified both directions: opaque legible listbox with all host sheets disabled, **and** a themed host's own tokens still win — a floor, not a ceiling.

Also regenerated `wwwroot/trblazeui.css` (Tailwind v4.1.18) and re-swept `/components/datatable`, `/dialog`, `/select`, `/alert-dialog` for regressions — none. TR-001…TR-009 remain fixed since 1.0.7 (unchanged this run); TR-013 stays retracted. AstroLyfe's feedback file now carries per-issue resolution notes and is **0 open**.

*(Previous run, 2026-07-21)* Ran `*triage-issues` (analyze-only) against AstroLyfe's re-consolidated feedback (`docs/AstroLyfe-TrBlazeUI-Feedback.md`, 2026-07-21). The file lists 12 issues and reads as all-open; it is not. **Nine of them (TR-001…TR-009) are stale** — AstroLyfe's repro environment is still TrBlazeUI **1.0.6**, but those were fixed 2026-07-02 under REQ-UI-014 and shipped in **1.0.7**; the resolution notes were dropped when their file was re-consolidated. All nine were re-verified live today against current source and still hold (Tab/Shift+Tab escape a closed SelectTrigger — identity-checked, not role-checked, which caught a false positive on the first probe; listbox + 5 options materialize; accessible name present at first render; 0 `role="img"`-without-label across 25 svgs; `AsChild`, hardened `.sr-only`, `Input.Label`, `Grid`/`GridItem`, `data-trblazeui-missing-icon` all present). REQ-UI-014 held at `Verified` — **the action there is to publish/upgrade, not to re-fix.** **Three are genuinely new and all reproduced** on the library's own demo → logged as **REQ-UI-016 (Planned)**: TR-010 (DataTable ships toolbar + pagination by default, pagination guard is `Any()` not `> PageSize`), TR-011 (tall `DialogContent` at top=−245px/−305px, `max-height:none`, `overflow-y:visible` — header off-screen and unclickable), TR-012 (`bg-popover` → `var(--popover)` with no library-side token definition, so a host that omits it gets a transparent listbox). TR-013 was retracted by the reporter (app-side culture bug). Release build 0/0. **Nothing in `src/` or `tests/` was modified** — fixing was not requested.

*(Previous run, 2026-07-18)* Ran `*fix-issues` against the TechieRag report (now archived at `docs/OldDocs/trblazeui-issues-report-2.md`). The report's own 5 issues were already resolved (confirmed in the prior triage — no code needed). The real open work was **REQ-FN-009**, the NU1902 build blocker surfaced by the build gate. Root cause: `HtmlSanitizer 9.0.892` (latest stable) hard-pins `AngleSharp [0.17.1]`, which carries **CVE-2026-54570 (GHSA-pgww-w46g-26qg)** — a mutated-XSS bypass that defeats DOM-based HTML sanitizers, i.e. this library's own XSS protection (`RichTextEditor`/`MarkdownEditor`, REQ-NFR-003). No *stable* HtmlSanitizer ships the patched `AngleSharp ≥ 1.5.0`, so a scoped audit-suppression would have meant knowingly shipping the exploitable hole. **Owner chose to upgrade to `HtmlSanitizer 9.1.949-beta`** (the only line pulling patched AngleSharp — resolves 1.5.1), accepting the pre-release dependency over shipping a suppressed vulnerability. Verified: full-solution Release build **0/0** (0× NU1902), AngleSharp resolves 1.5.1 in the shipped graph, and a runtime sanitize smoke on the shipped package PASSED — benign markup preserved, classic XSS + the CVE-2026-54570 mXSS payload both neutralized. REQ-FN-009, REQ-NFR-005, REQ-NFR-003 now `Verified` (ledger `docs/.last-verify.json`). Only `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj` changed (one PackageReference + a rationale comment).

## Next command to run
```
Manual UAT per docs/TrBlazeUI-UsageGuide.md smoke checklist.
```
Then (owner-manual, because agents cannot run git/gh or publish): commit the working tree, create the GitHub Release tagged **`2.0.0`**, and paste the `## [2.0.0]` section of `CHANGELOG.md` as the release body — the notes are written, nothing to draft. The workflow builds and publishes all five packages. Then tell AstroLyfe to upgrade off 1.0.6; that single upgrade closes all 12 issues in their feedback file. NOTE: Components depends on HtmlSanitizer 9.1.949-beta (pre-release) — confirm that is acceptable, or hold the Components bump until HtmlSanitizer 9.1.x reaches stable.

## Open requirements
- None — every REQ in the checklist Requirements Status table is terminal (`Verified` / `Done` / `N/A`). REQ-UI-016 closed 2026-07-21.

## Known blockers
- None for the build (Release 0/0) and none in the library. **Consumer-facing (owner action, not a code defect):** AstroLyfe is still on TrBlazeUI **1.0.6**, so their UAT rounds keep re-surfacing issues already fixed in 1.0.7 and now in the unpublished > 1.0.7. Publishing + their upgrade closes all 12. The prior warning about their `transform`-based TR-011 override is **resolved** — the library fix clamps height rather than the centering property, so their override neither breaks nor is needed.

## Verification log
| Date | Phase | Result | Status table |
|------|-------|--------|--------------|
| 2026-06-30 | Discovery (day-1 build probe) | FAIL — 5 IDE0031 (Sidebar) | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-06-30 | Build (REQ-NFR-005, REQ-FN-003) | PASS — Release 0/0; both REQs Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-06-30 | Handoff | Ship-ready — all REQs terminal | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-02 | Fix-issues (REQ-UI-014, AstroLyfe) | PASS — Release 0/0; 18/18 runtime checks | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-12 | Verify ui (REQ-UI-015, TrStudio) | PASS → Verified — Release 0/0; 14/14 headless-Chromium | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-18 | Triage (TechieRag report, analyze-only) | 5 reported issues reconciled (fixes hold); build gate FAILED — NU1902 AngleSharp → REQ-NFR-005 demoted, REQ-FN-009 logged | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-18 | Fix-issues + verify (REQ-FN-009) | PASS → Verified — HtmlSanitizer→9.1.949-beta (AngleSharp 1.5.1); Release 0/0, NU1902 cleared; sanitize smoke neutralizes CVE-2026-54570 mXSS. Ledger docs/.last-verify.json | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-21 | Handoff (post-REQ-UI-016) | **READY FOR UAT** — all REQs terminal; 2.0.0 staged with CHANGELOG release notes; UsageGuide + BRD §4 + DevGuide refreshed; legacy consumer reports archived to docs/OldDocs and stale citations repointed | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-21 | Fix-issues + verify (REQ-UI-016, AstroLyfe TR-010/011/012) | PASS → Verified — Release 0/0; headless-Chromium **21/21** (`tests/verify/ui-ui016.spec.js` on `/verify-ui016`) incl. §4a render gate + §4b visual truth @1366/1280/390. DataTable toolbar opt-in + row-count pagination guard; Dialog/AlertDialog clamped (top −245/−305 → +16px); library-shipped `:where()` token fallbacks make popovers opaque without host tokens. No regression on 4 demo pages. Ledger docs/.last-verify.json | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-21 | Triage (AstroLyfe UAT-2/3, analyze-only) | Release 0/0. TR-010/011/012 REPRO → **REQ-UI-016 logged Planned**; TR-013 retracted by reporter. TR-001…TR-009 re-verified live as still-fixed → reconciled as stale 1.0.6 observations, REQ-UI-014 held at Verified (no demotion). No code changed | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary
- **Feedback files are one-per-consumer and live in `docs/`:** `AstroLyfe-TrBlazeUI-Feedback.md`, `TrStudio-TrBlazeUI-Feedback.md`, `TechieRag-TrBlazeUI-Feedback.md`. *(Reconciled 2026-07-21: PROJECT-STATUS previously cited `docs/trblazeui-issues-report.md`, a path that no longer exists. The two Feb-2026 raw reports it referred to — the TechieRag Web Sample App report and the AppStudio IDE report, both against `beta.0.8` and both fully resolved — are archived unmodified at `docs/OldDocs/trblazeui-issues-report-2.md` and `docs/OldDocs/TrBlazeUI-Issues-Report-1.md`.)*
- TechieRag: 0 open — all issues resolved (canonical file `docs/TechieRag-TrBlazeUI-Feedback.md`, consolidated 2026-07-02). The separate NU1902 supply-chain blocker (AngleSharp mXSS via HtmlSanitizer) was fixed 2026-07-18 under REQ-FN-009 by moving to HtmlSanitizer 9.1.949-beta. TrStudio: all 11 resolved 2026-07-12 (REQ-UI-015).
- **AstroLyfe: 0 open.** TR-010/011/012 fixed + verified 2026-07-21 (REQ-UI-016, ships > 1.0.7); TR-001…TR-009 fixed 2026-07-02, shipped in 1.0.7; TR-013 retracted. All 12 now carry per-issue resolution notes in `docs/AstroLyfe-TrBlazeUI-Feedback.md`. Remaining gap is distribution only: publish, then AstroLyfe upgrades off 1.0.6.
- TechieRag: 0 issues open.

## Standards compliance (last verifier check)
- Underscore fields: clean (obj-prefix convention)
- Test method underscores: not separately run (no test project in solution)
- Mis-prefixed fields: clean (statics PascalCase per Coding Standards §Fields)
- XML docs: 100% on public members (CS1591 build-enforced)
- IDE0031: downgraded to `suggestion` for event-accessor null guards (CS0131) — justified in `.editorconfig`
- NU1902: cleared 2026-07-18 (AngleSharp 1.5.1 via HtmlSanitizer 9.1.949-beta)

## Deferred / future
- **Move HtmlSanitizer off the pre-release `9.1.949-beta` to a stable 9.1.x once released** (tracked with REQ-FN-009 / REQ-NFR-003) — the beta is only in use because no stable HtmlSanitizer yet ships the patched AngleSharp ≥ 1.5.0.
- Optional migration of consumer workaround components back to standard TrBlazeUI components.
- Compile-time icon-name analyzer / source generator so wrong icon ids fail the build.
- Same inline-fallback treatment for `DialogPortal`/`SheetPortal` when no PortalHost is attached.
- Consider an automated UI test project (Playwright) for the demo app to back future verification.
