---
project: TrBlazeUI
last_updated: 2026-09-22
current_phase: Build — 1 to fix, 39 of 40 verified
last_verified_build: PASS
last_verified_date: 2026-09-22
---

# TrBlazeUI — Status

## Where I am

2.0.9 is published to GitHub Packages and carries Chatur's second batch — 85 component folders,
all six new controls present at the tag. The owner has settled the sources: GitHub Packages for
this organisation's own applications, nuget.org for external users. That is now in the AI
reference with the sign-in steps; the README was left alone as asked. REQ-FN-004 stays open: its
check demands the newest tag on nuget.org, true only for external versions.

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
| 2026-09-13 | handoff-phase | 35/35 Verified. Ready for UAT; 2.0.6 live on nuget.org. Build 0/0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-14 | triage-and-fix | 35/35 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-19 | triage-and-fix | 36/36 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-22 | triage-and-fix | 40/40 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-22 | amend-docs | 39/40 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary

- TechieFlow: 1 open · 0 closed — docs/TrBlazeUI-TechieFlow-Feedback.md

## Standards compliance

- Last check 2026-09-22: 0 findings, see the checklist Remarks.

## Deferred / future

- Tell TfLens 2.0.9 is out; their TR-039 and TR-040 shipped in 2.0.7.
- `Directory.Build.props` falls back to 2.1.0 while releases run 2.0.x. Owner's call.
- Re-run `tests/package/codex-agent-deployment.sh` for REQ-FN-010; it fails until then.
- TF-001: six phantom misses; asked upstream for `miss-void`.
- `tools/splat-audit` throws on the library assembly alone.
- Report `ApexChart.Dispose` upstream; then drop `DisconnectSafeApexChart`.
- Delete the stray `c2.0.5` tag (owner).
- Restore `/verify-trstudio` for REQ-UI-015.
- Test with real assistive technology.
- Fix the badge overlap on `/verify-tflens-3`.
- Fold `tree-view.js`, `nav-list.js` and `roving-focus.js` into one `roving-list.js`.
