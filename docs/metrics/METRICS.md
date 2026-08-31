# TrBlazeUI — development telemetry

**Generated:** 2026-08-31 · **Project type:** `library` · **Source:** `docs/metrics/*.jsonl`
**Figures computed by** `.tfcore/telemetry/tf-metrics.sh --report` — nothing on this page is hand-arithmetic.

| Stream | Records |
|---|---|
| `gates.jsonl` | 22 (0 backfilled) |
| `runs.jsonl` | 11 |
| `misses.jsonl` | 9 `miss` + 8 `miss-fix` |
| `sessions.jsonl` | 4 |
| `commits.jsonl` | 52 |

**Every record on this page is live and every one is `project_type: library`.** There is no
backfilled data in this repo and no second project type, so none of the figures below cross a
provenance boundary. That is why they are printed at all — not because the sample is large.

> **Read the sample size before the number.** The gate stream begins on **2026-08-25**. It covers
> two working days, not the project's history: TrBlazeUI's earlier work (REQ-UI-014 through
> REQ-UI-018, the whole 2.0.x/2.1.0 cycle) predates telemetry and is **absent**, not passing.
> Several figures below are therefore literally correct and easy to misread. Where that is the
> case it is said in the row.

---

## 1. First-pass rate

**0%** — 0 of **11** REQs scored reached `Verified` on attempt 1.

**This is an artifact of when recording started, not a quality finding, and it should not be
quoted on its own.** Every REQ in the stream entered it *because* something was already wrong:
the 2026-08-25 records open with consumer-triage findings, and the 2026-08-31 records open with
six `escaped` verdicts from the TfLens report. A REQ that was built correctly and verified once
never generated a first attempt to score. The figure will only become meaningful once a phase is
recorded from its build through its verify without a defect report in between.

---

## 2. Gate catch distribution

| Gate that caught the failure | Count |
|---|---|
| `escaped` (no gate fired — a human or a consuming app found it) | **12** |
| build · acceptance · render · visual · standards | **0** |

n = 12.

**This is the figure worth acting on.** Not one recorded defect in this repo was caught by a gate.
All twelve were found downstream — by a consuming application, after release. The gates are not
failing to run (the verify suites pass 166/166); they are running *after* the defects have already
been introduced and shipped, and they assert what a previous cycle already fixed rather than what a
consumer is about to hit.

Late-gate coverage is zero across the board — `perf` (since 2026-08-10), `assets` and
`mockup-parity` (both since 2026-08-31) have **run 0 times**. For a component library `assets` and
`mockup-parity` are arguably not applicable; `perf` has simply never been exercised.

---

## 3. Escape rate

**100%** (12 of 12 failure records carry `gate: "escaped"`), n = 12.

Same evidence as §2, stated as the headline it feeds. A library's defects reach a consumer because
the library has no user of its own — the demo app is written by the same pass that writes the
components, so it encodes the same assumptions and cannot act as an independent check. Three of
today's defects were sitting **in the library's own demo pages** and had been rendering wrongly for
weeks without anyone noticing:

- `/components/datatable` bound 500 records with `ShowPagination="false"` and rendered **5 rows**;
  the demo was relying on the bug it was demonstrating.
- `/components/dropdown-menu` and `/components/menubar` shipped `<LucideIcon Name="check-circle">`,
  which rendered **nothing** — an invisible icon with no error.

A screenshot gate would not have caught any of them, which is the substantive point: they are all
"the page looks complete" defects.

### An honest discrepancy on this page

**§3 says the escape rate is 100%. The miss stream's own escape share says 0%.** Both are computed
correctly and they are measuring different things:

- `gates.jsonl` escape rate counts records with `gate: "escaped"` — all 10 of today's.
- Miss escape share counts misses with `found_by ∈ {owner, production}` — and today's six misses
  were recorded as **`found_by: "library-feedback"`**, which is the accurate value for a defect
  reported by a consuming application and is a real member of the SCHEMA §5.5.1 vocabulary.

So a defect that escaped to a consumer is excluded from the metric named "escape share". For an
**app** the two agree; for a **library**, whose defects escape to consuming projects by definition,
`library-feedback` falls outside the boundary the share is drawn on. The value was chosen because
it describes the channel truthfully, and the alternative — recording it as `owner` to make the
number move — would have been fabricating the provenance to fit the metric. **Flagged as a
framework observation, not corrected in the data.**

The stream now shows this cleanly: `found_by` is **`library-feedback` = 6, `owner` = 3**, giving an
escape share of **33%** — which counts only the three the owner reported directly and none of the
six a consuming application hit in production. Both numbers are right; only one of them is named
"escape".

---

## 4. Misses — what was missed, who missed it, what it cost

9 misses, **7 resolved, 2 open**, 0 won't-fix, 0 orphan fixes.

### What was missed

| `miss_class` | Count |
|---|---|
| `partial-implementation` | 3 |
| `wrong-behaviour` | 3 |
| `missed-requirement` | 1 |
| `scope-creep` | 1 |
| `unspecified-gap` | 1 |

