# TrBlazeUI feedback — found while building Chatur

| | |
|---|---|
| App | Chatur |
| Upstream | TrBlazeUI |
| Updated | 2026-09-19 |

## Summary

4 entries: 0 blocking now, 4 filed and not blocking, 0 fixed upstream.

Nothing is blocked.

## Entries

### TR-001 — ScrollArea cannot stay at the newest line while content is added

- **Severity:** minor
- **Blocks:** no — the Workbench output pane is designed as a plain ScrollArea around a CodeBlock; lines still appear as they arrive, and the design work carried on.
- **Repro:** Put text that grows line by line inside a ScrollArea:
  ```razor
  <ScrollArea Class="h-[300px]"><CodeBlock Code="@output" /></ScrollArea>
  ```
- **Expected:** A way to keep the view at the bottom while new lines arrive, which stops when the reader scrolls up and resumes when they return to the bottom.
- **Actual:** The reference for version 2.0.7 lists only `Class` for ScrollArea. The view stays where it is, so a running build's newest line is off screen.
- **Encountered in:** `*day1-greenfield Chatur`, mockups step, Workbench output panel (BRD-2, BRD-5, BRD-11).
- **Workaround:** none. The pane does not follow the newest line until the library offers it.
- **Suggested fix:** Add a `StickToEnd` parameter to ScrollArea (or a small `LogView` control built on it) that follows new content unless the reader has scrolled away.

### TR-002 — No tree view control

- **Severity:** major
- **Blocks:** no — nothing in phase 1 needs it; the later-phase screens are drawn with a tree and the design work carried on. It will block the Files screen (phase 2) if still missing then.
- **Repro:** Look for a tree in the component reference, version 2.0.7:
  ```
  grep -i "tree" TrBlazeUI-AI-Reference.md      (no control found)
  ```
- **Expected:** A `TreeView` with expand and collapse, one selected row, keyboard arrows, an icon and a trailing badge per row, and loading of children on demand.
- **Actual:** No such control. The nearest is `Collapsible` with `Item` rows, which has no keyboard movement, no selection and no indentation rules.
- **Encountered in:** `*day1-greenfield Chatur`, mockups for Files, Chat, Changes, Source control and the Analyst desk (phases 2 to 4).
- **Workaround:** none. The screens name `Collapsible` with `Item` rows until the control exists.
- **Suggested fix:** Add `TreeView` and `TreeItem` to `TrBlazeUI.Components`.

### TR-003 — No control that shows the difference between two texts

- **Severity:** major
- **Blocks:** no — nothing in phase 1 needs it; the Changes screen (phase 3) is drawn and the design work carried on. It will block Changes if still missing then.
- **Repro:**
  ```
  grep -i "diff" TrBlazeUI-AI-Reference.md      (no control found)
  ```
- **Expected:** A `DiffView` taking a before and an after text: side by side or inline, line numbers, added and removed lines tinted from the theme, parts that can be folded, and a slot for buttons on each part.
- **Actual:** No such control; `CodeBlock` shows one text in one colour.
- **Encountered in:** `*day1-greenfield Chatur`, mockups for Changes (phase 3) and Documents "Compare with the previous version" (phase 2).
- **Workaround:** none.
- **Suggested fix:** Add `DiffView` to `TrBlazeUI.Components`, with the line comparison done in .NET so no script library is needed.

### TR-004 — No joined button group for choosing one of a few views

- **Severity:** minor
- **Blocks:** no — the mockups draw two `Toggle`s side by side, and the design work carried on.
- **Repro:** Try to build "Side by side | Inline" or "Board | Table" as one joined control:
  ```razor
  <Toggle>Board</Toggle><Toggle>Table</Toggle>   @* two loose toggles; nothing keeps exactly one pressed *@
  ```
- **Expected:** A `ToggleGroup` (single or multiple choice) that draws its items joined and keeps the single choice itself.
- **Actual:** Only a lone `Toggle`; `Tabs` is the wrong meaning for a view switch inside a toolbar.
- **Encountered in:** `*day1-greenfield Chatur`, mockups for Changes, Reports and Board (phases 3 and 5).
- **Workaround:** none; each screen would have to keep the single choice by hand.
- **Suggested fix:** Add `ToggleGroup` and `ToggleGroupItem`.


## Resolution status (TrBlazeUI, fixed upstream 2026-09-19)

All four are fixed in the library source under REQ-UI-021 and ship in the next release after
2.0.7 (`CHANGELOG.md`, `[Unreleased]`). Release build 0 warnings / 0 errors. 87 of 87 browser checks
pass at 1280 and 390 (`tests/verify/ui-chatur.spec.js`), and the verifier marked the row Verified.

| Entry | What you get | Verify from here |
|---|---|---|
| **TR-001** | `ScrollArea StickToEnd="true"` follows new lines, stops when the reader scrolls up, and starts again at the bottom. `AtEndChanged` tells you when it stops or starts, and `ScrollToEndAsync()` is for a "Jump to latest" button. Also fixed: your exact repro, `Class="h-[300px]"`, now limits the scrolling area; before, the inner area grew with its content and never scrolled. | Wrap the Workbench output in `<ScrollArea StickToEnd="true" Class="h-[300px]">` and stream lines into the `CodeBlock`. |
| **TR-002** | `TreeView` and `TreeItem`: open and close, one selected row (`@bind-SelectedValue`), arrow keys, Home and End, Enter, type-to-jump, an `Icon` and a `Trailing` slot per row, and children loaded on demand (`HasChildren` + `OnExpand` + `Loading`). The trailing slot is called `Trailing`, not `Badge`, so a `Badge` can go inside it. | Swap the `Collapsible` + `Item` rows on Files for `TreeView`. |
| **TR-003** | `DiffView` with `Before` and `After`: side by side or inline, line numbers, added and removed lines tinted from the theme, unchanged parts folded, and a `HunkActions` slot on each part. The comparison runs in .NET (`TextDiff`), with no script library. | Put `DiffView` on Changes and on Documents "Compare with the previous version". |
| **TR-004** | `ToggleGroup` already existed but was missing from the reference. It now takes `Joined="true"` (one joined control) and `AllowDeselect="false"` (exactly one stays chosen). There is one Tab stop and arrow keys move between the options. | Replace the two loose `Toggle`s with `<ToggleGroup Joined="true" AllowDeselect="false">`. |

**One thing to know before upgrading.** A class list that pairs a one-side border with a border
colour, such as `border-b border-input`, used to lose the one-side border when merged. It now keeps
it, so a border you asked for and never saw may appear.

**Please re-test and reopen anything that still bites.**
