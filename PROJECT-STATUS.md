---
project: TrBlazeUI
last_updated: 2026-11-19
current_phase: Release — handoff done, 95 of 95 verified
last_verified_build: PASS
last_verified_date: 2026-11-19
---

# TrBlazeUI — Status

## Where I am

99 rows Verified. REQ-UI-084 to REQ-UI-087 (AstroLyfe TR-016, TR-019, TR-021, TR-022) are Verified and sit in [Unreleased] in the CHANGELOG, with the Combobox Id behaviour change in the guides and the release notes. Full browser suite run 2026-11-21: seven tests failed under load in one pass and passed when re-run; package and version tests pass; build 0 warnings.

## Next command to run

Claude Code:
```
(owner) commit, then build and publish the package — its shipped documents are current; no agent command
```
OpenCode:
```
(owner) commit, then build and publish the package — its shipped documents are current; no agent command
```
Why: every row in this phase's scope is terminal and the shipped documents were brought up to date.

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

- Replies were written only in this repository's `docs/` copies; the apps' own feedback files were not touched (owner's rule of 2026-11-19).
- TrStudio TR-016 did not reproduce in Chromium; it needs the rendered class from TrStudio's Mac web view.
- Two old checks read one shared server log and clash under two workers (REQ-UI-021 TR-013, REQ-UI-028); REQ-UI-063 presses a key before its menu takes focus under load. Each passes alone.
- `tests/package/codex-agent-deployment.sh` rebuilds `bin/` without the Primitives dll; rebuild before REQ-FN-012.
- Mac (2026-11-11): REQ-NFR-001, REQ-UI-020, REQ-UI-063 and REQ-UI-021 fail from machine setup or parallel-worker flakes; each passes alone.
- The demo's gitignored `app.css` needs `tools/tailwindcss.exe`; without it 8 rows 404.
- CHANGELOG "Shipped in 2.2.3 to 2.2.5" is not yet split by release; 2.1.10 and 2.2.0 have no section.
- The MAUI WebView reload was not driven (no MAUI demo); the browser test makes the same state.

## Verification log

Last five passes; older passes live in `docs/metrics/gates.jsonl`.

| Date | Phase | Result | Status table |
|---|---|---|---|
| 2026-11-05 | build-phase | 79/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | build-phase + handoff | 81/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-12 | verify REQ-UI-065, REQ-UI-066 | 83/83 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-13 | triage-and-fix + handoff | 84/84 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-19 | triage-and-fix + handoff | 95/95 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary

- TechieFlow: 0 open · 1 fixed upstream, not yet re-checked (TF-006) · 5 closed — docs/TrBlazeUI-TechieFlow-Feedback.md

## Standards compliance

- Last check 2026-11-19: 0 findings in the 18 source files this run changed, see the checklist Remarks.

## Deferred / future

- Owner's call, not built: Chip, read-only InputOTP, Calendar day counts (MyDiary GLM-5.3).
- Register `ContextMenuSub` in its list as Menubar now does (TR-023 cause).
- Submenu pull-back margin as a parameter.
- Dark Destructive Button text 2.77:1.
- No test forces the portal-timeout inline fallback.
- Framework `Virtualize` throws on dispose; not fixable here.
- `tools/splat-audit`: report `ApexChart.Dispose` upstream.
- Delete the stray `c2.0.5` tag (owner).
- Test with real assistive technology.
- Fix the badge overlap on `/verify-tflens-3`.
- Fold the three roving scripts into one.
- Module-only `DisposeAsync`s could use `JSTeardown`.
