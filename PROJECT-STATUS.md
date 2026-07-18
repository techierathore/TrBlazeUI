---
project: TrBlazeUI
stack: .NET 10 / Blazor (Server·WASM·Auto) / Tailwind CSS v4 / shadcn-compatible
last_updated: 2026-07-18
current_phase: Fix-issues complete — REQ-FN-009 fixed & verified; Release build green
last_verified_build: PASS (Release 0/0; NU1902 cleared, AngleSharp 1.5.1)
last_verified_date: 2026-07-18
---

# TrBlazeUI — Status

## Where I am
Ran `*fix-issues` against the TechieRag report `docs/trblazeui-issues-report.md`. The report's own 5 issues were already resolved (confirmed in the prior triage — no code needed). The real open work was **REQ-FN-009**, the NU1902 build blocker surfaced by the build gate. Root cause: `HtmlSanitizer 9.0.892` (latest stable) hard-pins `AngleSharp [0.17.1]`, which carries **CVE-2026-54570 (GHSA-pgww-w46g-26qg)** — a mutated-XSS bypass that defeats DOM-based HTML sanitizers, i.e. this library's own XSS protection (`RichTextEditor`/`MarkdownEditor`, REQ-NFR-003). No *stable* HtmlSanitizer ships the patched `AngleSharp ≥ 1.5.0`, so a scoped audit-suppression would have meant knowingly shipping the exploitable hole. **Owner chose to upgrade to `HtmlSanitizer 9.1.949-beta`** (the only line pulling patched AngleSharp — resolves 1.5.1), accepting the pre-release dependency over shipping a suppressed vulnerability. Verified: full-solution Release build **0/0** (0× NU1902), AngleSharp resolves 1.5.1 in the shipped graph, and a runtime sanitize smoke on the shipped package PASSED — benign markup preserved, classic XSS + the CVE-2026-54570 mXSS payload both neutralized. REQ-FN-009, REQ-NFR-005, REQ-NFR-003 now `Verified` (ledger `docs/.last-verify.json`). Only `src/TrBlazeUI.Components/TrBlazeUI.Components.csproj` changed (one PackageReference + a rationale comment).

## Next command to run
```
Publish the next package versions (> 1.0.7) for Components / Primitives / Icons.Lucide (owner: manual bump + push). NOTE: Components now depends on HtmlSanitizer 9.1.949-beta (pre-release) — confirm that is acceptable for the published package, or hold the Components bump until HtmlSanitizer 9.1.x reaches stable.
```

## Open requirements
- None — REQ-FN-009 fixed & Verified this run; REQ-NFR-005 re-verified; all requirements Verified / Done.

## Known blockers
- None. (The Release build is green again.)

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

## Library feedback summary
- TrBlazeUI: TechieRag report (`docs/trblazeui-issues-report.md`) — all 5 reported issues confirmed resolved 2026-07-18; the separate NU1902 supply-chain blocker (AngleSharp mXSS via HtmlSanitizer) fixed same day under REQ-FN-009 by moving to HtmlSanitizer 9.1.949-beta. TrStudio: all 11 resolved 2026-07-12 (REQ-UI-015); AstroLyfe: all 9 resolved 2026-07-02; earlier reports remain resolved.
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
