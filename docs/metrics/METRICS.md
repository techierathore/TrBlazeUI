# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-09-12** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 21 live (22 run + 1 run-void) | 2026-08-11 → 2026-09-12 |
| `gates.jsonl` | 64 (0 backfilled) | 2026-08-25 → 2026-09-12 |
| `sessions.jsonl` | 6 | 2026-08-09 → 2026-09-12 |
| `commits.jsonl` | 57 | 2026-02-09 → 2026-09-12 |
| `misses.jsonl` | 25 miss + 20 miss-fix + 1 miss-amend | 2026-08-31 → 2026-09-12 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below — there is no reconstructed data to keep apart from
recorded data.

**One run record is voided** and is outside every figure on this page: a
`verify-phase` window of 2026-09-12T08:54:30Z that was the inline verify of a
`*fix-issues` run and was given the fix's start time, so it claimed the whole fix as
verify time. The gate records and the ledger it wrote stand; only its cost and
duration are not counted, and the `fix-issues` record that replaces it covers the
same window once.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 27 | 10 | **37%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**Read this figure for what it is: 37% passed on their first *graded* attempt, not
on their first *build*.** Gate records began on 2026-08-25, by which time the
library was already at 2.1.0 with most of its catalogue built, so for most of these
27 rows the stream's "attempt 1" is the first time an existing implementation was
graded — not a requirement built and verified inside the instrumented period. The
figure only becomes a statement about build quality once a REQ is written, built and
graded entirely after 2026-08-25. It read 0% on the previous snapshot because no row
had yet been graded from a standing start at all; the full functional and UI sweep of
2026-09-12 is what put ten on the board.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures |
|---|---|---|
| **library** | escaped — no gate caught it | 26 |
| **library** | acceptance | 1 |

Counts over 27 grading events, as the tool reports them. The escape *rate* is in §3
and is the tool's own figure; no share is worked out by hand on this page.

Late-added gates, and what they have seen on this data:

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**The first non-escape in this project's history is on this snapshot.** Every failure
before 2026-09-12 arrived as consumer feedback about code that had already shipped —
TfLens, TechieBlog, TrStudio, AstroLyfe building against published packages — so no
gate of this project's stood between the defect and the reporter. On 2026-09-12 the
**acceptance** gate caught REQ-NFR-001's accessibility failure (7 findings across 37
places) before any consumer saw it, because that row finally had an executable
scanner behind it rather than a review. One record is not a trend, but it is the
first evidence that the remedy §4.2 keeps pointing at actually works.

**A library can never fail the visual-truth or mockup-parity gate**, because it has
no screens of its own to fail on: `tf-verify-list.sh` resolves 0 screens for every
row. That is why `project_type` separation is enforced — pooling this distribution
with an `app` project's would understate the visual gate everywhere.

---

## 3. Escape rate

Two different questions, computed from two different streams. They are reported
side by side and are never merged into one number.

| Source | Definition | Rate |
|---|---|---|
| `gates.jsonl` (live, library) | of graded failures, the share no gate caught | **94%** (26 of 27) |
| `misses.jsonl` | of logged misses, the share that reached a consumer or the owner | **72%** |

The two differ because they count different things: the gate stream counts *grading
events*, the miss stream counts *defects*. One defect can produce several gate
records, and a miss can be logged with no gate record behind it at all.

---

## 4. Miss attribution and rework cost

### 4.1 Counts — poolable

25 misses logged, 20 miss-fixes recorded, **8 still open**, 0 orphan fixes, 0
won't-fix, 1 amendment applied.

| Class | Count |
|---|---|
| wrong-behaviour | 14 |
| partial-implementation | 4 |
| unspecified-gap | 3 |
| regression | 2 |
| missed-requirement | 1 |
| scope-creep | 1 |

| Found by | Count |
|---|---|
| owner | 18 |
| library-feedback | 6 |
| gate | 1 |

**Design-miss share: 12%.** The rest are implementation defects, not specification
defects — which is the expected shape for a component library whose requirements
are its own published API.

`found_by: gate` appears for the first time on this snapshot — the same single
record as §2.

### 4.2 `why_missed` — over the records that carry the field

24 of 25 eligible records carry it; **0 predate the field**, and 0 escapes are
missing it. The one record without it is completed with
`tf-emit.sh --amend <miss_id> why_missed <value>`, not by editing the stream.

