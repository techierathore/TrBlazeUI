# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-10-07** · project_type `library` · schema v1

Every figure on this page comes from `tf-metrics.sh --report . --json` and `--phases .`,
run on 2026-10-07. None was worked out by hand.

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 56 live runs counted (61 run records, 5 voided) | 2026-08-11 → 2026-10-07 |
| `gates.jsonl` | 190 (0 backfilled) | 2026-08-25 → 2026-10-07 |
| `sessions.jsonl` | 13 | 2026-08-09 → 2026-10-03 |
| `commits.jsonl` | 71 | 2026-02-09 → 2026-10-03 |
| `misses.jsonl` | 58 miss (6 withdrawn, 52 counted) + 45 miss-fix + 1 miss-amend | 2026-08-31 → 2026-10-07 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below and no REQ is excluded for backfill taint.

**Five run records are voided** and are outside every figure on this page. Both records
stay on the stream; nothing was deleted.

| Voided record | Reason on the void |
|---|---|
| `verify-phase` 2026-09-12T08:54:30Z | A verifier chained inside a `fix-issues` run was given the fix's start time, so the record claimed the whole fix as verify time. Gate records stand; cost and duration are not counted. |
| `verify-phase` 2026-09-13T12:16:23Z | The same mistake inside a `triage-and-fix` run. |
| `verify-phase` 2026-09-14T18:51:15Z | The same mistake inside a `triage-and-fix` run (TfLens TR-039, TR-040). |
| `fix-issues` 2026-10-07T05:59:51Z | A chained step of today's `triage-and-fix` run (started 2026-10-07T05:59:51Z). `tf-fix-close.sh` labels its segments `fix-issues`, and the `triage-and-fix` run record was then refused as an overlap. Re-recorded with the same window as `cmd: triage-and-fix`. |
| `fix-issues` 2026-10-07T06:32:45Z | The same, for the 5-second closing segment of that run. Re-recorded as `cmd: triage-and-fix`. |

The last two are a framework defect, filed upstream as TechieFlow TF-004: the chained fix
step takes the run's label, so the run that chains it cannot record itself.

**Six misses are withdrawn** and are outside every figure on this page:
`MISS-TrBlazeUI-20260919-01` to `-05` and `MISS-TrBlazeUI-20260922-01`. All six were logged
by a triage close replaying an earlier run's actions (TF-001).

### What is new since the 2026-10-03 snapshot

Six counted run records, six gate records, three misses and three miss-fixes:

- **The tail of the 2026-10-03 run** — its `triage-and-fix` record (started
  2026-10-03T05:00:08Z, 224 s, `tree` scope).
- **2026-10-07 — today: REQ-UI-030, REQ-UI-031, REQ-UI-032** (Chatur TR-015 to TR-017).
  Three new rows, each born with one `escaped` gate record and one miss
  (`MISS-TrBlazeUI-20261007-01` to `-03`, all `unspecified-gap`, sort `spec`,
  attribution `inferred`). Today's `triage-and-fix` run is recorded in two segments:
  the fix (started 05:59:51Z, 1,839 s, 130,902 tokens out, `tree` scope, 0 subagent runs)
  and a closing segment (started 06:32:45Z, 5 s, 1,135 tokens out). Between them a
  `verify-phase` run (started 06:30:30Z, 135 s, `main` scope) wrote three `Verified` gate
  records at attempt 2; three `miss-fix` records closed the misses as `shared:3`.
  A `handoff-phase` run followed (started 07:00:03Z, 240 s, 32,526 tokens out).
- **The first 2026-10-07 `metrics-report` run** (started 06:33:10Z, 141 s). This page
  replaces the page that run wrote.

Today's `triage-and-fix` run is recorded and costed in §6. Its fix segment is `tree`
scope, so fan-out was observed on it — and none ran. The `verify-phase` window is `main`
scope, so fan-out was not observed there.

