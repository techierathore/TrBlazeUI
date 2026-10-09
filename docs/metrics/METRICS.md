# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-10-09 (evening)** · project_type `library` · schema v1

Every figure on this page comes from `tf-metrics.sh --report . --json` and `--phases .`,
run on 2026-10-09 at 18:13 UTC. None was worked out by hand. Where the tool prints a count
and no share, this page prints the count and names the number it is out of; it does not
divide them itself.

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 80 live runs counted (102 records: 80 runs, 11 voided runs, 11 void records) | 2026-08-11 → 2026-10-09 |
| `gates.jsonl` | 231 (0 backfilled, 0 malformed) | 2026-08-25 → 2026-10-09 |
| `sessions.jsonl` | 15 | 2026-08-09 → 2026-10-08 |
| `commits.jsonl` | 76 | 2026-02-09 → 2026-10-08 |
| `misses.jsonl` | 78 miss (7 withdrawn, 71 counted) + 64 miss-fix + 1 miss-amend + 7 miss-void | 2026-08-31 → 2026-10-09 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below and no REQ is excluded for backfill taint.

**Eleven run records are voided** and are outside every figure on this page. Every record
stays on the stream; nothing was deleted.

| Voided record | Reason on the void |
|---|---|
| `verify-phase` 2026-09-12T08:54:30Z | A verifier chained inside a `fix-issues` run was given the fix's start time, so the record claimed the whole fix as verify time. Gate records stand; cost and duration are not counted. |
| `verify-phase` 2026-09-13T12:16:23Z | The same mistake inside a `triage-and-fix` run. |
| `verify-phase` 2026-09-14T18:51:15Z | The same mistake inside a `triage-and-fix` run (TfLens TR-039, TR-040). |
| `fix-issues` 2026-10-07T05:59:51Z | A chained step of the morning's `triage-and-fix` run. `tf-fix-close.sh` labels its segments `fix-issues`, and the `triage-and-fix` run record was then refused as an overlap. Re-recorded with the same window as `cmd: triage-and-fix`. |
| `fix-issues` 2026-10-07T06:32:45Z | The same, for the 5-second closing segment of that run. Re-recorded as `cmd: triage-and-fix`. |
| `fix-issues` 2026-10-07T13:41:44Z | The same, for the afternoon's `triage-and-fix` run (Chatur TR-018). Re-recorded as three `triage-and-fix` segments around the chained `verify-phase` and `metrics-report` runs. |
| `fix-issues` 2026-10-07T14:06:51Z | The same, for that run's closing segment. Re-recorded as above. |
| `fix-issues` 2026-10-07T16:19:30Z | The same, for the evening's `triage-and-fix` run (Sevak's 34 entries). Re-recorded as three `triage-and-fix` segments around the chained `verify-phase` and `metrics-report` runs. |
| `fix-issues` 2026-10-07T18:13:01Z | The same, for that run's closing segment. Re-recorded as above. |
| `fix-issues` 2026-10-08T03:38:19Z | The same, for the 2026-10-08 morning's `triage-and-fix` run (Sevak TR-041, TR-006). Re-recorded as three `triage-and-fix` segments around the chained `verify-phase` and `metrics-report` runs. |
| `fix-issues` 2026-10-08T04:19:59Z | The same, for that run's closing segment. Re-recorded as above. |

The last eight are one framework defect, filed upstream as TechieFlow TF-004: the chained fix
step takes the run's label, so the run that chains it cannot record itself. **It did not
happen on either of today's runs** — their records were written as `triage-and-fix` from the
start, so the void count is still eleven.

**Seven misses are withdrawn** and are outside every figure on this page:
`MISS-TrBlazeUI-20260919-01` to `-05` and `MISS-TrBlazeUI-20260922-01` were logged by a
triage close replaying an earlier run's actions (TF-001); `MISS-TrBlazeUI-20261007-04` was
logged on 2026-10-07 under the FN prefix by mistake (a component parameter is a UI row) and
re-logged minutes later as REQ-UI-033.

### What is new since the 2026-10-09 morning snapshot

