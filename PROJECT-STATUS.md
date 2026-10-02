---
project: TrBlazeUI
last_updated: 2026-10-01
current_phase: Build — 1 to fix, 41 of 42 verified
last_verified_build: PASS
last_verified_date: 2026-10-01
---

# TrBlazeUI — Status

## Where I am

Chatur's TR-011, TR-012 and TR-013 are fixed and verified in source: DataTable takes
attributes for rows, the header row and the choose-all control; ToggleGroup has OnVariant
and no longer reports a cancelled-task error on dispose. None of it is published; it ships in
the release after 2.0.9, which the owner cuts. 41 of 42 rows verified. REQ-FN-004 stays open
on the owner's decision about nuget.org.

## Next command to run

Claude Code:
```
/TechieFlow:agents:flow-master *build-phase TrBlazeUI
```
OpenCode:
```
/flow-master *build-phase TrBlazeUI
```
Why: 1 rows carry a defect (⚠ in Remarks) that a fix must clear before a verify: REQ-FN-004.

## Open requirements

| Status | Count |
|---|---|
| Not Started | 0 |
| In Progress | 0 |
| Implemented | 0 |
| Needs re-verify | 1 |
| Blocked | 0 |

- [ ] REQ-FN-004 — GitHub Packages CI/CD (publish-nuget.yml + build.yml) (Needs re-verify)

## Known blockers

- REQ-FN-004 cannot be fixed until the owner answers decision 1 in
  `docs/TrBlazeUI-Decision-Request.md`: were 2.0.7, 2.0.8 and 2.0.9 meant for external users
  too? Under the source policy just set, only external versions need be on nuget.org, and
  which of the three those are decides whether the check changes or three publishes run.
  Running the fix first would only guess. Do not run the command above until then.

## Verification log

Last five passes; older passes live in `docs/metrics/gates.jsonl`.

| Date | Phase | Result | Status table |
|---|---|---|---|
| 2026-09-14 | triage-and-fix | 35/35 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-19 | triage-and-fix | 36/36 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-22 | triage-and-fix | 40/40 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-22 | amend-docs | 39/40 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-10-01 | triage-and-fix | 41/42 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary

- TechieFlow: 1 open · 1 closed — docs/TrBlazeUI-TechieFlow-Feedback.md

## Standards compliance

- Last check 2026-10-01: 0 findings, see the checklist Remarks.

## Deferred / future

- Cut the release after 2.0.9 (owner); move CHANGELOG `[Unreleased]` under it.
- Sweep the TR-013 dispose gap in other controls (NavList, TreeView).
- Tell TfLens 2.0.9 is out.
- `Directory.Build.props` falls back to 2.1.0; owner's call.
- Re-run `tests/package/codex-agent-deployment.sh` for REQ-FN-010.
- `tools/splat-audit` throws on the library assembly alone.
- Report `ApexChart.Dispose` upstream.
- Delete the stray `c2.0.5` tag (owner).
- Restore `/verify-trstudio` for REQ-UI-015.
- Test with real assistive technology.
- Fix the badge overlap on `/verify-tflens-3`.
- Fold the three roving scripts into one.
