# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-10-07 (afternoon)** · project_type `library` · schema v1

Every figure on this page comes from `tf-metrics.sh --report . --json` and `--phases .`,
run on 2026-10-07 at 14:08 UTC. None was worked out by hand. Where the tool prints a count
and no share, this page prints the count and names the number it is out of; it does not
divide them itself.

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 61 live runs counted (66 run records, 5 voided) | 2026-08-11 → 2026-10-07 |
| `gates.jsonl` | 195 (0 backfilled, 0 malformed) | 2026-08-25 → 2026-10-07 |
| `sessions.jsonl` | 14 | 2026-08-09 → 2026-10-07 |
| `commits.jsonl` | 73 | 2026-02-09 → 2026-10-07 |
| `misses.jsonl` | 60 miss (7 withdrawn, 53 counted) + 46 miss-fix + 1 miss-amend | 2026-08-31 → 2026-10-07 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below and no REQ is excluded for backfill taint.

**Five run records are voided** and are outside every figure on this page. Every record
stays on the stream; nothing was deleted.

| Voided record | Reason on the void |
|---|---|
| `verify-phase` 2026-09-12T08:54:30Z | A verifier chained inside a `fix-issues` run was given the fix's start time, so the record claimed the whole fix as verify time. Gate records stand; cost and duration are not counted. |
| `verify-phase` 2026-09-13T12:16:23Z | The same mistake inside a `triage-and-fix` run. |
| `verify-phase` 2026-09-14T18:51:15Z | The same mistake inside a `triage-and-fix` run (TfLens TR-039, TR-040). |
| `fix-issues` 2026-10-07T05:59:51Z | A chained step of the morning's `triage-and-fix` run. `tf-fix-close.sh` labels its segments `fix-issues`, and the `triage-and-fix` run record was then refused as an overlap. Re-recorded with the same window as `cmd: triage-and-fix`. |
| `fix-issues` 2026-10-07T06:32:45Z | The same, for the 5-second closing segment of that run. Re-recorded as `cmd: triage-and-fix`. |

Those last two are a framework defect, filed upstream as TechieFlow TF-004: the chained fix
step takes the run's label, so the run that chains it cannot record itself. **It happened
again this afternoon** — see "What is new" below — and the afternoon's two records are *not*
voided or re-recorded on this page; they are counted under `fix-issues` as written.

**Seven misses are withdrawn** and are outside every figure on this page:
`MISS-TrBlazeUI-20260919-01` to `-05` and `MISS-TrBlazeUI-20260922-01` were logged by a
triage close replaying an earlier run's actions (TF-001); `MISS-TrBlazeUI-20261007-04` was
logged this afternoon under the FN prefix by mistake (a component parameter is a UI row)
and re-logged minutes later as REQ-UI-033.

### What is new since the morning 2026-10-07 snapshot

Five counted run records, five gate records, two misses (one withdrawn) and one miss-fix:

- **The morning's own tail** — the `amend-docs` run (started 2026-10-07T09:18:10Z, 242 s).
- **This afternoon: REQ-UI-033** (Chatur TR-018, `EditorTabs.CloseContent`). The row was
  first opened as REQ-FN-011 by mistake: that row carries one `escaped` gate record (which
  stays — there is no record kind that withdraws a gate record) and one miss
  (`MISS-TrBlazeUI-20261007-04`, withdrawn). Re-opened as REQ-UI-033 with one `escaped`
  gate record and one miss (`MISS-TrBlazeUI-20261007-05`, `unspecified-gap`, sort `spec`,
  attribution `inferred`). A `verify-phase` run (started 14:04:17Z, 154 s, 1,040 tokens
  out, `tree` scope) wrote three `Verified` gate records — REQ-UI-033 at attempt 2, and
  REQ-UI-030 and REQ-UI-022 re-confirmed on the same component — and one `miss-fix` closed
  the miss as `sole` with verdict `Verified`.
- **The afternoon's `triage-and-fix` run is on the stream as two `fix-issues` records**
  (TF-004 again): the fix segment (started 13:41:44Z, 1,353 s, 232,412 tokens out, `tree`
  scope, 1 subagent run measured with 9,215 output tokens, declared `trblazeui`) and a
  31-second closing segment (started 14:06:51Z, 4,620 tokens out). Both count under
  `fix-issues` in §4 and §6 as written.
- **The morning's `metrics-report` run** (started 07:05:15Z, 96 s). This page replaces the
  page that run wrote. The afternoon's `metrics-report` record is written after this page.

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 42 | 10 | **24%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 24% passing on their first *graded* attempt, not on their first *build*.** Gate
records began on 2026-08-25, when most of the catalogue was already built. The rate was
25% over 40 REQs at the morning snapshot; the two rows scored since then are REQ-UI-033
and the mistaken REQ-FN-011, whose first gate record is the escape the triage wrote when it
opened them. A row opened by a triage can never score first-pass, by construction — and a
row opened by mistake and never built counts as scored and failed all the same.

