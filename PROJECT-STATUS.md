---
project: TrBlazeUI
last_updated: 2026-11-12
current_phase: Release — Sevak TR-047/TR-048 verified, 83 of 83 verified
last_verified_build: PASS
last_verified_date: 2026-11-12
---

# TrBlazeUI — Status

## Where I am

Every row is Verified. The verifier passed REQ-UI-065 (Sevak TR-048 regression test; the fix itself shipped in 2.2.2) and REQ-UI-066 (Sevak TR-047, `CodeBlock.CopyLabel`, `CopyButtonAttributes`, `OnCopied`). They join Chatur TR-023/TR-024 and the demo-host fixes in the release after 2.2.2. On the Mac, four older rows fail from machine setup or test flakes (Known blockers). CHANGELOG, the agent reference and Sevak's file are current.

## Next command to run

Claude Code:
```
(owner) commit, then build and publish the package — its shipped documents are current; no agent command
```
OpenCode:
```
(owner) commit, then build and publish the package — its shipped documents are current; no agent command
```
Why: every row is Verified and the shipped documents are current.

## Open requirements

| Status | Count |
|---|---|
| Not Started | 0 |
| In Progress | 0 |
| Implemented | 0 |
| Needs re-verify | 0 |
| Blocked | 0 |

- None

## Known blockers

- On the Mac (2026-11-11), four suite rows fail for reasons outside the code. REQ-NFR-001 looks for the axe scanner only under `/mnt/c/1MyCode/...` (WSL paths). REQ-UI-020 TR-031 expects `flex-end`, which Chromium 158 (Playwright 1.65) reports as `flow-end`. REQ-UI-063 and REQ-UI-021 fail only under parallel workers and pass when run alone.
- The demo's `app.css` is gitignored and built by `tools/tailwindcss.exe`, which this checkout does not have. Without the file, 8 more rows fail with a 404. It was generated here with the Tailwind 4.1.11 npm CLI.

- The release after 2.2.2 is not on GitHub Packages until the owner publishes it through the usual GitHub Release; the stored token can only read packages.
- CHANGELOG has no section for 2.1.10 or 2.2.0, which are already published; the owner fills them in.

## Verification log

Last five passes; older passes live in `docs/metrics/gates.jsonl`.

| Date | Phase | Result | Status table |
|---|---|---|---|
| 2026-11-02 | amend-docs | 78/78 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | triage-and-fix + handoff | 79/80 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | build-phase | 79/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | build-phase + handoff | 81/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-12 | verify REQ-UI-065, REQ-UI-066 | 83/83 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary

- TechieFlow: 0 open · 1 fixed upstream, not yet re-checked (TF-006) · 5 closed — docs/TrBlazeUI-TechieFlow-Feedback.md

## Standards compliance

- Last check 2026-11-02: 0 findings, see the checklist Remarks.

## Deferred / future

- Register `ContextMenuSub` in its list as Menubar now does (TR-023 cause).
- Submenu pull-back margin as a parameter.
- Dark Destructive Button text 2.77:1.
- InputGroup demo menu items only log; show the choice.
- Container-width `HideBelow`, if Chatur asks.
- No test forces the portal-timeout inline fallback.
- Framework `Virtualize` throws on dispose; not fixable here.
- `tools/splat-audit`: report `ApexChart.Dispose` upstream.
- Delete the stray `c2.0.5` tag (owner).
- Test with real assistive technology.
- Fix the badge overlap on `/verify-tflens-3`.
- Fold the three roving scripts into one.
