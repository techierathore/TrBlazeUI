# TrBlazeUI — Misses

| | |
|---|---|
| App | TrBlazeUI |
| Count | 11 logged: 2 open, 9 fixed, 0 will not fix |
| Source | `docs/metrics/misses.jsonl`, one row per miss record. Rewritten by `tf-misses-md.sh` on every new record. Never edit it: a wrong row is corrected by a new record. |
| Updated | 2026-09-07 |

**Whose gap** answers the four questions of the miss protocol: **the app's spec** did not say it, so the checklist line is fixed; **the framework never said it**, so one requirement line and a check are added; **the check was too weak** (a review, or a script that did not fire), so the check is fixed; **said and ignored**, so the rule becomes a hook or is deleted. **not sorted** means the record predates the sort or nobody has answered yet; `bash .tfcore/utils/tf-emit.sh --amend <miss> sort <spec|unsaid|weak-check|ignored>` completes it.

## Open (2)

| Miss | Found | Whose gap | What went wrong |
|---|---|---|---|
| MISS-TrBlazeUI-20260831-11 (REQ-FN-004) | 2026-08-31 by owner | not sorted | no sentence recorded (wrong-behaviour, config, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-07 (REQ-FN-004) | 2026-08-31 by owner | not sorted | no sentence recorded (wrong-behaviour, config, why: insufficient-verify-method) |

## Fixed (9)

| Miss | Found | Closed | Whose gap | What went wrong |
|---|---|---|---|---|
| MISS-TrBlazeUI-20260831-10 (REQ-UI-009) | 2026-08-31 by owner | 2026-08-31 by fix-issues | not sorted | no sentence recorded (wrong-behaviour, config, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-09 | 2026-08-31 by owner | 2026-08-31 by fix-issues | not sorted | no sentence recorded (scope-creep, config, why: instruction-ignored) |
| MISS-TrBlazeUI-20260831-08 (REQ-FN-005) | 2026-08-31 by owner | 2026-08-31 by build-phase | not sorted | no sentence recorded (missed-requirement, checklist, why: missing-checklist-item) |
| MISS-TrBlazeUI-20260831-06 (REQ-UI-019) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (unspecified-gap, brd, why: missing-checklist-item) |
| MISS-TrBlazeUI-20260831-05 (REQ-FN-006) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (partial-implementation, other, why: missing-checklist-item) |
| MISS-TrBlazeUI-20260831-04 (REQ-UI-009) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (partial-implementation, src, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-03 (REQ-UI-005) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (wrong-behaviour, src, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-02 (REQ-UI-004) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (partial-implementation, src, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-01 (REQ-UI-001) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (wrong-behaviour, src, why: insufficient-verify-method) |