| why_missed | Count |
|---|---|
| insufficient-verify-method | 18 |
| missing-checklist-item | 5 |
| instruction-ignored | 1 |

**This is the most actionable table on the page.** Eighteen of twenty-four misses
were missed because *the check that existed could not have caught them* — not
because a check was skipped. That matches what the fixes themselves keep finding: a
parameter nothing read, a class silently deleted by a merge, a token declared and
read by nothing, and on 2026-09-12 a release-tag rule that had never been run against
a tag. None of those fail a build, throw at runtime, or look wrong in a screenshot.
The remedy is the kind of assertion these sessions keep adding — measuring the
computed style, the rendered element, or the rule's actual output rather than the
presence of markup.

### 4.3 `sort` — whose gap it was

14 of 25 records carry `sort`; **11 predate the field** and are outside the
denominator.

| sort | Count |
|---|---|
| weak-check | 11 |
| spec | 3 |

**Eleven of fourteen are `weak-check`** — a line existed and its check let the defect
through. That is the same finding as §4.2 seen from the other side, and it is what
makes "fix the check, not just the code" the standing instruction for this project.

### 4.4 Attribution — `linked` records only

**6 of 25 misses are attributed; 19 are excluded** because their
`origin_confidence` is not `linked`. Every figure in this sub-section runs over
those 6 records and no others.

| Origin phase | Misses |
|---|---|
| fix-issues | 4 |
| build-phase | 2 |

| Origin model | Misses |
|---|---|
| claude-opus-5 | 5 |
| unrecorded | 1 |

| Origin agent | Misses |
|---|---|
| flow-master | 3 |
| general-purpose | 2 |
| trblazeui | 1 |

> **These rankings are observational, not causal.** Which model and which agent get
> the hard work is not random — a phase that handles consumer-feedback defects will
> out-miss one that renders a document, whatever is driving it. A routing decision
> made on this table would be made on a confounded number. With n=6 it is barely
> above this report's three-record floor, which is why no percentage is printed
> beside any of these counts.

### 4.5 Rework cost

| Measure | Value | Records |
|---|---|---|
| Tokens per miss — **measured** (`cost_attribution: sole`) | 58,942.7 | 3 |
| Tokens per miss — *apportioned* (`shared`) | 41,919.5 | 10 |
| Unattributable | — | 7 |

0 `sole` repairs are missing their token window, so nothing is averaged in as a free
fix. List price over the 3 measured records: **$23.06 per miss** — a price, not a
bill.

`cost_usd` is `null` on every record here: all of them were produced on Claude Code,
which exposes no cost source, and inventing one would be an estimate presented as a
measurement. **Tokens are the measurement; dollars are list price.**

Measured and apportioned are two columns and never one number: a fix run that
repaired six misses has one token window, and dividing it six ways is arithmetic,
not observation.

---

## 5. Effort per phase

*Time, tokens, model and fan-out, grouped by `cmd`. This is a fact about runs, not
about tickets — there is no per-feature timing field and there will not be one.*

21 live run records. **Token-window coverage: `tree` 9 · `main` 6 · `none` 4 ·
absent 2.** Only the 9 `tree` records ever read a subagent transcript, so fan-out
figures cover those alone; a `0` on a `main` record means *not observed*, never
*none ran*.

| Phase | Runs | Wall clock | Tokens out | Tokens in | % out | % time |
|---|---|---|---|---|---|---|
| build-phase | 2 | 5h42m | 80.9k | 182 | 7% | 53% |
| fix-issues | 4 | 1h38m | 473.8k | 2.1k | 43% | 15% |
| triage-issues | 2 | 58m50s | 126.7k | 544 | 11% | 9% |
| triage-and-fix | 1 | 48m01s | 203.3k | 582 | 18% | 7% |
| verify-phase | 4 | 33m44s | 91.7k | 238 | 8% | 5% |
| amend-docs | 2 | 32m03s | 49.6k | 68 | 4% | 5% |
| handoff-phase | 1 | 12m56s | 0 | 0 | 0% | 2% |
| refresh-status | 1 | 8m44s | 0 | 0 | 0% | 1% |
| log-miss | 2 | 5m49s | 52.5k | 118 | 5% | 1% |
| metrics-report | 2 | 5m29s | 34.1k | 92 | 3% | 1% |

