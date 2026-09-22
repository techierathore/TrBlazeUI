# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md.

     THE ONE RULE FOR THIS DOCUMENT: no combined first-pass rate, gate catch
     distribution, escape rate, miss rate, or cost-per-miss across live/backfilled,
     across project_type, across attribution confidence, or across cost attribution.
     No "total" row, no "overall" line, no averaged intro sentence. -->

**Snapshot as of 2026-09-22** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 35 live runs counted, 3 voided | 2026-08-11 → 2026-09-22 |
| `gates.jsonl` | 139 (0 backfilled) | 2026-08-25 → 2026-09-22 |
| `sessions.jsonl` | 9 | 2026-08-09 → 2026-09-22 |
| `commits.jsonl` | 64 | 2026-02-09 → 2026-09-15 |
| `misses.jsonl` | 48 miss + 33 miss-fix + 1 miss-amend | 2026-08-31 → 2026-09-22 |

Every record on every stream was written live. **Nothing here is backfilled**, so no
provenance column appears below.

**Three run records are voided** and are outside every figure on this page. All three are
the same mistake: a `verify-phase` record written by a verifier chained inside a fix,
given the fix's start time. They are from 2026-09-12T08:54:30Z, 2026-09-13T12:16:23Z and
2026-09-14T18:51:15Z. The gate records from all three stand; only their cost and duration
are not counted. Today's verifier record was written with its own start time
(2026-09-22T14:25:04Z), so it needed no void.

### What is new since the 2026-09-19 snapshot

One piece of work: `*triage-and-fix TrBlazeUI docs/Chatur-TrBlazeUI-Feedback.md`, started
2026-09-22T13:27:38Z, against Chatur's **second** batch of ten findings. It opened four new
rows (REQ-UI-022 `CodeEditor`/`EditorTabs`, REQ-UI-023 `Typing`/`Progress.Indeterminate`,
REQ-UI-024 `LogView`, REQ-UI-025 `NavList`), demoted four existing ones (REQ-UI-005,
REQ-UI-006, REQ-UI-017, REQ-FN-006), fanned out six builder subagents, and the chained
verifier (`verify-phase`, started 2026-09-22T14:25:04Z) marked all eight **Verified**.

Five of the ten reported findings were not defects in the library at all — two named
controls that already exist unreleased, three named controls documented in the very copy
of the reference the reporter was reading. Only REQ-FN-006 carries that as a defect. That
shape does not appear anywhere in the figures below, because the streams count rows, not
report accuracy; it is recorded here because it is the most useful thing this run learned.

> **TF-001 is still live, and today's telemetry is inflated again.** `tf-triage.sh close`
> still replays actions it did not write. Today it reported *"9 row(s) logged — 9 gate
> record(s) (escaped), 8 miss(es)"* for a run that logged **8** rows. The ninth is
> **REQ-UI-021**, the row the 2026-09-19 run created and which this run never touched:
> one `escaped` record under run id `2026-09-22T13:27:38Z`, and one miss,
> **`MISS-TrBlazeUI-20260922-01`**, which has **no `miss-fix`** because there was nothing
> to fix — so it sits on the open-miss count permanently.
>
> The hand-trim applied on 2026-09-19 is why one leaked today rather than thirteen. It is
> not a fix: `close` still reads a list it does not empty. The action list was trimmed
> again after this run. Streams are append-only and no record type withdraws a gate record
> or a miss, so **every escape, gate-catch and open-miss figure below counts these as the
> tool prints them.** Nothing on this page is corrected by hand.
> Filed as **TF-001** in `docs/TrBlazeUI-TechieFlow-Feedback.md`, now with a
> "Still happening — 2026-09-22" section.

Running total of records this defect has added: **14 spurious `escaped` gate records**
(13 on 2026-09-19, 1 on 2026-09-22) and **6 spurious misses** that will never be resolved
(`MISS-TrBlazeUI-20260919-01` to `-05`, `MISS-TrBlazeUI-20260922-01`).

---

## 1. First-pass rate

*What fraction of REQs reach `Verified` on attempt 1.*

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 33 | 10 | **30%** |

**Excluded from the live rate:** none. No REQ carries backfilled history.

**This is 30% passing on their first *graded* attempt, not on their first *build*.** Gate
records began on 2026-08-25, when most of the catalogue was already built. The rate was
36% at the last snapshot over 28 REQs; it fell because five newly-scored rows all entered
at attempt 2. Four of those five are REQ-UI-022 to REQ-UI-025, whose first gate record is
the escape the triage wrote when it opened the row — a row opened by a triage can never
score first-pass, by construction. The fifth is REQ-UI-021, entered by the replay above.

