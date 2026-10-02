# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-10-01** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 42 live runs counted, 3 voided | 2026-08-11 → 2026-10-01 |
| `gates.jsonl` | 150 (0 backfilled) | 2026-08-25 → 2026-10-01 |
| `sessions.jsonl` | 11 | 2026-08-09 → 2026-09-22 |
| `commits.jsonl` | 67 | 2026-02-09 → 2026-09-22 |
| `misses.jsonl` | 52 miss (6 withdrawn, 46 counted) + 36 miss-fix + 1 miss-amend | 2026-08-31 → 2026-10-01 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below.

**Three run records are voided** and are outside every figure on this page. All three are
the same mistake: a `verify-phase` record written by a verifier chained inside a fix,
given the fix's start time. They are from 2026-09-12T08:54:30Z, 2026-09-13T12:16:23Z and
2026-09-14T18:51:15Z. The gate records from all three stand; only their cost and duration
are not counted. Today's verifier record was written with its own start time
(2026-10-01T20:47:48Z), so it needed no void.

**Six misses are withdrawn** and are outside every figure on this page:
`MISS-TrBlazeUI-20260919-01` to `-05` and `MISS-TrBlazeUI-20260922-01`. All six were logged
by a triage close replaying an earlier run's actions (TF-001). The 2026-09-22 snapshot
counted them, because nothing could withdraw a miss then; the miss counts below are lower
for that reason and not because work was undone.

### What is new since the 2026-09-22 snapshot

One piece of work: `*triage-and-fix TrBlazeUI` against Chatur's **third** batch (TR-011,
TR-012, TR-013), started 2026-10-01T20:23:38Z. It opened two rows (REQ-UI-026, `DataTable`
attributes on rows, the header row and the choose-all control; REQ-UI-027, `ToggleGroup`
`OnVariant`), demoted one (REQ-UI-021, for the `ToggleGroup` dispose error), fanned out no
subagents, and the chained verifier (`verify-phase`, started 2026-10-01T20:47:48Z) marked
those three and four neighbouring rows **Verified**.

**TF-001 is fixed and re-checked on this run.** The triage close reported *"3 row(s) logged
— 3 gate record(s) (escaped), 3 miss(es)"* for a run that logged 3 rows: nothing from an
earlier run was replayed. The six false misses are withdrawn, as above. The **14 false
`escaped` gate records** (13 from 2026-09-19, 1 from 2026-09-22) are still on the stream
and still counted: nothing withdraws a gate record yet.

This run's own `triage-and-fix` record and its session record are written after this
report, so its time and tokens are not in §5 yet.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 35 | 10 | **29%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 29% passing on their first *graded* attempt, not on their first *build*.** Gate
records began on 2026-08-25, when most of the catalogue was already built. The rate was
30% over 33 REQs at the last snapshot; the two rows scored since then are REQ-UI-026 and
REQ-UI-027, whose first gate record is the escape the triage wrote when it opened them. A
row opened by a triage can never score first-pass, by construction.

**Every consumer-feedback row this project opens is born at attempt 2**, so a falling
first-pass rate here is partly a measure of how much consumer feedback is arriving, not
only of how well the work is done.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures | Share |
|---|---|---|---|
| **library** | escaped — no gate caught it | 77 | 99% |
| **library** | acceptance | 1 | 1% |

Counts over 78 failures, as the tool reports them. The escape *rate* is in §3.

**The escaped count is inflated, and none of it is corrected here.** 14 of the 77 escaped
records are TF-001 replays (13 on 2026-09-19, 1 on 2026-09-22), and the 2026-09-14 close
rewrote 11 earlier actions as new escaped records. All of them stay in the count. Today's
run added 3, all real.

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

The table is as the tool prints it. The assets check was run by hand today on the two
changed demo screens (8 assets graded, 0 missing), but the rows in scope resolve to no
screen, so the verdict recorded only the build and acceptance checks for them. **A library
can never fail the visual-truth or mockup-parity gate**, because it has no screens of its
own — the demo app's pages are not the library. That is why `project_type` separation is
enforced.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate | n |
|---|---|---|---|
| `gates.jsonl` | failures whose gate was `escaped` | **96%** | 78 failures |
| `misses.jsonl` | misses found by owner or production rather than by a gate | **85%** | 46 misses |

