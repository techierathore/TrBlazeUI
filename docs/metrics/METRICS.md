# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-10-08 (morning)** · project_type `library` · schema v1

Every figure on this page comes from `tf-metrics.sh --report . --json` and `--phases .`,
run on 2026-10-08 at 04:33 UTC. None was worked out by hand. Where the tool prints a count
and no share, this page prints the count and names the number it is out of; it does not
divide them itself.

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 71 live runs counted (89 records: 71 runs, 9 voided runs, 9 void records) | 2026-08-11 → 2026-10-08 |
| `gates.jsonl` | 221 (0 backfilled, 0 malformed) | 2026-08-25 → 2026-10-08 |
| `sessions.jsonl` | 14 | 2026-08-09 → 2026-10-07 |
| `commits.jsonl` | 74 | 2026-02-09 → 2026-10-07 |
| `misses.jsonl` | 73 miss (7 withdrawn, 66 counted) + 59 miss-fix + 1 miss-amend | 2026-08-31 → 2026-10-08 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below and no REQ is excluded for backfill taint.

**Nine run records are voided** and are outside every figure on this page. Every record
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

Those six are a framework defect, filed upstream as TechieFlow TF-004: the chained fix step
takes the run's label, so the run that chains it cannot record itself. **It happened again
this morning** — see "What is new" below — and this morning's two `fix-issues` records are
*not* yet voided or re-recorded on this page; they are counted under `fix-issues` as written.

**Seven misses are withdrawn** and are outside every figure on this page:
`MISS-TrBlazeUI-20260919-01` to `-05` and `MISS-TrBlazeUI-20260922-01` were logged by a
triage close replaying an earlier run's actions (TF-001); `MISS-TrBlazeUI-20261007-04` was
logged on 2026-10-07 under the FN prefix by mistake (a component parameter is a UI row) and
re-logged minutes later as REQ-UI-033.

### What is new since the 2026-10-07 evening snapshot

Five counted run records, two void records, four gate records, two misses and two miss-fixes:

- **The evening's `triage-and-fix` run was put right.** Its two `fix-issues` records
  (16:19:30Z and 18:13:01Z) were voided and the run re-recorded as three `triage-and-fix`
  segments around the chained `verify-phase` and `metrics-report` runs: 16:19:30Z (the fix
  segment, 3 subagent runs measured), 18:13:01Z (322 s, 16,202 tokens out) and 18:22:24Z
  (75 s, 24,146 tokens out), all `tree` scope. The evening's `metrics-report` record
  (18:18:23Z, 241 s, 109,846 tokens out, 1 subagent run) is in §6 now.
- **This morning: Sevak's last two entries, TR-041 and TR-006.** Two rows were opened
  (REQ-UI-044 and REQ-UI-045), each with one `escaped` gate record at attempt 1 and one miss
  (`MISS-TrBlazeUI-20261008-01` and `-02`, both `unspecified-gap`, sort `spec`, attribution
  `inferred`). A `verify-phase` run (04:18:49Z, 70 s, 663 tokens out, `tree` scope, 0 subagent
  runs) wrote both `Verified` gate records at attempt 2, and two `miss-fix` records closed the
  misses with verdict `Verified` at `shared:2` — one fix window (161,575 tokens out) divided
  over two rows, which is arithmetic, not a measurement (§5b).
- **This morning's `triage-and-fix` run is on the stream as two `fix-issues` records**
  (TF-004 again): the fix segment (03:38:19Z, 2,430 s, 161,575 tokens out, `tree` scope,
  1 subagent run measured, 31,888 tokens out in it) and a 716-second closing segment
  (04:19:59Z, 71,649 tokens out). Both count under `fix-issues` in §4 and §6 as written.
- **This rebuild's own `metrics-report` record** is written after this page.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 54 | 10 | **19%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 19% passing on their first *graded* attempt, not on their first *build*.** Gate
records began on 2026-08-25, when most of the catalogue was already built. The two rows
scored since the evening snapshot (REQ-UI-044, REQ-UI-045) were opened by a triage, whose
first gate record is the escape it writes when it opens the row — so a row opened by a
triage can never score first-pass, by construction.

**Every consumer-feedback row this project opens is born failed at attempt 1**, so a falling
first-pass rate here partly measures how much consumer feedback is arriving, not only how
well the work is done. Thirteen such rows arrived from one consumer in under a day.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

### Live · `library` — 98 failures

| Gate | Caught |
|---|---|
| acceptance | 1 |
| **escaped** — no gate caught it | 97 |

Out of 98 failure records. No `build`, `render`, `visual` or `standards` failure is on the
stream.

