# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-09-14** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 28 live runs counted, 3 voided | 2026-08-11 → 2026-09-14 |
| `gates.jsonl` | 107 (0 backfilled) | 2026-08-25 → 2026-09-14 |
| `sessions.jsonl` | 7 | 2026-08-09 → 2026-09-13 |
| `commits.jsonl` | 61 | 2026-02-09 → 2026-09-13 |
| `misses.jsonl` | 34 miss + 24 miss-fix + 1 miss-amend | 2026-08-31 → 2026-09-14 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below.

**Three run records are voided** and are outside every figure on this page. All three
are the same mistake: a `verify-phase` record written by a verifier chained inside a
fix, given the fix's start time, so it claimed the whole fix as verify time. They are
from 2026-09-12T08:54:30Z, 2026-09-13T12:16:23Z and 2026-09-14T18:51:15Z; the last is
inside the `*triage-and-fix` run that closed TfLens TR-039 and TR-040. The gate records
and the ledger from all three stand; only their cost and duration are not counted.

**This snapshot was taken after that 2026-09-14 run wrote its own run record**, so its
time and tokens are in §5 and §6.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 27 | 10 | **37%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 37% passing on their first *graded* attempt, not on their first *build*.**
Gate records began on 2026-08-25, when most of the catalogue was already built, so
for most of these rows "attempt 1" is the first time an existing implementation was
graded. It is unchanged from the last snapshot: the two rows graded again on
2026-09-14 (REQ-UI-002, REQ-UI-008) were already scored.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures |
|---|---|---|
| **library** | escaped — no gate caught it | 50 |
| **library** | acceptance | 1 |

Counts over 51 failures, as the tool reports them. The escape *rate* is in §3.

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**The escaped count is inflated.** The 2026-09-14 triage demoted two rows (REQ-UI-002
for TR-040, REQ-UI-008 for TR-039), but its close wrote 13 escaped records: one per row
named by every triage action still held in `tests/.artifacts/verify/triage.json`,
including 11 rows triaged on earlier days. The figure above counts those duplicates as
the tool reports them; it is not corrected by hand here.

Both of the real new escapes arrived as a report from a project building against the
published packages. Neither could have failed an existing check: one was written only to
the server log after a GC, and the other was a parameter one input had and its sibling
lacked.

**A library can never fail the visual-truth or mockup-parity gate**, because it has
no screens of its own: `tf-verify-list.sh` resolves 0 screens for every row. That is
why `project_type` separation is enforced.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate |
|---|---|---|
| `gates.jsonl` (live, library) | of graded failures, the share no gate caught | **94%** |
| `misses.jsonl` | of logged misses, the share that reached a consumer or the owner | **79%** |

The gate stream counts *grading events*; the miss stream counts *defects*. One defect
can produce several gate records (see the duplicates in §2), and a miss can have no gate
record behind it.

---

## 4. Miss attribution and rework cost

### 4.1 Counts — poolable

34 misses logged, 24 miss-fixes recorded, **13 still open**, 21 resolved, 0 orphan
fixes, 0 won't-fix, 1 amendment applied.

| Class | Count |
|---|---|
| wrong-behaviour | 16 |
| regression | 8 |
| partial-implementation | 4 |
| unspecified-gap | 4 |
| missed-requirement | 1 |
| scope-creep | 1 |

| Found by | Count |
|---|---|
| owner | 27 |
| library-feedback | 6 |
| gate | 1 |

**Design-miss share: 12%.** The rest are implementation defects, the expected shape
for a library whose requirements are its own published API.

TR-039 and TR-040 added **no new miss**: both rows already had an open
`wrong-behaviour` miss (REQ-UI-008, REQ-UI-002), so the triage collapsed onto those and
the fix wrote a miss-fix against each.

### 4.2 `why_missed` — over the records that carry the field

33 of 34 eligible records carry it; **0 predate the field**, and 0 escapes are
missing it. The one without it is completed with
`tf-emit.sh --amend <miss_id> why_missed <value>`.

| why_missed | Count |
|---|---|
| insufficient-verify-method | 26 |
| missing-checklist-item | 6 |
| instruction-ignored | 1 |

**Twenty-six of thirty-three misses got through because the existing check could not
have caught them.** The teardown checks for TR-036 read only "unhandled exception in
circuit"; the TR-039 fault is an unobserved task, which the demo host did not log at
all until this run added the logging and a forced finalizer pass.

### 4.3 `sort` — whose gap it was

23 of 34 records carry `sort`; **11 predate the field** and are outside the
denominator.

| sort | Count |
|---|---|
| weak-check | 19 |
| spec | 4 |

**Nineteen of twenty-three are `weak-check`**: a line existed and its check let the
defect through. Same finding as §4.2, seen from the other side.

### 4.4 Attribution — `linked` records only

**8 of 34 misses are attributed; 26 are excluded** because their
`origin_confidence` is not `linked`. Every figure here runs over those 8 records only.

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
| Tokens per miss — **measured** (`cost_attribution: sole`) | 58,942.7 | 3 |
| Tokens per miss — *apportioned* (`shared`) | 98,297.0 | 14 |
| Unattributable | — | 7 |

