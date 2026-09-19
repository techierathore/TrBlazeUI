# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-09-19** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 31 live runs counted, 3 voided | 2026-08-11 → 2026-09-19 |
| `gates.jsonl` | 122 (0 backfilled) | 2026-08-25 → 2026-09-19 |
| `sessions.jsonl` | 8 | 2026-08-09 → 2026-09-15 |
| `commits.jsonl` | 63 | 2026-02-09 → 2026-09-15 |
| `misses.jsonl` | 40 miss + 25 miss-fix + 1 miss-amend | 2026-08-31 → 2026-09-19 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below.

**Three run records are voided** and are outside every figure on this page, as at the
last snapshot. All three are the same mistake: a `verify-phase` record written by a
verifier chained inside a fix, given the fix's start time. They are from
2026-09-12T08:54:30Z, 2026-09-13T12:16:23Z and 2026-09-14T18:51:15Z. The gate records
from all three stand; only their cost and duration are not counted. Today's verifier
record was written with its own start time (2026-09-19T09:02:52Z), so it needed no void.

### What is new since the 2026-09-14 snapshot

One piece of work: `*triage-and-fix TrBlazeUI docs/Chatur-TrBlazeUI-Feedback.md`,
started 2026-09-19T08:17:18Z. It opened **one new row, REQ-UI-021** (Chatur TR-001 to
TR-004: ScrollArea StickToEnd, TreeView, DiffView, joined ToggleGroup), logged it as a
spec miss (`MISS-TrBlazeUI-20260919-06`), fixed it, and the chained verifier
(`verify-phase`, started 2026-09-19T09:02:52Z) marked it **Verified**.

> **Today's telemetry is inflated by a framework defect, and the inflated records
> cannot be removed.** When the triage closed, `tf-triage.sh close` replayed old actions
> still held in `tests/.artifacts/verify/triage.json` (from the runs of 2026-09-12 to
> 2026-09-14) and wrote them again under today's run id, 2026-09-19T08:17:18Z. That
> added **13 spurious `escaped` gate records** and **5 duplicate misses**
> (`MISS-TrBlazeUI-20260919-01` to `-05`) for bugs already fixed on 2026-09-13 and
> 2026-09-14. The streams are append-only and there is no record type that withdraws a
> gate record or a miss, so they stay, and **every escape, gate-catch and miss figure
> below counts them as the tool prints it.** Nothing on this page is corrected by hand.
> Filed upstream as **TF-001** in `docs/TrBlazeUI-TechieFlow-Feedback.md`.

The 13 replayed gate records (`gates.jsonl` lines 108–120, all `gate:"escaped"`, all
run id 2026-09-19T08:17:18Z):

| REQ | Replayed records |
|---|---|
| REQ-UI-020 | 3 |
| REQ-UI-002 | 2 |
| REQ-UI-008 | 2 |
| REQ-UI-001 | 1 |
| REQ-UI-003 | 1 |
| REQ-UI-005 | 1 |
| REQ-UI-006 | 1 |
| REQ-FN-004 | 1 |
| REQ-FN-005 | 1 |

Only one gate record under that run id is genuine: **REQ-UI-021** (line 121). The TF-001
entry names seven of these REQs; the stream also carries replayed records for
REQ-UI-005 and REQ-UI-006, so the list above is the one to trust.

**Attempt numbers on those rows are now overstated.** Each gate record's `attempt` is
counted from the records before it, so every replayed record pushed its REQ's counter
forward: by three for REQ-UI-020, by two for REQ-UI-002 and REQ-UI-008, and by one for
the other six. The next live verify of any of those rows will carry an attempt number
that high. The first-pass rate is not affected, because every one of these rows was
already scored before today.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 28 | 10 | **36%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 36% passing on their first *graded* attempt, not on their first *build*.**
Gate records began on 2026-08-25, when most of the catalogue was already built. The
rate was 37% at the last snapshot; the change is REQ-UI-021, newly scored. Its first
gate record is the escape the triage wrote when it opened the row, so its `Verified`
today is attempt 2.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures | Share |
|---|---|---|---|
| **library** | escaped — no gate caught it | 64 | 98% |
| **library** | acceptance | 1 | 2% |

Counts over 65 failures, as the tool reports them. The escape *rate* is in §3.

**The escaped count is inflated twice over, and neither is corrected here.** 13 of the
64 escaped records are today's replay (listed above). The 2026-09-14 snapshot already
reported the same fault once before: that day's close also rewrote 11 earlier actions as
new escaped records. Both sets stay in the count.

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**A library can never fail the visual-truth or mockup-parity gate**, because it has
no screens of its own. That is why `project_type` separation is enforced.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate |
|---|---|---|
| `gates.jsonl` (live, library) | of graded failures, the share no gate caught | **94%** |
| `misses.jsonl` | of logged misses, the share found by the owner or in production | **82%** |

Both figures include today's replayed records: the 13 spurious escaped gate records in
the first, the 5 duplicate misses (all `found_by: owner`) in the second. The gate stream
counts *grading events*; the miss stream counts *defects*. At the last snapshot these
read 94% and 79%.

---

