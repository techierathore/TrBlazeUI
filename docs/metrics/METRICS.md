# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md. Figures from tf-metrics.sh --report --json / --phases. -->

**Snapshot as of 2026-11-02** · project_type `library` · schema v1

| Stream | Records |
|---|---|
| `runs.jsonl` | 103 live (11 voided, excluded) |
| `gates.jsonl` | 245 (0 backfilled, 0 malformed) |
| `sessions.jsonl` | 22 (1 duplicate collapsed) |
| `commits.jsonl` | 106 (commit hook installed) |
| `misses.jsonl` | 77 miss + 71 miss-fix (7 misses voided, 1 amendment applied, 0 orphans) |

---

## 1. First-pass rate

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 65 | 11 | 17% |
| Backfilled† | — | 0 | 0 | — |

† No backfilled REQ records exist.

**Excluded from the live rate:** 0 REQs (no backfill-tainted REQs).

---

## 2. Gate catch distribution

### Live · `library` — 109 failures

| Gate | Caught | Share |
|---|---|---|
| acceptance | 1 | 1% |
| **escaped** — no gate caught it | 108 | 99% |

**Late gates that have never run here:** perf (since 2026-08-10), assets (since 2026-08-31), mockup-parity (since 2026-08-31), test-users (since 2026-11-01) — 0 runs, 0 catches each.

**Most common failure classes:** unspecified-gap ×40, wrong-behaviour ×17, regression ×14.

---

## 3. Escape rate

| Provenance | project_type | REQs scored | Escaped failures | Rate |
|---|---|---|---|---|
| **Live** | library | 65 | 108 | 98% |

The miss stream's own escape share (91%, §5) is computed from different records by a different definition and is reported there, not merged here.

---

## 4. Throughput and rework

Commit-derived rows are exempt from the provenance split; the rest are live `library` only.

| Metric | Value |
|---|---|
| Runs total | 103 |
| Rework ratio (fix-mode ÷ build-phase runs) | 1275% |
| Batch size — median REQs per `build-phase` run | 2.5 |
| REQ throughput — median REQs/hour | 13.54 |
| Sessions / total tokens | 22 / 10,080,727 |
| Tokens per `Verified` REQ | 74,123 |
| Commit cadence | 2.65 commits/active day over 40 days |

Cost in USD is not reported here. Claude Code transcripts carry token counts but no per-message dollar cost (`cost_usd` is `null` on every Claude Code record); this framework runs on subscriptions where marginal per-token cost is not the real unit, and no rate-card estimate is printed. OpenCode runs do carry real provider cost — see §6.

---

## 5. Misses

| Metric | Value |
|---|---|
| Misses logged | 77 (10 open, 67 resolved, 0 wont-fix) |
| Design-miss share (`unspecified-gap`) | 52% |
| Escape share (found by a human / outside a gate) | 91% |
| Found by | owner 69 · library-feedback 6 · gate 1 · production 1 |

**Miss classes**

| Class | n |
|---|---|
| unspecified-gap | 40 |
| wrong-behaviour | 17 |
| regression | 14 |
| partial-implementation | 4 |
| missed-requirement | 1 |
| scope-creep | 1 |

**Why it was missed** — 76 of 77 eligible misses assessed (0 predate the field; 0 escapes missing it)

| Practice | n |
|---|---|
| missing-checklist-item | 42 |
| insufficient-verify-method | 32 |
| instruction-ignored | 2 |

**Gap sort** — 66 of 66 eligible (11 misses predate the field and are outside the denominator)

| Sort | n |
|---|---|
| spec | 40 |
| weak-check | 25 |
| ignored | 1 |

### 5a. Attribution — `linked` records only

**12 of 77 misses are attributed; 65 excluded** (`origin_confidence` not `linked`).

| By | Counts |
|---|---|
| Origin phase | fix-issues=10, build-phase=2 |
| Origin agent | flow-master=5, general-purpose=5, none=1, trblazeui=1 |
| Origin model | claude-opus-5=11, ?=1 |

Per-model and per-phase figures are observational, not causal: which model and phase get the hard work is not random, so this ranking is not a routing signal.

### 5b. Rework cost