The `gates.jsonl` figure is still inflated by the replayed gate records described in §2: a
replayed record is *always* an escape, so that defect could only push this number up. The
`misses.jsonl` figure no longer is, because the replayed misses are withdrawn.

**A 96% escape rate on a component library is a real signal even after that discount.**
This project's defects are found by the applications that consume it, not by its own
gates. Today's run shows why in one row: REQ-UI-021 had a check that read the server log
for errors, and it passed, because the error only appears when a page stops answering
during a dispose and no test made a page do that. One now does.

---

## 4. Miss attribution and rework cost

| Figure | Value |
|---|---|
| Misses logged | 46 |
| Resolved | 33 |
| Open | 13 |
| `wont-fix` | 0 |
| Amendments applied | 1 (0 orphaned) |
| Miss-fix records | 36 (0 orphaned) |
| Withdrawn (in no figure here) | 6 |

By class: wrong-behaviour 16, regression 13, unspecified-gap 11, partial-implementation 4,
missed-requirement 1, scope-creep 1. Design-miss share (unspecified-gap): **24%**.
Found by: owner 39, library-feedback 6, gate 1.

### Why the miss was missed

Over the 45 of 46 records that carry the field (1 does not; 0 predate its introduction):

| `why_missed` | Count | Share |
|---|---|---|
| insufficient-verify-method | 31 | 69% |
| missing-checklist-item | 13 | 29% |
| instruction-ignored | 1 | 2% |

### Whose gap it was

Over the 35 records that carry `sort` (11 predate the field and are outside this
denominator):

| `sort` | Count | Share |
|---|---|---|
| weak-check — the line existed, the check let it through | 23 | 66% |
| spec — the spec never had it | 12 | 34% |

Today added 2 `spec` (the two capabilities the library never had) and 1 `weak-check` (the
dispose error on a control that was already verified).

### Rework cost

**Measured and apportioned are separate columns and are never added together.**

| Attribution | Records | Tokens out per miss |
|---|---|---|
| `sole` — one miss, one repair window | 4 | **139,895** (measured, n=4) |
| `shared:n` — one window repaired several | 25 | 94,688 (apportioned by equal division, n=25 — not a measurement) |
| `none` — no usable token window | 7 | counted, costed at nothing |

`tokens_unrecorded_sole_n` is 0, so no repair was averaged in as free. List price per miss
over the 4 measured records: $26.20 — a price, not a bill. No measured dollars exist (0
priced records).

**Attribution excluded: 35 of 46 misses.** Per-phase, per-agent and per-model miss rates
run over `origin_confidence:"linked"` records only, and 11 are linked: by origin phase
fix-issues 9, build-phase 2; by origin agent general-purpose 5, flow-master 4, none 1,
trblazeui 1. These are counts over 11 records, not rates.

**A per-model miss rate would be observational, not causal, and is not printed here.**
Which model gets the hard work is not random.

---

## 5. Effort per phase

*About the RUN, not the ticket. There is no cycle-time-per-feature on this page and there
will not be one — the unit of work in this framework is the run.*

42 live run records. **Token-window coverage: `tree` 17 · `main` 18 · `none` 5 · absent 2.**
A window is only as good as its scope: `tree` saw the subagents, `main` did not look, and
`none`/absent measured nothing and is excluded from every token figure rather than averaged
in as a zero.

| Phase | Runs | Wall clock | Tokens out | Tokens measured on | % out | % time |
|---|---|---|---|---|---|---|
| fix-issues | 10 | 3h50m | 1.9M | 9 of 10 | 42% | 22% |
| triage-and-fix | 6 | 3h26m | 1.5M | 6 of 6 | 35% | 20% |
| handoff-phase | 2 | 1h01m | 383.2k | 1 of 2 | 9% | 6% |
| verify-phase | 9 | 1h05m | 173.3k | 8 of 9 | 4% | 6% |
| triage-issues | 3 | 1h02m | 153.3k | 2 of 3 | 4% | 6% |
| amend-docs | 4 | 37m16s | 90.8k | 3 of 4 | 2% | 4% |
| build-phase | 2 | 5h42m | 80.9k | 1 of 2 | 2% | 33% |
| metrics-report | 3 | 8m15s | 59.5k | 3 of 3 | 1% | 1% |
| log-miss | 2 | 5m49s | 52.5k | 2 of 2 | 1% | 1% |
| refresh-status | 1 | 8m44s | 0 | 0 of 1 | 0% | 1% |