0 `sole` repairs are missing their token window. List price over the 3 measured
records: **$23.06 per miss**, a price and not a bill.

`cost_usd` is `null` on every record: all were produced on Claude Code, which exposes
no cost source. **Tokens are the measurement; dollars are list price.** Measured and
apportioned stay two columns, never one number.

---

## 5. Effort per phase

*Time, tokens, model and fan-out, grouped by `cmd`. A fact about runs, not tickets.*

28 live run records counted. **Token-window coverage: `tree` 9 · `main` 13 · `none` 4
· absent 2.** Only the 9 `tree` records read a subagent transcript, so fan-out figures
cover those alone; a `0` on a `main` record means *not observed*.

| Phase | Runs | Wall clock | Tokens out | Tokens in | % out | % time |
|---|---|---|---|---|---|---|
| build-phase | 2 | 5h42m | 80.9k | 182 | 3% | 40% |
| triage-and-fix | 5 | 3h21m | 1.45M | 13.3k | 52% | 23% |
| fix-issues | 4 | 1h38m | 473.8k | 2.1k | 17% | 11% |
| handoff-phase | 2 | 1h02m | 383.2k | 2.7k | 14% | 7% |
| triage-issues | 2 | 58m50s | 126.7k | 544 | 5% | 7% |
| verify-phase | 6 | 47m09s | 142.6k | 1.5k | 5% | 5% |
| amend-docs | 2 | 32m03s | 49.6k | 68 | 2% | 4% |
| refresh-status | 1 | 8m44s | 0 | 0 | 0% | 1% |
| log-miss | 2 | 5m49s | 52.5k | 118 | 2% | 1% |
| metrics-report | 2 | 5m29s | 34.1k | 92 | 1% | 1% |

Token figures cover only runs whose window was computable: `amend-docs` 1 of 2,
`build-phase` 1 of 2, `handoff-phase` 1 of 2, `triage-issues` 1 of 2, `verify-phase`
5 of 6, `refresh-status` 0 of 1, and every run of the other phases. Unmeasured runs are
**excluded, never counted as zero**, which is why `refresh-status` shows `0`.

**`*build-phase` costing more wall clock than `*log-miss` is a fact about what those
phases are, not a finding about either.** The warning in §4.4 applies here too.

Fixing reported defects remains this project's dominant cost: `triage-and-fix` alone now
carries just over half of all output tokens in under a quarter of the wall clock.
`build-phase` is the reverse, 40% of the wall clock for 3% of the output, because its
time goes into builds and smokes.

**Fan-out.** Where `subagents` (typed by the agent) and `subagent_runs` (counted from
the harness store) disagree, **the measured figure is right** (SCHEMA §2.6).
`build-phase` declared 2 where the store counted 0. No `triage-and-fix` run is `tree`
scope, so its fan-out is not observed on any of its 5 runs; the 2026-09-14 run declared
none, because its one builder cluster was implemented in the main session.

---

## 6. Poolable figures

Comparable across `project_type` and provenance.

| Measure | Value |
|---|---|
| Runs | 28 — `verify-phase` 6 · `triage-and-fix` 5 · `fix-issues` 4 · `amend-docs` 2 · `build-phase` 2 · `handoff-phase` 2 · `log-miss` 2 · `metrics-report` 2 · `triage-issues` 2 · `refresh-status` 1 |
| Rework ratio | insufficient data (n=2 `build-phase` runs) |
| Batch size | insufficient data (REQs per `build-phase` run) |
| REQ throughput | 9.63 REQs/hour (median across runs) |
| Sessions / tokens | 7 sessions, 2,943,249 tokens |
| Tokens per `Verified` REQ | 52,558.0 |
| List price | $424.03 over 22 priced runs |
| List price per `Verified` REQ | $7.57 |
| Commit cadence | 2.44 commits/active day (61 commits over 25 days) |

---

## 7. What is missing

- **The session stream stops at 2026-09-13.** The 2026-09-14 run has no session record,
  so `tokens_total` and tokens per `Verified` REQ in §6 are understated for that day.
- **The commit hook is present** (`commit_hook: true`), so the cadence figure in §6 is
  sound.
- **4 run records measured no tokens** (`none` scope) and **2 carry no window at all**.
  They are excluded from every token figure rather than averaged in as zero.
- **26 of 34 misses are unattributed.** Until `origin_confidence: linked` is the norm,
  §4.4 can carry counts only.
- **1 miss record carries no `why_missed`**; `tf-emit.sh --amend` is the remedy.
- **No perf budget is declared on any row**, so the perf gate has never run.
- **13 misses are open by the tool's count.** No row is below `Verified`, so these are
  misses whose rows were re-verified without the miss being closed; `*log-miss --fixed`
  per row closes them.
- **The triage close re-emits earlier actions.** `tf-triage.sh close` read every action
  in `triage.json`, not only this run's, and wrote 11 duplicate escaped gate records
  (§2). It again refused one miss for REQ-FN-004, whose sentence is not in the allowed
  wording list; that row already has an open miss.
- **The `fix-issues` close wrote no run record** on 2026-09-14: the emitter refused it for
  overlapping the verifier record that was later voided. The `triage-and-fix` record
  covers that window once.
