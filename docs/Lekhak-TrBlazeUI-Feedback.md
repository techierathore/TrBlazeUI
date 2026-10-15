# TrBlazeUI feedback — found while building Lekhak

| | |
|---|---|
| App | Lekhak |
| Upstream | TrBlazeUI (github.com/techierathore/TrBlazeUI) |
| Updated | 2026-10-15 |

## Summary

Nothing is blocked.

- 7 entries: 0 blockers, 1 major (TR-002), 6 minors (TR-001, TR-003 … TR-007). None blocks Lekhak: each has a working workaround in the app.
- Last consolidated: 2026-09-29.
- Package feed: the credentials live in this machine's NuGet configuration, not in the repository, so a fresh clone elsewhere (or CI) needs a `nuget.config` with a credential reference supplied by environment variable.
- Theming is not a gap: Lekhak's three site themes drive TrBlazeUI through an alias layer from its tokens to Lekhak's `--color-*` variables; keep `data-site-theme` / `data-theme` on `<html>`.
- **Re-checked on 2.1.6 (2026-10-09), when Lekhak moved from 2.0.2.** TR-001 and TR-005 are fixed and closed. TR-002, TR-003, TR-004 and TR-006 were still present in the 2.1.6 package. The TrBlazeUI team answered on 2026-10-09 (reply below) and the repository now carries this file under `docs/`.
- **Re-checked on 2.1.7 (2026-10-15).** TR-002, TR-003, TR-004 and TR-006 are fixed and closed below; a filled Button measures 0px border live. TR-007 was still present on 2.1.7. The one wave7 failure on 2.1.7 (minimal dark `--primary`) is Lekhak's own REQ-NFR-027 mapping against a stale spec, not the library.
- **TR-007 answered 2026-10-15 (reply below):** fixed upstream, ships after 2.1.7.

## Entries

### TR-002 — `trblazeui.css` sits entirely in cascade layers, so any unlayered host CSS beats it

> ✅ **Closed 2026-10-15** — re-checked here: 2.1.7 taken 2026-10-15; the package ships staticwebassets/trblazeui-layers.css declaring properties, theme, base, trblazeui-host, components, utilities; wave7-trblazeui.spec LayerOrderDeclarationIsParsedFirst passed against the live web head

- **Status:** fixed upstream 2026-10-09 (`trblazeui-layers.css` and its `trblazeui-host` layer; layer names public, in the release after 2.1.6 — see the 2026-10-09 reply)
- **Severity:** major
- **Blocks:** no — `wwwroot/css/trblazeui-layers.css` declares the layer order and imports the host reboot between Preflight and the component layers; verified 7/7 across all six theme × mode combinations.
- **Repro:**
  ```
  Load trblazeui.css next to an unlayered reboot.css (Fluent UI Blazor's) and render <Button>, <Input>, <Label>.
  ```
- **Expected:** TrBlazeUI components keep their own borders, radius and display.
- **Actual:** Buttons and inputs get reboot's `border:1px solid black` and Fluent's radius; `<Label>` is forced to `inline-block`. Layering the host instead lets TrBlazeUI's Preflight flatten the host's headings, links and lists.
- **Encountered in:** REQ-UI-111 Stage F, 2026-08-17
- **Workaround:** the layer-order file above; it depends on TrBlazeUI's internal layer names matching Tailwind v4's.
- **Suggested fix:** Treat the layer names as public API, or ship a documented `@layer` order declaration or a tokens-only build.
- **Re-checked 2026-10-09 on 2.1.6:** still open. `trblazeui.css` still declares `@layer theme, base, components, utilities, properties` with no documented order, and the AI reference does not name the layers as public. The Lekhak workaround still holds.

### TR-001 — No Stepper / wizard-progress component

> ✅ **Closed 2026-10-09** — re-checked here: 2026-10-09: on TrBlazeUI 2.1.6, Stepper + StepperItem ship (AI reference §8, using TrBlazeUI.Components.Stepper; StepperItem.Status/Icon since 2.0.9/2.1.3). The gap is gone; adopting Stepper in place of the Badge workaround is optional UI work, not a defect.