**The escaped count is inflated, and none of it is corrected here.** 14 of the escaped
records are TF-001 replays (13 on 2026-09-19, 1 on 2026-09-22), and the 2026-09-14 close
rewrote 11 earlier actions as new escaped records. One more, the 2026-10-07 afternoon's
first REQ-FN-011, belongs to a row that was removed and whose id was reused that evening.
All of them stay in the count; there is no record kind that withdraws a gate record. The
two escapes this morning are real: the spec had no line for a Select that must survive a
failed script inside a Dialog, nor for a chat family, until the consumer asked.

**Gates added after the stream started** — read each against the records that ran it:

| Gate | Added | Records that ran it | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**A library can never fail the visual-truth or mockup-parity gate**, because it has no
screens of its own — the demo app's pages are not the library. That is why `project_type`
separation is enforced. The `verify-phase` runs ran the build and acceptance checks; the
screen checks they drove (two demo pages this morning, both render and visual OK) are
evidence on disk, not gate records.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate | Over |
|---|---|---|---|
| `gates.jsonl` | REQs with a `gate:"escaped"` record ÷ REQs with any failure record | **98%** | live `library` gate records |
| `misses.jsonl` | misses found by `owner` / `production` ÷ all misses | **89%** | 66 misses |

The `gates.jsonl` figure is inflated by the replayed gate records described in §2: a
replayed record is *always* an escape, so that defect can only push this number up. The
`misses.jsonl` figure is not, because the replayed misses are withdrawn.

**A 98% escape rate on a component library is a real signal even after that discount.**
This project's defects are found by the applications that consume it, not by its own
gates. This morning's two rows are the plain case again, both `unspecified-gap` with sort
`spec`.

---

## 4. Throughput and rework — poolable

*Comparable across `project_type` and provenance, so pooled deliberately.*

| Metric | Value |
|---|---|
| Runs | 71 (triage-and-fix 16, verify-phase 15, fix-issues 14, metrics-report 8, amend-docs 5, build-phase 4, handoff-phase 3, triage-issues 3, log-miss 2, refresh-status 1) |
| Rework ratio (fix-mode runs ÷ `build-phase` runs) | 800% |
| Batch size — median REQs per `build-phase` run | 2.5 (n=4) |
| REQ throughput — median REQs/hour | 13.74 |
| Sessions / total tokens | 14 / 5,764,390 |
| Tokens per `Verified` REQ | 46,865.0 |
| Commit cadence | 2.24 commits/active day (74 commits over 33 active days) |

**The rework ratio says little about rework here.** 3 of the 4 `build-phase` runs were
themselves in fix mode, and a component library fed by consumer reports does most of its
work as fixes by design. It rose from 725% to 800% because the evening's run was
re-recorded as three `triage-and-fix` segments (all fix mode) and this morning's run added
two `fix-issues` records (TF-004).

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
| Misses logged | 66 (10 open, 56 resolved, 0 wont-fix) |
| Miss-fix records | 59 (0 orphaned) |
| Amendments applied | 1 (0 orphaned) |
| Withdrawn (in no figure here) | 7 |
| Design-miss share (`unspecified-gap`) | 45% |
| Found by a human (`owner` / `production`) | 89% |

*The human-found share is reported **beside** the §3 escape rate, never merged with it:
the two are computed from different records by different definitions.*

Found by: owner 59, library-feedback 6, gate 1.

**Miss classes** — *what* was missed (out of 66)

| Class | n |
|---|---|
| unspecified-gap | 30 |
| wrong-behaviour | 17 |
| regression | 13 |
| partial-implementation | 4 |
| missed-requirement | 1 |
| scope-creep | 1 |

This morning's two misses are both `unspecified-gap`, which moved the design-miss share
from 44% to 45%; that class leads `wrong-behaviour` by 13.

**Why it was missed** — *which practice failed* (65 of 66 misses carry the field)

| Practice | n |
|---|---|
| missing-checklist-item | 32 |
| insufficient-verify-method | 31 |
| instruction-ignored | 2 |

0 misses predate the field. 1 miss carries no value; 0 escapes lack it.
`missing-checklist-item` overtook `insufficient-verify-method` this morning (30 to 32
against 31): every consumer-feedback row adds one.

**Whose gap it was** (55 of 55 eligible misses sorted; 11 predate the `sort` field,
added 2026-09-07, and are outside this denominator)

| `sort` | n |
|---|---|
| spec — the spec never had it | 30 |
| weak-check — a check existed and let it through | 24 |
| ignored — it was written down and not followed | 1 |

### 5a. Attribution — `linked` records only

**12 of 66 misses are attributed; 54 are excluded** because they name a phase no
`runs.jsonl` record backs, so the model that produced them is unknown. Both of this
morning's misses are `inferred` and are among the excluded.

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
| **Measured** (`sole` — the run fixed only this REQ) | 6 | **136,496.7** (n=6) |
| Apportioned (`shared:n` — divided equally, **not a measurement**) | 46 | 85,567.5 (n=46) |
| Unattributable (`none` — no usable token window) | 7 | — |

