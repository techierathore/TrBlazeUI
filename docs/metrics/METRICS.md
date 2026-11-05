# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md. Figures from tf-metrics.sh --report --json / --phases. -->

**Snapshot as of 2026-11-05** (after the Chatur TR-023/TR-024, REQ-NFR-005, REQ-UI-015 and REQ-FN-013 runs) · project_type `library` · schema v1

| Stream | Records |
|---|---|
| `runs.jsonl` | 124 live (11 voided, excluded) |
| `gates.jsonl` | 336 (0 backfilled, 0 malformed) |
| `sessions.jsonl` | 23 (1 duplicate collapsed) |
| `commits.jsonl` | 112 (commit hook installed) |
| `misses.jsonl` | 82 miss + 75 miss-fix (7 misses voided, 1 amendment applied, 0 orphans) |

---

## 1. First-pass rate

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 77 | 19 | 25% |
| Backfilled† | — | 0 | 0 | — |

† No backfilled REQ records exist.

**Excluded from the live rate:** 0 REQs (no backfill-tainted REQs).

---

## 2. Gate catch distribution

### Live · `library` — 114 failures

| Gate | Caught | Share |
|---|---|---|
| acceptance | 3 | 3% |
| **escaped** — no gate caught it | 111 | 97% |

**Late gates that have never run here:** perf (since 2026-08-10), assets (since 2026-08-31), mockup-parity (since 2026-08-31), test-users (since 2026-11-01) — 0 runs, 0 catches each.

**Most common failure classes:** unspecified-gap ×43, wrong-behaviour ×17, regression ×15.

---

## 3. Escape rate

| Provenance | project_type | REQs scored | Escaped failures | Rate |
|---|---|---|---|---|
| **Live** | library | 77 | 111 | 97% |

The miss stream's own escape share (89%, §5) is computed from different records by a different definition and is reported there, not merged here.

---

## 4. Throughput and rework

Commit-derived rows are exempt from the provenance split; the rest are live `library` only.

| Metric | Value |
|---|---|
| Runs total | 124 |
| Rework ratio (fix-mode ÷ build-phase runs) | 620% |
| Batch size — median REQs per `build-phase` run | 3.0 |
| REQ throughput — median REQs/hour | 16.49 |
| Sessions / total tokens | 23 / 10,315,892 |
| Tokens per `Verified` REQ | 46,468 |
| Commit cadence | 2.67 commits/active day over 42 days |

Cost in USD is not reported here. Claude Code transcripts carry token counts but no per-message dollar cost (`cost_usd` is `null` on every Claude Code record); this framework runs on subscriptions where marginal per-token cost is not the real unit, and no rate-card estimate is printed. OpenCode runs do carry real provider cost — see §6. The tool also prints a *list price* ($1,273.79 over 112 priced runs, $5.74 per Verified REQ): the published rate applied to measured tokens, a comparison aid and not a bill.

---

## 5. Misses

| Metric | Value |
|---|---|
| Misses logged | 82 (11 open, 71 resolved, 0 wont-fix) |
| Design-miss share (`unspecified-gap`) | 52% |
| Escape share (found by a human / outside a gate) | 89% |
| Found by | owner 71 · library-feedback 6 · gate 3 · production 2 |

**Miss classes**

| Class | n |
|---|---|
| unspecified-gap | 43 |
| wrong-behaviour | 17 |
| regression | 15 |
| partial-implementation | 5 |
| missed-requirement | 1 |
| scope-creep | 1 |

**Why it was missed** — 79 of 82 eligible misses assessed (0 predate the field; 0 escapes missing it)

| Practice | n |
|---|---|
| missing-checklist-item | 45 |
| insufficient-verify-method | 32 |
| instruction-ignored | 2 |

**Gap sort** — 69 of 71 eligible (11 misses predate the field and are outside the denominator)

| Sort | n |
|---|---|
| spec | 41 |
| weak-check | 27 |
| ignored | 1 |

### 5a. Attribution — `linked` records only

**12 of 82 misses are attributed; 70 excluded** (`origin_confidence` not `linked`).

| By | Counts |
|---|---|
| Origin phase | fix-issues=10, build-phase=2 |
| Origin agent | flow-master=5, general-purpose=5, none=1, trblazeui=1 |
| Origin model | claude-opus-5=11, ?=1 |

Per-model and per-phase figures are observational, not causal: which model and phase get the hard work is not random, so this ranking is not a routing signal.

### 5b. Rework cost

| | Fix records | Tokens out per miss |
|---|---|---|
| **Measured** (`sole`) | 14 (14 carry `tokens_out`, 0 unrecorded) | 92,537 |
| Apportioned (`shared:n`) | 54 (0 unrecorded) | 87,446 |
| Unattributable (`none`) | 7 | — |

No measured dollars per miss (0 records carry money). The list price per measured miss is $13.49 over 14 records — a published rate applied to tokens, not a bill. OpenCode cost appears only on OpenCode runs and is not pooled here.

---

## 6. Effort per phase