That construction is worth naming plainly: **every consumer-feedback row this project
opens is born at attempt 2**, so a falling first-pass rate here is partly a measure of how
much consumer feedback is arriving, not only of how well the work is done.

---

## 2. Gate catch distribution

*Of all failures, which gate caught them.*

| project_type | Gate | Failures | Share |
|---|---|---|---|
| **library** | escaped — no gate caught it | 73 | 99% |
| **library** | acceptance | 1 | 1% |

Counts over 74 failures, as the tool reports them. The escape *rate* is in §3.

**The escaped count is inflated three times over, and none of it is corrected here.**
14 of the 73 escaped records are TF-001 replays (13 on 2026-09-19, 1 today). The
2026-09-14 snapshot reported the same fault once before: that day's close rewrote 11
earlier actions as new escaped records. All of them stay in the count.

| Gate | Added | Runs | Caught |
|---|---|---|---|
| perf | 2026-08-10 | 0 | 0 |
| assets | 2026-08-31 | 0 | 0 |
| mockup-parity | 2026-08-31 | 0 | 0 |

The assets gate **did** run today (9 routes, 6 assets each, 0 missing) but caught nothing,
so it is still 0 caught. **A library can never fail the visual-truth or mockup-parity
gate**, because it has no screens of its own — the demo app's pages are not the library.
That is why `project_type` separation is enforced.

---

## 3. Escape rate

Two different questions, from two different streams, reported side by side and never
merged into one number.

| Source | Definition | Rate | n |
|---|---|---|---|
| `gates.jsonl` | failures whose gate was `escaped` | **96%** | 74 failures |
| `misses.jsonl` | misses found by owner or production rather than by a gate | see §4 | 48 misses |

Both are inflated by the TF-001 replays described above, and the `gates.jsonl` figure is
the one most distorted by them: a replayed record is *always* an escape, so the defect can
only push this number up.

**A 96% escape rate on a component library is a real signal even after that discount.**
This project's defects are found by the applications that consume it, not by its own
gates, and that is what the shape of the work makes likely: a library's acceptance tests
exercise the API it meant to ship, while a consumer exercises the API they expected to
find. Today's run is the clearest example on record — see §4.

---

## 4. Miss attribution and rework cost

| Figure | Value |
|---|---|
| Misses logged | 48 |
| Resolved | 30 |
| Open | 18 |
| `wont-fix` | 0 |
| Amendments applied | 1 (0 orphaned) |
| Miss-fix records | 33 (0 orphaned) |

Of the 18 open, **6 are the TF-001 phantoms** and can never be resolved, because they
record work that was never open. The honest open count for real work is **12**.

### Why the miss was missed

Over the 47 of 48 records that carry the field (1 does not; 0 predate its introduction):

| `why_missed` | Count | Share |
|---|---|---|
| insufficient-verify-method | 33 | 70% |
| missing-checklist-item | 13 | 28% |
| instruction-ignored | 1 | 2% |

### Whose gap it was

Over the 37 records that carry `sort` (11 predate the field and are outside this
denominator):

| `sort` | Count | Share |
|---|---|---|
| weak-check — the line existed, the check let it through | 26 | 70% |
| spec — the spec never had it | 11 | 30% |

Today added 4 `spec` (the four new components — the library genuinely never had them) and
4 `weak-check`. That split is the run in miniature: half the batch was missing capability,
half was capability that existed and was not found.

### Rework cost

**Measured and apportioned are separate columns and are never added together.**

| Attribution | Records | Tokens per miss |
|---|---|---|
| `sole` — one miss, one repair window | 4 | **139,895** (measured) |
| `shared:n` — one window repaired several | 22 | not a headline figure; apportioned only |
| `none` | counted, costed at nothing | — |

`tokens_unrecorded_sole_n` is 0, so no repair was averaged in as free.

**Attribution excluded: 39 of 48 misses.** Per-phase, per-agent and per-model miss rates
run over `origin_confidence:"linked"` records only, and 39 records are not linked. That
leaves too few to publish a per-agent or per-model rate: **insufficient data (n=9)**.

**A per-model miss rate would be observational, not causal, and is not printed here.**
Which model gets the hard work is not random.

---

## 5. Effort per phase