- **Severity:** minor
- **Blocks:** no — the stage indicator is composed from Badge, Separator and Spinner.
- **Repro:**
  ```
  Search the catalog (README, TrBlazeUI-AI-Reference.md) for a multi-step stage indicator.
  ```
- **Expected:** A Stepper for flows such as Setup → Outline → Writing → Review → Human Review.
- **Actual:** Only Progress, Badge, Separator and Tabs exist.
- **Encountered in:** mockups for AI Story Studio, Story Ingest and Story Studio, 2026-08-06
- **Workaround:** Badge stage chips + Separator connectors + Spinner on the active step.
- **Suggested fix:** Ship a `Stepper` component.

### TR-003 — The reference's `_Imports.razor` block does not compile beside Fluent UI

> ✅ **Closed 2026-10-15** — re-checked here: 2.1.7 taken 2026-10-15; the shipped TrBlazeUI-AI-Reference.md has the section 'Beside another component library (Fluent UI, MudBlazor, Radzen)' and the layer order under CSS Imports; the solution builds with 0 errors

- **Status:** fixed upstream 2026-10-09 (reference section "Beside another component library"; `@using ApexCharts` chart-page only, in the release after 2.1.6 — see the 2026-10-09 reply)
- **Severity:** minor
- **Blocks:** no — names aliased or qualified at their call sites; `@using ApexCharts` kept out of global imports.
- **Repro:**
  ```
  Add the reference's _Imports.razor block to an app that also uses Fluent UI Blazor, then build.
  ```
- **Expected:** It compiles.
- **Actual:** `ToastService`, `ToastPosition` and `ButtonType` collide; `@using ApexCharts` (arriving transitively via `TrBlazeUI.Components`) adds 84 CS0104 errors in 30 files through `Color` and `Orientation`.
- **Encountered in:** REQ-UI-111 Stage F, 2026-08-17
- **Workaround:** alias `ToastService`, qualify `ToastPosition` at its one use, resolve `ButtonType` at 11 call sites.
- **Suggested fix:** Add a "coexisting with another component library" section and mark `@using ApexCharts` as chart-page-scoped.
- **Re-checked 2026-10-09 on 2.1.6:** still open. The reference's import block still includes `@using ApexCharts` and says it is required; there is no section on coexisting with another library. Less pressing now that Fluent UI is gone from Lekhak.

### TR-004 — Three sidebar width tokens are declared in a plain `:root`

> ✅ **Closed 2026-10-15** — re-checked here: 2.1.7 taken 2026-10-15; the shipped trblazeui.css declares --sidebar-width, --sidebar-width-mobile and --sidebar-width-icon inside :where(:root); Lekhak's 260px sidebar renders unchanged on the live web head

- **Status:** fixed upstream 2026-10-09 (sidebar width tokens through `:where(:root)`, in the release after 2.1.6 — see the 2026-10-09 reply)
- **Severity:** minor
- **Blocks:** no — Lekhak's own sheets are unlayered and win; a smoke assertion pins the widths.
- **Repro:**
  ```
  Inspect trblazeui.css for --sidebar-width, --sidebar-width-mobile, --sidebar-width-icon.
  ```
- **Expected:** Declared through zero-specificity `:where(:root)`, as the reference promises for library tokens.
- **Actual:** Declared in a plain `:root`, so an integrator who layers their CSS silently loses their own value.
- **Encountered in:** REQ-UI-111 Stage F, 2026-08-17
- **Workaround:** none needed; documented in `wwwroot/css/trblazeui-theme.css`.
- **Suggested fix:** Wrap the three tokens in `:where(:root)`.
- **Re-checked 2026-10-09 on 2.1.6:** still open. `trblazeui.css` still declares `:root{--sidebar-width:16rem…}` in a plain `:root`.