Aggregated over **124 live run records** (11 voided runs excluded). Token-window scope: tree 65 · main 47 · none 10 · absent 2 — `none`/absent windows are excluded from token figures, never counted as zero.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of all output | Tokens measured on |
|---|---|---|---|---|---|
| `triage-and-fix` | 33 | 38,223 s / 592 s | 4,260,876 | 48% | 31 of 33 |
| `fix-issues` | 21 | 28,024 s / 604 s | 2,100,359 | 24% | 18 of 21 |
| `build-phase` | 10 | 26,027 s / 764 s | 799,913 | 9% | 9 of 10 |
| `verify-phase` | 30 | 11,578 s / 230 s | 382,654 | 4% | 28 of 30 |
| `handoff-phase` | 3 | 3,947 s / 776 s | 415,709 | 5% | 2 of 3 |
| `triage-issues` | 3 | 3,747 s / 801 s | 153,350 | 2% | 2 of 3 |
| `metrics-report` | 15 | 2,527 s / 160 s | 540,375 | 6% | 15 of 15 |
| `amend-docs` | 6 | 2,520 s / 156 s | 107,623 | 1% | 5 of 6 |
| `refresh-status` | 1 | 524 s / 524 s | — | 0% | 0 of 1 |
| `log-miss` | 2 | 349 s / 174 s | 52,482 | 1% | 2 of 2 |

Phase differences reflect what the phases are, not a finding about any of them. Measured dollars (OpenCode only, never pooled): `fix-issues` $8.40 (1 run), `triage-and-fix` $1.55 (1 run), `metrics-report` $0.11 (1 run) — plan allowance, not an invoice.

### 6a. Which model did the work

Phases with at least 100,000 output tokens measured.

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `triage-and-fix` | claude-fable-5-1 | 1,999,550 | 46% | 12 |
| `triage-and-fix` | claude-opus-5 | 1,523,274 | 35% | 6 |
| `triage-and-fix` | claude-opus-5-5 | 726,979 | 17% | 12 |
| `triage-and-fix` | opencode-go/kimi-k2.7-code | 11,073 | 0% | 1 |
| `fix-issues` | claude-opus-5 | 1,545,016 | 73% | 7 |
| `fix-issues` | claude-fable-5-1 | 307,044 | 14% | 2 |
| `fix-issues` | claude-opus-5-5 | 213,724 | 10% | 8 |
| `fix-issues` | opencode-go/kimi-k2.7-code | 34,575 | 1% | 1 |
| `build-phase` | claude-fable-5-1 | 719,061 | 89% | 8 |
| `build-phase` | claude-opus-5 | 80,852 | 10% | 1 |
| `verify-phase` | claude-fable-5-1 | 162,455 | 42% | 10 |
| `verify-phase` | claude-opus-5 | 161,005 | 42% | 7 |
| `verify-phase` | claude-opus-5-5 | 59,194 | 15% | 11 |
| `handoff-phase` | claude-opus-5 | 383,183 | 92% | 1 |
| `handoff-phase` | claude-opus-5-5 | 32,526 | 7% | 1 |
| `triage-issues` | claude-opus-5 | 153,350 | 100% | 2 |
| `metrics-report` | claude-fable-5-1 | 267,276 | 49% | 5 |
| `metrics-report` | claude-opus-5-5 | 211,527 | 39% | 6 |
| `metrics-report` | claude-opus-5 | 59,503 | 11% | 3 |
| `metrics-report` | opencode-go/kimi-k2.7-code | 2,069 | 0% | 1 |
| `amend-docs` | claude-opus-5 | 90,781 | 84% | 3 |
| `amend-docs` | claude-opus-5-5 | 16,842 | 15% | 2 |

### 6b. Subagent fan-out

Fan-out is observed on `tree`-scope windows only; every unobserved run below was excluded because its window was not `tree` scope (0 predate the field).

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share | Declared vs measured |
|---|---|---|---|---|---|---|
| `triage-and-fix` | 18 of 33 | 14 / 1 / 3 | 12 | 161,666 | 9% | — |
| `fix-issues` | 11 of 21 | 14 / 0 / 6 | 4 | 532,927 | 43% | — |
| `build-phase` | 3 of 10 | 1 / 0 / 1 | 1 | 79,201 | 33% | 4 declared vs 1 measured |
| `verify-phase` | 12 of 30 | 1 / 0 / 1 | 1 | 6,792 | 6% | 0 declared vs 1 measured |
| `handoff-phase` | 1 of 3 | 0 / 0 / 0 | 0 | 0 | 0% | — |
| `triage-issues` | 2 of 3 | 4 / 2 / 4 | 1 | 43,947 | 29% | 1 declared vs 4 measured |
| `metrics-report` | 12 of 15 | 10 / 1 / 1 | 10 | 141,887 | 30% | 3 declared vs 10 measured |
| `amend-docs` | 5 of 6 | 0 / 0 / 0 | 0 | 0 | 0% | 1 declared vs 0 measured |
| `log-miss` | 1 of 2 | 0 / 0 / 0 | 0 | 0 | 0% | — |

Where declared and measured disagree, the measured `subagent_runs` (counted from the harness store) is authoritative. "Declared" counts the entries agents typed into `subagents`, including `none`; it is a self-report.

---

## 7. What is missing

- Per-run token averages for `handoff-phase`, `triage-issues`, `log-miss` — insufficient data (n=2 each); `refresh-status` — insufficient data (n=0).
- Perf / assets / mockup-parity / test-users gate catches — those gates have never run on this library.
- Review records (owner corrections) — none logged (n=0).