**A correction to the 2026-10-03 snapshot.** It said that day's `verify-phase` window lay
inside that day's `fix-issues` window. The records do not show that: the `fix-issues` run
is 04:41:52Z–04:50:39Z and the `verify-phase` run is 04:50:39Z–05:00:02Z — consecutive, not
nested. The 05:00:07Z end it quoted belongs to the separate 5-second REQ-less record.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 40 | 10 | **25%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 25% passing on their first *graded* attempt, not on their first *build*.** Gate
records began on 2026-08-25, when most of the catalogue was already built. The rate was
27% over 37 REQs at the last snapshot; the three rows scored since then are REQ-UI-030,
REQ-UI-031 and REQ-UI-032, whose first gate record is the escape the triage wrote when it
opened them. A row opened by a triage can never score first-pass, by construction.

**Every consumer-feedback row this project opens is born failed at attempt 1**, so a falling
first-pass rate here partly measures how much consumer feedback is arriving, not only how
well the work is done.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

### Live · `library` — 83 failures

| Gate | Caught | Share |
|---|---|---|
| acceptance | 1 | 1% |
| **escaped** — no gate caught it | 82 | 99% |

No `build`, `render`, `visual` or `standards` failure is on the stream.

**The escaped count is inflated, and none of it is corrected here.** 14 of the escaped
records are TF-001 replays (13 on 2026-09-19, 1 on 2026-09-22), and the 2026-09-14 close
rewrote 11 earlier actions as new escaped records. All of them stay in the count; there is
no record kind that withdraws a gate record. The three added today are real.

**Gates added after the stream started** — read each against the records that ran it:

| Gate | Added | Records that ran it | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**A library can never fail the visual-truth or mockup-parity gate**, because it has no
screens of its own — the demo app's pages are not the library. That is why `project_type`
separation is enforced.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate | Over |
|---|---|---|---|
| `gates.jsonl` | REQs with a `gate:"escaped"` record ÷ REQs with any failure record | **97%** | live `library` gate records |
| `misses.jsonl` | misses found by `owner` / `production` ÷ all misses | **87%** | 52 misses |

The `gates.jsonl` figure is inflated by the replayed gate records described in §2: a
replayed record is *always* an escape, so that defect can only push this number up. The
`misses.jsonl` figure is not, because the replayed misses are withdrawn.

**A 97% escape rate on a component library is a real signal even after that discount.**
This project's defects are found by the applications that consume it, not by its own
gates. Today's three rows are the plain case: each is `unspecified-gap` with sort `spec` —
the spec had no line for the behaviour until the consumer asked, so no gate could have
failed on it.

---

## 4. Throughput and rework — poolable

*Comparable across `project_type` and provenance, so pooled deliberately.*

| Metric | Value |
|---|---|
| Runs | 56 (fix-issues 12, verify-phase 12, triage-and-fix 10, metrics-report 5, amend-docs 4, build-phase 4, handoff-phase 3, triage-issues 3, log-miss 2, refresh-status 1) |
| Rework ratio (fix-mode runs ÷ `build-phase` runs) | 600% |
| Batch size — median REQs per `build-phase` run | 2.5 (n=4) |
| REQ throughput — median REQs/hour | 11.59 |
| Sessions / total tokens | 13 / 5,470,703 |
| Tokens per `Verified` REQ | 51,128.1 |
| Commit cadence | 2.22 commits/active day (71 commits over 32 active days) |

**The rework ratio says little about rework here.** 3 of the 4 `build-phase` runs were
themselves in fix mode, and a component library fed by consumer reports does most of its
work as fixes by design.

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
| Misses logged | 52 (10 open, 42 resolved, 0 wont-fix) |
| Miss-fix records | 45 (0 orphaned) |
| Amendments applied | 1 (0 orphaned) |
| Withdrawn (in no figure here) | 6 |
| Design-miss share (`unspecified-gap`) | 31% |
| Found by a human (`owner` / `production`) | 87% |