### TR-005 — The Dialog example uses the form the reference forbids

> ✅ **Closed 2026-10-09** — re-checked here: 2026-10-09: on TrBlazeUI 2.1.6 the AI reference labels the class-on-DialogTrigger form BAD and the Dialog section example uses <DialogTrigger AsChild><Button>. Fixed.

- **Severity:** minor
- **Blocks:** no — Lekhak uses the `AsChild` form.
- **Repro:**
  ```
  Compare the reference's "NEVER Do" item 7 with its Dialog section example.
  ```
- **Expected:** The example uses `<DialogTrigger AsChild><Button>…</Button></DialogTrigger>`.
- **Actual:** The example uses the forbidden `<DialogTrigger class="inline-flex …">` verbatim.
- **Encountered in:** REQ-UI-111 Stage F, building `/trblaze-check`, 2026-08-17
- **Workaround:** the `AsChild` form.
- **Suggested fix:** Correct the Dialog example.

### TR-006 — `Button` relies on Preflight's `border-width:0`, which the TR-002 workaround outranks

> ✅ **Closed 2026-10-15** — re-checked here: 2.1.7 taken 2026-10-15; filled Button on /trblaze-check measures border-width 0px in light and dark with class border-0 (Playwright against the live web head); 2.1.6 measured 1px

- **Status:** fixed upstream 2026-10-09 (`border-0` on every `Button` variant but Outline, in the release after 2.1.6 — see the 2026-10-09 reply)
- **Severity:** minor
- **Blocks:** no — a faint 1px hairline on filled buttons; fill and radius are correct.
- **Repro:**
  ```
  With the TR-002 layer order in place, measure a filled TrBlazeUI <Button>: border-width 1px, colour var(--border).
  ```
- **Expected:** No border on a filled button.
- **Actual:** The host reboot's `button{border:1px solid}` reaches TrBlazeUI buttons. The 2026-09-28 mockup update records this border as the shipped look.
- **Encountered in:** REQ-UI-111 Stage F, measured on `/trblaze-check`, 2026-08-17
- **Workaround:** none; left as is rather than a broad cascade rule that could break legacy markup.
- **Suggested fix:** Declare `border-width:0` in the `components` layer, or have migrated buttons carry `border-0`.
- **Re-checked 2026-10-09 on 2.1.6:** still open. The stylesheet's only `border-width:0` rules are `.sr-only`, `!border-0`, `file:border-0` and `data-[state=closed]:border-0`; `Button` carries none.

### TR-007 — The reference's `InputGroupButton` example nests a `<button>` inside a `<button>`

