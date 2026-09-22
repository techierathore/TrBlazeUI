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
- **Blocks:** no — 14 phantom escaped checks and 6 phantom misses in the metrics so far.
- **Repro:**
  ```
  bash .tfcore/utils/tf-phase.sh start triage-and-fix TrBlazeUI      # 2026-09-19T08:17:18Z
  bash .tfcore/utils/tf-triage.sh TrBlazeUI new "…" "…"               # one new row, REQ-UI-021
  bash .tfcore/utils/tf-triage.sh TrBlazeUI close --started 2026-09-19T08:17:18Z --cmd fix-issues
  → "triage: 14 row(s) logged — 14 gate record(s) (escaped), 6 miss(es)"
  ```
- **Expected:** `close` records only actions taken after `--started`: 1 check record, 1 miss.
- **Actual:** `tests/.artifacts/verify/triage.json` still held actions from the 2026-09-12 to 2026-09-14 runs, and `close` wrote them all again under today's run id: 13 check records (`gates.jsonl` 108–120) and 5 misses, `MISS-TrBlazeUI-20260919-01` to `-05`, for bugs already fixed.
- **Encountered in:** `*triage-and-fix TrBlazeUI docs/Chatur-TrBlazeUI-Feedback.md`, step 2.
- **Still happening 2026-09-22.** That run logged 8 rows; `close` reported 9. The ninth, REQ-UI-021, was created on 2026-09-19 and never touched: one `escaped` record plus `MISS-TrBlazeUI-20260922-01`, which has **no `miss-fix`** — nothing to fix — so it stays open for good.
- **Workaround:** none on the stream; nothing withdraws a record. Trimming the list by hand is why one leaked this time rather than thirteen. It shrinks the next run's blast radius, it fixes nothing.
- **Suggested fix:** in `close`, skip actions whose `ts` precedes `--started`, and empty the list afterwards. **And add a withdrawal record:** six open misses record work that was never open and will depress the resolved-miss rate on every future report. A `miss-void`, shaped like the existing `run-void`, would let a report exclude them.