Four more counted run records, eight gate records, four misses, four miss-fixes and one
commit:

- **The morning's own `metrics-report` record** (04:43:39Z, `tree` scope, 1 subagent) is in
  §6 now. That is why `metrics-report` rose from 9 runs to 10.
- **The newest run is a `*triage-and-fix` for Lekhak's feedback** — TR-002, TR-003, TR-004
  and TR-006, logged as REQ-UI-047, REQ-FN-012, REQ-UI-048 and REQ-UI-049. It left three run
  records: a `triage-and-fix` segment (17:55:59Z), the chained `verify-phase` (18:08:40Z)
  and a REQ-less closing `triage-and-fix` segment (18:10:03Z).
- **The triage opened each of the four rows with one `escaped` gate record at attempt 1**,
  and logged one miss per row (`MISS-TrBlazeUI-20261009-02` to `-05`). All four are
  `unspecified-gap`, sort `spec`, why `missing-checklist-item`, attribution not `linked`.
- **The chained `verify-phase` run wrote `Verified` at attempt 2 for all four** — the first
  verify pass after the rows were logged. Four `miss-fix` records closed the four misses
  with verdict `Verified`. The fix run touched all four REQs, so each fix carries
  `cost_attribution: shared:4` and joins the **apportioned** row in §5b, not the measured
  one.
- **All three of the newest run's records are `tree` scope**, on `claude-opus-5-5`, and each
  counted 0 subagent runs. Unlike the morning's run, these zeros were looked for, so they
  enter the fan-out figures in §6b.
- **This rebuild's own `metrics-report` record** is not written by this refresh.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 59 | 10 | **17%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 17% passing on their first *graded* attempt, not on their first *build*.** Gate
records began on 2026-08-25, when most of the catalogue was already built. The four rows
scored since the last snapshot (REQ-UI-047, REQ-FN-012, REQ-UI-048, REQ-UI-049) were all
opened by a triage, whose first gate record is the escape it writes when it opens the row —
so each passed verify first time after logging and still counts as *not* first-pass. A row
opened by a triage can never score first-pass, by construction. That is why the rate fell
from 18% to 17% on a run where every row passed its first verify.

**Every consumer-feedback row this project opens is born failed at attempt 1**, so a falling
first-pass rate here partly measures how much consumer feedback is arriving, not only how
well the work is done.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

### Live · `library` — 103 failures

| Gate | Caught |
|---|---|
| acceptance | 1 |
| **escaped** — no gate caught it | 102 |

Out of 103 failure records. No `build`, `render`, `visual` or `standards` failure is on the
stream.

**The escaped count is inflated, and none of it is corrected here.** 14 of the escaped
records are TF-001 replays (13 on 2026-09-19, 1 on 2026-09-22), and the 2026-09-14 close
rewrote 11 earlier actions as new escaped records. One more, the 2026-10-07 afternoon's
first REQ-FN-011, belongs to a row that was removed and whose id was reused that evening.
All of them stay in the count; there is no record kind that withdraws a gate record. The
four newest escapes are real: the spec had no line for any of the four things Lekhak asked
for until Lekhak asked.

**Gates added after the stream started** — read each against the records that ran it:

| Gate | Added | Records that ran it | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**A library can never fail the visual-truth or mockup-parity gate**, because it has no
screens of its own — the demo app's pages are not the library. That is why `project_type`
separation is enforced. The `verify-phase` runs ran the build and acceptance checks; any
screen checks they drove on demo pages are evidence on disk, not gate records.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate | Over |
|---|---|---|---|
| `gates.jsonl` | REQs with a `gate:"escaped"` record ÷ REQs with any failure record | **98%** | live `library` gate records |
| `misses.jsonl` | misses found by `owner` / `production` ÷ all misses | **90%** | 71 misses |

The `gates.jsonl` figure is inflated by the replayed gate records described in §2: a
replayed record is *always* an escape, so that defect can only push this number up. The
`misses.jsonl` figure is not, because the replayed misses are withdrawn.

