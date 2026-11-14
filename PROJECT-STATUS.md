---
project: TrBlazeUI
last_updated: 2026-11-13
current_phase: Release — handoff done, 84 of 84 verified
last_verified_build: PASS
last_verified_date: 2026-11-13
---

# TrBlazeUI — Status

## Where I am

Every row is Verified. New row REQ-UI-068 (Sevak TR-049): removing a component whose JavaScript side is already gone no longer ends the session. The fix covers `SidebarProvider` and ten more components through the new `JSTeardown` helper, and it is not in 2.2.4. 2.2.4 is on GitHub Packages and holds TR-047 and TR-048. CHANGELOG, the agent reference and Sevak's file are current.

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

- Mac (2026-11-11): REQ-NFR-001, REQ-UI-020, REQ-UI-063 and REQ-UI-021 fail from machine setup (WSL-only axe path, Chromium `flow-end`) or parallel-worker flakes; each passes alone.
- The demo's `app.css` is gitignored and needs `tools/tailwindcss.exe`, absent here; without it 8 rows 404. Generated with the Tailwind 4.1.11 npm CLI.
- TR-049 reaches consumers only when the owner publishes the release after 2.2.4.
- CHANGELOG `[Unreleased]` still holds what shipped in 2.2.3 and 2.2.4, beside TR-049; 2.1.10 and 2.2.0 have no section. The owner sorts the headings.
- The MAUI WebView reload was not driven (no MAUI demo); the browser test makes the same state.

## Verification log

Last five passes; older passes live in `docs/metrics/gates.jsonl`.

| Date | Phase | Result | Status table |
|---|---|---|---|
| 2026-11-05 | triage-and-fix + handoff | 79/80 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | build-phase | 79/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | build-phase + handoff | 81/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-12 | verify REQ-UI-065, REQ-UI-066 | 83/83 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-13 | triage-and-fix + handoff | 84/84 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |

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
- Module-only `DisposeAsync`s could use `JSTeardown`.
