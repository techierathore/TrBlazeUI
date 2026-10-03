# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-10-03** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 50 live runs counted, 3 voided | 2026-08-11 → 2026-10-03 |
| `gates.jsonl` | 184 (0 backfilled) | 2026-08-25 → 2026-10-03 |
| `sessions.jsonl` | 12 | 2026-08-09 → 2026-10-02 |
| `commits.jsonl` | 69 | 2026-02-09 → 2026-10-02 |
| `misses.jsonl` | 55 miss (6 withdrawn, 49 counted) + 42 miss-fix + 1 miss-amend | 2026-08-31 → 2026-10-03 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below.

**Three run records are voided** and are outside every figure on this page. All three are
the same mistake: a `verify-phase` record written by a verifier chained inside a fix,
given the fix's start time. They are from 2026-09-12T08:54:30Z, 2026-09-13T12:16:23Z and
2026-09-14T18:51:15Z. The gate records from all three stand; only their cost and duration
are not counted. Today's verifier record carries its own start time
(2026-10-03T04:50:39Z), so it needed no void — but its window still sits inside today's
`fix-issues` window (see §5).

**Six misses are withdrawn** and are outside every figure on this page:
`MISS-TrBlazeUI-20260919-01` to `-05` and `MISS-TrBlazeUI-20260922-01`. All six were logged
by a triage close replaying an earlier run's actions (TF-001).

### What is new since the 2026-10-01 snapshot

Eight run records, 34 gate records, 3 misses and 6 miss-fixes, in three pieces of work:

- **The tail of the 2026-10-01 run.** That snapshot's own `metrics-report` record and the
  `triage-and-fix` record. The `triage-and-fix` record starts at 2026-10-01T21:03:40Z and
  lasts 131 s: its real work is recorded under the `fix-issues` record that starts at
  2026-10-01T20:23:38Z, because a run may not start before the previous one ended.
- **2026-10-02 — a `build-phase` run in fix mode** (started 06:47:25Z) on REQ-FN-004 and
  REQ-UI-028. It opened REQ-UI-028 (one `escaped` gate record), logged two misses
  (`MISS-TrBlazeUI-20261002-01`, REQ-FN-004, wrong-behaviour, sort `ignored`;
  `MISS-TrBlazeUI-20261002-02`, REQ-UI-028, unspecified-gap) and closed them along with
  three older REQ-FN-004 misses. A full `verify-phase` sweep (started 07:20:56Z) then
  wrote 31 `Verified` gate records.
- **2026-10-03 — today: REQ-UI-029** (Chatur TR-014, `Switch` Outlined). A new spec row
  born with one `escaped` gate record, one miss (`MISS-TrBlazeUI-20261003-01`,
  unspecified-gap, sort `spec`), a `fix-issues` run (started 04:41:52Z) with one measured
  subagent, a `verify-phase` PASS (started 04:50:39Z) and a `sole` miss-fix.

This run's own `triage-and-fix` record is written after this report by the calling run,
so its time and tokens are not in §5 yet.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 37 | 10 | **27%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 27% passing on their first *graded* attempt, not on their first *build*.** Gate
records began on 2026-08-25, when most of the catalogue was already built. The rate was
29% over 35 REQs at the last snapshot; the two rows scored since then are REQ-UI-028 and
REQ-UI-029, whose first gate record is the escape the triage wrote when it opened them. A
row opened by a triage can never score first-pass, by construction.

**Every consumer-feedback row this project opens is born at attempt 2**, so a falling
first-pass rate here is partly a measure of how much consumer feedback is arriving, not
only of how well the work is done.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures | Share |
|---|---|---|---|
| **library** | escaped — no gate caught it | 79 | 99% |
| **library** | acceptance | 1 | 1% |

Counts over 80 failures, as the tool reports them. The escape *rate* is in §3.

**The escaped count is inflated, and none of it is corrected here.** 14 of the 79 escaped
records are TF-001 replays (13 on 2026-09-19, 1 on 2026-09-22), and the 2026-09-14 close
rewrote 11 earlier actions as new escaped records. All of them stay in the count. The two
added since the last snapshot (REQ-UI-028, REQ-UI-029) are real.

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

The table is as the tool prints it. **A library can never fail the visual-truth or
mockup-parity gate**, because it has no screens of its own — the demo app's pages are not
the library. That is why `project_type` separation is enforced.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate | n |
|---|---|---|---|
| `gates.jsonl` | failures whose gate was `escaped` | **96%** | 80 failures |
| `misses.jsonl` | misses found by owner or production rather than by a gate | **86%** | 49 misses |

The `gates.jsonl` figure is still inflated by the replayed gate records described in §2: a
replayed record is *always* an escape, so that defect could only push this number up. The
`misses.jsonl` figure is not, because the replayed misses are withdrawn.

**A 96% escape rate on a component library is a real signal even after that discount.**
This project's defects are found by the applications that consume it, not by its own
gates. Today's row is the plain case: the library never offered an outlined `Switch`, so
no gate could have failed on it — the spec had no line for it until the consumer asked.