**A 98% escape rate on a component library is a real signal even after that discount.**
This project's defects are found by the applications that consume it, not by its own
gates. The four newest rows are the plain case again: `unspecified-gap`, sort `spec`.

---

## 4. Throughput and rework — poolable

*Comparable across `project_type` and provenance, so pooled deliberately.*

| Metric | Value |
|---|---|
| Runs | 80 (triage-and-fix 23, verify-phase 17, fix-issues 12, metrics-report 10, amend-docs 5, build-phase 4, handoff-phase 3, triage-issues 3, log-miss 2, refresh-status 1) |
| Rework ratio (fix-mode runs ÷ `build-phase` runs) | 925% |
| Batch size — median REQs per `build-phase` run | 2.5 (n=4) |
| REQ throughput — median REQs/hour | 13.9 |
| Sessions / total tokens | 15 / 7,364,784 |
| Tokens per `Verified` REQ | 57,537.4 |
| Commit cadence | 2.24 commits/active day (76 commits over 34 active days) |

**The rework ratio says little about rework here.** 3 of the 4 `build-phase` runs were
themselves in fix mode, and a component library fed by consumer reports does most of its
work as fixes by design. It rose from 875% to 925% because the newest run added two more
fix-mode `triage-and-fix` records.

**Cost in USD is not reported.** `cost_usd` is `null` on every Claude Code record — the
transcript carries tokens and no cost — and no OpenCode record exists here, so there is no
measured dollar figure to print. The tool also offers a rate-card *list price*; it is left
off this page, because a rate card applied to tokens is an estimate, not a measurement.
Tokens are the honest figure.

Commit-derived metrics are exempt from the provenance separations: `git log` is a real
append-only log. The commit-telemetry hook is installed on this clone, so the commit count
is not understated; no duplicate commits were collapsed. `commits.jsonl` lags by one
commit by design.

---

## 5. Misses — what was missed, who missed it, what the fix cost

| Metric | Value |
|---|---|
| Misses logged | 71 (10 open, 61 resolved, 0 wont-fix) |
| Miss-fix records | 64 (0 orphaned) |
| Amendments applied | 1 (0 orphaned) |
| Withdrawn (in no figure here) | 7 |
| Design-miss share (`unspecified-gap`) | 49% |
| Found by a human (`owner` / `production`) | 90% |

*The human-found share is reported **beside** the §3 escape rate, never merged with it:
the two are computed from different records by different definitions.*

Found by: owner 64, library-feedback 6, gate 1.

**Miss classes** — *what* was missed (out of 71)

| Class | n |
|---|---|
| unspecified-gap | 35 |
| wrong-behaviour | 17 |
| regression | 13 |
| partial-implementation | 4 |
| missed-requirement | 1 |
| scope-creep | 1 |

The four newest misses are all `unspecified-gap`, which moved the design-miss share from
46% to 49%.

**Why it was missed** — *which practice failed* (70 of 71 misses carry the field)

| Practice | n |
|---|---|
| missing-checklist-item | 37 |
| insufficient-verify-method | 31 |
| instruction-ignored | 2 |

0 misses predate the field. One miss carries no value; 0 escapes lack it.
`missing-checklist-item` keeps growing by one with every consumer-feedback row — by four on
the newest run.

**Whose gap it was** (60 of 60 eligible misses sorted; 11 predate the `sort` field,
added 2026-09-07, and are outside this denominator)

| `sort` | n |
|---|---|
| spec — the spec never had it | 35 |
| weak-check — a check existed and let it through | 24 |
| ignored — it was written down and not followed | 1 |

### 5a. Attribution — `linked` records only

**12 of 71 misses are attributed; 59 are excluded** because they name a phase no
`runs.jsonl` record backs, so the model that produced them is unknown. The four newest
misses name `day1-greenfield` / `analyst` as their origin, a phase with no run record here,
so they are among the excluded.

| By | Counts (over 12 records) |
|---|---|
| Origin phase | fix-issues 10, build-phase 2 |
| Origin agent | flow-master 5, general-purpose 5, none 1, trblazeui 1 |
| Origin model | claude-opus-5 11, unknown 1 |