*The human-found share is reported **beside** the §3 escape rate, never merged with it:
the two are computed from different records by different definitions.*

Found by: owner 45, library-feedback 6, gate 1.

**Miss classes** — *what* was missed

| Class | n | Share |
|---|---|---|
| wrong-behaviour | 17 | 33% |
| unspecified-gap | 16 | 31% |
| regression | 13 | 25% |
| partial-implementation | 4 | 8% |
| missed-requirement | 1 | 2% |
| scope-creep | 1 | 2% |

Today's three misses are all `unspecified-gap`, which is why the design-miss share rose
from 27% to 31%.

**Why it was missed** — *which practice failed* (51 of 52 misses assessed)

| Practice | n | Share |
|---|---|---|
| insufficient-verify-method | 31 | 61% |
| missing-checklist-item | 18 | 35% |
| instruction-ignored | 2 | 4% |

0 misses predate the field. 1 miss carries no value; 0 escapes lack it.

**Whose gap it was** (41 of 41 eligible misses sorted; 11 predate the `sort` field,
added 2026-09-07, and are outside this denominator)

| `sort` | n | Share |
|---|---|---|
| weak-check — a check existed and let it through | 24 | 59% |
| spec — the spec never had it | 16 | 39% |
| ignored — it was written down and not followed | 1 | 2% |

The `spec` share is climbing with each consumer-feedback batch — today added three.

### 5a. Attribution — `linked` records only

**12 of 52 misses are attributed; 40 are excluded** because they name a phase no
`runs.jsonl` record backs, so the model that produced them is unknown. Today's three are
`inferred` and are among the excluded.

| By | Counts (over 12 records) |
|---|---|
| Origin phase | fix-issues 10, build-phase 2 |
| Origin agent | flow-master 5, general-purpose 5, none 1, trblazeui 1 |
| Origin model | claude-opus-5 11, unknown 1 |

These are counts, not rates. **They are observational, not causal.** Which model gets the
hard work is not random, so a model at the top of this list may be doing the hardest work
rather than the worst. Read it as a question to investigate, never as a ranking to route on.

### 5b. Rework cost — measured and apportioned never combine

| | Fix records | Tokens out per miss |
|---|---|---|
| **Measured** (`sole` — the run fixed only this REQ) | 5 | **117,313.6** (n=5) |
| Apportioned (`shared:n` — divided equally, **not a measurement**) | 33 | 86,902.0 (n=33) |
| Unattributable (`none` — no usable token window) | 7 | — |

`tokens_unrecorded_sole_n` and `tokens_unrecorded_shared_n` are both 0, so no repair was
averaged in as free. Today's three fixes share one fix window (the `triage-and-fix` segment started
05:59:51Z) and are in the
apportioned row, which is why its mean fell from 91,229 at n=30.

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

Aggregated over **56 live run records** (5 voided records excluded — see the top of the
page). Token-window coverage: `tree` 24 · `main` 24 · `conversation` 0 · `none` 6 ·
absent 2. `none`/absent windows measured nothing and are excluded from every token figure
rather than averaged in as zero.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of output | % of time | Tokens measured on | Tokens out per run (median) |
|---|---|---|---|---|---|---|---|
| `fix-issues` | 12 | 3h58m / 16m27s | 1.9M | 36% | 21% | 10 of 12 | 187.9k (59.0k) |
| `triage-and-fix` | 10 | 4h02m / 17m44s | 1.8M | 34% | 21% | 10 of 10 | 175.8k (90.3k) |
| `build-phase` | 4 | 6h21m / 34m15s | 473.1k | 9% | 33% | 3 of 4 | 157.7k (80.9k) |
| `handoff-phase` | 3 | 1h05m / 12m56s | 415.7k | 8% | 6% | 2 of 3 | insufficient data (n=2) |
| `verify-phase` | 12 | 1h34m / 6m53s | 217.1k | 4% | 8% | 11 of 12 | 19.7k (13.1k) |
| `triage-issues` | 3 | 1h02m / 13m21s | 153.3k | 3% | 5% | 2 of 3 | insufficient data (n=2) |
| `metrics-report` | 5 | 12m02s / 2m21s | 129.3k | 3% | 1% | 5 of 5 | 25.9k (25.4k) |
| `amend-docs` | 4 | 37m16s / 2m36s | 90.8k | 2% | 3% | 3 of 4 | 30.3k (20.7k) |
| `log-miss` | 2 | 5m49s / insufficient data (n=2) | 52.5k | 1% | 1% | 2 of 2 | insufficient data (n=2) |
| `refresh-status` | 1 | 8m44s / insufficient data (n=1) | 0 | 0% | 1% | 0 of 1 | insufficient data (n=0) |