**Design-miss share: 11%** (1 of 9).

The `scope-creep` record is this agent's own: during the fix pass it bumped `Directory.Build.props`
to a version nobody had released and propagated that number into five documents. The owner caught
it. It is logged like any other miss, and it is the one record on this page whose attribution came
out **`linked`** with a real model — see below. The `unspecified-gap` is REQ-UI-019's cluster of things no
requirement ever asked for — `Badge` status variants, `DataTable.ShowHeader`/`Density`,
`Breadcrumb.Wrap`. Nobody specified them, so nobody built them, and no gate could have caught
their absence. That is the one class of miss this framework was previously blind to.

### Which practice let them through

| `why_missed` | Count |
|---|---|
| `insufficient-verify-method` | 5 |
| `missing-checklist-item` | 3 |
| `instruction-ignored` | 1 |

n = 9 of 9 eligible; **0 escapes are missing a `why_missed`**.

Five of nine say the acceptance existed and **no gate could have caught this class of defect** —
which matches §2 exactly. These are silent-failure defects: rows dropped with no pager, an icon
that draws nothing, a collapsed panel that still occupies layout, a key rendered instead of a
label. Each passes every "is it visible?" check. The verification method, not the specification, is
the weak side here.

### Attribution — and what is excluded

**Attributed: 2 of 9. Excluded: 7.**

| Attributed by | Value |
|---|---|
| `origin_phase` | `build-phase` = 1 · `fix-issues` = 1 |
| `origin_agent` | `trblazeui` = 1 · `flow-master` = 1 |
| `origin_model` | `claude-opus-5` = 1 · unresolved = 1 |

Only two records resolved to a run in `runs.jsonl`: `MISS-…-02` (REQ-UI-004, `build-phase`, agent
`trblazeui`, 2026-08-25 — whose run recorded no model, so the model stays unresolved) and
`MISS-…-09`, this agent's own version overreach, which linked cleanly to today's `fix-issues` run
and therefore carries `claude-opus-5`.

The other seven concern REQs migrated as `Done (pre-existing)` — no run record has ever touched
them, so `origin_run_id` was **deliberately omitted** and the emitter marked them `inferred` and
nulled the model.

**No per-model miss figure is published.** One resolved model out of nine records is not a rate,
and the one that did resolve is the agent auditing itself. Publishing "claude-opus-5: 1 miss" as a
per-model figure would be a routing decision made on a sample of one.

### Rework cost

**No headline cost-per-miss figure can be published from this data.**

| Cost attribution | Count |
|---|---|
| `sole` | **0** |
| `shared:6` | 6 |
| `shared:2` | 2 |
| unattributable | 0 |

Every `miss-fix` on this stream is `shared` — six repaired by one `fix-issues` run touching six
REQs, two by a second run touching two. Per SCHEMA §6 a shared cost never enters a headline cost
figure, so `tokens_per_miss_measured` is correctly `null` (measured n = 0). What *can* be said, as
run figures rather than per-miss ones: the TfLens repair cost **322.5k output tokens over 42m20s**,
and the CI/CD repair **50.8k over 6m39s**. Dividing either by its REQ count would produce a number
that looks precise and means nothing.

---

## 5. Effort per phase

Aggregated over live `runs.jsonl` by `cmd`. **The unit is the run, never the feature** (SCHEMA §0).
Token-window coverage across the 9 runs: `tree` = 3, `none` = 4, absent = 2. **The six unmeasured
runs are excluded from every token figure rather than averaged in as zero**, which is why the two
largest wall-clock phases show no tokens.

| Phase | Runs | Wall clock | Tokens out | % of out | % of time |
|---|---|---|---|---|---|
| `build-phase` | 1 | 5h07m | *unmeasured* | — | 70% |
| `triage-issues` | 2 | 58m50s | 126.7k | 28% | 13% |
| `fix-issues` | 1 | 42m20s | **322.5k** | 71% | 10% |
| `handoff-phase` | 1 | 12m56s | *unmeasured* | — | 3% |
| `refresh-status` | 1 | 8m44s | *unmeasured* | — | 2% |
| `verify-phase` | 1 | 6m44s | *unmeasured* | — | 2% |
| `amend-docs` | 1 | 2m03s | *unmeasured* | — | 0% |
| `log-miss` | 1 | 0m41s | 6.6k | 1% | 0% |

**Today's cycle, measured end to end** (all three runs `tree`-scoped, so subagent transcripts were
actually read rather than assumed):

| Run | Wall clock | Tokens out | of which subagents | Fan-out |
|---|---|---|---|---|
| `triage-issues` (discovery) | 13m21s | 126.7k | 43.9k (35%) | 4 |
| `log-miss` (recording) | 0m41s | 6.6k | — | 0 |
| `fix-issues` (repair + verify) | 42m20s | **322.5k** | 133.9k (42%) | 6 |