**Every consumer-feedback row this project opens is born failed at attempt 1**, so a falling
first-pass rate here partly measures how much consumer feedback is arriving, not only how
well the work is done.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

### Live · `library` — 85 failures

| Gate | Caught |
|---|---|
| acceptance | 1 |
| **escaped** — no gate caught it | 84 |

Out of 85 failure records. No `build`, `render`, `visual` or `standards` failure is on the
stream.

**The escaped count is inflated, and none of it is corrected here.** 14 of the escaped
records are TF-001 replays (13 on 2026-09-19, 1 on 2026-09-22), and the 2026-09-14 close
rewrote 11 earlier actions as new escaped records. One more, this afternoon's REQ-FN-011,
belongs to a row that no longer exists. All of them stay in the count; there is no record
kind that withdraws a gate record. This afternoon's REQ-UI-033 escape is real.

**Gates added after the stream started** — read each against the records that ran it:

| Gate | Added | Records that ran it | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

**A library can never fail the visual-truth or mockup-parity gate**, because it has no
screens of its own — the demo app's pages are not the library. That is why `project_type`
separation is enforced. This afternoon's parity run against Chatur's `process-run.html`
mockup on the Code Editor demo was `UNGRADEABLE` (0 anchors compared) for exactly that
reason, and is on no stream.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate | Over |
|---|---|---|---|
| `gates.jsonl` | REQs with a `gate:"escaped"` record ÷ REQs with any failure record | **97%** | live `library` gate records |
| `misses.jsonl` | misses found by `owner` / `production` ÷ all misses | **87%** | 53 misses |

The `gates.jsonl` figure is inflated by the replayed gate records described in §2: a
replayed record is *always* an escape, so that defect can only push this number up. The
`misses.jsonl` figure is not, because the replayed misses are withdrawn.

**A 97% escape rate on a component library is a real signal even after that discount.**
This project's defects are found by the applications that consume it, not by its own
gates. This afternoon's row is the plain case again: `unspecified-gap` with sort `spec` —
the spec had no line for the behaviour until the consumer asked, so no gate could have
failed on it.

---

## 4. Throughput and rework — poolable

*Comparable across `project_type` and provenance, so pooled deliberately.*

| Metric | Value |
|---|---|
| Runs | 61 (fix-issues 14, verify-phase 13, triage-and-fix 10, metrics-report 6, amend-docs 5, build-phase 4, handoff-phase 3, triage-issues 3, log-miss 2, refresh-status 1) |
| Rework ratio (fix-mode runs ÷ `build-phase` runs) | 650% |
| Batch size — median REQs per `build-phase` run | 2.5 (n=4) |
| REQ throughput — median REQs/hour | 11.69 |
| Sessions / total tokens | 14 / 5,764,390 |
| Tokens per `Verified` REQ | 52,403.5 |
| Commit cadence | 2.21 commits/active day (73 commits over 33 active days) |

**The rework ratio says little about rework here.** 3 of the 4 `build-phase` runs were
themselves in fix mode, and a component library fed by consumer reports does most of its
work as fixes by design. It rose from 600% to 650% because the afternoon's two
`triage-and-fix` segments are labelled `fix-issues` (TF-004).

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
| Misses logged | 53 (10 open, 43 resolved, 0 wont-fix) |
| Miss-fix records | 46 (0 orphaned) |
| Amendments applied | 1 (0 orphaned) |
| Withdrawn (in no figure here) | 7 |
| Design-miss share (`unspecified-gap`) | 32% |
| Found by a human (`owner` / `production`) | 87% |

*The human-found share is reported **beside** the §3 escape rate, never merged with it:
the two are computed from different records by different definitions.*

Found by: owner 46, library-feedback 6, gate 1.

**Miss classes** — *what* was missed (out of 53)

| Class | n |
|---|---|
| unspecified-gap | 17 |
| wrong-behaviour | 17 |
| regression | 13 |
| partial-implementation | 4 |
| missed-requirement | 1 |
| scope-creep | 1 |

This afternoon's miss is `unspecified-gap`, which is why the design-miss share rose from
31% to 32% and that class now ties `wrong-behaviour`.

**Why it was missed** — *which practice failed* (52 of 53 misses carry the field)

| Practice | n |
|---|---|
| insufficient-verify-method | 31 |
| missing-checklist-item | 19 |
| instruction-ignored | 2 |

0 misses predate the field. 1 miss carries no value; 0 escapes lack it.

**Whose gap it was** (42 of 42 eligible misses sorted; 11 predate the `sort` field,
added 2026-09-07, and are outside this denominator)

