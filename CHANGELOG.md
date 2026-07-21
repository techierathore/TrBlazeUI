# Changelog

All notable changes to TrBlazeUI are recorded here. This project follows
[Semantic Versioning](https://semver.org/) as described in `RELEASE.md`.

All five packages share a single version number: **TrBlazeUI.Primitives**,
**TrBlazeUI.Components**, **TrBlazeUI.Icons.Lucide**, **TrBlazeUI.Icons.Heroicons**,
**TrBlazeUI.Icons.Feather**.

---

## [2.0.0] — unreleased

Consumer-feedback release closing the AstroLyfe UAT-2/UAT-3 findings (`REQ-UI-016`).
Verified 2026-07-21: Release build 0 warnings / 0 errors; 21/21 headless-Chromium checks.

> **Why a major bump:** `DataTable.ShowToolbar` changes its default value, which alters the
> rendered output of every existing `<DataTable>` that did not set it explicitly. No API
> signature changed and existing code still compiles — but per `RELEASE.md` ("Major: breaking
> changes") a default that changes what users see on screen is a breaking change. If you judge
> this cosmetic rather than contractual, `1.1.0` is defensible; only this heading needs editing.

### ⚠ Breaking

- **`DataTable.ShowToolbar` now defaults to `false`** (was `true`). The search box and
  Columns button are now **opt-in**. A bare `<DataTable TData="X" Data="@List">` renders
  just the table.
  **Migration:** add `ShowToolbar="true"` to any `DataTable` where you want the toolbar.
  No action needed if you were already passing `ShowToolbar="false"` — that becomes a
  harmless no-op.

### Fixed

- **DataTable no longer renders pagination chrome for a single page.** The bar was previously
  gated on `objProcessedData.Any()`, so a one-row grid still painted
  "Showing 1-1 of 1 / Rows per page / Page 1 of 1 / « ‹ › »". The guard is now
  `TotalItems > PageSize`, so pagination appears only when there is more than one page.
  `ShowPagination="false"` still suppresses it unconditionally. *(AstroLyfe TR-010)*

- **`DialogContent` / `AlertDialogContent` can no longer render above the top of the viewport.**
  A dialog taller than the viewport used to position its header off-screen — measured
  `top: -245px` at 1366×720 and `-305px` at 1280×600 — where it sat behind the host app's
  fixed header, invisible and unclickable. Both components now carry
  `max-h-[calc(100vh-2rem)] overflow-y-auto`; tall content scrolls inside the dialog.
  Measured after the fix: `top: 16px` at 1366×720, 1280×600 and 390×844.

  This clamps the dialog's *height* rather than overriding its centering property, so it is
  immune to the `transform`-vs-standalone-`translate` distinction that made consumer-side CSS
  overrides version-fragile. **If you shipped such an override, you can remove it** — it is no
  longer needed, and it remains compatible if you keep it. `Sheet`/`Drawer` position with
  `inset-y-0` and are deliberately untouched. *(AstroLyfe TR-011)*

- **Popover surfaces are opaque without host-defined theme tokens.** `SelectContent` and the
  other `bg-popover` surfaces resolve `var(--popover)`, which the library never defined — so an
  application that shipped no token set got `background-color: rgba(0, 0, 0, 0)`: an open
  `Select` painted a transparent panel with unreadable text over whatever sat behind it.

  `trblazeui.css` now ships default definitions for the core design tokens (`--popover`,
  `--popover-foreground`, `--background`, `--foreground`, `--border`, `--muted`, `--accent`,
  `--ring`, … in both light and `.dark`). They are declared inside `@layer base` **and** wrapped
  in `:where()` so they carry zero specificity — **any** host declaration still wins, layered or
  not. This is a floor, not a ceiling: themed applications are unaffected. *(AstroLyfe TR-012)*

### Changed

- `DataTable` gained an internal `ShouldShowPagination()` guard consolidating the
  `ShowPagination` / `IsLoading` / row-count conditions.
- Demo and AI-reference documentation updated for the new `ShowToolbar` default.

### Notes

- `TrBlazeUI.Components` depends on **`HtmlSanitizer 9.1.949-beta`** (pre-release). This is
  deliberate: it is the only line pulling `AngleSharp >= 1.5.0`, which patches
  **CVE-2026-54570** (mutated-XSS bypass defeating DOM-based sanitizers — the exact protection
  `RichTextEditor`/`MarkdownEditor` rely on). No stable `HtmlSanitizer` yet ships the patched
  `AngleSharp`. Revisit when 9.1.x reaches stable.

---

## [1.0.7]

Consumer-feedback release closing the TrStudio findings (`REQ-UI-015`) and the earlier
AstroLyfe findings (`REQ-UI-014`).

### Fixed

- `DataTable`, `Alert`, `Checkbox`, `Switch` splat `CaptureUnmatchedValues` onto their rendered
  root, so `id` / `data-*` / `aria-*` no longer throw `InvalidOperationException`.
- A controlled `Switch` no longer optimistically flips `aria-checked` when the bound `Checked`
  value is held unchanged by a gate or interceptor.
- `DataTable` self-contains at ≤400px (root `min-w-0`, wrapping footer) without forcing page
  horizontal scroll.
- `FileUpload.OnFilesSelected` added as an alias of `FilesChanged`.
- **Mac Catalyst packaging blocker:** `AddRazorSupportForMvc` removed, so published nuspecs carry
  no `<frameworkReferences>` and MAUI Mac Catalyst consumers resolve the packages without
  `NETSDK1082`.
- `Select` keyboard trap removed (Tab/Shift+Tab escape a closed trigger); inline popup fallback
  when no `PortalHost` is attached; accessible name resolved on first render.
- `DropdownMenuTrigger` gained an `AsChild` pattern to avoid nested interactive controls.
- Icons default to `aria-hidden="true"`; unknown icon ids render an empty placeholder marked
  `data-trblazeui-missing-icon` with a one-time logger warning, instead of a misleading
  alert-triangle glyph.
- `.sr-only` hardened to a zero-scroll-footprint visually-hidden box.
- `Input.Label` renders a real associated `<label>` instead of silently doing nothing.
- New `Grid` / `GridItem` components + `/components/grid` demo.

---

## [1.0.4] and earlier

See `docs/OldDocs/` for the archived consumer issue reports covering the `0.0.0-beta.*` line.
