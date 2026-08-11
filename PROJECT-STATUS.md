---
project: TrBlazeUI
stack: .NET 10 / Blazor (Server·WASM·Auto) / Tailwind CSS v4 / shadcn-compatible
last_updated: 2026-08-11
current_phase: Handoff — READY FOR UAT (2.1.0; owner sets `Released` after UAT passes)
last_verified_build: PASS (Release 0 errors / 0 warnings, 2026-08-11 — re-confirmed at handoff)
last_verified_date: 2026-08-11
---

# TrBlazeUI — Status

## Where I am
All REQ-* are verified; awaiting UAT per `docs/TrBlazeUI-UsageGuide.md`. All 31 checklist rows are
terminal (23 `Done (pre-existing)`, 8 `Verified`) and the base version is **2.1.0** — the TechieBlog
consumer-feedback release, closed under **REQ-UI-017**. Every one of the 65 entries in
`docs/TechieBlog-TrBlazeUI-Feedback.md` was fixed library-side: catalog-wide attribute splatting
(344/344 + 59/59 by reflection), Rating/Tabs/NavigationMenu/Item accessibility, the Blazor Server
text-entry data-loss fix, ordered portals, the full Tailwind utility layer, a contrast-validated
token set, and 9 new components — each with its own demo page plus a `/whats-new` release page.
**Handoff ran 2026-08-11:** the UsageGuide and DevGuide now describe the 2.1.0 surface, the
Architecture doc is stamped as-built, all four consumer-feedback files are consolidated, and the
HTML set is re-rendered. The 2.1.0 screens were re-driven on a booted Blazor Server demo at handoff
— **25/25** (22 routes × HTTP 200 / 0 error boundaries / 0 console errors / 0px overflow at 1366×800,
plus a 390px reflow pass on `/components/prose`, `/components/datatable`, `/whats-new`).

## Next command to run
```
Manual UAT per docs/TrBlazeUI-UsageGuide.md smoke checklist.
```
Then publish 2.1.0 manually (owner) and set `current_phase: Released` in this file.

## Open requirements
- None — every row in `docs/TrBlazeUI-Checklist.md#requirements-status` is terminal.

## Known blockers
- **None blocking the release.**
- ⚠ **TR-066 (open, not fixed)** — a `Dialog` declared inside another `Dialog`'s `DialogContent`
  never opens. **Pre-existing**: reproduces against the 2.0.1 `PortalService` source, so it is not a
  2.1.0 regression. Two candidate fixes were tried, neither worked, and both were reverted rather
  than shipped unproven. Supported workaround (demonstrated and verified on `/components/dialog`):
  compose stacked dialogs as siblings, each with its own `@bind-Open`. Write-up in
  `docs/TechieBlog-TrBlazeUI-Feedback.md` (TR-066).
- ℹ️ **Owner question (non-gating):** which build did AstroLyfe's 2026-07-22 "2.0.0" upgrade resolve
  to? The auto-margin centering makes TR-014 moot either way; confirming only closes the loop.
- ℹ️ **Publish is owner-manual:** tag `2.1.0`, paste the CHANGELOG 2.1.0 section as the release body,
  and carry its "Behaviour changes to review before upgrading" list into the notes — the token
  retune, the `Rating` markup change, the always-mounted `TabsContent` panel and the larger CSS
  bundle are all visible to consumers. Components still depends on HtmlSanitizer `9.1.949-beta`.