*About the RUN, not the ticket. There is no cycle-time-per-feature on this page and there
will not be one — the unit of work in this framework is the run.*

35 live run records. **Token-window coverage: `tree` 13 · `main` 15 · `none` 5 · absent 2.**
A window is only as good as its scope: `tree` saw the subagents, `main` did not look, and
`none`/absent measured nothing and is excluded from every token figure rather than averaged
in as a zero.

| Phase | Runs | Wall clock | Tokens out | % out | % time |
|---|---|---|---|---|---|
| fix-issues | 8 | 3h21m | 1.5M | 39% | 21% |
| triage-and-fix | 6 | 3h26m | 1.5M | 39% | 21% |
| handoff-phase | 2 | 1h01m | 383.2k | 10% | 6% |
| verify-phase | 8 | 56m23s | 161.0k | 4% | 6% |
| triage-issues | 2 | 58m50s | 126.7k | 3% | 6% |
| build-phase | 2 | 5h42m | 80.9k | 2% | 35% |
| log-miss | 2 | 5m49s | 52.5k | 1% | 1% |
| amend-docs | 2 | 32m03s | 49.6k | 1% | 3% |
| metrics-report | 2 | 5m29s | 34.1k | 1% | 1% |
| refresh-status | 1 | 8m44s | 0 | 0% | 1% |

**`build-phase` taking 35% of wall clock on 2% of output is a fact about what that phase
is, not a finding about it** — it waits on builds. The same caution applies to every row:
these are phase shapes, not performance rankings.

### The two heaviest phases

**`fix-issues`** — 8 runs, tokens measured on 7 (1 unmeasured and excluded), 220.7k out per
run (median 67.3k). Fan-out **observed on 5 of 8 runs**; the other 3 were not `tree` scope,
so their 0 means *not looked*, not *none*. Over the 5 observed: 12 spawns, 2 runs fanned
out, 506.7k output tokens inside subagents = **46% of this phase's observed output**.
Declared 9 vs **measured 12** — `subagents` is typed by the agent, `subagent_runs` is
counted from the harness store, and **where they disagree the measured one is right.**
19 REQ touches, 67 files written. List price $258.86 over 7 runs.

**`triage-and-fix`** — 6 runs, tokens measured on all 6, 253.9k out per run (median 156.2k).
Fan-out **observed on 1 of 6 runs**; the other 5 were not `tree` scope. 17 REQ touches, 108
files written. List price $156.59 over 6 runs.

The fan-out denominators are the weak point of this whole section: on the two phases that
actually fan out, only 6 of 14 runs were observed at all. Any statement about how much work
happens inside subagents rests on those 6.

### Models and money

Every measured run on this project is `claude-opus-5` through `claude-code`, so there is no
per-model split to draw.

**`cost_usd` is `null` on every Claude Code record** — no cost source exists, and inventing
one would be an estimate presented as a measurement. What is shown instead is **list price**:
the published rate applied to the tokens on the record, worked out at report time and never
stored. It is a price, not a bill, and it is what makes a subscription run comparable with a
metered one. **$566.71 of list price over 28 records.** No rate-card estimate appears
anywhere else on this page.

| Pooled figure | Value |
|---|---|
| Tokens (all streams) | 3,992,393 |
| Tokens per `Verified` REQ | 61,421 |
| List price per `Verified` REQ | $8.72 |
| Commits | 64 over 27 active days (2.37/day) |
| Median throughput | 10.44 REQs/hour |

Commit-derived metrics are exempt from the provenance separations: `git log` is a real
append-only log and commit volume is comparable across project types. The commit-telemetry
hook is installed on this clone, so the commit count is not understated.

`rework_ratio` is **insufficient data (n=2 `build-phase` runs)**.

---

## 6. What is missing

- **No perf, assets-catch or mockup-parity history.** The assets gate ran today and caught
  nothing; the other two have never run. A library has no mockups and declares no perf
  budgets, so two of the three may never produce a figure.
- **Attribution on 39 of 48 misses is not `linked`**, which is what keeps §4 from carrying a
  per-phase or per-agent rate.
- **Fan-out is unobserved on 8 of the 14 runs in the two phases that fan out.**
- **Six misses and fourteen gate records are phantoms** from TF-001 and cannot be withdrawn.
  A `miss-void` record, in the shape of the existing `run-void`, would let this report exclude
  them honestly instead of re-explaining them in prose every time. That is now the most
  valuable thing the framework could add for this project's numbers.
