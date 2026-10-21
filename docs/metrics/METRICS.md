# TrBlazeUI — Development Metrics

<!-- Written by .tfcore/tasks/metrics-report.md (`*metrics`). Regenerated on demand,
     never hand-edited. Source: docs/metrics/*.jsonl (append-only) — schema at
     .tfcore/telemetry/SCHEMA.md. -->

**Snapshot as of 2026-10-21** · project_type `library` · schema v1

| Stream | Records | Span |
|---|---|---|
| `runs.jsonl` | 95 | 2026-08-08 → 2026-10-21 |
| `gates.jsonl` | 239 (0 backfilled) | 2026-08-08 → 2026-10-21 |
| `sessions.jsonl` | 19 | 2026-08-08 → 2026-10-21 |
| `commits.jsonl` | 100 | 2026-08-08 → 2026-10-21 |
| `misses.jsonl` | 75 miss + 69 miss-fix | 2026-08-09 → 2026-10-21 |

---

## 1. First-pass rate

| Provenance | project_type | REQs scored | First-pass | Rate |
|---|---|---|---|---|
| **Live** | library | 62 | 10 | 16% |
| Backfilled† | — | 0 | 0 | — |

† No backfilled REQ records exist.

**Excluded from the live rate:** 0 REQs.

---

## 2. Gate catch distribution

### Live · `library` — 107 failures

| Gate | Caught | Share |
|---|---|---|
| acceptance | 1 | 1% |
| **escaped** — no gate caught it | 106 | 99% |

**Most common failure classes:** unspecified-gap ×38, wrong-behaviour ×17, regression ×14.

---

## 3. Escape rate

| Provenance | project_type | REQs with any failure | Escaped to UAT/prod | Rate |
|---|---|---|---|---|
| **Live** | library | 62 | 106 | 98% |

---

## 4. Throughput and rework

| Metric | Value |
|---|---|
| Runs total | 95 |
| Rework ratio (fix-mode ÷ build-phase runs) | 1150% |
| Batch size — median REQs per `build-phase` run | 2.5 |
| REQ throughput — median REQs/hour | 13.74 |
| Sessions / total tokens | 19 / 9,489,212 |
| Tokens per `Verified` REQ | 71,888 |
| Commit cadence | 2.7 commits/active day over 37 days |

Cost in USD is not reported here. Claude Code transcripts carry token counts but no per-message dollar cost; this framework runs on subscriptions where marginal per-token cost is not the real unit. OpenCode runs do carry real provider cost — see §5b.

---

## 5. Misses

| Metric | Value |
|---|---|
| Misses logged | 75 (10 open, 65 resolved, 0 wont-fix) |
| Design-miss share (`unspecified-gap`) | 51% |
| Found by a human (`owner` / `production`) | 91% |

**Miss classes**

| Class | n | Share |
|---|---|---|
| unspecified-gap | 38 | 51% |
| wrong-behaviour | 17 | 23% |
| regression | 14 | 19% |
| partial-implementation | 4 | 5% |
| missed-requirement | 1 | 1% |
| scope-creep | 1 | 1% |

**Why it was missed** — 74 of 75 misses assessed

| Practice | n | Share |
|---|---|---|
| missing-checklist-item | 40 | 54% |
| insufficient-verify-method | 32 | 43% |
| instruction-ignored | 2 | 3% |

### 5a. Attribution — `linked` records only

**12 of 75 misses are attributed; 63 excluded** because they name a phase no `runs.jsonl` record backs.

| By | Counts |
|---|---|
| Origin phase | fix-issues=10, build-phase=2 |
| Origin agent | flow-master=5, general-purpose=5, none=1, trblazeui=1 |
| Origin model | claude-opus-5=11, ?=1 |

### 5b. Rework cost

| | Fix records | Tokens out per miss |
|---|---|---|
| **Measured** (`sole`) | 10 | 97,197 |
| Apportioned (`shared:n`) | 52 | 81,889 |
| Unattributable (`none`) | 7 | — |

No measured dollars for Claude Code runs. OpenCode cost appears only on the one OpenCode run and is not pooled here.

---

## 6. Effort per phase

Aggregated over **95 live run records**.

| Phase (`cmd`) | Runs | Wall clock (total / median) | Tokens out | % of all output | Tokens measured on |
|---|---|---|---|---|---|
| `triage-and-fix` | 28 | 34,283 s / 672 s | 3,700,707 | 49% | 28 of 28 |
| `fix-issues` | 16 | 25,266 s / 626 s | 1,931,025 | 26% | 13 of 16 |
| `build-phase` | 4 | 22,899 s / 2,056 s | 473,090 | 6% | 3 of 4 |
| `verify-phase` | 21 | 9,578 s / 284 s | 288,741 | 4% | 20 of 21 |
| `handoff-phase` | 3 | 3,947 s / 776 s | 415,709 | 5% | 2 of 3 |
| `metrics-report` | 12 | 2,129 s / 163 s | 455,335 | 6% | 12 of 12 |
| `amend-docs` | 5 | 2,478 s / 162 s | 99,550 | 1% | 4 of 5 |
| `triage-issues` | 3 | 3,747 s / 801 s | 153,350 | 2% | 2 of 3 |
| `log-miss` | 2 | 349 s / 175 s | 52,482 | 1% | 2 of 2 |
| `refresh-status` | 1 | 524 s / 524 s | 0 | 0% | 0 of 1 |

### 6a. Which model did the work

| Phase | Model | Output tokens | Share of the phase | Runs |
|---|---|---|---|---|
| `triage-and-fix` | claude-opus-5 | 1,523,274 | 41% | 6 |
| `triage-and-fix` | claude-fable-5-1 | 1,499,018 | 41% | 10 |
| `triage-and-fix` | claude-opus-5-5 | 667,342 | 18% | 11 |
| `fix-issues` | claude-opus-5 | 1,545,016 | 80% | 7 |
| `fix-issues` | claude-fable-5-1 | 307,044 | 16% | 2 |

### 6b. Subagent fan-out

| Phase | Runs observed | Spawns (total / median / max) | Runs that fanned out | Output tokens in subagents | Subagent share |
|---|---|---|---|---|---|
| `fix-issues` | 9 of 16 | 13 / 0 / 6 | 3 | 518,258 | 44% |
| `metrics-report` | 10 of 12 | 9 / 1 / 1 | 9 | 126,550 | 30% |
| `triage-and-fix` | 18 of 28 | 14 / 1 / 3 | 12 | 161,666 | 9% |

---

## 7. What is missing

- Per-model miss rate for OpenCode — insufficient data (n=1).
- Mockup-parity / visual gate catches — no library project screens were driven for these gates.