## Verification log
| Date | Phase | Result | Status table |
|------|-------|--------|--------------|
| 2026-06-30 | Discovery (day-1 build probe) | FAIL — 5 IDE0031 (Sidebar) | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-06-30 | Build (REQ-NFR-005, REQ-FN-003) | PASS — Release 0/0; both REQs Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-06-30 | Handoff | Ship-ready — all REQs terminal | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-02 | Fix-issues (REQ-UI-014, AstroLyfe) | PASS — Release 0/0; 18/18 runtime checks | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-12 | Verify ui (REQ-UI-015, TrStudio) | PASS → Verified — Release 0/0; 14/14 headless-Chromium | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-18 | Triage (TechieRag report, analyze-only) | 5 issues reconciled; build gate FAILED on NU1902 AngleSharp → REQ-FN-009 logged | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-18 | Fix-issues + verify (REQ-FN-009) | PASS → Verified — HtmlSanitizer 9.1.949-beta (AngleSharp 1.5.1); NU1902 cleared; CVE-2026-54570 mXSS neutralized | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-21 | Triage (AstroLyfe UAT-2/3, analyze-only) | TR-010/011/012 REPRO → REQ-UI-016 logged Planned; TR-013 retracted; TR-001…TR-009 re-verified as still-fixed | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-21 | Fix-issues + verify (REQ-UI-016) | PASS → Verified — Release 0/0; 21/21 (`ui-ui016.spec.js`); DataTable chrome opt-in, Dialog clamp, `:where()` token fallbacks | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-21 | Handoff (post-REQ-UI-016) | READY FOR UAT — 2.0.0 staged; legacy consumer reports archived to docs/OldDocs | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-22 | Triage (AstroLyfe post-upgrade, analyze-only) | TR-003 REPRO → REQ-UI-014 demoted to Needs re-verify; TR-014 could-not-reproduce | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-22 | Fix-issues + verify (REQ-UI-014, TR-003) | PASS → Verified — 8/8 (`ui-ui014.spec.js`), axe `button-name`=0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-22 | Fix-issues + verify (REQ-UI-016, TR-014 hardening) | PASS → Verified (held) — 23/23 (`ui-ui016.spec.js`); auto-margin dialog centering | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-22 | Handoff (post-TR-003 fix) | READY FOR UAT — 2.0.1 pending owner-manual publish | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-11 | Fix-issues + verify (REQ-UI-017, TechieBlog TR-001…TR-065) | PASS → **Verified** — Release 0/0; 65/65 (`ui-techieblog.spec.js` on `/verify-techieblog`); splat audit 344/344 + 59/59; token contrast 18 failures → 0; 12 new components; version → 2.1.0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-11 | Verify (REQ-UI-017 demo coverage + standards sweep) | PASS — Release 0/0; 15/15 (`ui-demo-2-1-0.spec.js`); 112/113 demo routes clean; `ui-ui014` 8/8 + `ui-ui016` 23/23 held; ColorPicker `_r`/`_g` → `objR`/`objG`; **TR-066 logged open** | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-11 | Handoff (2.1.0) | **READY FOR UAT** — Release 0/0 re-confirmed; 2.1.0 screens re-driven live 25/25; UsageGuide + DevGuide refreshed to the 2.1.0 surface, Architecture stamped as-built, 4 consumer-feedback files consolidated (0 open except TR-066), 5 HTMLs re-rendered. 2.1.0 pending owner-manual publish; TR-066 accepted open with a supported workaround | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary
*(Refreshed at handoff 2026-08-11 — 4 consumer files, 90 entries total, **1 open**.)*
- One feedback file per consumer in `docs/`; the two Feb-2026 `beta.0.8` raw reports are archived
  unmodified in `docs/OldDocs/`.
- **TechieBlog: 1 open (TR-066, high — nested Dialog; pre-existing, workaround shipped)** of 66
  entries. All 65 of TR-001…TR-065 closed 2026-08-11 (REQ-UI-017), every one library-side. The
  file carries a resolution header (per-entry disposition + the app-side workarounds they can now
  delete) and an inline ✅ note per entry. TR-016 reconciled as **not a gap** (`ResponsiveNav*` ships).
- **AstroLyfe: 0 open** — 13/13 addressed (TR-003 fixed 2026-07-22; TR-014 hardened; TR-013 retracted).
- **TrStudio: 0 open** — all 11 resolved 2026-07-12 (REQ-UI-015).
- **TechieRag: 0 open** — consolidated 2026-07-02; the separate NU1902 supply-chain blocker closed
  2026-07-18 under REQ-FN-009.

## Standards compliance (last verifier check)
- Underscore instance fields: **clean** (2026-08-11 — the last two, `ColorPicker._r`/`._g`, renamed to
  the `obj` prefix and re-verified live)
- Block-scoped namespaces: clean (0 across `src/`)
- Test method underscores: 0 (no unit-test project in the solution; `tests/verify/*.spec.js` only)
- XML docs: 100% on public members (CS1591 build-enforced, 0 warnings)
- Analyzer/style gates: clean — `TreatWarningsAsErrors` + `EnforceCodeStyleInBuild` pass at 0 warnings
- IDE0031: downgraded to `suggestion` for event-accessor null guards (CS0131) — justified in `.editorconfig`
- NU1902: cleared 2026-07-18 (AngleSharp 1.5.1 via HtmlSanitizer 9.1.949-beta)

## Deferred / future
- **TR-066** — root-cause and fix the nested-`Dialog` case (see Known blockers).
- **Swallow `JSDisconnectedException` in `SelectContent.DisposeAsync`** (`src/TrBlazeUI.Primitives/Primitives/Select/SelectContent.razor:287`). Observed at handoff 2026-08-11: closing a tab with an open `Select` logs a full stack trace per disconnect on the Server host. Cosmetic — the standard Blazor Server dispose race, no user-visible effect — but hosts shouldn't have to filter it out of their logs.
- Move HtmlSanitizer off the pre-release `9.1.949-beta` to a stable 9.1.x once released (REQ-FN-009).
- Re-run a full axe audit against 2.1.0 to move REQ-NFR-001 off its 90% "not independently audited" note.
- Compile-time icon-name analyzer / source generator so wrong icon ids fail the build.
- Inline-fallback treatment for `DialogPortal`/`SheetPortal` when no PortalHost is attached.
- A first-class test project so the `tests/verify/*.spec.js` gates run from `dotnet test`.