These are counts, not rates. **They are observational, not causal.** Which model gets the
hard work is not random, so a model at the top of this list may be doing the hardest work
rather than the worst. Read it as a question to investigate, never as a ranking to route on.
The attributed set has not changed since 2026-10-03: nothing the October triage closes
logged could be linked to an origin run.

### 5b. Rework cost — measured and apportioned never combine

| | Fix records | Tokens out per miss |
|---|---|---|
| **Measured** (`sole` — the run fixed only this REQ) | 7 | **127,405.6** (n=7) |
| Apportioned (`shared:n` — divided equally, **not a measurement**) | 50 | 80,367.6 (n=50) |
| Unattributable (`none` — no usable token window) | 7 | — |

`tokens_unrecorded_sole_n` and `tokens_unrecorded_shared_n` are both 0, so no repair was
averaged in as free. The measured row is unchanged. The apportioned row grew by four
records — the newest run's one fix window, split four ways because it repaired four REQs.
That moved the apportioned figure from 85,567.5 (n=46) to 80,367.6 (n=50). It is arithmetic
on a shared window, not a measured cost per miss. Seven measured repairs is still a small
sample: one large or small fix moves the mean a long way.

**Dollars.** No measured dollars: 0 records carry a real cost. Claude Code carries
`cost_usd: null` permanently, and pricing tokens from a rate card would be an estimate
presented as a measurement.

A miss fixed inline, inside a longer run with no distinct fix record, cannot be costed. It
counts toward the miss count and contributes nothing to the cost — which is why the
unattributable row is printed rather than dropped.

---

## 6. Effort per phase — time, tokens, model, fan-out

*About the RUN, not the ticket. There is no cycle-time-per-feature on this page and there
will not be one — the unit of work in this framework is the run.*

Aggregated over **80 live run records** (11 voided records excluded — see the top of the
page). Token-window coverage: `tree` 45 · `main` 27 · `conversation` 0 · `none` 6 ·
absent 2. `none`/absent windows measured nothing and are excluded from every token figure
rather than averaged in as zero.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of output | % of time | Tokens measured on | Tokens out per run (median) |
|---|---|---|---|---|---|---|---|
| `triage-and-fix` | 23 | 7h37m / 9m52s | 3.4M | 48% | 32% | 23 of 23 | 147.0k (71.5k) |
| `fix-issues` | 12 | 3h58m / 16m27s | 1.9M | 26% | 17% | 10 of 12 | 187.9k (59.0k) |
| `build-phase` | 4 | 6h21m / 34m15s | 473.1k | 7% | 27% | 3 of 4 | 157.7k (80.9k) |
| `handoff-phase` | 3 | 1h05m / 12m56s | 415.7k | 6% | 5% | 2 of 3 | insufficient data (n=2) |
| `metrics-report` | 10 | 30m42s / 3m03s | 380.0k | 5% | 2% | 10 of 10 | 38.0k (29.7k) |
| `verify-phase` | 17 | 2h24m / 6m14s | 268.2k | 4% | 10% | 16 of 17 | 16.8k (11.3k) |
| `triage-issues` | 3 | 1h02m / 13m21s | 153.3k | 2% | 4% | 2 of 3 | insufficient data (n=2) |
| `amend-docs` | 5 | 41m18s / 2m42s | 99.5k | 1% | 3% | 4 of 5 | 24.9k (20.6k) |
| `log-miss` | 2 | 5m49s / insufficient data (n=2) | 52.5k | 1% | 0% | 2 of 2 | insufficient data (n=2) |
| `refresh-status` | 1 | 8m44s / insufficient data (n=1) | 0 | 0% | 1% | 0 of 1 | insufficient data (n=0) |

**`triage-and-fix` is the heaviest phase by output (48%) and by wall clock (32%).** The
newest run added two more records to it. With the TF-004 records repaired and today's runs
recorded correctly from the start, the split between `triage-and-fix` and `fix-issues`
follows the work rather than the bookkeeping.

