# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-09-13** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 23 live runs counted, 2 voided | 2026-08-11 → 2026-09-13 |
| `gates.jsonl` | 77 (0 backfilled) | 2026-08-25 → 2026-09-13 |
| `sessions.jsonl` | 6 | 2026-08-09 → 2026-09-12 |
| `commits.jsonl` | 59 | 2026-02-09 → 2026-09-12 |
| `misses.jsonl` | 28 miss + 22 miss-fix + 1 miss-amend | 2026-08-31 → 2026-09-13 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below.

**Two run records are voided** and are outside every figure on this page. Both are
the same mistake: a `verify-phase` record written by a verifier chained inside a fix,
given the fix's start time, so it claimed the whole fix as verify time. One is from
2026-09-12T08:54:30Z; the other is from 2026-09-13T12:16:23Z, inside the
`*triage-and-fix` run that closed TfLens TR-036 to TR-038. The gate records and the
ledger from both stand; only their cost and duration are not counted.

**This snapshot was taken before that 2026-09-13 run wrote its own run record**, so
that run's time and tokens are not yet in §5 or §6.

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
2026-09-13 (REQ-UI-001, REQ-UI-020) were already scored.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures |
|---|---|---|
| **library** | escaped — no gate caught it | 37 |
| **library** | acceptance | 1 |

Counts over 38 failures, as the tool reports them. The escape *rate* is in §3.

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**Every new failure since the last snapshot escaped**, because each one arrived as a
report from a project building against the published packages. The 2026-09-13 run
added TR-036, TR-037 and TR-038 from TfLens. Two of those three got past a check that
already existed: the REQ-UI-020 page already drew the short chart form with labels
turned on, and already drew a truncated outline badge, but neither check measured
the labels or the colour.

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
| `misses.jsonl` | of logged misses, the share that reached a consumer or the owner | **75%** |

The gate stream counts *grading events*; the miss stream counts *defects*. One defect
can produce several gate records, and a miss can have no gate record behind it.

---

## 4. Miss attribution and rework cost

### 4.1 Counts — poolable

28 misses logged, 22 miss-fixes recorded, **9 still open**, 19 resolved, 0 orphan
fixes, 0 won't-fix, 1 amendment applied.

| Class | Count |
|---|---|
| wrong-behaviour | 15 |
| partial-implementation | 4 |
| regression | 4 |
| unspecified-gap | 3 |
| missed-requirement | 1 |
| scope-creep | 1 |

| Found by | Count |
|---|---|
| owner | 21 |
| library-feedback | 6 |
| gate | 1 |

**Design-miss share: 11%.** The rest are implementation defects, the expected shape
for a library whose requirements are its own published API.

### 4.2 `why_missed` — over the records that carry the field

27 of 28 eligible records carry it; **0 predate the field**, and 0 escapes are
missing it. The one without it is completed with
`tf-emit.sh --amend <miss_id> why_missed <value>`.

| why_missed | Count |
|---|---|
| insufficient-verify-method | 21 |
| missing-checklist-item | 5 |
| instruction-ignored | 1 |

**Twenty-one of twenty-seven misses got through because the existing check could not
have caught them.** The 2026-09-13 three fit the pattern: an exception written only to
the server log, a label switched off by a library the wrapper calls, and a class
deleted by the merge. None fails a build, and none shows in a screenshot unless a check
reads the log, counts the labels or compares the computed colour. The checks added
that day do exactly that.

### 4.3 `sort` — whose gap it was

17 of 28 records carry `sort`; **11 predate the field** and are outside the
denominator.

| sort | Count |
|---|---|
| weak-check | 14 |
| spec | 3 |

**Fourteen of seventeen are `weak-check`**: a line existed and its check let the
defect through. Same finding as §4.2, seen from the other side.

### 4.4 Attribution — `linked` records only

**7 of 28 misses are attributed; 21 are excluded** because their
`origin_confidence` is not `linked`. Every figure here runs over those 7 records only.

| Origin phase | Misses |
|---|---|
| fix-issues | 5 |
| build-phase | 2 |

| Origin model | Misses |
|---|---|
| claude-opus-5 | 6 |
| unrecorded | 1 |

| Origin agent | Misses |
|---|---|
| flow-master | 3 |
| general-purpose | 3 |
| trblazeui | 1 |

> **These rankings are observational, not causal.** Which model and agent get the hard
> work is not random: a phase that handles consumer-feedback defects will out-miss one
> that renders a document, whatever drives it. With n=7, no percentage is printed.

### 4.5 Rework cost

| Measure | Value | Records |
|---|---|---|
| Tokens per miss — **measured** (`cost_attribution: sole`) | 58,942.7 | 3 |
| Tokens per miss — *apportioned* (`shared`) | 75,958.1 | 12 |
| Unattributable | — | 7 |