## 4. Miss attribution and rework cost

### 4.1 Counts — poolable

40 misses logged, 25 miss-fixes recorded, **18 still open**, 22 resolved, 0 orphan
fixes, 0 won't-fix, 1 amendment applied.

**Five of the 18 open misses are today's duplicates** (`MISS-TrBlazeUI-20260919-01` to
`-05`). They describe bugs fixed on 2026-09-13 and 2026-09-14 and have no fix record of
their own, so the tool counts them open. The genuine new miss, `-06` for REQ-UI-021, is
closed `Verified`.

| Class | Count |
|---|---|
| wrong-behaviour | 17 |
| regression | 11 |
| unspecified-gap | 6 |
| partial-implementation | 4 |
| missed-requirement | 1 |
| scope-creep | 1 |

| Found by | Count |
|---|---|
| owner | 33 |
| library-feedback | 6 |
| gate | 1 |

**Design-miss share: 15%** (was 12%). Two `unspecified-gap` records arrived today:
REQ-UI-021's genuine one, and duplicate `-01`. The duplicates also account for three of
the `regression` records and one `wrong-behaviour` record.

| Duplicate miss | REQ | Class |
|---|---|---|
| MISS-TrBlazeUI-20260919-01 | REQ-UI-020 | unspecified-gap |
| MISS-TrBlazeUI-20260919-02 | REQ-UI-020 | regression |
| MISS-TrBlazeUI-20260919-03 | REQ-UI-020 | wrong-behaviour |
| MISS-TrBlazeUI-20260919-04 | REQ-UI-008 | regression |
| MISS-TrBlazeUI-20260919-05 | REQ-UI-002 | regression |

### 4.2 `why_missed` — over the records that carry the field

39 of 40 eligible records carry it; **0 predate the field**, and 0 escapes are
missing it. The one without it is completed with
`tf-emit.sh --amend <miss_id> why_missed <value>`.

| why_missed | Count |
|---|---|
| insufficient-verify-method | 30 |
| missing-checklist-item | 8 |
| instruction-ignored | 1 |

Four of the `insufficient-verify-method` records and one `missing-checklist-item`
record are today's duplicates. REQ-UI-021's miss is `missing-checklist-item`: the four
Chatur requests were features the checklist never listed.

### 4.3 `sort` — whose gap it was

29 of 29 eligible records carry `sort`; **11 predate the field** and are outside the
denominator.

| sort | Count |
|---|---|
| weak-check | 23 |
| spec | 6 |

Four `weak-check` and one `spec` are duplicates; REQ-UI-021's is `spec`.

### 4.4 Attribution — `linked` records only

**8 of 40 misses are attributed; 32 are excluded** because their
`origin_confidence` is not `linked`. None of today's six misses is linked, so the
attributed set is unchanged.

| Origin phase | Misses |
|---|---|
| fix-issues | 6 |
| build-phase | 2 |

| Origin model | Misses |
|---|---|
| claude-opus-5 | 7 |
| unrecorded | 1 |

| Origin agent | Misses |
|---|---|
| general-purpose | 4 |
| flow-master | 3 |
| trblazeui | 1 |

> **These rankings are observational, not causal.** Which model and agent get the hard
> work is not random: a phase that handles consumer-feedback defects will out-miss one
> that renders a document, whatever drives it. With n=8, no percentage is printed.

### 4.5 Rework cost

| Measure | Value | Records |
|---|---|---|
| Tokens per miss — **measured** (`cost_attribution: sole`) | 139,895.0 | 4 |
| Tokens per miss — *apportioned* (`shared`) | 98,297.0 | 14 |
| Unattributable | — | 7 |

0 `sole` repairs are missing their token window. List price over the 4 measured
records: **$26.20 per miss**, a price and not a bill.

The measured figure rose from 58,942.7 (n=3) because one new `sole` record arrived:
REQ-UI-021's fix, whose window is today's whole triage-and-fix run (382,752 output
tokens on the record). That run did four features' work for one REQ, so it weighs
heavily in a set of four.

`cost_usd` is `null` on every record: all were produced on Claude Code, which exposes
no cost source. **Tokens are the measurement; dollars are list price.** Measured and
apportioned stay two columns, never one number.

---

## 5. Effort per phase

*Time, tokens, model and fan-out, grouped by `cmd`. A fact about runs, not tickets.*

31 live run records counted. **Token-window coverage: `tree` 9 · `main` 15 · `none` 5
· absent 2.** Only the 9 `tree` records read a subagent transcript, so fan-out figures
cover those alone; a `0` on a `main` record means *not observed*.

| Phase | Runs | Wall clock | Tokens out | Tokens in | % out | % time |
|---|---|---|---|---|---|---|
| build-phase | 2 | 5h42m | 80.9k | 182 | 3% | 38% |
| triage-and-fix | 5 | 3h20m | 1.5M | 13.3k | 46% | 22% |
| fix-issues | 6 | 2h23m | 856.6k | 2.6k | 27% | 16% |
| handoff-phase | 2 | 1h01m | 383.2k | 2.7k | 12% | 7% |
| triage-issues | 2 | 58m50s | 126.7k | 544 | 4% | 6% |
| verify-phase | 7 | 51m39s | 147.9k | 1.5k | 5% | 6% |
| amend-docs | 2 | 32m03s | 49.6k | 68 | 2% | 4% |
| refresh-status | 1 | 8m44s | 0 | 0 | 0% | 1% |
| log-miss | 2 | 5m49s | 52.5k | 118 | 2% | 1% |
| metrics-report | 2 | 5m29s | 34.1k | 92 | 1% | 1% |