| | Fix records | Tokens out per miss |
|---|---|---|
| **Measured** (`sole`) | 12 (12 carry `tokens_out`, 0 unrecorded) | 89,934 |
| Apportioned (`shared:n`) | 52 (0 unrecorded) | 81,889 |
| Unattributable (`none`) | 7 | — |

No measured dollars per miss (0 records carry money). OpenCode cost appears only on OpenCode runs and is not pooled here.

---

## 6. Effort per phase

Aggregated over **103 live run records** (11 voided runs excluded). Token-window scope: tree 57 · main 36 · none 8 · absent 2 — `none`/absent windows are excluded from token figures, never counted as zero.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of all output | Tokens measured on |
|---|---|---|---|---|---|
| `triage-and-fix` | 30 | 35,271 s / 672 s | 3,760,344 | 49% | 29 of 30 |
| `fix-issues` | 19 | 26,755 s / 604 s | 2,024,579 | 26% | 16 of 19 |
| `build-phase` | 4 | 22,899 s / 2,056 s | 473,090 | 6% | 3 of 4 |
| `verify-phase` | 23 | 9,830 s / 271 s | 291,178 | 4% | 22 of 23 |
| `handoff-phase` | 3 | 3,947 s / 776 s | 415,709 | 5% | 2 of 3 |
| `triage-issues` | 3 | 3,747 s / 801 s | 153,350 | 2% | 2 of 3 |
| `amend-docs` | 5 | 2,478 s / 162 s | 99,550 | 1% | 4 of 5 |
| `metrics-report` | 13 | 2,249 s / 160 s | 457,404 | 6% | 13 of 13 |
| `refresh-status` | 1 | 524 s / 524 s | — | 0% | 0 of 1 |
| `log-miss` | 2 | 349 s / 175 s | 52,482 | 1% | 2 of 2 |

Phase differences reflect what the phases are, not a finding about any of them. Measured dollars (OpenCode only, never pooled): `fix-issues` $8.40 (1 run), `triage-and-fix` $1.55 (1 run), `metrics-report` $0.11 (1 run) — plan allowance, not an invoice.

### 6a. Which model did the work

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `triage-and-fix` | claude-opus-5 | 1,523,274 | 41% | 6 |
| `triage-and-fix` | claude-fable-5-1 | 1,499,018 | 40% | 10 |
| `triage-and-fix` | claude-opus-5-5 | 726,979 | 19% | 12 |
| `fix-issues` | claude-opus-5 | 1,545,016 | 76% | 7 |
| `fix-issues` | claude-fable-5-1 | 307,044 | 15% | 2 |
| `fix-issues` | claude-opus-5-5 | 137,944 | 7% | 6 |
| `metrics-report` | claude-fable-5-1 | 220,420 | 48% | 4 |
| `metrics-report` | claude-opus-5-5 | 175,412 | 38% | 5 |
| `build-phase` | claude-fable-5-1 | 392,238 | 83% | 2 |

### 6b. Subagent fan-out

Fan-out is observed on `tree`-scope windows only; every unobserved run below was excluded because its window was not `tree` scope (0 predate the field).

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share | Declared vs measured |
|---|---|---|---|---|---|---|
| `fix-issues` | 9 of 19 | 13 / 0 / 6 | 3 | 518,258 | 44% | — |
| `metrics-report` | 11 of 13 | 9 / 1 / 1 | 9 | 126,550 | 29% | 3 declared vs 9 measured |
| `triage-and-fix` | 18 of 30 | 14 / 1 / 3 | 12 | 161,666 | 9% | 13 declared vs 14 measured |
| `triage-issues` | 2 of 3 | 4 / 2 / 4 | 1 | 43,947 | 29% | 1 declared vs 4 measured |
| `build-phase` | 1 of 4 | 0 / 0 / 0 | 0 | 0 | 0% | 2 declared vs 0 measured |

Where declared and measured disagree, the measured `subagent_runs` (counted from the harness store) is authoritative.

---

## 7. What is missing

- Per-run token averages for `handoff-phase`, `triage-issues`, `log-miss` — insufficient data (n=2 each); `refresh-status` — insufficient data (n=0).
- Perf / assets / mockup-parity / test-users gate catches — those gates have never run on this library.
- Review records (owner corrections) — none logged (n=0).
