# TrBlazeUI — next release

For the GitHub Release body. The owner names the version when cutting it; this file is renamed to
`TrBlazeUI-Release-Notes-<version>.md` then. All five packages share the version. Full detail is in
`CHANGELOG.md` under [Unreleased].

## ⚠ Read before upgrading

- **A `Combobox` `Id` now lands on the button, no longer on the wrapper.** Before, `Id="pick"` (or
  `id="pick"`) was written on the Combobox's outer `<div>`. Now it is written on the
  `role="combobox"` button inside it. An app that styled the wrapper by that id, looked it up in a
  script, or pointed a test at it must change that: select the button instead, or put the Combobox
  inside a `<div>` of your own that carries the id. In return, `<Label For="pick">` now reaches the
  control.

## Fixed

- **A `SelectItem` with only `Text` draws it** (AstroLyfe TR-016). The open list showed blank rows
  and the closed list showed the raw value; both now show `Text`. Child content still wins when both
  are given.
- **`Combobox.Id` is a parameter on the trigger button** (AstroLyfe TR-021), as above.

## Documentation

- `FileUpload.DropzoneContent` is in the AI reference with an example (AstroLyfe TR-019).
- A `Select` inside a modal `Dialog` opens above it (AstroLyfe TR-022): already so after 2.1.4; now held by a test.
