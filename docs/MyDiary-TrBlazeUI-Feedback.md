# TrBlazeUI feedback — MyDiary (copy kept by TrBlazeUI)

| | |
|---|---|
| App | MyDiary |
| Upstream | TrBlazeUI |
| Updated | 2026-11-19 |

## Summary

1 entries: nothing is blocked. 0 open, 0 fixed upstream and not yet re-checked, 1 closed. Copied from the MyDiary-OneBrief comparison: the Claude-Opus-5.5 run's TR-001 (fixed in 2.2.6, prepared 2026-11-19) and, below it, the GLM-5.3 run's five entries, numbered by that run and answered under each.

## Entries

### TR-001 — The Calendar cannot mark the days that have content

> ✅ **Fixed upstream 2026-11-19, in 2.2.6** (prepared, not yet released) — `Calendar` takes `MarkedDates` (`Func<DateTime, bool>`: which days get a dot under the number), `MarkedLabel` (what a screen reader hears after the number, for example "has an entry") and `MarkClass` (the dot's colour). A marked day is still picked as usual, so `OnSelect` opens that day. Test `tests/verify/req-ui-077.spec.ts`, page `/verify-mydiary-tr001`, row REQ-UI-077. Also fixed on the way: the calendar ignored a changed `Class` or `DisabledDates` until the shown month moved.
> ```razor
> <Calendar @bind-Selected="day" MarkedDates="@(d => entryDays.Contains(d.Date))" MarkedLabel="has an entry" OnSelect="OpenDay" />
> ```

- **Severity:** major
- **Blocks:** no — found while drawing MyDiary's mockups; the Browse calendar is designed with marked days and waits for this fix when it is built.
- **Repro:** TrBlazeUI 2.1.9 `Calendar` takes `Mode` (Single, Multiple, Range), `DisabledDates` and `FirstDayOfWeek`. It has no parameter or template for what a day cell shows.
- **Expected:** A journal marks each day that has an entry (a dot under the number), so the user can see at a glance which days they wrote on and pick one.
- **Actual:** Every day cell looks the same apart from selected, today and disabled.
- **Encountered in:** `*day1-greenfield MyDiary`, mockups for Browse (BRD-42, BRD-43).
- **Workaround:** none.
- **Suggested fix:** Add a `DayTemplate` (a render fragment given the date) or a `MarkedDates` set with a `MarkClass`, so an app can draw a dot or a count on chosen days.

**From the GLM-5.3 run of the same brief** — its numbers overlap the run above, so each carries the run's name.

#### GLM-5.3 TR-001 — Timeline is a milestone strip, not a date-grouped entry list

> ✅ **Already possible — no library change.** `TimelineItem` takes `ChildContent`, a slot for any row content: badges, chips, a star, and a link or button that opens the entry. Group rows under dates with one `Timeline` per date and a heading above it. `TimelineItem` has no `Href` of its own; put the anchor inside `ChildContent`.

- **Severity:** minor
- **Blocks:** no — the Timeline screen was drawn as Card rows with Badge kind marks, and the work carried on
- **Repro:** read `.trblazeui/TrBlazeUI-AI-Reference.md` §8 "Timeline": `TimelineItem` carries Meta/Title/Subtitle — one event, no children, no click-through row
- **Expected:** a journal app needs a list of clickable entry rows grouped under dates, each with a badge, chips, star and mood
- **Actual:** the shipped Timeline models career-step milestones; the entry list must be hand-built from Card + Badge markup
- **Encountered in:** `*day1-greenfield MyDiary` — mockup `timeline.html`, BRD-22
- **Workaround:** Card rows + Badge + chips, in the library's tokens
- **Suggested fix:** either a `TimelineItem` slot for rich row content and an `Href` on the item, or a first-class grouped list control with clickable rows

#### GLM-5.3 TR-002 — Calendar has no documented per-day content or day link

> ✅ **Mostly fixed upstream 2026-11-19, in 2.2.6** (prepared, not yet released) — the same request as the Opus run's TR-001 above: `MarkedDates` marks the days with entries and `OnSelect` opens a day. Two things are not built: a count per day (the calendar draws a dot, not a number) and a per-day `Href`. The reference's Calendar section was also wrong: it showed `<Calendar @bind-Value>`, which does not compile; it now shows `@bind-Selected` and the full parameter table.

- **Severity:** minor
- **Blocks:** no — the month grid was drawn in the library's visual language (Badge counts in day cells, days as anchors), and the work carried on
- **Repro:** read `.trblazeui/TrBlazeUI-AI-Reference.md` §5 "Calendar": the documented surface is `<Calendar @bind-Value>` alone
- **Expected:** MyDiary's calendar shows an entry-count badge per day and opens a day's entries when a counted day is tapped
- **Actual:** the Calendar is documented as a date picker; per-day content and day actions are beyond its documented API
- **Encountered in:** `*day1-greenfield MyDiary` — mockup `calendar.html`, BRD-28, BRD-29
- **Workaround:** the grid drawn in library tokens; the build will need a day-cell template or a custom grid
- **Suggested fix:** a `DayTemplate` render fragment on Calendar (day value, content slot) and an optional per-day `Href`/`OnClick`

#### GLM-5.3 TR-003 — PasswordStrength documents no parameters

> ✅ **Fixed upstream 2026-11-19 (documentation)** — the reference now lists `PasswordStrength`'s parameters: `Value`, `MinimumLength` (8), `LevelChanged` (`Empty`, `Weak`, `Fair`, `Good`, `Strong`) and `Class`. It draws its own four-part bar **and its own caption** ("Good password"), announced to screen readers, so the hand-drawn caption is not needed.

- **Severity:** minor
- **Blocks:** no — the mockup drew the caption ("Good strength") and the filled track manually in the library's tokens, and the work carried on
- **Repro:** read `.trblazeui/TrBlazeUI-AI-Reference.md` §8 "PasswordStrength": only `<PasswordStrength Value="@password" />` is shown
- **Expected:** a caption text or label parameter and a fill-percentage/score parameter, so the strength reads as shown in the reference's own look
- **Actual:** no parameter table; the caption and fill had to be hand-drawn beside the bar
- **Encountered in:** `*day1-greenfield MyDiary` — mockups `signin-create-account.html`, `settings.html`
- **Workaround:** a `Class`-styled caption beside the component at build time, if the real component exposes no caption
- **Suggested fix:** a parameter table for PasswordStrength (Value, and whatever caption/threshold surface exists)

#### GLM-5.3 TR-004 — No Chip component

> ⏸ **Not built — a new component, left for the owner to decide.** There is no `Chip`. A tag or mood pill is a `Badge` (`Variant` for the tone, `As="span"`); a removable chip is a `Badge` with a small `Button Variant="ButtonVariant.Ghost" Size="ButtonSize.Icon"` inside it.

- **Severity:** minor
- **Blocks:** no — chips were drawn as Badge-styled pills, which the library fully supports, and the work carried on
- **Repro:** search `.trblazeui/TrBlazeUI-AI-Reference.md` for "chip": only Badge variants exist
- **Expected:** tags, moods and citation chips are a recurring pattern; a small Chip (text, optional icon, optional remove, optional `Href`) would keep them uniform
- **Actual:** every chip must be assembled from Badge or plain markup
- **Encountered in:** `*day1-greenfield MyDiary` — mockups across the set (tags, mood, Ask source chips)
- **Workaround:** Badge-styled pills
- **Suggested fix:** a `Chip` component beside Badge, with optional remove and link

#### GLM-5.3 TR-005 — InputOTP has no documented read-only masked display

> ⏸ **Not built — a new mode, left for the owner to decide.** `InputOTP` is an entry control only; `Disabled` greys it but shows its digits. To show that a PIN is set, draw six dots beside the "Change PIN" button, as the mockup does.

- **Severity:** minor
- **Blocks:** no — the PIN-is-set row was drawn as six filled dots in the library's tokens, and the work carried on
- **Repro:** read `.trblazeui/TrBlazeUI-AI-Reference.md` §5 "InputOTP": an entry control only; no read-only or masked display mode is documented
- **Expected:** Settings shows that a PIN is set as six dots, without inviting new entry
- **Actual:** the dots must be hand-drawn, or a masked value fed to the entry control
- **Encountered in:** `*day1-greenfield MyDiary` — mockup `settings.html`, BRD-37
- **Workaround:** render the dots beside the "Change PIN" button
- **Suggested fix:** a read-only masked variant of InputOTP (or a `ReadOnly` parameter)

## Replies from TrBlazeUI

<!-- The upstream team's answers, newest block first. Left in full: this is the record. -->

### 2026-11-19 — the Calendar marks days in 2.2.6; the rest answered

Each entry above carries its answer. When MyDiary's Browse screen is built on 2.2.6, bind the calendar with
`@bind-Selected`, mark the entry days with `MarkedDates`, and open a day from `OnSelect`; then close the entry
with `bash .tfcore/utils/tf-feedback.sh MyDiary --close TR-001 "<what you ran and what it showed>"`.
