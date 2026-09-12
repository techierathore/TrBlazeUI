---
project: TrBlazeUI
last_updated: 2026-09-12
current_phase: Verify — 1 not measurable, 34 of 35 verified
last_verified_build: PASS
last_verified_date: 2026-09-12
---

# TrBlazeUI — Status

## Where I am

34 of 35 rows verified, none failing. Today's reported CI failure is fixed: a release
tag with any prefix other than `v` killed the publish, so the tag-to-version rule now
lives once in `scripts/TagVersion.ps1`, strips any non-digit prefix with a warning,
and is tested on every push. REQ-FN-005 is re-verified. One row is left: publishing
the packages to nuget.org, which only a real publish can close.

## Next command to run

Claude Code:
```
(owner) 1 row(s) cannot be measured here — create the data, change the acceptance line, or mark the row N/A: REQ-FN-004
```
OpenCode:
```
(owner) 1 row(s) cannot be measured here — create the data, change the acceptance line, or mark the row N/A: REQ-FN-004
```
Every test carrying REQ-FN-004 is skipped, so another verify run changes nothing.

## Open requirements

| Status | Count |
|---|---|
| Not Started | 0 |
| In Progress | 0 |
| Implemented | 1 |
| Needs re-verify | 0 |
| Blocked | 0 |

- [ ] REQ-FN-004 — GitHub Packages CI/CD (publish-nuget.yml + build.yml) (Implemented)

## Known blockers

- REQ-FN-004 waits on the owner. Everything up to the push is fixed and tested; only a real, non-dry-run publish proves the row.
- The number for the next release is an open decision — `docs/TrBlazeUI-Decision-Request.md` holds it. nuget.org is live at 2.0.3, and the unreleased work changes existing behaviour, so the number is a signal rather than the next in sequence.
- The `c2.0.5` release is deleted; its tag is still on the repository and is the owner's to delete, because agents never run git.
- `/verify-trstudio` returns 404 and its page is missing from `demos/`, so REQ-UI-015's 14 checks cannot be reproduced. Its verdict rests on a run from 12 July.

## Verification log

Last five passes; older passes live in `docs/metrics/gates.jsonl`.

| Date | Phase | Result | Status table |
|---|---|---|---|
| 2026-08-31 | Build + verify (versioning) | REQ-FN-005 Verified — per-package MinVer removed on the owner's decision; ADR-005 superseded by ADR-008. Release 0/0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-12 | triage-and-fix | 34/35 Verified. REQ-UI-020 added; 6 rows re-verified. Build 0/0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-12 | verify-phase | 33/35 Verified. 13 PASS, 1 FAIL (REQ-NFR-001), 1 not tested (REQ-FN-004) | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-12 | Fix-issues + verify | REQ-NFR-001 Verified — accessibility findings 37 nodes → 0. 5 rows re-verified. Build 0/0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-09-12 | triage-and-fix | 34/35 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary

- None

## Standards compliance

- Last check 2026-09-12: 0 findings, see the checklist Remarks.

## Deferred / future

- Restore the `/verify-trstudio` harness page so REQ-UI-015's spec can run again.
- Have a person test with real assistive technology; the scanner covers only part of accessibility.
- Re-run `tests/package/codex-agent-deployment.sh`: the session sweep removed REQ-FN-010's consumer fixture, so its test fails until the fixture is rebuilt.
- Delete `scripts/release-*.sh` — dead code whose `components/v…` tag prefixes correspond to nothing in the build.
