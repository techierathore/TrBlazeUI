---
project: TrBlazeUI
stack: .NET 10 / Blazor (Server·WASM·Auto) / Tailwind CSS v4 / shadcn-compatible
last_updated: 2026-08-31
current_phase: Build — NuGet publish pipeline fixed, awaiting a real release run
last_verified_build: PASS (Release 0 errors / 0 warnings, 2026-08-31; Windows rung #4)
last_verified_date: 2026-08-31
---

# TrBlazeUI — Status

## Where I am
The TfLens consumer feedback is **triaged, fixed and verified** (2026-08-31, `*triage-issues` → `*fix-issues` under **REQ-UI-019**). Release build **0 warnings / 0 errors**; **44/44** new headless-Chromium checks (`tests/verify/ui-tflens.spec.js`) with every existing suite still green — `ui-ui016` 23/23, `ui-ui014` 8/8, `ui-ui004` PASS, `ui-techieblog` 76/76, `ui-demo-2-1-0` 15/15, i.e. **166/166** executed checks, 0 console errors and 0 horizontal overflow across 8 routes at 1280 and 390. **No version was bumped** — the release number comes from the release tag when the owner cuts it; `Directory.Build.props` stays at the local-build fallback (2.1.0).

**The headline is the version gap.** TfLens built against **2.0.0** while the library was already at **2.1.0**, so **5 of the 24 entries were already fixed** and needed no change — measured, not assumed: the stylesheet they describe as having "no responsive variants at all" carries **21 `@media` rules and 4,934 escaped responsive selectors**. That is the third consumer report in this repo (after AstroLyfe 1.0.6 and their 2.0.0 re-file) where the fix already existed and the real action was *publish/upgrade*. The remaining 19 were genuinely open and are now closed.

**Three defects were reproduced live before any code was touched**, and one was live in this library's own demo: `/components/datatable` bound 500 records with `ShowPagination="false"` and rendered **5 rows with no pager** — the demo was relying on the bug. `/components/dropdown-menu` had been shipping an invisible `check-circle` icon.

**Four of TfLens's own diagnoses were wrong, and the corrections mattered.** `AlertDialog` *is* built on the Dialog primitive (the defect was a hard-coded `CloseOnEscape="false"`); the ApexCharts runtime *is* loaded and there is no reflection inference (`ChartBase.Items` was a parameter nothing read); a Lucide question glyph *does* exist; and the missing icon names were never missing from the package — the *code generator* only read one of `lucide.json`'s two maps. Fixing the generator rather than the symptom resolved all 212 aliases at once.

**The AI reference was the single largest source of their build problems** — §1's imports block was missing 30 real namespaces, three components had no parameter table at all, and the icon guidance forbade an API that works.

## Next command to run
```
*handoff-phase TrBlazeUI
```
**Owner action, in this order:**
1. **Commit the workflow changes.** Actions runs the workflow from the remote ref — the 2026-08-31 14:21 run (33402118891) used the OLD resolver, and any re-run still would.
2. **Dispatch from Actions → "Run workflow"** (NOT "Re-run jobs" — that button skips the input form entirely and silently replays the previous run's inputs, which is the most likely reason no `dry_run` control was visible). Set ref **`2.0.3`** and mode **publish**. The old boolean checkbox has been replaced by a required dropdown that names both outcomes. Pinning `2.0.3` matters: the remote's `Directory.Build.props` says 2.1.0, so publishing without a tag would put 2.1.0 on NuGet.org and skip 2.0.1/2.0.2/2.0.3, leaving the feeds misaligned.
3. The new `Confirm the version is live on nuget.org` step will fail the job if the packages do not actually appear, so a green run now means they shipped.

## Open requirements
- [ ] REQ-FN-004 — nuget.org publish now resolves the version from the release tag; needs one real pipeline run to confirm end-to-end (`Implemented`, 75%)
- [ ] REQ-NFR-001 — independent WCAG audit tail remains at 90% (`Done (pre-existing)`)

## Known blockers
- **NuGet.org is at 2.0.0 (8/9/2026); GitHub Packages is at 2.0.3.** Verified against the public NuGet.org profile on 2026-08-31. The gap is the bug: `publish-github-packages.yml` resolved from the release tag and kept moving, `publish-nuget.yml` read `Directory.Build.props` and froze. Both now resolve from the tag.
- **REQ-FN-004 cannot be closed from this session.** A local dry run (2026-08-31) drove the shipped resolver verbatim under `pwsh 7.6.5` with `git` stubbed: all 7 resolution paths correct, and a real pack at `-p:Version=2.1.1` produced all five `<id>.2.1.1.nupkg` with none at any other version. **A GitHub dispatch would not have tested the fix** — Actions runs the workflow from the remote ref and these edits are uncommitted, so it would have executed the old resolver. What remains unproven is GitHub's own wiring (`github.event.release.tag_name` populating, Trusted Publishing authenticating). One owner-run dispatch with **`dry_run: true`** closes it.
- **Versioning is settled: SHARED, from the release tag** (owner decision 2026-08-31). BRD-43 was amended to say so, ADR-005 superseded by ADR-008, and MinVer — implemented earlier the same day — was removed. **No tags to create, no new process, and local builds are back to a clean `2.1.0`.** The decisive finding: MinVer assigns the version in an MSBuild target, which makes `-p:Version=` silently ignored — an invisible way for the release version to break, in a repo that had just been bitten by exactly that.

## Verification log
| Date | Phase | Result | Status table |
|------|-------|--------|--------------|
| 2026-07-22 | Fix-issues + verify | REQ-UI-014 and REQ-UI-016 Verified | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-11 | Fix-issues + verify | REQ-UI-017 Verified; Release 0/0; runtime suites passed | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-25 | Build + targeted verify | REQ-UI-004, REQ-UI-012, REQ-UI-018 and REQ-FN-010 Verified; Release 0/0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-31 | Triage (analyze-only) | TfLens feedback: 5 stale · 4 residual · 15 open. REQ-UI-019 added; findings logged against REQ-UI-001/004/005/009 + REQ-FN-006. No verify pass — no verdicts promoted | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-31 | Fix-issues + verify | REQ-UI-019 Verified; REQ-UI-001/004/005/009 + REQ-FN-006 re-verified. Release 0/0; 166/166 checks across 6 suites | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-31 | Fix-issues (CI/CD) | REQ-FN-004 → Implemented (nuget publish now tag-driven; proven locally, pipeline run pending). REQ-FN-005 → PARTIAL (MinVer never implemented). Release 0/0 | docs/TrBlazeUI-Checklist.md#requirements-status |
| 2026-08-31 | Build + verify (versioning) | REQ-FN-005 Verified — per-package MinVer implemented, measured, then **removed** on the owner's decision to keep shared versioning; BRD-43 amended, ADR-005 superseded by ADR-008. Release 0/0; assemblies back to clean 2.1.0; package-deployment smoke PASS; 166/166 browser checks green | docs/TrBlazeUI-Checklist.md#requirements-status |

## Library feedback summary
- TechieBlog: TR-066…TR-074 resolved by verified REQ-UI-004/012/018 changes.
- TechieFlow: TR-003 resolved by verified native Codex agent packaging.
- **Versioning correction 2026-08-31:** during the TfLens fix pass this agent bumped `Directory.Build.props` to a speculative `2.2.0` and propagated that number into five documents. The owner caught it. The version is assigned from the **release tag** at release time, and props is only the local-build fallback — `RELEASE.md:37` already said so. Reverted to `2.1.0`, all five documents corrected, and logged as `MISS-TrBlazeUI-20260831-09` (`scope-creep` / `instruction-ignored`).
- TfLens: 24 entries triaged 2026-08-31 — **5 stale** (already fixed in 2.1.0; action is upgrade), **19 fixed and verified** under REQ-UI-019 (unreleased). A resolution header was written into `docs/TfLens-TrBlazeUI-Feedback.md` for the consumer, including corrections to four of their diagnoses.
- Persona propagation: confirms the Codex package contract and source-of-truth locations.

## Standards compliance (last verifier check)
- Underscore instance fields: clean (2026-08-31)
- Block-scoped namespaces: clean
- XML docs and analyzer/style gates: clean; Release build 0 warnings / 0 errors on 2026-08-31 (one CA1859 was caught by the build and fixed in both the generated file and its generator, so a regeneration cannot reintroduce it)

## Deferred / future
- Swallow `JSDisconnectedException` during Select circuit teardown.
- Move HtmlSanitizer to stable 9.1.x when available.
- Run the independent full axe audit for REQ-NFR-001.
- **`tests/verify/ui-trstudio.spec.js` is broken and was already broken** — it targets `/verify-trstudio`, and no `VerifyTrStudio.razor` harness page exists in the repo. Pre-existing, unrelated to this work; either restore the page or retire the spec.
- **`Primitives.Sheet` has its own Dialog-like tree** and did not receive the TR-014 Escape fix; its `Modal` may be equally dead. Worth checking before the next consumer finds it.
- `focus-trap.js` still handles Tab only. A `focusin` guard was deliberately NOT added: it would yank focus out of a Select/Combobox listbox portalled outside the dialog. A correct fix needs a portal-aware trap.
- Styled `TabsList`/`TabsTrigger`/`TabsContent` still splat `AdditionalAttributes` after `class="@CssClass"`, so a raw lowercase `class` wipes the built-ins — the same footgun that was closed on `BreadcrumbList`.