**`build-phase` taking 27% of wall clock on 7% of output is a fact about what that phase
is, not a finding about it** — it waits on builds. The same caution applies to every row:
these are phase shapes, not performance rankings.

**Some runs leave a second, REQ-less record.** 2026-10-01T20:56:41Z (`fix-issues`),
2026-10-02T07:38:55Z (`build-phase`), 2026-10-03T05:00:02Z (`fix-issues`), the 2026-10-07
morning's 06:32:45Z (`triage-and-fix`), afternoon's 14:06:51Z and 14:12:09Z
(`triage-and-fix`), evening's 18:13:01Z and 18:22:24Z (`triage-and-fix`), the 2026-10-09
morning's closing segment 04:42:33Z (`triage-and-fix`) and the newest run's closing segment
2026-10-09T18:10:03Z (`triage-and-fix`) each follow a REQ-bearing record of the same
command. They count as runs, so the run counts for those phases are higher than the work
they describe.

### 6a. Which model did the work

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `triage-and-fix` | `claude-opus-5` | 1.5M | 45% | 6 |
| `triage-and-fix` | `claude-fable-5-1` | 1.5M | 44% | 10 |
| `triage-and-fix` | `claude-opus-5-5` | 357.8k | 11% | 7 |
| `fix-issues` | `claude-opus-5` | 1.5M | 82% | 7 |
| `fix-issues` | `claude-fable-5-1` | 307.0k | 16% | 2 |
| `fix-issues` | `claude-opus-5-5` | 27.0k | 1% | 1 |
| `build-phase` | `claude-fable-5-1` | 392.2k | 83% | 2 |
| `build-phase` | `claude-opus-5` | 80.9k | 17% | 1 |
| `handoff-phase` | `claude-opus-5` | 383.2k | 92% | 1 |
| `handoff-phase` | `claude-opus-5-5` | 32.5k | 8% | 1 |
| `metrics-report` | `claude-fable-5-1` | 220.4k | 58% | 4 |
| `metrics-report` | `claude-opus-5-5` | 100.1k | 26% | 3 |
| `metrics-report` | `claude-opus-5` | 59.5k | 16% | 3 |
| `verify-phase` | `claude-opus-5` | 161.0k | 60% | 7 |
| `verify-phase` | `claude-fable-5-1` | 72.7k | 27% | 5 |
| `verify-phase` | `claude-opus-5-5` | 34.4k | 13% | 4 |
| `triage-issues` | `claude-opus-5` | 153.3k | 100% | 2 |
| `amend-docs` | `claude-opus-5` | 90.8k | 91% | 3 |
| `amend-docs` | `claude-opus-5-5` | 8.8k | 9% | 1 |
| `log-miss` | `claude-opus-5` | 52.5k | 100% | 2 |

One `triage-and-fix` run carries the model name `<synthetic>` with 0 tokens out; it is in
the run count and in no token figure.

**This is observational, not causal** — the same warning §5a carries. Which model gets
which phase is not random, so a difference between models here is at least as much a fact
about what they were asked to do as about the models. All measured runs came through
`claude-code`; one run each of `amend-docs`, `build-phase`, `triage-issues` and
`verify-phase` came through the retired `codex` harness and is among the unmeasured runs
for its phase. Today's new records are all `claude-opus-5-5`, which is why that model's
share of `triage-and-fix` rose from 8% to 11%, of `metrics-report` from 19% to 26%, and it
now has 4 `verify-phase` runs.

### 6b. Subagent fan-out — measured, on its own denominator

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share |
|---|---|---|---|---|---|
| `triage-and-fix` | 15 of 23 | 13 / 1 / 3 | 11 | 150.2k | 8% |
| `fix-issues` | 6 of 12 | 13 / 0.5 / 6 | 3 | 518.3k | 46% |
| `metrics-report` | 8 of 10 | 7 / 1.0 / 1 | 7 | 95.0k | 27% |
| `verify-phase` | 7 of 17 | 1 / 0 / 1 | 1 | 6.8k | 7% |
| `amend-docs` | 4 of 5 | 0 / 0 / 0 | 0 | 0 | 0% |
| `triage-issues` | 2 of 3 | insufficient data (n=2) | — | — | — |
| `build-phase` | 1 of 4 | insufficient data (n=1) | — | — | — |
| `log-miss` | 1 of 2 | insufficient data (n=1) | — | — | — |
| `handoff-phase` | 1 of 3 | insufficient data (n=1) | — | — | — |
| `refresh-status` | 0 of 1 | insufficient data (n=0) | — | — | — |

