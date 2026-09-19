# TechieFlow feedback — found while building TrBlazeUI

| | |
|---|---|
| App | TrBlazeUI |
| Upstream | TechieFlow |
| Updated | 2026-09-19 |

## Summary

1 entry: 0 blocking now, 1 filed and not blocking, 0 fixed upstream.

Nothing is blocked.

## Entries

### TF-001 — Closing a triage records last week's bugs again under today's run

- **Severity:** major
- **Blocks:** no — the fix work goes on. The metrics count 13 extra escaped checks and 5 extra misses for 2026-09-19.
- **Repro:**
  ```
  bash .tfcore/utils/tf-phase.sh start triage-and-fix TrBlazeUI      # 2026-09-19T08:17:18Z
  bash .tfcore/utils/tf-triage.sh TrBlazeUI new "…" "…"               # one new row, REQ-UI-021
  bash .tfcore/utils/tf-triage.sh TrBlazeUI close --started 2026-09-19T08:17:18Z --cmd fix-issues
  → "triage: 14 row(s) logged — 14 gate record(s) (escaped), 6 miss(es)"
  ```
- **Expected:** `close` records only the actions taken after `--started`: 1 check record and 1 miss for REQ-UI-021.
- **Actual:** `tests/.artifacts/verify/triage.json` still held the actions from the 2026-09-12 to 2026-09-14 runs, and `close` wrote all of them again with today's run id. It added 13 check records for REQ-UI-001, -002, -003, -005, -006, -008, -020, REQ-FN-004 and REQ-FN-005 (`gates.jsonl` lines 108 to 120), and 5 misses, `MISS-TrBlazeUI-20260919-01` to `-05`, for bugs fixed on 2026-09-13 and 2026-09-14.
- **Encountered in:** `*triage-and-fix TrBlazeUI docs/Chatur-TrBlazeUI-Feedback.md`, step 2.
- **Workaround:** none on the stream. The records can't be edited, and no record type withdraws a check record or a miss. The action list was trimmed by hand to today's action so later steps don't replay it again.
- **Suggested fix:** in `close`, skip actions whose `ts` is before `--started`, and empty the action list after a successful close. Also add a record type that withdraws a wrong check record or miss.