**`build-phase` taking 33% of wall clock on 2% of output is a fact about what that phase
is, not a finding about it** — it waits on builds. The same caution applies to every row:
these are phase shapes, not performance rankings.

### The two heaviest phases

**`fix-issues`** — 10 runs, tokens measured on 9 (1 unmeasured and excluded), 205.8k out per
run (median 67.3k). Fan-out **observed on 5 of 10 runs**; the other 5 were not `tree` scope,
so their 0 means *not looked*, not *none*. Over the 5 observed: 12 spawns, 2 runs fanned
out, 506.7k output tokens inside subagents = **46% of this phase's observed output**.
Declared 10 vs **measured 12** — `subagents` is typed by the agent, `subagent_runs` is
counted from the harness store, and **where they disagree the measured one is right.**
22 REQ touches, 70 files written. List price $296.40 over 9 runs.

**`triage-and-fix`** — 6 runs, tokens measured on all 6, 253.9k out per run (median 156.2k).
Fan-out **observed on 1 of 6 runs**; the other 5 were not `tree` scope. Over the 1 observed:
1 spawn, 14.5k output tokens inside subagents. 17 REQ touches, 108 files written. List
price $156.59 over 6 runs. Today's run is not in these six yet.

The fan-out denominators are the weak point of this whole section: on the two phases that
actually fan out, only 6 of 16 runs were observed at all. Any statement about how much work
happens inside subagents rests on those 6.

### Models and money

Two models now appear, both through `claude-code`. This is where the output went, not a
comparison of the models: which model gets which work is not random.

| Phase | Model | Tokens out | Runs |
|---|---|---|---|
| fix-issues | `claude-opus-5` | 1.5M | 7 |
| fix-issues | `claude-fable-5-1` | 307.0k | 2 |
| verify-phase | `claude-opus-5` | 161.0k | 7 |
| verify-phase | `claude-fable-5-1` | 12.3k | 1 |

Every other phase is `claude-opus-5` only. One run each of `amend-docs`, `build-phase`,
`triage-issues` and `verify-phase` came through `codex`; those four are the unmeasured runs
in the table above for their phases.

**`cost_usd` is `null` on every Claude Code record** — no cost source exists, and inventing
one would be an estimate presented as a measurement. What is shown instead is **list price**:
the published rate applied to the tokens on the record, worked out at report time and never
stored. It is a price, not a bill, and it is what makes a subscription run comparable with a
metered one. **$632.54 of list price over 35 records.** No rate-card estimate appears
anywhere else on this page.

| Pooled figure | Value |
|---|---|
| Tokens (all streams) | 4,516,133 |
| Tokens per `Verified` REQ | 62,724 |
| List price per `Verified` REQ | $8.79 |
| Commits | 67 over 29 active days (2.31/day) |
| Median throughput | 11.5 REQs/hour |

Commit-derived metrics are exempt from the provenance separations: `git log` is a real
append-only log and commit volume is comparable across project types. The commit-telemetry
hook is installed on this clone, so the commit count is not understated.

`rework_ratio` is **insufficient data (n=2 `build-phase` runs)**.

---

## 6. What is missing

- **No perf, assets-catch or mockup-parity history.** A library has no mockups and declares
  no perf budgets, so two of the three may never produce a figure.
- **Attribution on 35 of 46 misses is not `linked`**, which is what keeps §4 from carrying a
  per-phase or per-agent rate.
- **Fan-out is unobserved on 10 of the 16 runs in the two phases that fan out.**
- **Fourteen gate records are false** (TF-001 replays) and cannot be withdrawn. The six false
  misses now can be and are. A record that withdraws a gate record, in the shape of the
  existing `miss-void`, would let §2 and §3 stop carrying this note.
- **Today's run is not costed yet.** Its run record and session record are written after
  this report.