The newest run's three `tree` records raised `triage-and-fix` from 13 observed runs to 15
and `verify-phase` from 6 to 7, each with 0 spawns, so the spawn totals did not move and
the `triage-and-fix` subagent share fell from 9% to 8%. The morning's `metrics-report` run
(1 subagent) is new to that row, which moved it from 7 observed runs to 8 and its subagent
share from 24% to 27%.

**Read the `observed` column first.** Fan-out is only visible on a `tokens_scope: "tree"`
record — a `main`-scope window never read the subagent transcripts, so **`0` there means
*not looked*, not *none ran***. Every unobserved run on this page is unobserved for that one
reason (not `tree` scope); none predates the `subagent_runs` field (2026-08-31).

**Declared vs measured — the measured count is right where they disagree.**

- `fix-issues`: declared 11 vs **measured 13**. The declared list also carries free text
  where an agent name belongs (cluster descriptions, `none`, `trblazeui:1`), so `subagents`
  is not a reliable count even where it is filled in.
- `triage-and-fix`: declared 9 vs **measured 13**. The newest run declared `none` again,
  which the tool counts as a name; its measured count was 0, so on that run the two agree.
- `triage-issues`: declared 1 vs **measured 4**.
- `metrics-report`: declared 2 vs **measured 7**.
- `build-phase`: declared 2 vs **measured 0** — but measured on 1 observed run of 4, so the
  measured figure covers less than the declared one.

---

## 7. What is missing

- **No perf, assets or mockup-parity history.** A library has no mockups and declares no
  perf budgets, so two of the three may never produce a figure; the parity tool was run on
  2026-10-07 against a consumer's mockup and could grade nothing.
- **Attribution on 59 of 71 misses is not `linked`**, which keeps §5a to counts over 12
  records rather than per-phase or per-model rates. The gap widened by four with the newest
  misses: a triage close writes a non-`linked` origin, never `linked`.
- **Fan-out is unobserved on every non-`tree` run** (`main` 27, `none` 6, absent 2, against
  `tree` 45 of 80). The newest run's records are all `tree`, so they added nothing to that
  gap.
- **Fifteen gate records are false or orphaned** (14 TF-001 replays, plus the 2026-10-07
  first REQ-FN-011 escape on a row that was removed; its id is now in use again) and cannot
  be withdrawn. The seven false misses can be and are. A record that withdraws a gate
  record, in the shape of `miss-void`, would let §2 and §3 stop carrying this note.
- **Tokens out per run: insufficient data** for `handoff-phase` (n=2), `log-miss` (n=2),
  `triage-issues` (n=2) and `refresh-status` (n=0); median wall clock likewise for
  `log-miss` and `refresh-status`.
- **No measured dollars** — 0 records carry a real cost (§4).
- **No owner-review records** (`kind: "review"`, n=0), so the cost of corrections at a
  review is not yet on this page.
- **`sessions.jsonl` has not grown since 2026-10-08**, so session counts and the total-token
  figure in §4 do not yet include today's work.
- **The 2026-10-03 `metrics-report` run left no run record of its own.** Its time sits
  inside that day's `triage-and-fix` record, which declared it as a subagent.
- **A chained fix step cannot let its parent run record itself** (TechieFlow TF-004).
  Four runs on 2026-10-07 and 2026-10-08 were hit, and all are now repaired by voiding and
  re-recording. Both of today's runs avoided it. Until the framework fix lands, any
  `triage-and-fix` run that closes through `tf-fix-close.sh` is still at risk of being
  counted as `fix-issues`.
- **This rebuild has no `metrics-report` run record** — none was written for this refresh,
  so it is not in §6.