**Today's relabelling moved work between the two heaviest rows.** The two voided
`fix-issues` records (1,839 s and 5 s; 130,902 and 1,135 tokens out) now count under
`triage-and-fix`, so `fix-issues` fell from 14 runs to 12 and `triage-and-fix` rose from 8
to 10. `fix-issues` still carries the most output; `triage-and-fix` now carries slightly
more wall clock.

**`build-phase` taking 33% of wall clock on 9% of output is a fact about what that phase
is, not a finding about it** — it waits on builds. The same caution applies to every row:
these are phase shapes, not performance rankings.

**Some runs leave a second, REQ-less record.** 2026-10-01T20:56:41Z (`fix-issues`),
2026-10-02T07:38:55Z (`build-phase`), 2026-10-03T05:00:02Z (`fix-issues`) and today's
2026-10-07T06:32:45Z (`triage-and-fix`, 5 s, re-recorded from `fix-issues`) each follow a
REQ-bearing record of the same command. They count as runs, so the run counts for those phases are higher than the work
they describe.

### 6a. Which model did the work

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `fix-issues` | `claude-opus-5` | 1.5M | 82% | 7 |
| `fix-issues` | `claude-fable-5-1` | 307.0k | 16% | 2 |
| `fix-issues` | `claude-opus-5-5` | 27.0k | 1% | 1 |
| `triage-and-fix` | `claude-opus-5` | 1.5M | 87% | 6 |
| `triage-and-fix` | `claude-opus-5-5` | 199.9k | 11% | 3 |
| `triage-and-fix` | `claude-fable-5-1` | 35.0k | 2% | 1 |
| `build-phase` | `claude-fable-5-1` | 392.2k | 83% | 2 |
| `build-phase` | `claude-opus-5` | 80.9k | 17% | 1 |
| `handoff-phase` | `claude-opus-5` | 383.2k | 92% | 1 |
| `handoff-phase` | `claude-opus-5-5` | 32.5k | 8% | 1 |
| `verify-phase` | `claude-opus-5` | 161.0k | 74% | 7 |
| `verify-phase` | `claude-opus-5-5` | 33.5k | 15% | 2 |
| `verify-phase` | `claude-fable-5-1` | 22.6k | 10% | 2 |
| `triage-issues` | `claude-opus-5` | 153.3k | 100% | 2 |
| `amend-docs` | `claude-opus-5` | 90.8k | 100% | 3 |
| `metrics-report` | `claude-opus-5` | 59.5k | 46% | 3 |
| `metrics-report` | `claude-opus-5-5` | 49.7k | 38% | 1 |
| `metrics-report` | `claude-fable-5-1` | 20.1k | 16% | 1 |
| `log-miss` | `claude-opus-5` | 52.5k | 100% | 2 |

**This is observational, not causal** — the same warning §5a carries. Which model gets
which phase is not random, so a difference between models here is at least as much a fact
about what they were asked to do as about the models. All measured runs came through
`claude-code`; one run each of `amend-docs`, `build-phase`, `triage-issues` and
`verify-phase` came through the retired `codex` harness and is among the unmeasured runs
for its phase.

