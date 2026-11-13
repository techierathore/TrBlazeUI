# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md. Figures from tf-metrics.sh --report --json / --phases / --estimates. -->

**Snapshot as of 2026-11-13** (after the Sevak TR-047/TR-048 runs and the Sevak TR-049 triage-and-fix run, REQ-UI-068) · project_type `library` · schema v1

| Stream | Records |
|---|---|
| `runs.jsonl` | 130 live (11 voided, excluded) |
| `gates.jsonl` | 340 (0 backfilled, 0 malformed) |
| `sessions.jsonl` | 25 (1 duplicate collapsed) |
| `commits.jsonl` | 117 (commit hook installed) |
| `misses.jsonl` | 83 miss + 76 miss-fix (7 misses voided, 1 amendment applied, 0 orphans) |
| `estimates.jsonl` | 0 — no estimates yet |

---

## 1. First-pass rate

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 80 | 21 | 26% |
| Backfilled† | — | 0 | 0 | — |

† No backfilled REQ records exist.

**Excluded from the live rate:** 0 REQs (no backfill-tainted REQs).

---

## 2. Gate catch distribution

### Live · `library` — 115 failures

| Gate | Caught | Share |
|---|---|---|
| acceptance | 3 | 3% |
| **escaped** — no gate caught it | 112 | 97% |

**Late gates that have never run here:** perf (since 2026-08-10), assets (since 2026-08-31), mockup-parity (since 2026-08-31), test-users (since 2026-11-01) — 0 runs, 0 catches each.

**Most common failure classes:** unspecified-gap ×44, wrong-behaviour ×17, regression ×15.

---

## 3. Escape rate

| Provenance | project_type | REQs scored | Escaped failures | Rate |
|---|---|---|---|---|
| **Live** | library | 80 | 112 | 97% |

The miss stream's own escape share (89%, §5) is computed from different records by a different definition and is reported there, not merged here.

---

## 4. Throughput and rework

Commit-derived rows are exempt from the provenance split; the rest are live `library` only.

| Metric | Value |
|---|---|
| Runs total | 130 |
| Rework ratio (fix-mode ÷ build-phase runs) | 640% |
| Batch size — median REQs per `build-phase` run | 3.0 |
| REQ throughput — median REQs/hour | 16.07 |
| Sessions / total tokens | 25 / 11,639,857 |
| Tokens per `Verified` REQ | 51,732.7 |
| Commit cadence | 2.66 commits/active day over 44 days |

Cost in USD is not reported here. Claude Code transcripts carry token counts but no per-message dollar cost (`cost_usd` is `null` on every Claude Code record); this framework runs on subscriptions where marginal per-token cost is not the real unit, and no rate-card estimate is printed. OpenCode runs do carry real provider cost — see §6. The tool also prints a *list price* ($1,292.70 over 118 priced runs, $5.75 per Verified REQ): the published rate applied to measured tokens, a comparison aid and not a bill.

---

## 5. Misses

| Metric | Value |
|---|---|
| Misses logged | 83 (11 open, 72 resolved, 0 wont-fix) |
| Design-miss share (`unspecified-gap`) | 53% |
| Escape share (found by a human / outside a gate) | 89% |
| Found by | owner 71 · library-feedback 6 · gate 3 · production 3 |

**Miss classes**

| Class | n | Share |
|---|---|---|
| unspecified-gap | 44 | 53% |
| wrong-behaviour | 17 | 20% |
| regression | 15 | 18% |
| partial-implementation | 5 | 6% |
| missed-requirement | 1 | 1% |
| scope-creep | 1 | 1% |

**Why it was missed** — 80 of 83 eligible misses assessed (0 predate the field; 0 escapes missing it)

| Practice | n | Share |
|---|---|---|
| missing-checklist-item | 46 | 58% |
| insufficient-verify-method | 32 | 40% |
| instruction-ignored | 2 | 2% |

**Gap sort** — 70 of 72 eligible (11 misses predate the field and are outside the denominator)

