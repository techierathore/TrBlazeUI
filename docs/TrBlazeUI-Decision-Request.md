# TrBlazeUI — decisions I need from you

| | |
|---|---|
| App | TrBlazeUI |
| Written | 2026-09-12 |
| Waiting on | Nothing. Answered 2026-09-13. |

## What happened

**Answered 2026-09-13: released as 2.0.6**, live on nuget.org. The original request is kept below.

---

You asked why I suggested `v2.1.1` for the next release. I should not have suggested
any number. The changelog says the release number is yours to assign when you cut the
release, and says in as many words not to write one into it speculatively. I guessed
from the `2.1.0` sitting in `Directory.Build.props`, which is only the number local
builds use when nobody passes one in. That was my mistake, not a decision the project
had already taken.

Here is what is actually true today. All five packages on nuget.org are live at
**2.0.0** and **2.0.3** — I checked the public index for each one. `2.1.0` was never
published anywhere public; the changelog has a `2.1.0` section and it is still headed
"unreleased". So the tag you cut, `2.0.5`, was not a step backwards at all: it is the
next patch number after what is live. My earlier warning that it was "below 2.1.0"
was misleading and I withdraw it.

The open question is not which number comes next in sequence. It is that the work
waiting to be released changes how existing code behaves: `Badge` now renders a
`<span>` instead of a `<div>`, a long `Badge` label no longer wraps, `DataTable` with
pagination switched off renders every row instead of five, and `AlertDialog` now
closes on Escape. Each can change a page someone already built against 2.0.3.

## What I need you to decide

### 1. Which version number the next release carries

The packages are at 2.0.3 in public. The unreleased work includes changes that alter
how existing code behaves, which is what version numbers exist to signal. The number
you pick is the whole signal — it decides whether someone upgrading gets a surprise.

| Option | What happens | What it costs |
|---|---|---|
| **A — 3.0.0** | Says plainly that behaviour changed and code may need attention. Anyone on 2.x stays there until they choose to move, and reads the notes when they do. | A major number sets an expectation about how much changed. The list is real but it is eight or so items, not a rewrite. |
| **B — 2.1.0** | Uses the number the changelog already has a section for, so the section and the release match. Signals new features, not breakage. | Understates it. Someone upgrading a minor version does not expect a `<div>` to become a `<span>`, and a stylesheet or test keyed on `div` stops matching with no warning. |
| **C — 2.0.5** | The number you already tagged. Smallest possible step from 2.0.3. | Understates it most. A patch release is understood as safe to take without reading anything, and this one is not. |

**My recommendation: A — 3.0.0.** The behaviour changes are the kind that break a
working page silently rather than loudly, and a major number is the only one that
tells someone to read the notes before upgrading.

## What I do when you answer

1. Correct the changelog: the `2.0.0` and `2.1.0` sections are both headed
   "unreleased" although 2.0.0 and 2.0.3 are live, and the unreleased work gets the
   number you choose. Around ten minutes.
2. Set the fallback number in `Directory.Build.props` to match, so a local build and a
   release agree.
3. Tell you the exact tag to cut and the two steps to run the publish, then watch the
   run and confirm all five packages are live on nuget.org at that version.
4. Close the last open row on the checklist, which only a real publish can close.

I do not need an answer to delete the old tag — the commands for that are in my
message and are yours to run either way.

## Copy this back to me

```
TrBlazeUI: decision 1 — cut the next release as 3.0.0. Update the changelog and the fallback version to match, then tell me the tag to cut.
```

```
TrBlazeUI: decision 1 — cut the next release as 2.1.0. Update the changelog and the fallback version to match, then tell me the tag to cut.
```

```
TrBlazeUI: decision 1 — cut the next release as 2.0.5. Update the changelog and the fallback version to match, then tell me the tag to cut.
```