0 `sole` repairs are missing their token window. List price over the 3 measured
records: **$23.06 per miss**, a price and not a bill.

`cost_usd` is `null` on every record: all were produced on Claude Code, which exposes
no cost source. **Tokens are the measurement; dollars are list price.** Measured and
apportioned stay two columns, never one number.

---

## 5. Effort per phase

*Time, tokens, model and fan-out, grouped by `cmd`. A fact about runs, not tickets.*

23 live run records counted. **Token-window coverage: `tree` 9 · `main` 8 · `none` 4
· absent 2.** Only the 9 `tree` records read a subagent transcript, so fan-out figures
cover those alone; a `0` on a `main` record means *not observed*.

| Phase | Runs | Wall clock | Tokens out | Tokens in | % out | % time |
|---|---|---|---|---|---|---|
| build-phase | 2 | 5h42m | 80.9k | 182 | 6% | 50% |
| fix-issues | 4 | 1h38m | 473.8k | 2.1k | 38% | 14% |
| triage-and-fix | 3 | 1h23m | 339.8k | 950 | 27% | 12% |
| triage-issues | 2 | 58m50s | 126.7k | 544 | 10% | 9% |
| verify-phase | 4 | 33m44s | 91.7k | 238 | 7% | 5% |
| amend-docs | 2 | 32m03s | 49.6k | 68 | 4% | 5% |
| handoff-phase | 1 | 12m56s | 0 | 0 | 0% | 2% |
| refresh-status | 1 | 8m44s | 0 | 0 | 0% | 1% |
| log-miss | 2 | 5m49s | 52.5k | 118 | 4% | 1% |
| metrics-report | 2 | 5m29s | 34.1k | 92 | 3% | 1% |

Token figures cover only runs whose window was computable: `amend-docs` 1 of 2,
`build-phase` 1 of 2, `triage-issues` 1 of 2, and every run of the other phases with
tokens shown. Unmeasured runs are **excluded, never counted as zero**, which is why
`handoff-phase` and `refresh-status` show `0`.

**`*build-phase` costing more wall clock than `*log-miss` is a fact about what those
phases are, not a finding about either.** The warning in §4.4 applies here too.

Fixing reported defects remains this project's dominant cost: `fix-issues` and
`triage-and-fix` together account for most of the output tokens over about a quarter of
the wall clock. `build-phase` is the reverse, half the wall clock for 6% of the output,
because its time goes into builds and smokes.

**Fan-out.** Where `subagents` (typed by the agent) and `subagent_runs` (counted from
the harness store) disagree, **the measured figure is right** (SCHEMA §2.6).
`build-phase` declared 2 where the store counted 0.

---

## 6. Poolable figures

Comparable across `project_type` and provenance.

| Measure | Value |
|---|---|
| Runs | 23 — `fix-issues` 4 · `verify-phase` 4 · `triage-and-fix` 3 · `amend-docs` 2 · `build-phase` 2 · `log-miss` 2 · `metrics-report` 2 · `triage-issues` 2 · `handoff-phase` 1 · `refresh-status` 1 |
| Rework ratio | insufficient data (n=2 `build-phase` runs) |
| Batch size | insufficient data (REQs per `build-phase` run) |
| REQ throughput | 11.25 REQs/hour (median across runs) |
| Sessions / tokens | 6 sessions, 1,846,497 tokens |
| Tokens per `Verified` REQ | 47,346.1 |
| List price | $298.08 over 17 priced runs |
| List price per `Verified` REQ | $7.64 |
| Commit cadence | 2.46 commits/active day (59 commits over 24 days) |

---

## 7. What is missing

- **The session stream stops at 2026-09-12.** Runs after that have no session record,
  so `tokens_total` and tokens per `Verified` REQ in §6 are understated for that
  window.
- **The commit hook is present** (`commit_hook: true`), so the cadence figure in §6 is
  sound.
- **4 run records measured no tokens** (`none` scope) and **2 carry no window at all**.
  They are excluded from every token figure rather than averaged in as zero.
- **21 of 28 misses are unattributed.** Until `origin_confidence: linked` is the norm,
  §4.4 can carry counts only.
- **1 miss record carries no `why_missed`**; `tf-emit.sh --amend` is the remedy.
- **No perf budget is declared on any row**, so the perf gate has never run.
- **9 misses are open by the tool's count.** Six are the TfLens TR-028 to TR-035
  entries, whose rows were re-verified on 2026-09-12 without their misses being
  closed; `*log-miss --fixed` per row closes them. The 2026-09-13 triage found open
  misses already on REQ-UI-001 and REQ-UI-020, so no second miss was written for
  TR-036 to TR-038, and the fix closed onto those existing records.
- **One miss was refused by the emitter** during the 2026-09-13 triage, for REQ-FN-004:
  its sentence was not in the allowed wording list. The row already has an open miss
  from 2026-08-31, so nothing is lost.