| `sort` | n |
|---|---|
| weak-check — a check existed and let it through | 24 |
| spec — the spec never had it | 17 |
| ignored — it was written down and not followed | 1 |

The `spec` count climbs with each consumer-feedback entry — this afternoon added one.

### 5a. Attribution — `linked` records only

**12 of 53 misses are attributed; 41 are excluded** because they name a phase no
`runs.jsonl` record backs, so the model that produced them is unknown. This afternoon's
miss is `inferred` and is among the excluded.

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
| **Measured** (`sole` — the run fixed only this REQ) | 6 | **136,496.7** (n=6) |
| Apportioned (`shared:n` — divided equally, **not a measurement**) | 33 | 86,902.0 (n=33) |
| Unattributable (`none` — no usable token window) | 7 | — |

`tokens_unrecorded_sole_n` and `tokens_unrecorded_shared_n` are both 0, so no repair was
averaged in as free. This afternoon's fix repaired one REQ in its own window, so it joins
the measured row as `sole`; the measured mean rose from 117,313.6 (n=5) to 136,496.7 (n=6).
That window (232,412 tokens out) includes the parity comparison, the triage, the mistaken
row and its correction, the documents the package ships, and the consumer reply — a fix
run's cost is the run's, not the code change's.

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

Aggregated over **61 live run records** (5 voided records excluded — see the top of the
page). Token-window coverage: `tree` 29 · `main` 24 · `conversation` 0 · `none` 6 ·
absent 2. `none`/absent windows measured nothing and are excluded from every token figure
rather than averaged in as zero.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of output | % of time | Tokens measured on | Tokens out per run (median) |
|---|---|---|---|---|---|---|---|
| `fix-issues` | 14 | 4h21m / 15m40s | 2.1M | 39% | 22% | 12 of 14 | 176.3k (59.0k) |
| `triage-and-fix` | 10 | 4h02m / 17m44s | 1.8M | 32% | 21% | 10 of 10 | 175.8k (90.3k) |
| `build-phase` | 4 | 6h21m / 34m15s | 473.1k | 9% | 32% | 3 of 4 | 157.7k (80.9k) |
| `handoff-phase` | 3 | 1h05m / 12m56s | 415.7k | 8% | 6% | 2 of 3 | insufficient data (n=2) |
| `verify-phase` | 13 | 1h37m / 6m44s | 218.1k | 4% | 8% | 12 of 13 | 18.2k (12.7k) |
| `triage-issues` | 3 | 1h02m / 13m21s | 153.3k | 3% | 5% | 2 of 3 | insufficient data (n=2) |
| `metrics-report` | 6 | 13m38s / 1m58s | 147.3k | 3% | 1% | 6 of 6 | 24.5k (22.7k) |
| `amend-docs` | 5 | 41m18s / 2m42s | 99.5k | 2% | 3% | 4 of 5 | 24.9k (20.6k) |
| `log-miss` | 2 | 5m49s / insufficient data (n=2) | 52.5k | 1% | 0% | 2 of 2 | insufficient data (n=2) |
| `refresh-status` | 1 | 8m44s / insufficient data (n=1) | 0 | 0% | 1% | 0 of 1 | insufficient data (n=0) |

**`fix-issues` grew by two runs this afternoon that are really one `triage-and-fix` run**
(TF-004, see the top of the page): 1,353 s and 31 s, 232,412 and 4,620 tokens out. The
morning's two were voided and re-recorded under `triage-and-fix`; the afternoon's are
counted as written. So the two heaviest rows are closer in substance than the table shows.

**`build-phase` taking 32% of wall clock on 9% of output is a fact about what that phase
is, not a finding about it** — it waits on builds. The same caution applies to every row:
these are phase shapes, not performance rankings.

**Some runs leave a second, REQ-less record.** 2026-10-01T20:56:41Z (`fix-issues`),
2026-10-02T07:38:55Z (`build-phase`), 2026-10-03T05:00:02Z (`fix-issues`), the morning's
2026-10-07T06:32:45Z (`triage-and-fix`, 5 s, re-recorded from `fix-issues`) and this
afternoon's 2026-10-07T14:06:51Z (`fix-issues`, 31 s) each follow a REQ-bearing record of
the same command. They count as runs, so the run counts for those phases are higher than
the work they describe.

### 6a. Which model did the work

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `fix-issues` | `claude-opus-5` | 1.5M | 73% | 7 |
| `fix-issues` | `claude-fable-5-1` | 544.1k | 26% | 4 |
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
| `verify-phase` | `claude-fable-5-1` | 23.6k | 11% | 3 |
| `triage-issues` | `claude-opus-5` | 153.3k | 100% | 2 |
| `amend-docs` | `claude-opus-5` | 90.8k | 91% | 3 |
| `amend-docs` | `claude-opus-5-5` | 8.8k | 9% | 1 |
| `metrics-report` | `claude-opus-5-5` | 67.7k | 46% | 2 |
| `metrics-report` | `claude-opus-5` | 59.5k | 40% | 3 |
| `metrics-report` | `claude-fable-5-1` | 20.1k | 14% | 1 |
| `log-miss` | `claude-opus-5` | 52.5k | 100% | 2 |

