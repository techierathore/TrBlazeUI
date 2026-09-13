# TrBlazeUI — Misses

| | |
|---|---|
| App | TrBlazeUI |
| Count | 28 logged: 9 open, 19 fixed, 0 will not fix |
| Source | `docs/metrics/misses.jsonl`, one row per miss record. Rewritten by `tf-misses-md.sh` on every new record. Never edit it: a wrong row is corrected by a new record. |
| Updated | 2026-09-13 |

**Whose gap** answers the four questions of the miss protocol: **the app's spec** did not say it, so the checklist line is fixed; **the framework never said it**, so one requirement line and a check are added; **the check was too weak** (a review, or a script that did not fire), so the check is fixed; **said and ignored**, so the rule becomes a hook or is deleted. **not sorted** means the record predates the sort or nobody has answered yet; `bash .tfcore/utils/tf-emit.sh --amend <miss> sort <spec|unsaid|weak-check|ignored>` completes it.

## Open (9)

| Miss | Found | Whose gap | What went wrong |
|---|---|---|---|
| MISS-TrBlazeUI-20260913-02 (REQ-UI-020) | 2026-09-13 by owner | the check was too weak | TfLens TR-037: BarChart Items/XValue/YValue shorthand with ShowDataLabels=true draws no data labels; the built-in series never passes the flag and ApexCharts takes it from the series (reproduced: 0 labels at 1280 and 390 on /verify-tflens-2) |
| MISS-TrBlazeUI-20260912-13 (REQ-UI-003) | 2026-09-12 by owner | the check was too weak | TfLens TR-035 (Low, reproduced live at 390px) — the phone sidebar ignores the mobile width the library itself defines. Sidebar.razor.cs:112 GetMobileClasses() sizes the sheet with w-[var(--sidebar-width)]; --sidebar-width-mobile is declared as 18rem in trblazeui-input.css:11 and emitted in trblazeui |
| MISS-TrBlazeUI-20260912-12 (REQ-UI-002) | 2026-09-12 by owner | the check was too weak | TfLens TR-032 (Low, reproduced live on /components/native-select @1280) — ROOT CAUSE FOUND, and it is not NativeSelect. The rendered <select> carries appearance-none bg-no-repeat bg-[length:1rem] bg-[right_0.5rem_center] pr-8 but NOT the bg-[url('data:image/svg+xml;...')] chevron class its own CssCl |
| MISS-TrBlazeUI-20260912-11 (REQ-UI-005) | 2026-09-12 by owner | the check was too weak | TfLens TR-031 + TR-033 (both Low, reproduced live on /components/datatable @1280). TR-031: DataTableColumn HeaderClass='text-right' sets text-align on the th, but DataTable.razor:118 wraps the label in <div class='flex items-center gap-2'>, where text-align moves nothing — measured innerDisplay=flex |
| MISS-TrBlazeUI-20260912-10 (REQ-UI-006) | 2026-09-12 by owner | the check was too weak | TfLens TR-029 + TR-034 (Medium/Low, both reproduced live on /components/badge). TR-034: every Badge renders a <div> — measured 36 badges on the page, tag set = [DIV], never a span — so a pill cannot sit inside a <p> without invalid HTML and can never match a mockup that draws it as <span class=badge |
| MISS-TrBlazeUI-20260912-09 (REQ-UI-008) | 2026-09-12 by owner | the check was too weak | TfLens TR-028 (High, reproduced live on /charts/bar @1280): BarChart exposes no axis, grid or data-label control and no route to ApexChartOptions, so a chart cannot be made to match an approved design. Measured: 32 .apexcharts-gridline and 30 .apexcharts-yaxis-label rendered with no parameter to tur |
| MISS-TrBlazeUI-20260912-08 (REQ-UI-020) | 2026-09-12 by owner | the app's spec | TfLens post-2.1.0 consumer-feedback fixes (TR-028…TR-035) |
| MISS-TrBlazeUI-20260831-11 (REQ-FN-004) | 2026-08-31 by owner | not sorted | no sentence recorded (wrong-behaviour, config, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-07 (REQ-FN-004) | 2026-08-31 by owner | not sorted | no sentence recorded (wrong-behaviour, config, why: insufficient-verify-method) |

## Fixed (19)

| Miss | Found | Closed | Whose gap | What went wrong |
|---|---|---|---|---|
| MISS-TrBlazeUI-20260913-03 (REQ-UI-020) | 2026-09-13 by owner | 2026-09-13 by fix-issues | the check was too weak | TfLens TR-038: Badge Variant=Outline Truncate=true loses text-foreground, because text-ellipsis falls into the bare text-colour merge group (reproduced on /verify-tflens-2 tr029-truncate) |
| MISS-TrBlazeUI-20260913-01 (REQ-UI-001) | 2026-09-13 by owner | 2026-09-13 by fix-issues | the check was too weak | TfLens TR-036: leaving a page that holds a Select logs 'Unhandled exception in circuit' because SelectContent.DisposeAsync awaits two JS module disposals without catching JSDisconnectedException (reproduced: 1 on /components/select) |
| MISS-TrBlazeUI-20260912-14 (REQ-FN-005) | 2026-09-12 by owner | 2026-09-12 by fix-issues | the check was too weak | A release tag with any prefix other than 'v' killed the publish: tag 'c2.0.5' threw "Invalid semver version 'c2.0.5'" after the GitHub Release was already published. |
| MISS-TrBlazeUI-20260912-07 (REQ-NFR-001) | 2026-09-12 by gate | 2026-09-12 by fix-issues | the app's spec | no sentence recorded (partial-implementation, src) |
| MISS-TrBlazeUI-20260912-06 (REQ-UI-003) | 2026-09-12 by owner | 2026-09-12 by fix-issues | the check was too weak | TfLens TR-035 (Low, reproduced live at 390px) — the phone sidebar ignores the mobile width the library itself defines. Sidebar.razor.cs:112 GetMobileClasses() sizes the sheet with w-[var(--sidebar-width)]; --sidebar-width-mobile is declared as 18rem in trblazeui-input.css:11 and emitted in trblazeui |
| MISS-TrBlazeUI-20260912-05 (REQ-UI-002) | 2026-09-12 by owner | 2026-09-12 by fix-issues | the check was too weak | TfLens TR-032 (Low, reproduced live on /components/native-select @1280) — ROOT CAUSE FOUND, and it is not NativeSelect. The rendered <select> carries appearance-none bg-no-repeat bg-[length:1rem] bg-[right_0.5rem_center] pr-8 but NOT the bg-[url('data:image/svg+xml;...')] chevron class its own CssCl |
| MISS-TrBlazeUI-20260912-04 (REQ-UI-005) | 2026-09-12 by owner | 2026-09-12 by fix-issues | the check was too weak | TfLens TR-031 + TR-033 (both Low, reproduced live on /components/datatable @1280). TR-031: DataTableColumn HeaderClass='text-right' sets text-align on the th, but DataTable.razor:118 wraps the label in <div class='flex items-center gap-2'>, where text-align moves nothing — measured innerDisplay=flex |
| MISS-TrBlazeUI-20260912-03 (REQ-UI-006) | 2026-09-12 by owner | 2026-09-12 by fix-issues | the check was too weak | TfLens TR-029 + TR-034 (Medium/Low, both reproduced live on /components/badge). TR-034: every Badge renders a <div> — measured 36 badges on the page, tag set = [DIV], never a span — so a pill cannot sit inside a <p> without invalid HTML and can never match a mockup that draws it as <span class=badge |
| MISS-TrBlazeUI-20260912-02 (REQ-UI-008) | 2026-09-12 by owner | 2026-09-12 by fix-issues | the check was too weak | TfLens TR-028 (High, reproduced live on /charts/bar @1280): BarChart exposes no axis, grid or data-label control and no route to ApexChartOptions, so a chart cannot be made to match an approved design. Measured: 32 .apexcharts-gridline and 30 .apexcharts-yaxis-label rendered with no parameter to tur |
| MISS-TrBlazeUI-20260912-01 (REQ-UI-020) | 2026-09-12 by owner | 2026-09-12 by fix-issues | the app's spec | TfLens post-2.1.0 consumer-feedback fixes (TR-028…TR-035) |
| MISS-TrBlazeUI-20260831-10 (REQ-UI-009) | 2026-08-31 by owner | 2026-08-31 by fix-issues | not sorted | no sentence recorded (wrong-behaviour, config, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-09 | 2026-08-31 by owner | 2026-08-31 by fix-issues | not sorted | no sentence recorded (scope-creep, config, why: instruction-ignored) |
| MISS-TrBlazeUI-20260831-08 (REQ-FN-005) | 2026-08-31 by owner | 2026-08-31 by build-phase | not sorted | no sentence recorded (missed-requirement, checklist, why: missing-checklist-item) |
| MISS-TrBlazeUI-20260831-06 (REQ-UI-019) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (unspecified-gap, brd, why: missing-checklist-item) |
| MISS-TrBlazeUI-20260831-05 (REQ-FN-006) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (partial-implementation, other, why: missing-checklist-item) |
| MISS-TrBlazeUI-20260831-04 (REQ-UI-009) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (partial-implementation, src, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-03 (REQ-UI-005) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (wrong-behaviour, src, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-02 (REQ-UI-004) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (partial-implementation, src, why: insufficient-verify-method) |
| MISS-TrBlazeUI-20260831-01 (REQ-UI-001) | 2026-08-31 by library-feedback | 2026-08-31 by fix-issues | not sorted | no sentence recorded (wrong-behaviour, src, why: insufficient-verify-method) |