Token figures cover only the runs whose window was computable: `amend-docs` 1 of 2,
`build-phase` 1 of 2, `triage-issues` 1 of 2, `verify-phase` 3 of 4, `fix-issues` 4
of 4. The unmeasured runs are **excluded, never counted as zero** — which is why
`handoff-phase` and `refresh-status` show `0`.

**`*build-phase` costing more wall clock than `*log-miss` is a fact about what those
phases are, not a finding about either.** The same warning that governs §4.4 governs
this table.

The row worth reading is `fix-issues`: **43% of all output tokens over 15% of the
wall clock.** Fixing reported defects is this project's dominant cost, and it is
token-dense rather than time-dense — the work is reading code and reasoning about
root causes, not waiting on builds. `build-phase` is the mirror image: 53% of the
wall clock for 7% of the output, because its time goes into builds and smokes.

**Fan-out.** Measured subagent spawns are 0 on every observed run; `build-phase`
*declared* 2 (`tf-builder`, `trblazeui`) where the harness store counted 0. Where
declared and measured disagree, **the measured figure is right** (SCHEMA §2.6), and
the gap is itself a finding about how well tasks self-report.

**List price by phase** — the published rate applied to tokens actually measured, a
price and not a bill:

| Phase | Runs priced | List price |
|---|---|---|
| fix-issues | 4 of 4 | $139.45 |
| triage-and-fix | 1 of 1 | $38.43 |
| verify-phase | 3 of 4 | $27.22 |
| build-phase | 1 of 2 | $25.47 |
| triage-issues | 1 of 2 | $23.22 |
| amend-docs | 1 of 2 | $10.96 |
| metrics-report | 2 of 2 | $7.00 |
| log-miss | 2 of 2 | $5.31 |

---

## 6. Poolable figures

Comparable across `project_type` and provenance.

| Measure | Value |
|---|---|
| Runs | 21 — `fix-issues` 4 · `verify-phase` 4 · `amend-docs` 2 · `build-phase` 2 · `log-miss` 2 · `metrics-report` 2 · `triage-issues` 2 · `handoff-phase` 1 · `refresh-status` 1 · `triage-and-fix` 1 |
| Rework ratio | insufficient data (n=2 `build-phase` runs) |
| Batch size | insufficient data (REQs per `build-phase` run) |
| REQ throughput | 11.69 REQs/hour (median across runs) |
| Sessions / tokens | 6 sessions, 1,846,497 tokens |
| Tokens per `Verified` REQ | 49,905.3 |
| List price | $277.05 over 15 priced runs |
| List price per `Verified` REQ | $7.49 |
| Commit cadence | 2.38 commits/active day (57 commits over 24 days) |

Tokens per `Verified` REQ fell from 71,552.8 to 49,905.3 across this snapshot: the
denominator grew by the rows the 2026-09-12 sweep verified, faster than the token
total grew.

---

## 7. What is missing

- **The session hook is firing again.** The stream now reaches 2026-09-12
  (one record at 09:24Z) after stopping at 2026-08-31. Runs between those two dates
  still have no session record, so the `tokens_total` and `tokens per Verified REQ`
  figures in §6 remain understated for that window — but the hook itself is no
  longer the open problem the previous snapshot reported.
- **The commit hook is present** (`commit_hook: true`), so commit telemetry is being
  written here and the cadence figure in §6 is sound.
- **4 run records measured no tokens at all** (`none` scope) and **2 carry no window
  at all**. They are excluded from every token figure rather than averaged in as
  zero.
- **19 of 25 misses are unattributed.** Until `origin_confidence: linked` is the
  norm, §4.4 cannot carry a rate, only counts.
- **1 miss record carries no `why_missed`** and is outside §4.2's denominator;
  `tf-emit.sh --amend` is the remedy.
- **No perf budget is declared on any row**, so the perf gate has never run and
  cannot.
- **8 misses are open by the tool's count, and six of those carry no `miss-fix`
  record at all** — `MISS-…-20260912-08` through `-13`, the TfLens TR-028…TR-035
  entries, whose checklist rows were re-verified the same day. The rows were closed
  and the misses were not, so the open count lags the checklist rather than
  contradicting it. Closing them is a `*log-miss --fixed` per row.
