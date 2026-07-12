---
project: TrBlazeUI
stack: .NET 10 / Blazor (Server·WASM·Auto) / Tailwind CSS v4 / shadcn-compatible
last_updated: 2026-07-12
current_phase: Fix-issues — TrStudio feedback Verified (REQ-UI-015); awaiting publish (> 1.0.7)
last_verified_build: PASS
last_verified_date: 2026-07-12
---

# TrBlazeUI — Status

## Where I am
TrStudio consumer-feedback pass complete. All 11 issues in `docs/TrStudio-TrBlazeUI-Feedback.md` (1 blocker, 3 major, 6 minor, 1 nice-to-have) are resolved **library-side** under REQ-UI-015 and self-smoked. Code: `DataTable`, `Alert`, `Components.Checkbox`, `Components.Switch` now splat `CaptureUnmatchedValues` (TR-001/002/008; `Badge`/`FieldError` already did — TR-004); `Switch` honors its controlled `Checked` prop instead of flipping optimistically (TR-009); `DataTable` root is `min-w-0` so it self-contains at ≤400px (TR-010); `FileUpload` gained an `OnFilesSelected` alias of `FilesChanged` (TR-007); and the **TR-011 blocker** is fixed by removing `AddRazorSupportForMvc` from Components + Primitives (no MVC/.cshtml in either), so the packed nuspecs no longer carry a `Microsoft.AspNetCore.App` FrameworkReference → MAUI Mac Catalyst consumers escape NETSDK1082. Docs: `TrBlazeUI-AI-Reference.md` corrected for the Button/Alert inline-icon pattern (TR-003), the flat `Empty` API (TR-005), the composite `Pagination` API + namespace (TR-006), and `FileUpload` (TR-007). Verified three ways: strict Release build **0/0**; pack + nuspec assertion **0 `frameworkReferences`** across all three packages; **14/14** headless-Chromium runtime smoke (splat render-truth, gated-vs-uncontrolled Switch, 390px `scrollWidth==390`, desktop + mobile visual pass). **Formally verified 2026-07-12** (`*verify ui`): ledger `docs/.last-verify.json` written; REQ-UI-015 = `Verified` in the checklist under all three gates (acceptance + §4a render-truth + §4b visual-truth).

## Next command to run
```
Publish the next package versions (> 1.0.7) for Components / Primitives / Icons.Lucide so TrStudio can consume the clean packages (owner: manual bump + push).
```

## Open requirements
- None — REQ-UI-015 Verified this run; all 28 requirements are Verified / Done.

## Known blockers
- None.

## Verification log
| Date | Phase | Result | Status table |
|------|-------|--------|--------------|
| 2026-06-30 | Discovery (day-1 build probe) | FAIL — 5 IDE0031 (Sidebar) | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-06-30 | Build (REQ-NFR-005, REQ-FN-003) | PASS — Release 0/0; both REQs Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-06-30 | Handoff | Ship-ready — all REQs terminal; docs finalized & rendered | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-06-30 | Runtime smoke (Playwright, key screens) | PASS — Home/DataTable/Chart/Toolbar/Icons render with data + visual OK | docs/screenshots/TrBlazeUI/ |
| 2026-07-02 | Fix-issues (REQ-UI-014, AstroLyfe TR-001…TR-009) | PASS — Release 0/0; 18/18 runtime checks (Tab order, popup w/ & w/o PortalHost, AsChild, Input Label, Grid responsive, icon fallback/aria, 390px overflow) | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-07-12 | Verify ui (REQ-UI-015, TrStudio TR-001…TR-011) | PASS → Verified — Release 0/0; pack nuspec 0 frameworkReferences ×3; 14/14 headless-Chromium (§4a splat render-truth + table data, gated/uncontrolled Switch, 390px scrollWidth==390; §4b visual desktop+390px). Ledger docs/.last-verify.json; spec tests/verify/ui-trstudio.spec.js | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary
- TrBlazeUI: 0 major, 0 minor open — TrStudio report (`docs/TrStudio-TrBlazeUI-Feedback.md`): all 11 issues (incl. the TR-011 Mac Catalyst blocker) resolved library-side 2026-07-12 (REQ-UI-015) with per-issue resolution notes; AstroLyfe report (`docs/AstroLyfe-TrBlazeUI-Feedback.md`): all 9 issues resolved 2026-07-02; earlier consumer reports (docs/TrBlazeUI-Issues-Report-1.md, docs/trblazeui-issues-report-2.md) remain resolved.
- TechieRag: 0 major, 0 minor — n/a (not a dependency)

## Standards compliance (last verifier check)
- Underscore fields: clean (obj-prefix convention; new code follows it)
- Test method underscores: not separately run (no test project in solution)
- Mis-prefixed fields: clean (statics PascalCase per Coding Standards §Fields)
- XML docs: 100% on public members (CS1591 build-enforced; all new components/params documented)
- IDE0031: downgraded to `suggestion` for event-accessor null guards (CS0131 makes the `?.` fix illegal) — justified in `.editorconfig`
- CA1848: icon warning paths use cached `LoggerMessage.Define` delegates

## Deferred / future
- Optional migration of consumer workaround components back to standard TrBlazeUI components (all enabling fixes shipped; AstroLyfe can now drop its `.sr-only` override and icon-name remaps).
- Compile-time icon-name analyzer / source generator so wrong icon ids fail the build (TR-009 stretch suggestion).
- Same inline-fallback treatment for `DialogPortal`/`SheetPortal` when no PortalHost is attached (FloatingPortal-based components are covered).
- Consider an automated UI test project (Playwright) for the demo app to back future verification (the fix-issues smoke scripts are a ready seed).