- **Status:** fixed upstream 2026-10-15 (the reference's §InputGroup example and NEVER item 11; `InputGroupButton` forwards unmatched attributes; in the release after 2.1.7 — see the 2026-10-15 reply)
- **Severity:** minor
- **Blocks:** no — the Not found page's search box (whose mockup draws a bordered input butted against a button anyway) is `<Input>` + `<Button>` in a flex row, so no `InputGroupButton` is used.
- **Repro:**
  ```
  <InputGroup><InputGroupInput /><InputGroupButton><Button Size="ButtonSize.Small">Go</Button></InputGroupButton></InputGroup>
  ```
  (the example in TrBlazeUI-AI-Reference.md §InputGroup), then inspect the DOM.
- **Expected:** one interactive `<button>`.
- **Actual:** on 2.1.6 `InputGroupButton` renders its own `<button>`, so the inner `Button` becomes a `<button>` nested in a `<button>` — invalid HTML; browsers and assistive tech handle the inner one inconsistently.
- **Encountered in:** REQ-UI-128 (Not found page search box), 2026-10-12
- **Workaround:** `<Input>` + `<Button>` in a flex row, or `<Button>` as a direct child of `<InputGroup>`.
- **Suggested fix:** either make `InputGroupButton` a non-button wrapper (like `InputGroupAddon`), or document it as the button itself (`<InputGroupButton OnClick=…>Go</InputGroupButton>`) and drop the inner `Button` from the example.
- **Re-checked 2026-10-15 on 2.1.7:** unchanged. The shipped reference (§InputGroup) still shows `<InputGroupButton><Button Size="ButtonSize.Small">Go</Button></InputGroupButton>`, and the component source renders a `<Button>` itself, so the example still nests two buttons. The TrBlazeUI repository's copy of this file predates this entry.

## Replies from TrBlazeUI

<!-- The upstream team's answers, newest block first. Left in full: this is the record. -->

### 2026-10-15 — TR-007 is fixed; it ships in the release after 2.1.7

You were right about the example, and the component had a second problem you would have hit next.
Both are fixed and tested in the library (REQ-UI-052, verified 2026-10-15). They ship in the next
release after 2.1.7 on GitHub Packages (`https://nuget.pkg.github.com/techierathore/index.json`).
Until then the feed stops at 2.1.7, and your `<Input>` + `<Button>` row keeps working.

| Entry | State | What you get |
|---|---|---|
| **TR-007** the reference's `InputGroupButton` example nests a `<button>` in a `<button>` | fixed | We took your second suggestion: `InputGroupButton` **is** the button, and stays one. The reference's §InputGroup example now puts `<InputGroupButton OnClick=…>Go</InputGroupButton>` inside an `InputGroupAddon`, with no inner `Button`. Its NEVER list gains item 11: never put a `<Button>` inside `<InputGroupButton>`. We also found that `InputGroupButton` dropped every attribute it does not declare (`title`, `data-testid`, `form`, `aria-*`). It now passes them to its one `<button>`. |

We did not take the first suggestion, a non-button wrapper. Every existing `InputGroupButton` in use
today is the button itself, so turning it into a wrapper would have broken all of them.

How to use it, after the upgrade:

```razor
<InputGroup>
    <InputGroupAddon>
        <LucideIcon Name="search" Size="16" />
    </InputGroupAddon>
    <InputGroupInput Placeholder="Search..." @bind-Value="objQuery" AriaLabel="Search" />
    <InputGroupAddon Align="InputGroupAlign.InlineEnd">
        <InputGroupButton OnClick="RunSearch" AriaLabel="Run search" data-testid="notfound-search-go">Go</InputGroupButton>
    </InputGroupAddon>
</InputGroup>
```

1. **Put the button text and its parameters on `InputGroupButton` itself.** It takes `OnClick`,
   `Type` (use `ButtonType.Submit` inside a form), `Variant`, `Size` (default `Small`), `Disabled`,
   `AriaLabel`, `Icon` and `IconPosition`. Never put a `<Button>` inside it.
2. **Wrap it in `InputGroupAddon Align="InputGroupAlign.InlineEnd"`** so it sits at the right end
   of the box, inside the group's single border. That is the look your Not found mockup draws.
3. **Attributes reach the button.** `data-testid`, `title` and `aria-*` written on
   `InputGroupButton` land on the rendered `<button>`, so a Playwright locator can target it.
4. **For a dropdown,** wrap it: `<DropdownMenuTrigger AsChild="true"><InputGroupButton …>…</InputGroupButton></DropdownMenuTrigger>`.
5. **Your agent's reference describes all of it.** After the upgrade, the build refreshes
   `.trblazeui/TrBlazeUI-AI-Reference.md`: §InputGroup has the corrected example and the rules
   above. `CHANGELOG.md` has the entry under "Lekhak TR-007".

How we checked it: on the library's demo, `/components/input-group` now shows the example under
"Search with a button (the reference example)". `tests/verify/req-ui-052.spec.ts` confirms the
page has no button inside a button, the Go button carries its `data-testid`, `title` and
`aria-label`, and pressing it runs the search. A second test fails if the
reference's InputGroup section ever shows a `<Button>` inside `<InputGroupButton>` again.

#### What we need from you

Moving to `InputGroupButton` is optional. Your `<Input>` + `<Button>` row is valid HTML and can
stay. If you want the joined look, upgrade once the release is on the feed and replace the Not found
search row with the block above. Then check for nested buttons on that page:
`document.querySelectorAll('button button').length` should be `0`. Close the entry here with
`bash .tfcore/utils/tf-feedback.sh Lekhak --close TR-007 "<what you ran and what it showed>"`,
or tell us what does not fit.

### 2026-10-09 — TR-002, TR-003, TR-004 and TR-006 are fixed; they ship in the release after 2.1.6

You were right: this file had never reached us. All four entries still open on 2.1.6 are now
fixed and tested in the library, and they ship in the next release after 2.1.6 (**2.1.7** by the
usual count) on GitHub Packages (`https://nuget.pkg.github.com/techierathore/index.json`). When this
reply was written the fixes were built and verified but the release had not been cut yet. If the
feed still stops at 2.1.6, wait; your workarounds keep working until you switch.

| Entry | State | What you get |
|---|---|---|
| **TR-002** unlayered host CSS beats `trblazeui.css` | fixed | The layer names (`properties`, `theme`, `base`, `components`, `utilities`) are now public, and a test fails the library build if a Tailwind upgrade renames one. A new one-line `_content/TrBlazeUI.Components/trblazeui-layers.css` declares that order with an empty **`trblazeui-host`** layer between `base` and `components`. |
| **TR-003** the reference's import block does not compile beside Fluent UI | fixed | `@using ApexCharts` is out of the block; the reference says to put it on chart pages only. A new section, "Beside another component library", gives aliases for `ToastService`, `ToastPosition` and `ButtonType`. A test builds the block beside Fluent UI Blazor 4.14.4 with those aliases. |
| **TR-004** the sidebar width tokens are in a plain `:root` | fixed | They are declared through `:where(:root)`, so your value wins in any layer and in any order. |
| **TR-006** a filled `Button` draws the host's 1px border | fixed | Every variant but Outline carries `border-0` itself. Under a host `button { border: 1px solid }` rule a filled button now measures 0px and Outline keeps its own 1px in `--input`. |

To use the host layer:

```html
<!-- First, before any other stylesheet -->
<link rel="stylesheet" href="_content/TrBlazeUI.Components/trblazeui-layers.css" />
```

```css
@import url("reboot.css") layer(trblazeui-host);
```

Things to know before you switch:

1. **Your `trblazeui-layers.css` can go.** Yours depended on our internal layer names; ours ships
   with the package and is tested against the shipped stylesheet. Use one or the other, not both:
   the first sheet that names the layers fixes their order.
2. **Link ours first, before any other stylesheet built with Tailwind v4.** A Tailwind build names
   the layers in its first line, so a sheet loaded earlier would fix the order without the host slot.
3. **TR-006 shows on your mockups.** Your 2026-09-28 mockup update records the hairline on filled
   buttons as the shipped look. After the upgrade it is gone, so the mockups need the border taken
   out, or the comparison will flag every filled button.
4. **TR-004 changes nothing unless you redeclare the tokens.** The defaults are the same 16rem,
   18rem and 3rem. If your CSS repeats them, your copy now wins, which is the point.
5. **Your agent's reference describes all of it.** After the upgrade, the build refreshes
   `.trblazeui/TrBlazeUI-AI-Reference.md`: §1 has the coexistence section and the layer order
   under "CSS Imports", and "Which control do I use for…" has a row for it. `CHANGELOG.md` has the
   full list.

#### What we need from you

Upgrade once the release is on the feed. Replace your own `wwwroot/css/trblazeui-layers.css` with
the library's file and your reboot import in `trblazeui-host`. Measure a filled `Button` on
`/trblaze-check` (border-width 0) and run your 7/7 theme × mode check again. Then close each entry
here (`bash .tfcore/utils/tf-feedback.sh Lekhak --close TR-002 "<what you ran and what it showed>"`,
and the same for TR-003, TR-004 and TR-006), or tell us what does not fit.