**This is observational, not causal** — the same warning §5a carries. Which model gets
which phase is not random, so a difference between models here is at least as much a fact
about what they were asked to do as about the models. All measured runs came through
`claude-code`; one run each of `amend-docs`, `build-phase`, `triage-issues` and
`verify-phase` came through the retired `codex` harness and is among the unmeasured runs
for its phase. This afternoon's three records (two `fix-issues`, one `verify-phase`) are
`claude-fable-5-1`.

### 6b. Subagent fan-out — measured, on its own denominator

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share |
|---|---|---|---|---|---|
| `fix-issues` | 8 of 14 | 14 / 0.5 / 6 | 4 | 527.5k | 39% |
| `triage-and-fix` | 4 of 10 | 2 / 0.5 / 1 | 2 | 30.9k | 11% |
| `verify-phase` | 4 of 13 | 0 / 0 / 0 | 0 | 0 | 0% |
| `amend-docs` | 4 of 5 | 0 / 0 / 0 | 0 | 0 | 0% |
| `metrics-report` | 4 of 6 | 3 / 1 / 1 | 3 | 30.3k | 25% |
| `triage-issues` | 2 of 3 | insufficient data (n=2) | — | — | — |
| `build-phase` | 1 of 4 | insufficient data (n=1) | — | — | — |
| `log-miss` | 1 of 2 | insufficient data (n=1) | — | — | — |
| `handoff-phase` | 1 of 3 | insufficient data (n=1) | — | — | — |
| `refresh-status` | 0 of 1 | insufficient data (n=0) | — | — | — |

This afternoon's fix segment is `tree` scope and **measured 1 subagent run** (the builder,
9,215 output tokens), the first fan-out observed on a `fix-issues` record since 2026-09-22;
it is why `fix-issues` moved from 6 to 8 observed runs and 13 to 14 spawns.

**Read the `observed` column first.** Fan-out is only visible on a `tokens_scope: "tree"`
record — a `main`-scope window never read the subagent transcripts, so **`0` there means
*not looked*, not *none ran***. Every unobserved run on this page is unobserved for that one
reason (not `tree` scope); none predates the `subagent_runs` field (2026-08-31).

**Declared vs measured — the measured count is right where they disagree.**

- `fix-issues`: declared 12 vs **measured 14**. The declared list also carries free text
  where an agent name belongs (cluster descriptions, `none`, `trblazeui:1`), so `subagents`
  is not a reliable count even where it is filled in.
- `triage-issues`: declared 1 vs **measured 4**.
- `metrics-report`: declared 1 vs **measured 3**.
- `build-phase`: declared 2 vs **measured 0** — but measured on 1 observed run of 4, so the
  measured figure covers less than the declared one.

---

## 7. What is missing

- **No perf, assets or mockup-parity history.** A library has no mockups and declares no
  perf budgets, so two of the three may never produce a figure; the parity tool was run
  this afternoon against a consumer's mockup and could grade nothing.
- **Attribution on 41 of 53 misses is not `linked`**, which keeps §5a to counts over 12
  records rather than per-phase or per-model rates.
- **Fan-out is unobserved on 32 of 61 runs** (every non-`tree` window), including 12 of the
  24 runs in the two heaviest phases.
- **Fifteen gate records are false or orphaned** (14 TF-001 replays, plus this afternoon's
  REQ-FN-011 escape on a row that was removed) and cannot be withdrawn. The seven false
  misses can be and are. A record that withdraws a gate record, in the shape of
  `miss-void`, would let §2 and §3 stop carrying this note.
- **Tokens out per run: insufficient data** for `handoff-phase` (n=2), `log-miss` (n=2),
  `triage-issues` (n=2) and `refresh-status` (n=0); median wall clock likewise for
  `log-miss` and `refresh-status`.
- **No measured dollars** — 0 records carry a real cost (§4).
- **No owner-review records** (`kind: "review"`, n=0), so the cost of corrections at a
  review is not yet on this page.
- **The 2026-10-03 `metrics-report` run left no run record of its own.** Its time sits
  inside that day's `triage-and-fix` record, which declared it as a subagent.
- **A chained fix step cannot let its parent run record itself** (TechieFlow TF-004).
  The morning's run was repaired by voiding and re-recording; the afternoon's run is on
  the stream as two `fix-issues` records and is counted that way here. Until the framework
  fix lands, every `triage-and-fix` run is at risk of being counted as `fix-issues`.
- **This rebuild's own `metrics-report` record** is written after this page, so it is not
  in §6.
