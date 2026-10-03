# TechieFlow feedback — found while building TrBlazeUI

| | |
|---|---|
| App | TrBlazeUI |
| Upstream | TechieFlow |
| Updated | 2026-10-03 |

## Summary

3 entries: 0 blocking now, 1 open (TF-003, the document checker asks a library's UI rows for a mockup link), 1 fixed upstream and waiting to be re-checked here (TF-002, fixed 2026-10-02), 1 closed.

Nothing is blocked. TF-001 was re-checked on 2026-10-01 and is closed. TF-002 is fixed upstream. It could not be re-checked on the 2026-10-02 run: the fixed script arrived at 07:30, ten minutes after that run's verify step had already started, so the next run that chains a verify is the first that can show it.

## Resolution status (TechieFlow team, 2026-09-22)

| ID | Fix | Check it here |
|---|---|---|
| TF-001 | Fixed upstream. `tf-triage.sh close` skips every action older than `--started`, says how many it skipped, and empties the list once the records are written. New `tf-emit.sh --void-miss <miss_id> "<reason>"` withdraws a wrong miss: the report leaves it out of every figure and prints it under *withdrawn*, and `docs/TrBlazeUI-Misses.md` lists it under *Withdrawn*. The six false misses (`MISS-TrBlazeUI-20260919-01` to `-05`, `MISS-TrBlazeUI-20260922-01`) are withdrawn. The 14 false escaped check records stay: nothing withdraws a check record yet. | On your next `*triage-and-fix`, the close line counts only that run's rows. `bash .tfcore/telemetry/tf-metrics.sh --report` shows "withdrawn : 6 miss(es)". |
| TF-002 | Fixed upstream (2026-10-02). `tf-phase.sh start verify-phase` or `start metrics-report` no longer writes a new document baseline when the marker shows it is running inside `build-phase`, `fix-issues` or `triage-and-fix`. It keeps the outer command's baseline and prints "runs inside triage-and-fix — keeping its document baseline". Findings the triage creates now stay `FAIL` until the run ends. Side effect: a standalone verify started right after a fix also keeps the fix's baseline, which can only make the gate stricter. | On your next `*triage-and-fix`, the verify's step 0 prints "verify-phase runs inside triage-and-fix — keeping its document baseline" and no second "baseline written" line. `tf-doc-check.sh docs/TrBlazeUI-Checklist.md` prints the new rows' findings as `FAIL`, not `OLD`. |

## Entries

### TF-001 — Closing a triage records last week's bugs again under today's run

> ✅ **Closed 2026-10-01** — re-checked here: On the 2026-10-01 triage-and-fix run, tf-triage.sh close printed '3 row(s) logged, 3 gate record(s) (escaped), 3 miss(es)' for the 3 rows that run logged (REQ-UI-021, REQ-UI-026, REQ-UI-027); nothing from an earlier run was replayed. tf-metrics.sh --report printed 'withdrawn : 6 miss(es)' naming the six false misses.

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

### TF-002 — A command that chains another one has its own document findings relabelled as old

- **Severity:** minor
- **Blocks:** no — the findings are still printed; only their label is wrong, and the run carried on.
- **Repro:**
  ```
  bash .tfcore/utils/tf-phase.sh start triage-and-fix TrBlazeUI   # "baseline written … (106 old finding(s))"
  bash .tfcore/utils/tf-triage.sh TrBlazeUI new "…" "…"            # twice: two new rows
  bash .tfcore/utils/tf-phase.sh start verify-phase TrBlazeUI     # "baseline written … (114 old finding(s))"
  bash .tfcore/utils/tf-doc-check.sh docs/TrBlazeUI-Checklist.md  # the two new rows' findings print as OLD
  ```
- **Expected:** findings this run created stay `FAIL` until the run ends, whatever commands it runs inside itself.
- **Actual:** `*triage-and-fix` tells its fix step to start `verify-phase` with its own step 0, and its metrics step to start `metrics-report`. Each start writes a new baseline, so the findings the triage had just created (the old count rose from 106 to 114; on REQ-UI-026 and REQ-UI-027 they were an acceptance line too long, no BRD item named and no mockup link) became "from before this command" and stopped blocking.
- **Encountered in:** `*triage-and-fix TrBlazeUI`, 2026-10-01, at the status gate.
- **Workaround:** read the `OLD` lines for the rows this run added and fix them by hand, which is what was done here.
- **Suggested fix:** when a phase marker already exists for a running command, a chained start keeps the outer command's baseline instead of writing a new one.

### TF-003 — The document checker asks a library's UI rows for a mockup link

- **Severity:** minor
- **Blocks:** no — the row is built and verified; the gate passed once the workaround below was in place.
- **Repro:**
  ```
  bash .tfcore/utils/tf-triage.sh TrBlazeUI new "…" "When a consumer … on the Switch demo screen, then …" --prefix UI
  bash .tfcore/utils/tf-doc-check.sh docs/TrBlazeUI-Checklist.md
  → FAIL docs/TrBlazeUI-Checklist.md: REQ-UI-029 is a UI row without a mockup link
  ```
- **Expected:** a project whose `core-config.yaml` says `metrics.project_type: library` has no screens and no `docs/mockups/`, so a UI row is not asked for a mockup link (or the rule is a warning there). `tf-triage.sh new` already prints "a UI row needs a mockup link" for the same row.
- **Actual:** `tf-doc-check.py` line ~1101 fails every `REQ-UI` detail entry without a link into `docs/mockups/`. In this repo that is every UI row: 27 of them sit in the `OLD` list for this reason alone, and each new one (REQ-UI-026, -027, -029) fails the gate. The checklist says why at line 72: "UI REQs map to component families, not mockups (this library predates the mockup flow)."
- **Encountered in:** `*triage-and-fix TrBlazeUI` for Chatur TR-014, 2026-10-03, status gate step 3.
- **Workaround:** for REQ-UI-029 the design really came from a consumer's mockup, so Chatur's `settings-agents.html` and `chatur.css` were copied unchanged into `docs/mockups/` and linked. A link outside the repo does not work: the checker keeps only the `mockups/…` tail and looks for it under `docs/`. Rows with no consumer mockup have no honest workaround.
- **Suggested fix:** skip the mockup-link check (and the matching `tf-triage.sh new` note) when `project_type` is `library` or `docs`, the same way the verifier already skips mockup parity for a project with no mockups.