### 6b. Subagent fan-out — measured, on its own denominator

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share |
|---|---|---|---|---|---|
| `fix-issues` | 6 of 12 | 13 / 0.5 / 6 | 3 | 518.3k | 46% |
| `triage-and-fix` | 4 of 10 | 2 / 0.5 / 1 | 2 | 30.9k | 11% |
| `verify-phase` | 3 of 12 | 0 / 0 / 0 | 0 | 0 | 0% |
| `amend-docs` | 3 of 4 | 0 / 0 / 0 | 0 | 0 | 0% |
| `metrics-report` | 3 of 5 | 2 / 1 / 1 | 2 | 18.4k | 18% |
| `triage-issues` | 2 of 3 | insufficient data (n=2) | — | — | — |
| `build-phase` | 1 of 4 | insufficient data (n=1) | — | — | — |
| `log-miss` | 1 of 2 | insufficient data (n=1) | — | — | — |
| `handoff-phase` | 1 of 3 | insufficient data (n=1) | — | — | — |
| `refresh-status` | 0 of 1 | insufficient data (n=0) | — | — | — |

`triage-and-fix` rose from 2 to 4 observed runs because today's two re-recorded segments
carry `tree` scope, where the voided `fix-issues` originals carried `main`. Both observed
0 subagent runs.

**Read the `observed` column first.** Fan-out is only visible on a `tokens_scope: "tree"`
record — a `main`-scope window never read the subagent transcripts, so **`0` there means
*not looked*, not *none ran***. Every unobserved run on this page is unobserved for that one
reason (not `tree` scope); none predates the `subagent_runs` field (2026-08-31).

**Declared vs measured — the measured count is right where they disagree.**

- `fix-issues`: declared 11 vs **measured 13**. The declared list also carries free text
  where an agent name belongs (cluster descriptions, `none`, `trblazeui:1`), so `subagents`
  is not a reliable count even where it is filled in.
- `triage-issues`: declared 1 vs **measured 4**.
- `metrics-report`: declared 1 vs **measured 2**.
- `build-phase`: declared 2 vs **measured 0** — but measured on 1 observed run of 4, so the
  measured figure covers less than the declared one.

---

## 7. What is missing

- **No perf, assets or mockup-parity history.** A library has no mockups and declares no
  perf budgets, so two of the three may never produce a figure.
- **Attribution on 40 of 52 misses is not `linked`**, which keeps §5a to counts over 12
  records rather than per-phase or per-model rates.
- **Fan-out is unobserved on 32 of 56 runs** (every non-`tree` window), including 12 of the
  22 runs in the two heaviest phases and today's `verify-phase` run.
- **Fourteen gate records are false** (TF-001 replays) and cannot be withdrawn. The six false
  misses can be and are. A record that withdraws a gate record, in the shape of `miss-void`,
  would let §2 and §3 stop carrying this note.
- **Tokens out per run: insufficient data** for `handoff-phase` (n=2), `log-miss` (n=2),
  `triage-issues` (n=2) and `refresh-status` (n=0); median wall clock likewise for
  `log-miss` and `refresh-status`.
- **No measured dollars** — 0 records carry a real cost (§4).
- **No owner-review records** (`kind: "review"`, n=0), so the cost of corrections at a
  review is not yet on this page.
- **The 2026-10-03 `metrics-report` run left no run record of its own.** Its time sits
  inside that day's `triage-and-fix` record, which declared it as a subagent.
- **A chained fix step cannot let its parent run record itself** (TechieFlow TF-004).
  Today it was repaired by voiding and re-recording; until the framework fix lands, every
  `triage-and-fix` run risks being counted as `fix-issues`.
- **This rebuild's own `metrics-report` record** is written after this page, so it is not
  in §6.