---

## 4. Miss attribution and rework cost

| Figure | Value |
|---|---|
| Misses logged | 49 |
| Resolved | 39 |
| Open | 10 |
| `wont-fix` | 0 |
| Amendments applied | 1 (0 orphaned) |
| Miss-fix records | 42 (0 orphaned) |
| Withdrawn (in no figure here) | 6 |

By class: wrong-behaviour 17, regression 13, unspecified-gap 13, partial-implementation 4,
missed-requirement 1, scope-creep 1. Design-miss share (unspecified-gap): **27%**.
Found by: owner 42, library-feedback 6, gate 1.

### Why the miss was missed

Over the 48 of 49 records that carry the field (1 does not; 0 predate its introduction;
0 escapes lack it):

| `why_missed` | Count | Share |
|---|---|---|
| insufficient-verify-method | 31 | 65% |
| missing-checklist-item | 15 | 31% |
| instruction-ignored | 2 | 4% |

### Whose gap it was

Over the 38 records that carry `sort` (11 predate the field and are outside this
denominator):

| `sort` | Count | Share |
|---|---|---|
| weak-check — the line existed, the check let it through | 24 | 63% |
| spec — the spec never had it | 13 | 34% |
| ignored — it was written down and not followed | 1 | 3% |

Since the last snapshot: 1 `ignored` (REQ-FN-004, 2026-10-02 — the first on this
project), 1 `weak-check` (REQ-UI-028) and today's 1 `spec` (REQ-UI-029).

### Rework cost

**Measured and apportioned are separate columns and are never added together.**

| Attribution | Records | Tokens out per miss |
|---|---|---|
| `sole` — one miss, one repair window | 5 | **117,314** (measured, n=5) |
| `shared:n` — one window repaired several | 30 | 91,229 (apportioned by equal division, n=30 — not a measurement) |
| `none` — no usable token window | 7 | counted, costed at nothing |

`tokens_unrecorded_sole_n` and `tokens_unrecorded_shared_n` are both 0, so no repair was
averaged in as free. Today's REQ-UI-029 fix is the fifth `sole` record (26,988 tokens out),
which is why the measured mean fell from 139,895 at n=4. List price per miss over the 5
measured records: $21.51 — a price, not a bill. No measured dollars exist (0 priced
records).

**Attribution excluded: 37 of 49 misses.** Per-phase, per-agent and per-model miss rates
run over `origin_confidence:"linked"` records only, and 12 are linked: by origin phase
fix-issues 10, build-phase 2; by origin agent flow-master 5, general-purpose 5, none 1,
trblazeui 1. These are counts over 12 records, not rates. Today's miss is `inferred`, not
linked, so it is outside them.

**A per-model miss rate would be observational, not causal, and is not printed here.**
Which model gets the hard work is not random.

---

## 5. Effort per phase

*About the RUN, not the ticket. There is no cycle-time-per-feature on this page and there
will not be one — the unit of work in this framework is the run.*

50 live run records. **Token-window coverage: `tree` 19 · `main` 23 · `none` 6 · absent 2.**
A window is only as good as its scope: `tree` saw the subagents, `main` did not look, and
`none`/absent measured nothing and is excluded from every token figure rather than averaged
in as a zero.

| Phase | Runs | Wall clock | Tokens out | Tokens measured on | % out | % time |
|---|---|---|---|---|---|---|
| fix-issues | 12 | 3h58m | 1.9M | 10 of 12 | 39% | 22% |
| triage-and-fix | 7 | 3h28m | 1.6M | 7 of 7 | 32% | 19% |
| build-phase | 4 | 6h21m | 473.1k | 3 of 4 | 10% | 34% |
| handoff-phase | 2 | 1h01m | 383.2k | 1 of 2 | 8% | 6% |
| verify-phase | 11 | 1h32m | 210.6k | 10 of 11 | 4% | 8% |
| triage-issues | 3 | 1h02m | 153.3k | 2 of 3 | 3% | 6% |
| amend-docs | 4 | 37m16s | 90.8k | 3 of 4 | 2% | 3% |
| metrics-report | 4 | 9m41s | 79.6k | 4 of 4 | 2% | 1% |
| log-miss | 2 | 5m49s | 52.5k | 2 of 2 | 1% | 1% |
| refresh-status | 1 | 8m44s | 0 | 0 of 1 | 0% | 1% |

**`build-phase` taking 34% of wall clock on 10% of output is a fact about what that phase
is, not a finding about it** — it waits on builds. The same caution applies to every row:
these are phase shapes, not performance rankings.

**Wall clock double-counts where windows nest.** Today's `verify-phase` window
(04:50:39Z–05:00:02Z) lies inside today's `fix-issues` window (04:41:52Z–05:00:07Z), so
those 9m23s appear in both rows. The nested `verify-phase` record shows 27,027 tokens out
against the enclosing `fix-issues` record's 26,988; a window inside another cannot hold
more output if both read the same transcript, and the stream does not say which session
each was read from.

### The two heaviest phases

