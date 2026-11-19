# TrBlazeUI 2.2.6

For the GitHub Release body (tag `v2.2.6`). All five packages share this version. Full detail is in
`CHANGELOG.md` under [2.2.6].

## Fixed

- **DatePicker closes on Escape and on a second click of its button** (Sevak TR-050). Escape works
  from the button and from inside the calendar and puts the focus back on the button. Every
  Popover with an `AsChild` trigger now toggles on a second click, and Escape on any Popover trigger
  closes it unless `CloseOnEscape="false"`.
- **A submenu keeps its 8 px margin when its rows change while it is open** (Chatur TR-025):
  Menubar, DropdownMenu and ContextMenu submenus are placed again on every render.
- **`place-items-*`, `place-content-*`, `place-self-*` and `justify-self-*` are in `trblazeui.css`**
  (Chatur TR-027), with their responsive forms.
- **LogView never states a line count other than the lines it shows** (Chatur's output strip): the
  count is withdrawn when a line arrives and stated again when the output pauses, or within 3 s.
- **The sidebar's phone mode follows a one-step window resize** (TrStudio TR-015), including in a
  Mac Catalyst web view.
- **Calendar re-renders when its parent changes `Class`, `DisabledDates` or the marked days.**
- **Leaving a page that registered keyboard shortcuts no longer logs "Unobserved task exception"** in
  the server log.

## Added

- `Calendar.MarkedDates`, `MarkedLabel`, `MarkClass`: a dot on the days that have content (MyDiary TR-001).
- `SelectContent MatchTriggerWidth="false"`: a Select list as wide as its options, never narrower
  than its button (Chatur TR-026).
- `DataTableColumn.HeaderTitle` and `HeaderTemplate`: a header that explains its column (TfLens TR-041).

## Documentation

- The agent reference binds `Calendar` with `@bind-Selected` (it showed `@bind-Value`, which does not
  compile) and documents `PasswordStrength`'s parameters.

## Upgrading

No breaking changes. One behaviour to know: a second click on a Popover trigger built with `AsChild`
(DatePicker, DateRangePicker, TimePicker, ColorPicker, the DataTable toolbar's column menu and your
own) now closes the popover instead of doing nothing.
