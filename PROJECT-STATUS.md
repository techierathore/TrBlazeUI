---
project: TrBlazeUI
last_updated: 2026-11-05
current_phase: Release — handoff done, 81 of 81 verified
last_verified_build: PASS
last_verified_date: 2026-11-05
---

# TrBlazeUI — Status

## Where I am

Every row is Verified. Ready for the release after 2.2.2: Chatur TR-023 and TR-024 (Menubar arrow order, submenu pull-back), the demo hosts on ASP.NET Core 10.0.14 (advisory clear), the Auto host serving its Blazor script again (REQ-FN-013), and the TrStudio harness page restored (REQ-UI-015). CHANGELOG [Unreleased], the agent reference, both guides and Chatur's feedback file are current.

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

- The release after 2.2.2 is not on GitHub Packages until the owner publishes it through the usual GitHub Release; the stored token can only read packages.
- CHANGELOG has no section for 2.1.10 or 2.2.0, which are already published; the owner fills them in.

## Verification log

Last five passes; older passes live in `docs/metrics/gates.jsonl`.

| Date | Phase | Result | Status table |
|---|---|---|---|
| 2026-11-02 | fix-issues + handoff | 78/78 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-02 | amend-docs | 78/78 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | triage-and-fix + handoff | 79/80 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | build-phase | 79/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-11-05 | build-phase + handoff | 81/81 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |

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
