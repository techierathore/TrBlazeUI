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
| `runs.jsonl` | 17 | 2026-08-11 → 2026-09-12 |
| `gates.jsonl` | 37 (0 backfilled) | 2026-08-25 → 2026-09-12 |
| `sessions.jsonl` | 5 | 2026-08-09 → 2026-08-31 |
| `commits.jsonl` | 55 | 2026-02-09 → 2026-09-04 |
| `misses.jsonl` | 17 miss + 17 miss-fix | 2026-08-31 → 2026-09-12 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below — there is no reconstructed data to keep apart from
recorded data.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 16 | 0 | **0%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**Read this figure for what it is.** Gate records began on 2026-08-25, by which time
the library was already at 2.1.0 with most of its catalogue built. Every REQ the
stream has ever scored entered it through a consumer-feedback cycle — a defect
report against shipped code — so there was never an attempt 1 for the stream to
observe. **0% here means "no REQ has been graded from a standing start since
telemetry began", not "every requirement failed first time".** The figure becomes
meaningful only once a REQ is built and graded entirely inside the instrumented
period.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures | Share |
|---|---|---|---|
| **library** | escaped — no gate caught it | 18 | **100%** |

Late-added gates, and what they have seen on this data:

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**Why every failure is an escape, and why that is structural here.** A gate can only
catch a defect in work it was pointed at. All 18 failures arrived as consumer
feedback about code that had already shipped — TfLens, TechieBlog, TrStudio,
AstroLyfe building against published packages — so by definition no gate of this
project's stood between the defect and the reporter. This is the one number on the
page that would look different if the library's own demos had been graded before
each release rather than after each report.

**A library can never fail the visual-truth or mockup-parity gate**, because it has
no screens of its own to fail on: `tf-verify-list.sh` resolves 0 screens for every
row. That is why `project_type` separation is enforced — pooling this distribution
with an `app` project's would understate the visual gate everywhere.

The assets gate did run in this session (7 routes, all OK), but it caught nothing,
so it contributes no record to the distribution above.

---

## 3. Escape rate

Two different questions, computed from two different streams. They are reported
side by side and are never merged into one number.

| Source | Definition | Rate |
|---|---|---|
| `gates.jsonl` (live, library) | of graded failures, the share no gate caught | **100%** (18 of 18) |
| `misses.jsonl` | of logged misses, the share that reached a consumer or the owner | **65%** |

The two differ because they count different things: the gate stream counts *grading
events*, the miss stream counts *defects*. One defect can produce several gate
records, and a miss can be logged with no gate record behind it at all.

---

## 4. Miss attribution and rework cost

### 4.1 Counts — poolable

17 misses logged, 17 miss-fixes recorded, **2 still open**, 0 orphan fixes, 0
won't-fix.

| Class | Count |
|---|---|
| wrong-behaviour | 9 |
| partial-implementation | 3 |
| unspecified-gap | 2 |
| missed-requirement | 1 |
| regression | 1 |
| scope-creep | 1 |

| Found by | Count |
|---|---|
| owner | 11 |
| library-feedback | 6 |

**Design-miss share: 12%.** The rest are implementation defects, not specification
defects — which is the expected shape for a component library whose requirements
are its own published API.

### 4.2 `why_missed` — over the records that carry the field

17 of 17 eligible records carry it; **0 predate the field**, and 0 escapes are
missing it.

| why_missed | Count |
|---|---|
| insufficient-verify-method | 12 |
| missing-checklist-item | 4 |
| instruction-ignored | 1 |

**This is the most actionable table on the page.** Twelve of seventeen misses were
missed because *the check that existed could not have caught them* — not because a
check was skipped. That matches what the fixes themselves keep finding: a parameter
nothing read, a class silently deleted by a merge, a token declared and read by
nothing. None of those fail a build, throw at runtime, or look wrong in a
screenshot. The remedy is the kind of assertion this session added — measuring the
computed style and the rendered element rather than the presence of markup.

### 4.3 `sort` — whose gap it was

6 of 17 records carry `sort`; **11 predate the field** and are outside the
denominator.

| sort | Count |
|---|---|
| weak-check | 5 |
| spec | 1 |

### 4.4 Attribution — `linked` records only

**4 of 17 misses are attributed; 13 are excluded** because their
`origin_confidence` is not `linked`. Every figure in this sub-section runs over
those 4 records and no others.

| Origin phase | Misses |
|---|---|
| fix-issues | 3 |
| build-phase | 1 |

| Origin model | Misses |
|---|---|
| claude-opus-5 | 3 |
| unrecorded | 1 |

| Origin agent | Misses |
|---|---|
| flow-master | 2 |
| general-purpose | 1 |
| trblazeui | 1 |

> **These rankings are observational, not causal.** Which model and which agent get
> the hard work is not random — a phase that handles consumer-feedback defects will
> out-miss one that renders a document, whatever is driving it. A routing decision
> made on this table would be made on a confounded number. With n=4, it is also
> below this report's own three-record floor for a rate, which is why no percentage
> is printed beside any of these counts.