`tokens_unrecorded_sole_n` and `tokens_unrecorded_shared_n` are both 0, so no repair was
averaged in as free. The measured row is unchanged since 2026-10-07. The apportioned row
grew by two records: this morning's one fix window (161,575 tokens out — a reproduction of
the freeze by injected failure, the portal and Select changes, the chat family through one
builder, two rebuilds and the regression suite) divided two ways is 80,788 per row by
arithmetic, which is why the apportioned mean moved from 85,784.8 (n=44) to 85,567.5 (n=46).
It says what the morning cost per row *if* the rows were equal; they were not, and the
measured row does not pretend otherwise.

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

Aggregated over **71 live run records** (9 voided records excluded — see the top of the
page). Token-window coverage: `tree` 39 · `main` 24 · `conversation` 0 · `none` 6 ·
absent 2. `none`/absent windows measured nothing and are excluded from every token figure
rather than averaged in as zero.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of output | % of time | Tokens measured on | Tokens out per run (median) |
|---|---|---|---|---|---|---|---|
| `triage-and-fix` | 16 | 5h47m / 7m37s | 3.0M | 43% | 25% | 16 of 16 | 184.9k (69.7k) |
| `fix-issues` | 14 | 4h51m / 18m02s | 2.1M | 31% | 21% | 12 of 14 | 176.0k (69.5k) |
| `build-phase` | 4 | 6h21m / 34m15s | 473.1k | 7% | 28% | 3 of 4 | 157.7k (80.9k) |
| `handoff-phase` | 3 | 1h05m / 12m56s | 415.7k | 6% | 5% | 2 of 3 | insufficient data (n=2) |
| `metrics-report` | 8 | 21m50s / 2m33s | 299.6k | 4% | 2% | 8 of 8 | 37.4k (26.2k) |
| `verify-phase` | 15 | 2h18m / 6m44s | 267.2k | 4% | 10% | 14 of 15 | 19.1k (12.7k) |
| `triage-issues` | 3 | 1h02m / 13m21s | 153.3k | 2% | 5% | 2 of 3 | insufficient data (n=2) |
| `amend-docs` | 5 | 41m18s / 2m42s | 99.5k | 1% | 3% | 4 of 5 | 24.9k (20.6k) |
| `log-miss` | 2 | 5m49s / insufficient data (n=2) | 52.5k | 1% | 0% | 2 of 2 | insufficient data (n=2) |
| `refresh-status` | 1 | 8m44s / insufficient data (n=1) | 0 | 0% | 1% | 0 of 1 | insufficient data (n=0) |

**`triage-and-fix` is now the heaviest phase by output** (43%), having taken the evening's
re-recorded segments from `fix-issues`; `fix-issues` in turn gained this morning's two
records that are really one `triage-and-fix` run (TF-004, see the top of the page): 2,430 s
and 716 s, 161,575 and 71,649 tokens out. So the two heaviest rows are closer in substance
than the table shows, and the split between them follows the bookkeeping of TF-004 as much
as the work.

**`build-phase` taking 28% of wall clock on 7% of output is a fact about what that phase
is, not a finding about it** — it waits on builds. The same caution applies to every row:
these are phase shapes, not performance rankings. This morning's fix segment waited the
same way: two builds and a boot shared one machine with another project's test runs.

**Some runs leave a second, REQ-less record.** 2026-10-01T20:56:41Z (`fix-issues`),
2026-10-02T07:38:55Z (`build-phase`), 2026-10-03T05:00:02Z (`fix-issues`), the 2026-10-07
morning's 06:32:45Z (`triage-and-fix`, 5 s), afternoon's 14:06:51Z and 14:12:09Z
(`triage-and-fix`, 67 s and 63 s), evening's 18:13:01Z and 18:22:24Z (`triage-and-fix`,
322 s and 75 s) and this morning's 04:19:59Z (`fix-issues`, 716 s) each follow a REQ-bearing
record of the same command. They count as runs, so the run counts for those phases are
higher than the work they describe.