**Finding the 24 defects cost roughly 40% of what fixing them cost.** Discovery is not the cheap
part of this loop, and the four parallel read-only analysis agents were 35% of the discovery spend.
That ratio is the argument for cheaper gates: every token in the triage column was spent
establishing something a gate could have told us for free.

Other pooled figures: **665,649 total tokens**, 9 runs, 4 sessions, **52 commits over 20 active
days (2.6/day)**, median throughput 13.7 REQs/hour. Rework ratio: **insufficient data** (n = 1
`build-phase` run) — reported as such rather than as a number.

`cost_usd` is `null` everywhere: no harness on this project reported a dollar figure, and one is
never derived from token counts here.

---

## 6. The release pipeline — a defect class the gates cannot see at all

Three of today's nine misses came from the owner, not from a consuming app, and two of them are
about **release infrastructure** rather than library code:

- **`REQ-FN-004`** — `publish-nuget.yml` resolved the published version from `Directory.Build.props`
  instead of the release tag, and passed `-p:Version=` to neither `dotnet build` nor `dotnet pack`.
  nuget.org therefore published a frozen **2.0.0** across two release cycles. Its own
  `RELEASE.md:37` documented the correct behaviour, and the sibling `publish-github-packages.yml`
  implemented it correctly — so the repo contained both the spec and a working reference
  implementation while the workflow disagreed with both.
- **`REQ-FN-005`** — `MinVer` is referenced in the BRD (BRD-43), the checklist and the architecture,
  and exists in **no** `.csproj`, `.props` or `.targets`. `RELEASE.md:118` states plainly that it
  "was never implemented". The row was nevertheless marked `Done (pre-existing) 100%`. That absence
  is the root cause of the first bug: with no tag-driven versioning in the build, the workflow had
  nothing to read a version *from*.

**Why this matters for the numbers on this page:** no gate in this framework runs against a
release pipeline. Every gate — build, acceptance, render, visual, standards — inspects the library
in a working tree. A workflow that publishes the wrong version is invisible to all of them, and it
stays invisible until a human looks at nuget.org. That is a **different** blind spot from the
"silent failure" class in §4, and it is not measured by the escape rate either, because a defect
that never reaches a REQ verdict never produces a gate record at all.

The third owner-found miss (`MISS-…-09`) is this agent's own version overreach, recorded with
`why_missed: instruction-ignored` because `RELEASE.md` already stated the rule that was broken.

---

## 7. What is missing, and why

- **The gate stream starts 2026-08-25.** Everything before it — the AstroLyfe, TrStudio and
  TechieBlog cycles, and all of 2.0.x/2.1.0 — is absent. Absent is not passing. Backfilling it is
  owner-only (`tf-metrics.sh --backfill-gates`) and would land as `backfilled: true`, permanently
  segregated from these figures.
- **Six of nine runs measured no token window** (`none`/absent), including both multi-hour
  `build-phase` and `handoff-phase` runs. The % -of-tokens column is therefore a share of what was
  measured, not of what was spent.
- **Five of six misses are `inferred`**, so per-phase/agent/model attribution rests on one record.
- **No `sole`-attributed fix**, so there is no defensible cost-per-miss.
- The commit hook **is** installed on this machine (`commit_hook: true`), so the 52-commit figure
  is not understated for tooling reasons.
- `tests/verify/ui-trstudio.spec.js` targets `/verify-trstudio`, a harness page that does not exist
  in the repo. It is a **pre-existing** broken spec, unrelated to this work, and it contributes
  nothing to these figures either way.
- **`REQ-FN-004` cannot be closed from an agent session.** Its `miss-fix` carries
  `verdict_after: "Needs re-verify"`, so it correctly counts as **open**: the fix is proven at the
  mechanism level locally, but confirming it end-to-end needs a GitHub Actions run against a real
  release tag, which only the owner can trigger.
- **`REQ-FN-005` is open and deliberately unfixed.** Adopting MinVer is an owner decision, not an
  agent one.

---

## 8. The one thing to change

**Not one defect in this stream was caught by a gate; every one reached a consuming application.**
The four `insufficient-verify-method` misses say why: they are all silent failures that look
correct. The cheapest gates that would have caught today's set, none of which exist today:

1. **A "class exists in the shipped CSS" check.** Two of TfLens's entries and one of the fixes came
   down to a utility that was absent from the pre-built bundle and therefore did nothing, silently.
   The safelist is hand-maintained and its own comment admits the risk.
2. **A rendered-vs-declared icon check.** `data-trblazeui-missing-icon` is already emitted — nothing
   asserts it is absent. One assertion across the demo crawl would have caught TR-008 the day it
   landed, in the library's own pages.
3. **A row-count assertion on any grid with pagination off.** TR-009 was live in this repo's own
   demo, at 5 rows out of 500.
4. **A geometry assertion on closed disclosure content.** TR-018 is invisible to screenshots by
   construction and only a `getBoundingClientRect()` check finds it.

Each is a few lines in the existing demo-crawl spec. Against a 100% escape rate, that is the
highest-value work available.