| Sort | n | Share |
|---|---|---|
| spec | 42 | 60% |
| weak-check | 27 | 39% |
| ignored | 1 | 1% |

### 5a. Attribution — `linked` records only

**12 of 83 misses are attributed; 71 excluded** (`origin_confidence` not `linked`).

| By | Counts |
|---|---|
| Origin phase | fix-issues=10, build-phase=2 |
| Origin agent | flow-master=5, general-purpose=5, none=1, trblazeui=1 |
| Origin model | claude-opus-5=11, ?=1 |

Per-model and per-phase figures are observational, not causal: which model and phase get the hard work is not random, so this ranking is not a routing signal.

### 5b. Rework cost

| | Fix records | Tokens out per miss |
|---|---|---|
| **Measured** (`sole`) | 15 (15 carry `tokens_out`, 0 unrecorded) | 90,279 |
| Apportioned (`shared:n` — equal division, not a measurement) | 54 (0 unrecorded) | 87,446 |
| Unattributable (`none`) | 7 | — |

No measured dollars per miss (0 records carry money). The list price per measured miss is $12.85 over 15 records — a published rate applied to tokens, not a bill. OpenCode cost appears only on OpenCode runs and is not pooled here.

**Discovery cost beside fix cost.** Discovery per miss: insufficient data (n=1 measured; 82 misses predate discovery recording on 2026-11-05).

| Miss | REQ | Discovery (measured) | Fix (measured) |
|---|---|---|---|
| MISS-TrBlazeUI-20261113-01 | REQ-UI-068 | 52,795 tokens out · 2,547 s | 58,667 tokens out |

---

## 6. Effort per phase

Aggregated over **130 live run records** (11 voided runs excluded). Token-window scope: tree 66 · main 52 · none 10 · absent 2 — `none`/absent windows are excluded from token figures, never counted as zero.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of all output | Tokens measured on |
|---|---|---|---|---|---|
| `triage-and-fix` | 35 | 40,951 s / 592 s | 4,352,141 | 48% | 33 of 35 |
| `fix-issues` | 22 | 31,507 s / 664 s | 2,217,490 | 24% | 19 of 22 |
| `build-phase` | 10 | 26,027 s / 763.5 s | 799,913 | 9% | 9 of 10 |
| `verify-phase` | 32 | 11,988 s / 229.5 s | 389,852 | 4% | 30 of 32 |
| `handoff-phase` | 3 | 3,947 s / 776 s | 415,709 | 5% | 2 of 3 |
| `triage-issues` | 3 | 3,747 s / 801 s | 153,350 | 2% | 2 of 3 |
| `metrics-report` | 16 | 2,628 s / 150.5 s | 571,599 | 6% | 16 of 16 |
| `amend-docs` | 6 | 2,520 s / 156.5 s | 107,623 | 1% | 5 of 6 |
| `refresh-status` | 1 | 524 s / 524 s | — | 0% | 0 of 1 |
| `log-miss` | 2 | 349 s / 174.5 s | 52,482 | 1% | 2 of 2 |

Per-run token averages: `handoff-phase`, `triage-issues`, `log-miss` insufficient data (n=2 each); `refresh-status` insufficient data (n=0).

Phase differences reflect what the phases are, not a finding about any of them. Measured dollars (OpenCode only, never pooled): `fix-issues` $8.40 (1 run), `triage-and-fix` $1.55 (1 run), `metrics-report` $0.11 (1 run) — plan allowance, not an invoice.

### 6a. Which model did the work