Token figures cover only runs whose window was computable: `amend-docs` 1 of 2,
`build-phase` 1 of 2, `fix-issues` 5 of 6, `handoff-phase` 1 of 2, `triage-issues` 1 of
2, `verify-phase` 6 of 7, `refresh-status` 0 of 1, and every run of the other phases.
Unmeasured runs are **excluded, never counted as zero**, which is why `refresh-status`
shows `0`. Every measured run was 100% `claude-opus-5`.

**Today's triage-and-fix run is filed under `fix-issues`, not `triage-and-fix`.** The
triage close was called with `--cmd fix-issues`, so its run record (started
2026-09-19T08:17:18Z, 45m34s, 382.8k output tokens) landed in the `fix-issues` row;
the `triage-and-fix` row still holds the same 5 runs as on 2026-09-14. A second
`fix-issues` record, 2 seconds long with no REQs and no token window, was written at
the close (started 2026-09-19T09:07:22Z); it adds a run to the count and nothing else.

**`*build-phase` costing more wall clock than `*log-miss` is a fact about what those
phases are, not a finding about either.** The warning in §4.4 applies here too.

Fixing reported defects remains this project's dominant cost: `triage-and-fix` alone
carries 46% of all output tokens in 22% of the wall clock, and `fix-issues` (which now
includes today's triage run) carries 27% in 16%.
`build-phase` is the reverse, 38% of the wall clock for 3% of the output, because its
time goes into builds and smokes.

**Fan-out.** Where `subagents` (typed by the agent) and `subagent_runs` (counted from
the harness store) disagree, **the measured figure is right** (SCHEMA §2.6).

| Phase | Observed runs | Declared | Measured spawns |
|---|---|---|---|
| fix-issues | 3 of 6 | 3 | 6 |
| triage-issues | 1 of 2 | 1 | 4 |
| build-phase | 1 of 2 | 2 | 0 |
| metrics-report | 1 of 2 | 1 | 1 |

No `triage-and-fix` run is `tree` scope, so its fan-out is not observed on any of its 5
runs. Today's `fix-issues` record is `main` scope and declared the literal string
`none` as a subagent kind; that entry is a label, not a spawn.

---

## 6. Poolable figures

Comparable across `project_type` and provenance.

| Measure | Value |
|---|---|
| Runs | 31 — `verify-phase` 7 · `fix-issues` 6 · `triage-and-fix` 5 · `amend-docs` 2 · `build-phase` 2 · `handoff-phase` 2 · `log-miss` 2 · `metrics-report` 2 · `triage-issues` 2 · `refresh-status` 1 |
| Rework ratio | insufficient data (n=2 `build-phase` runs) |
| Batch size | insufficient data (REQs per `build-phase` run) |
| REQ throughput | 9.63 REQs/hour (median across runs) |
| Sessions / tokens | 8 sessions, 3,541,214 tokens |
| Tokens per `Verified` REQ | 62,126.6 |
| List price | $461.58 over 24 priced runs |
| List price per `Verified` REQ | $8.10 |
| Commit cadence | 2.42 commits/active day (63 commits over 26 days) |

---

## 7. What is missing

- **Today's figures carry 13 spurious gate records and 5 duplicate misses** (TF-001,
  top of page). No record type exists to withdraw either, so they stay in the escape
  rate, the gate-catch distribution, the miss counts and the open-miss count. The fix
  belongs upstream: `close` should skip actions older than `--started`, and the schema
  needs a withdraw record for gates and misses like the one runs already have
  (`run-void`, SCHEMA §2.7).
- **The five duplicate misses stay open** unless the owner closes them. They do not
  describe open bugs.
- **The session stream stops at 2026-09-15.** The 2026-09-14 session has now arrived;
  today's session has no record yet, so session tokens and tokens per `Verified` REQ in
  §6 are understated for today.
- **The commit hook is present** (`commit_hook: true`), so the cadence figure in §6 is
  sound.
- **5 run records measured no tokens** (`none` scope, including today's 2-second
  `fix-issues` record) and **2 carry no window at all**. They are excluded from every
  token figure rather than averaged in as zero.
- **32 of 40 misses are unattributed.** Until `origin_confidence: linked` is the norm,
  §4.4 can carry counts only.
- **1 miss record carries no `why_missed`**; `tf-emit.sh --amend` is the remedy.
- **11 misses predate the `sort` field**; `tf-emit.sh --amend <miss_id> sort <value>`
  sorts them.
- **No perf budget is declared on any row**, so the perf gate has never run.
- **No run record for this report.** This snapshot was produced without writing a
  `metrics-report` record to `runs.jsonl`, so its own time and tokens are not in §5.