**`fix-issues`** — 12 runs, tokens measured on 10 (2 unmeasured and excluded), 187.9k out
per run (median 59.0k). Fan-out **observed on 6 of 12 runs**; the other 6 were not `tree`
scope, so their 0 means *not looked*, not *none*. Over the 6 observed: 13 spawns, 3 runs
fanned out, 518.3k output tokens inside subagents = **46% of this phase's observed
output**. Declared 11 vs **measured 13** — `subagents` is typed by the agent,
`subagent_runs` is counted from the harness store, and **where they disagree the measured
one is right.** 23 REQ touches, 71 files written. List price $299.12 over 10 runs.

**`triage-and-fix`** — 7 runs, tokens measured on all 7, 222.6k out per run (median
109.1k). Fan-out **observed on 1 of 7 runs**; the other 6 were not `tree` scope. Over the 1
observed: 1 spawn, 14.5k output tokens inside subagents = 20% of that run's output. 20 REQ
touches, 127 files written. List price $161.97 over 7 runs. Today's run is not in these
seven yet.

The fan-out denominators are the weak point of this whole section: on the two heaviest
phases, only 7 of 19 runs were observed at all. Any statement about how much work
happens inside subagents rests on those 7.

### Models and money

Three models now appear, all through `claude-code`. This is where the output went, not a
comparison of the models: which model gets which work is not random.

| Phase | Model | Tokens out | Runs |
|---|---|---|---|
| fix-issues | `claude-opus-5` | 1.5M | 7 |
| fix-issues | `claude-fable-5-1` | 307.0k | 2 |
| fix-issues | `claude-opus-5-5` | 27.0k | 1 |
| triage-and-fix | `claude-opus-5` | 1.5M | 6 |
| triage-and-fix | `claude-fable-5-1` | 35.0k | 1 |
| build-phase | `claude-fable-5-1` | 392.2k | 2 |
| build-phase | `claude-opus-5` | 80.9k | 1 |
| verify-phase | `claude-opus-5` | 161.0k | 7 |
| verify-phase | `claude-opus-5-5` | 27.0k | 1 |
| verify-phase | `claude-fable-5-1` | 22.6k | 2 |
| metrics-report | `claude-opus-5` | 59.5k | 3 |
| metrics-report | `claude-fable-5-1` | 20.1k | 1 |

Every other phase is `claude-opus-5` only. One run each of `amend-docs`, `build-phase`,
`triage-issues` and `verify-phase` came through `codex`; those four are unmeasured runs in
the table above for their phases.

**`cost_usd` is `null` on every Claude Code record** — no cost source exists, and inventing
one would be an estimate presented as a measurement. What is shown instead is **list price**:
the published rate applied to the tokens on the record, worked out at report time and never
stored. It is a price, not a bill, and it is what makes a subscription run comparable with a
metered one. **$698.14 of list price over 42 records.** No rate-card estimate appears
anywhere else on this page.

| Pooled figure | Value |
|---|---|
| Tokens (all streams) | 5,368,655 |
| Tokens per `Verified` REQ | 51,622 |
| List price per `Verified` REQ | $6.71 |
| Commits | 69 over 31 active days (2.23/day) |
| Median throughput | 11.4 REQs/hour |
| Rework ratio | 525% (21 fix-mode runs ÷ 4 `build-phase` runs) |
| Batch size | median 2.5 REQs per `build-phase` run (n=4) |

Commit-derived metrics are exempt from the provenance separations: `git log` is a real
append-only log and commit volume is comparable across project types. The commit-telemetry
hook is installed on this clone, so the commit count is not understated.

**The rework ratio says little about rework here.** It now clears the n≥3 bar, but 3 of the
4 `build-phase` runs were themselves in fix mode, and a component library fed by consumer
reports does most of its work as fixes by design.

---

## 6. What is missing

- **No perf, assets-catch or mockup-parity history.** A library has no mockups and declares
  no perf budgets, so two of the three may never produce a figure.
- **Attribution on 37 of 49 misses is not `linked`**, which is what keeps §4 from carrying a
  per-phase or per-agent rate.
- **Fan-out is unobserved on 12 of the 19 runs in the two heaviest phases.**
- **Fourteen gate records are false** (TF-001 replays) and cannot be withdrawn. The six false
  misses can be and are. A record that withdraws a gate record, in the shape of the
  existing `miss-void`, would let §2 and §3 stop carrying this note.
- **Some runs leave a second, REQ-less record.** 2026-10-01T20:56:41Z (`fix-issues`,
  277 s), 2026-10-02T07:38:55Z (`build-phase`, 362 s) and 2026-10-03T05:00:02Z
  (`fix-issues`, 5 s, no token window) each follow a REQ-bearing record of the same
  command. They count as runs, so the run counts for those two phases are higher than the
  work they describe.
- **`triage-and-fix` time is understated where a chained fix wrote its own record first.**
  On 2026-10-01 the fix record took the run's real start time, so the `triage-and-fix`
  record could only start after it ended and covers 131 s.
- **Today's run is not costed yet.** Its run record and session record are written after
  this report.