### 4.5 Rework cost

| Measure | Value | Records |
|---|---|---|
| Tokens per miss — **measured** (`cost_attribution: sole`) | insufficient data (n=2) | 2 |
| Tokens per miss — *apportioned* (`shared`) | 46,665.9 | 8 |
| Unattributable | — | 7 |

`cost_usd` is `null` on every record here: all 17 were produced on Claude Code,
which exposes no cost source, and inventing one would be an estimate presented as a
measurement. **Tokens are the measurement; dollars below are list price, never a
bill.**

Measured and apportioned are two columns and never one number: a fix run that
repaired six misses has one token window, and dividing it six ways is arithmetic,
not observation. This session is exactly that case — one `triage-and-fix` run
closed six misses.

---

## 5. Effort per phase

*Time, tokens, model and fan-out, grouped by `cmd`. This is a fact about runs, not
about tickets — there is no per-feature timing field and there will not be one.*

17 live run records. **Token-window coverage: `tree` 9 · `main` 2 · `none` 4 ·
absent 2.** Only the 9 `tree` records ever read a subagent transcript, so fan-out
figures cover those alone; a `0` on a `main` record means *not observed*, never
*none ran*.

| Phase | Runs | Wall clock | Tokens out | Tokens in | % out | % time |
|---|---|---|---|---|---|---|
| build-phase | 2 | 5h42m | 80.9k | 182 | 9% | 57% |
| triage-issues | 2 | 58m50s | 126.7k | 544 | 14% | 10% |
| **triage-and-fix** | **1** | **48m01s** | **203.3k** | **582** | **22%** | **8%** |
| amend-docs | 2 | 32m03s | 49.6k | 68 | 5% | 5% |
| verify-phase | 3 | 13m55s | 33.2k | 72 | 4% | 2% |
| handoff-phase | 1 | 12m56s | 0 | 0 | 0% | 2% |
| refresh-status | 1 | 8m44s | 0 | 0 | 0% | 1% |
| metrics-report | 1 | 3m58s | 27.1k | 76 | 3% | 1% |
| log-miss | 1 | 0m41s | 6.6k | 16 | 1% | 0% |
| fix-issues | 3 | 1h13m | 406.5k | 1.9k | 44% | 12% |

**`*build-phase` costing more wall clock than `*log-miss` is a fact about what those
phases are, not a finding about either.** The same warning that governs §4.4 governs
this table.

The row worth reading is `fix-issues`: **44% of all output tokens over 12% of the
wall clock.** Fixing consumer-reported defects is this project's dominant cost, and
it is token-dense rather than time-dense — the work is reading code and reasoning
about root causes, not waiting on builds.

**List price by phase** — the published rate applied to tokens actually measured, a
price and not a bill:

| Phase | Runs priced | List price |
|---|---|---|
| fix-issues | 3 | $112.06 |
| triage-and-fix | 1 | $38.43 |
| build-phase | 1 of 2 | $25.47 |
| triage-issues | 1 of 2 | $23.22 |
| verify-phase | 2 of 3 | $7.03 |

---

## 6. Poolable figures

Comparable across `project_type` and provenance.

| Measure | Value |
|---|---|
| Runs | 17 — `fix-issues` 3 · `verify-phase` 3 · `amend-docs` 2 · `build-phase` 2 · `triage-issues` 2 · `handoff-phase` 1 · `log-miss` 1 · `metrics-report` 1 · `refresh-status` 1 · `triage-and-fix` 1 |
| Rework ratio | insufficient data (n=2 `build-phase` runs) |
| Batch size | insufficient data (REQs per `build-phase` run) |
| REQ throughput | 12.49 REQs/hour (median across runs) |
| Sessions / tokens | 5 sessions, 1,359,504 tokens |
| Tokens per `Verified` REQ | 71,552.8 |
| List price | $223.56 over 11 priced runs |
| List price per `Verified` REQ | $11.77 |
| Commit cadence | 2.39 commits/active day (55 commits over 23 days) |

---

## 7. What is missing

- **Sessions stop at 2026-08-31** while runs continue to 2026-09-12. The
  session stream is written by `.tfcore/hooks/metrics-session.sh`, never by an
  agent, so the gap is a hook that is not firing on this machine — the
  `tokens_total` and `tokens per Verified REQ` figures in §6 are understated for a
  reason unrelated to how the project is going. Re-running `update-framework.sh` on
  this repo is what reinstalls it.
- **The commit hook is present** (`commit_hook: true`), so commit telemetry is being
  written here and the cadence figure in §6 is sound.
- **4 run records measured no tokens at all** (`none` scope) and **2 carry no window
  at all**. They are excluded from every token figure rather than averaged in as
  zero — which is why `handoff-phase` and `refresh-status` show `0` output above.
- **13 of 17 misses are unattributed.** Until `origin_confidence: linked` is the
  norm, §4.4 cannot carry a rate, only counts.
- **No perf budget is declared on any row**, so the perf gate has never run and
  cannot.