Phases with at least 100,000 output tokens measured.

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `triage-and-fix` | claude-fable-5-1 | 1,999,550 | 46% | 12 |
| `triage-and-fix` | claude-opus-5 | 1,523,274 | 35% | 6 |
| `triage-and-fix` | claude-opus-5-5 | 818,244 | 19% | 14 |
| `triage-and-fix` | opencode-go/kimi-k2.7-code | 11,073 | 0% | 1 |
| `triage-and-fix` | `<synthetic>` | 0 | 0% | 1 |
| `fix-issues` | claude-opus-5 | 1,545,016 | 70% | 7 |
| `fix-issues` | claude-opus-5-5 | 330,855 | 15% | 9 |
| `fix-issues` | claude-fable-5-1 | 307,044 | 14% | 2 |
| `fix-issues` | opencode-go/kimi-k2.7-code | 34,575 | 2% | 1 |
| `build-phase` | claude-fable-5-1 | 719,061 | 90% | 8 |
| `build-phase` | claude-opus-5 | 80,852 | 10% | 1 |
| `verify-phase` | claude-fable-5-1 | 162,455 | 42% | 10 |
| `verify-phase` | claude-opus-5 | 161,005 | 41% | 7 |
| `verify-phase` | claude-opus-5-5 | 66,392 | 17% | 13 |
| `handoff-phase` | claude-opus-5 | 383,183 | 92% | 1 |
| `handoff-phase` | claude-opus-5-5 | 32,526 | 8% | 1 |
| `triage-issues` | claude-opus-5 | 153,350 | 100% | 2 |
| `metrics-report` | claude-fable-5-1 | 298,500 | 52% | 6 |
| `metrics-report` | claude-opus-5-5 | 211,527 | 37% | 6 |
| `metrics-report` | claude-opus-5 | 59,503 | 10% | 3 |
| `metrics-report` | opencode-go/kimi-k2.7-code | 2,069 | 0% | 1 |
| `amend-docs` | claude-opus-5 | 90,781 | 84% | 3 |
| `amend-docs` | claude-opus-5-5 | 16,842 | 16% | 2 |

This ranking is observational, not causal — which model gets the hard phases is not random.

### 6b. Subagent fan-out

Fan-out is observed on `tree`-scope windows only; every unobserved run below was excluded because its window was not `tree` scope (0 predate the field).

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share | Declared vs measured |
|---|---|---|---|---|---|---|
| `triage-and-fix` | 18 of 35 | 14 / 1 / 3 | 12 | 161,666 | 9% | 15 declared vs 14 measured |
| `fix-issues` | 11 of 22 | 14 / 0 / 6 | 4 | 532,927 | 43% | — |
| `build-phase` | 3 of 10 | 1 / 0 / 1 | 1 | 79,201 | 33% | 4 declared vs 1 measured |
| `verify-phase` | 12 of 32 | 1 / 0 / 1 | 1 | 6,792 | 6% | — |
| `handoff-phase` | 1 of 3 | 0 / 0 / 0 | 0 | 0 | 0% | — |
| `triage-issues` | 2 of 3 | 4 / 2 / 4 | 1 | 43,947 | 29% | 1 declared vs 4 measured |
| `metrics-report` | 13 of 16 | 10 / 1 / 1 | 10 | 141,887 | 29% | 3 declared vs 10 measured |
| `amend-docs` | 5 of 6 | 0 / 0 / 0 | 0 | 0 | 0% | 1 declared vs 0 measured |
| `log-miss` | 1 of 2 | 0 / 0 / 0 | 0 | 0 | 0% | — |
| `refresh-status` | 0 of 1 | — | — | — | — | — |

Where declared and measured disagree, the measured `subagent_runs` (counted from the harness store) is authoritative. "Declared" counts the entries agents typed into `subagents`, including `none`; it is a self-report. A `—` in the last column means the tool printed no declared-vs-measured comparison for that phase.

---

## 7. What is missing

- Estimate against actual (question 6) — no estimates yet: `estimates.jsonl` has no records; `*estimate-phase TrBlazeUI` has never been run before a `*build-phase`.
- Discovery cost per miss — insufficient data (n=1 measured); recording started 2026-11-05.
- Per-run token averages for `handoff-phase`, `triage-issues`, `log-miss` — insufficient data (n=2 each); `refresh-status` — insufficient data (n=0).
- Perf / assets / mockup-parity / test-users gate catches — those gates have never run on this library.
- Review records (owner corrections) — none logged (n=0).