### 6a. Which model did the work

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `triage-and-fix` | `claude-opus-5` | 1.5M | 51% | 6 |
| `triage-and-fix` | `claude-fable-5-1` | 1.2M | 42% | 7 |
| `triage-and-fix` | `claude-opus-5-5` | 199.9k | 7% | 3 |
| `fix-issues` | `claude-opus-5` | 1.5M | 73% | 7 |
| `fix-issues` | `claude-fable-5-1` | 540.3k | 26% | 4 |
| `fix-issues` | `claude-opus-5-5` | 27.0k | 1% | 1 |
| `build-phase` | `claude-fable-5-1` | 392.2k | 83% | 2 |
| `build-phase` | `claude-opus-5` | 80.9k | 17% | 1 |
| `handoff-phase` | `claude-opus-5` | 383.2k | 92% | 1 |
| `handoff-phase` | `claude-opus-5-5` | 32.5k | 8% | 1 |
| `metrics-report` | `claude-fable-5-1` | 172.4k | 58% | 3 |
| `metrics-report` | `claude-opus-5-5` | 67.7k | 23% | 2 |
| `metrics-report` | `claude-opus-5` | 59.5k | 20% | 3 |
| `verify-phase` | `claude-opus-5` | 161.0k | 60% | 7 |
| `verify-phase` | `claude-fable-5-1` | 72.7k | 27% | 5 |
| `verify-phase` | `claude-opus-5-5` | 33.5k | 13% | 2 |
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
for its phase. Every record written since 2026-10-07 is `claude-fable-5-1`, which is why
its share of `triage-and-fix` is 42% after being 14% at the afternoon snapshot: the
re-recorded evening segments moved under this phase.

### 6b. Subagent fan-out — measured, on its own denominator

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share |
|---|---|---|---|---|---|
| `triage-and-fix` | 10 of 16 | 10 / 1.0 / 3 | 8 | 116.5k | 8% |
| `fix-issues` | 8 of 14 | 14 / 0.5 / 6 | 4 | 550.1k | 41% |
| `metrics-report` | 6 of 8 | 5 / 1.0 / 1 | 5 | 60.6k | 22% |
| `verify-phase` | 6 of 15 | 1 / 0.0 / 1 | 1 | 6.8k | 7% |
| `amend-docs` | 4 of 5 | 0 / 0 / 0 | 0 | 0 | 0% |
| `triage-issues` | 2 of 3 | insufficient data (n=2) | — | — | — |
| `build-phase` | 1 of 4 | insufficient data (n=1) | — | — | — |
| `log-miss` | 1 of 2 | insufficient data (n=1) | — | — | — |
| `handoff-phase` | 1 of 3 | insufficient data (n=1) | — | — | — |
| `refresh-status` | 0 of 1 | insufficient data (n=0) | — | — | — |

The evening's fix segment (3 subagent runs, the three builders) now sits under
`triage-and-fix`, which is why that phase's maximum rose from 1 to 3 spawns and its observed
runs from 7 to 10; `fix-issues` lost it and gained this morning's segment (1 builder, 31,888
tokens out in it), so its spawns went from 16 to 14.

**Read the `observed` column first.** Fan-out is only visible on a `tokens_scope: "tree"`
record — a `main`-scope window never read the subagent transcripts, so **`0` there means
*not looked*, not *none ran***. Every unobserved run on this page is unobserved for that one
reason (not `tree` scope); none predates the `subagent_runs` field (2026-08-31).

**Declared vs measured — the measured count is right where they disagree.**

- `fix-issues`: declared 12 vs **measured 14**. The declared list also carries free text
  where an agent name belongs (cluster descriptions, `none`, `trblazeui:1`), so `subagents`
  is not a reliable count even where it is filled in.
- `triage-and-fix`: declared 6 vs **measured 10**.
- `triage-issues`: declared 1 vs **measured 4**.
- `metrics-report`: declared 1 vs **measured 5**.
- `build-phase`: declared 2 vs **measured 0** — but measured on 1 observed run of 4, so the
  measured figure covers less than the declared one.

---

## 7. What is missing

- **No perf, assets or mockup-parity history.** A library has no mockups and declares no
  perf budgets, so two of the three may never produce a figure; the parity tool was run on
  2026-10-07 against a consumer's mockup and could grade nothing.
- **Attribution on 54 of 66 misses is not `linked`**, which keeps §5a to counts over 12
  records rather than per-phase or per-model rates. The gap widened by two this morning: a
  triage close writes `inferred`, never `linked`.
- **Fan-out is unobserved on 32 of 71 runs** (every non-`tree` window), including 12 of the
  30 runs in the two heaviest phases.
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
- **The 2026-10-03 `metrics-report` run left no run record of its own.** Its time sits
  inside that day's `triage-and-fix` record, which declared it as a subagent.
- **A chained fix step cannot let its parent run record itself** (TechieFlow TF-004).
  Four runs since 2026-10-07 were hit: three were repaired by voiding and re-recording; this
  morning's is on the stream as two `fix-issues` records and is counted that way here. Until
  the framework fix lands, every `triage-and-fix` run is at risk of being counted as
  `fix-issues`.
- **This rebuild's own `metrics-report` record** is written after this page, so it is not
  in §6.
