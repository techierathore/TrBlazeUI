// Chatur consumer-feedback batch 2 (docs/Chatur-TrBlazeUI-Feedback.md, filed 2026-09-21).
// Covers REQ-UI-005, REQ-UI-006, REQ-UI-017, REQ-UI-022, REQ-UI-023, REQ-UI-024, REQ-UI-025.
// Run: SMOKE_URL=http://localhost:PORT node tests/verify/ui-chatur-2.spec.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.SMOKE_URL;
if (!BASE) { console.error('SMOKE_URL is not set'); process.exit(2); }
const OUT = process.env.OUT_DIR || path.join(process.cwd(), 'tests', '.artifacts', 'chatur-2');
fs.mkdirSync(OUT, { recursive: true });

// Every check is tagged with the checklist row it grades, so tf-verify-tests.sh can map the
// results back to a row through the .ts wrapper (tests/verify/req-ui-022.spec.ts).
let objRow = 'REQ-UI-000';
const results = [];
let pass = 0, fail = 0;
const failures = [];
const check = (name, ok, detail) => {
  results.push({ id: `${objRow} ${name}`, pass: !!ok, detail: ok ? undefined : String(detail) });
  if (ok) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; failures.push(`${name} — ${detail}`); console.log(`  FAIL ${name} — ${detail}`); }
};
const eq = (name, actual, expected) =>
  check(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  const go = async route => {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
  };
  const attr = (sel, a) => page.locator(sel).first().getAttribute(a);
  const text = async sel => (await page.locator(sel).first().innerText()).trim();
  const count = sel => page.locator(sel).count();

  // ── REQ-UI-023 — Typing + Progress.Indeterminate ────────────────────────────
  objRow = 'REQ-UI-023';
  console.log('\nREQ-UI-023 — Typing / Progress.Indeterminate');
  await go('/components/progress');
  eq('indeterminate bar keeps role=progressbar', await attr('[data-testid="progress-indeterminate"]', 'role'), 'progressbar');
  eq('indeterminate bar omits aria-valuenow', await attr('[data-testid="progress-indeterminate"]', 'aria-valuenow'), null);
  eq('indeterminate bar aria-valuemin', await attr('[data-testid="progress-indeterminate"]', 'aria-valuemin'), '0');
  eq('indeterminate bar aria-valuemax', await attr('[data-testid="progress-indeterminate"]', 'aria-valuemax'), '100');
  check('determinate bar still reports aria-valuenow',
    await attr('[data-testid="progress-determinate"]', 'aria-valuenow') !== null, 'aria-valuenow was absent');
  const bars = await page.evaluate(() => {
    const all = [...document.querySelectorAll('[role="progressbar"]')];
    return {
      total: all.length,
      indeterminate: all.filter(b => b.getAttribute('data-indeterminate') === 'true').length,
      determinateMissingValue: all.filter(b => b.getAttribute('data-indeterminate') !== 'true' && !b.hasAttribute('aria-valuenow')).length,
    };
  });
  eq('no determinate bar lost its aria-valuenow', bars.determinateMissingValue, 0);
  check('at least one indeterminate bar on the page', bars.indeterminate >= 1, JSON.stringify(bars));
  const indAnim = await page.locator('[data-testid="progress-indeterminate"] [data-slot="progress-indicator"]').first()
    .evaluate(el => getComputedStyle(el).animationName).catch(() => 'MISSING');
  eq('indeterminate indicator animates from the regenerated bundle', indAnim, 'trblazeui-progress-indeterminate');

  await go('/components/typing');
  eq('typing is a status live region', await attr('[data-testid="typing-inline"]', 'role'), 'status');
  eq('typing announces politely', await attr('[data-testid="typing-inline"]', 'aria-live'), 'polite');
  eq('typing has three dots', await count('[data-testid="typing-inline"] .trblazeui-typing-dot'), 3);
  const tDisplay = await page.locator('[data-testid="typing-inline"]').first().evaluate(el => getComputedStyle(el).display);
  eq('typing sits inline, reserving no row', tDisplay, 'inline-flex');
  const dotScale = await page.evaluate(() => {
    const w = s => { const e = document.querySelector(s); return e ? parseFloat(getComputedStyle(e).width) : null; };
    return { small: w('[data-testid="typing-small"] .trblazeui-typing-dot'),
             def: w('[data-testid="typing-default"] .trblazeui-typing-dot'),
             large: w('[data-testid="typing-large"] .trblazeui-typing-dot') };
  });
  check('typing size scale increases', dotScale.small < dotScale.def && dotScale.def < dotScale.large, JSON.stringify(dotScale));
  const grow1 = await text('[data-testid="typing-stream-text"]').catch(() => '');
  await page.waitForTimeout(1500);
  const grow2 = await text('[data-testid="typing-stream-text"]').catch(() => '');
  check('the streamed sentence is actually growing', grow1 !== grow2, `"${grow1.slice(0, 30)}" vs "${grow2.slice(0, 30)}"`);

  // reduced motion
  const rmPage = await ctx.newPage();
  await rmPage.emulateMedia({ reducedMotion: 'reduce' });
  await rmPage.goto(`${BASE}/components/typing`, { waitUntil: 'networkidle' });
  await rmPage.waitForTimeout(1200);
  const rmAnim = await rmPage.locator('[data-testid="typing-inline"] .trblazeui-typing-dot').first()
    .evaluate(el => getComputedStyle(el).animationName).catch(() => 'MISSING');
  eq('reduced motion swaps the dot animation', rmAnim, 'trblazeui-still-working');
  await rmPage.close();

  // ── REQ-UI-006 — per-step status ────────────────────────────────────────────
  objRow = 'REQ-UI-006';
  console.log('\nREQ-UI-006 — StepperItem.Status / TimelineItem.Status');
  await go('/components/stepper');
  for (const [id, label, glyph] of [
    ['step-done', 'Done', '✓'], ['step-retried', 'Retried', '↻'], ['step-running', 'Running', '●'],
    ['step-waiting', 'Waiting', '…'], ['step-failed', 'Failed', '✕'],
  ]) {
    eq(`${id} marker names its state`, await attr(`[data-testid="${id}"] [role="img"]`, 'aria-label'), label);
    eq(`${id} marker glyph`, await text(`[data-testid="${id}"] [role="img"]`).catch(() => 'MISSING'), glyph);
  }
  eq('pending step names its state', await attr('[data-testid="step-pending"] [role="img"]', 'aria-label'), 'Pending');
  eq('done step carries data-status', await attr('[data-testid="step-done"]', 'data-status'), 'done');
  eq('exactly one aria-current in the status stepper',
    await count('nav[aria-label="Release pipeline"] [aria-current="step"]'), 1);
  eq('the status-free stepper emits no role=img markers',
    await count('nav[aria-label="Publishing progress"] [role="img"]'), 0);

  await go('/components/timeline');
  eq('timeline retried names its state', await attr('[data-testid="tl-retried"] [role="img"]', 'aria-label'), 'Retried');
  eq('timeline current emits aria-current', await attr('[data-testid="tl-running"]', 'aria-current'), 'step');

  // ── REQ-UI-017 — SortableList position + remove ─────────────────────────────
  objRow = 'REQ-UI-017';
  console.log('\nREQ-UI-017 — SortableList position / remove');
  await go('/components/sortable-list');
  eq('removable list shows a position on row 1',
    await text('[data-testid="sortable-removable"] [data-slot="sortable-list-position"]').catch(() => 'MISSING'), '1');
  const beforeRemove = await count('[data-testid="sortable-removable"] ol > li');
  const removeName = await attr('[data-testid="sortable-removable"] li:first-child [data-slot="sortable-list-remove"]', 'aria-label');
  check('remove button has its own accessible name', /^Remove /.test(removeName || ''), `got ${JSON.stringify(removeName)}`);
  await page.locator('[data-testid="sortable-removable"] li:first-child [data-slot="sortable-list-remove"]').click();
  await page.waitForTimeout(700);
  eq('removing a row shortens the list', await count('[data-testid="sortable-removable"] ol > li'), beforeRemove - 1);
  const removeStatus = await text('[data-testid="sortable-removable"] [data-slot="sortable-list-status"]').catch(() => '');
  check('removal is announced', /removed, \d+ items left/.test(removeStatus), `status read "${removeStatus}"`);
  eq('ShowPosition=false hides the position',
    await count('[data-testid="sortable-no-position"] [data-slot="sortable-list-position"]'), 0);

  // ── REQ-UI-005 — DataTable choose-all announces its state ───────────────────
  objRow = 'REQ-UI-005';
  console.log('\nREQ-UI-005 — DataTable choose-all state');
  await go('/components/datatable');
  const trigger = '[data-testid="req-ui-005-grid"] thead [data-slot="datatable-select-all-trigger"]';
  const label0 = await attr(trigger, 'aria-label');
  check('choose-all trigger names the empty state', /No rows selected, \d+ in all - choose rows/.test(label0 || ''),
    `got ${JSON.stringify(label0)}`);
  await page.locator('[data-testid="req-ui-005-grid"] tbody [role="checkbox"]').first().click();
  await page.waitForTimeout(700);
  const label1 = await attr(trigger, 'aria-label');
  check('choose-all trigger names the part-chosen state', /1 of \d+ rows selected - choose rows/.test(label1 || ''),
    `got ${JSON.stringify(label1)}`);
  const liveText = await text('[data-testid="req-ui-005-grid"] [data-slot="datatable-selection-status"]').catch(() => '');
  check('the live region reports the count', /1 of \d+ rows selected/.test(liveText), `region read "${liveText}"`);
  const countBtn = await text('[data-testid="req-ui-005-count"]').catch(() => '');
  check('SelectedCount reaches the page', /1/.test(countBtn), `button read "${countBtn}"`);
  eq('single-page table keeps a real choose-all checkbox',
    await count('[data-testid="req-ui-005-single-page"] thead [role="checkbox"]'), 1);
  eq('single-page choose-all keeps its plain name',
    await attr('[data-testid="req-ui-005-single-page"] thead [role="checkbox"]', 'aria-label'), 'Select all rows');

  // ── REQ-UI-022 — CodeEditor + EditorTabs ────────────────────────────────────
  objRow = 'REQ-UI-022';
  console.log('\nREQ-UI-022 — CodeEditor / EditorTabs');
  await go('/components/code-editor');
  eq('editor textarea does not soft-wrap',
    await attr('[data-testid="code-editor"] textarea[data-slot="code-editor-input"]', 'wrap'), 'off');
  check('gutter renders line numbers',
    await count('[data-testid="code-editor"] [data-slot="code-editor-gutter"] > div') > 1, 'no gutter rows');
  const ta = page.locator('[data-testid="indent-editor"] textarea').first();
  await ta.click();
  await ta.evaluate(el => el.setSelectionRange(0, 0));
  const lenBefore = await ta.inputValue().then(v => v.length);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(600);
  const stillFocused = await ta.evaluate(el => el === document.activeElement);
  check('Tab keeps focus in the editor', stillFocused, 'focus left the textarea');
  const lenAfter = await ta.inputValue().then(v => v.length);
  check('Tab inserted an indent', lenAfter > lenBefore, `length ${lenBefore} → ${lenAfter}`);
  await page.keyboard.press('Shift+Tab');
  await page.waitForTimeout(600);
  eq('Shift+Tab outdented again', await ta.inputValue().then(v => v.length), lenBefore);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
  const leftAfterEscape = await ta.evaluate(el => el !== document.activeElement);
  check('Escape then Tab releases focus (no keyboard trap)', leftAfterEscape, 'focus stayed trapped');
  const describedBy = await attr('[data-testid="indent-editor"] textarea', 'aria-describedby');
  const hintText = describedBy
    ? await page.evaluate(id => { const e = document.getElementById(id.split(/\s+/).pop()); return e ? e.textContent : ''; }, describedBy)
    : '';
  check('the escape hatch is described to the user', /Escape/.test(hintText), `hint read "${hintText}"`);
  eq('tab strip emits no role=tab', await count('[data-testid="editor-tabs"] [role="tab"], [data-testid="editor-tabs"] [role="tablist"]'), 0);
  eq('exactly one open file is current', await count('[data-testid="editor-tabs"] [aria-current="true"]'), 1);
  const dirtyTab = await page.locator('[data-testid="editor-tabs"] [data-dirty="true"]').count();
  check('a dirty file is marked', dirtyTab >= 1, `${dirtyTab} dirty tabs`);
  const closeName = await attr('[data-testid="editor-tabs"] [data-slot="editor-tab-close"]', 'aria-label');
  check('close button has its own name', /^Close /.test(closeName || ''), `got ${JSON.stringify(closeName)}`);

  // ── REQ-UI-024 — LogView ────────────────────────────────────────────────────
  objRow = 'REQ-UI-024';
  console.log('\nREQ-UI-024 — LogView');
  await go('/components/log-view');
  eq('the five sample kinds render', await count('[data-testid="log-kinds-panel"] [data-slot="log-view-line"]'), 5);
  eq('a failure line is marked', await count('[data-testid="log-kinds-panel"] [data-log-kind="failure"]'), 1);
  const srWord = await text('[data-testid="log-kinds-panel"] [data-log-kind="failure"] .sr-only').catch(() => '');
  check('kind is not signalled by colour alone', /Failure/.test(srWord), `sr-only read "${srWord}"`);
  eq('the panel is a labelled region', await attr('[data-testid="log-demo-panel"]', 'role'), 'region');
  eq('the panel is not a role=log live region', await count('[data-testid="log-demo-panel"] [role="log"]'), 0);
  await page.locator('[data-testid="log-demo-burst"]').click();
  await page.waitForTimeout(2000);
  eq('after a burst the panel is still at the end', await attr('[data-testid="log-demo-panel"]', 'data-at-end'), 'true');
  const vp = '[data-testid="log-demo-panel"] [data-slot="scroll-area-viewport"]';
  const atEnd = await page.locator(vp).first().evaluate(el => el.scrollHeight - el.scrollTop - el.clientHeight);
  check('the viewport is scrolled to the newest line', atEnd <= 24, `${atEnd}px from the end`);
  const hBefore = await page.locator(vp).first().evaluate(el => Math.round(el.getBoundingClientRect().height));
  await page.locator(vp).first().evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll')); });
  await page.waitForTimeout(900);
  eq('scrolling up stops the following', await attr('[data-testid="log-demo-panel"]', 'data-at-end'), 'false');
  check('a jump-to-newest control appears',
    await count('[data-testid="log-demo-panel"] [data-slot="log-view-jump"]') >= 1, 'no jump control');
  await page.locator('[data-testid="log-demo-panel"] [data-slot="log-view-jump"]').first().click();
  await page.waitForTimeout(900);
  eq('jumping back resumes the following', await attr('[data-testid="log-demo-panel"]', 'data-at-end'), 'true');
  const hAfter = await page.locator(vp).first().evaluate(el => Math.round(el.getBoundingClientRect().height));
  eq('the panel held its height throughout', hAfter, hBefore);
  await page.locator('[data-testid="log-capped-add"]').click();
  await page.locator('[data-testid="log-capped-add"]').click();
  await page.locator('[data-testid="log-capped-add"]').click();
  await page.waitForTimeout(900);
  eq('MaxLines caps the rendered rows', await count('[data-testid="log-capped-panel"] [data-slot="log-view-line"]'), 10);
  const dropped = await text('[data-testid="log-capped-panel"] [data-slot="log-view-dropped"]').catch(() => '');
  check('dropped lines are disclosed', /earlier lines dropped/.test(dropped), `note read "${dropped}"`);

  // ── REQ-UI-025 — NavList ────────────────────────────────────────────────────
  objRow = 'REQ-UI-025';
  console.log('\nREQ-UI-025 — NavList');
  await go('/components/nav-list');
  eq('the roles list is a listbox', await attr('[data-testid="navlist-roles"]', 'role'), 'listbox');
  eq('every row is an option',
    await count('[data-testid="navlist-roles"] [role="option"]'),
    await count('[data-testid="navlist-roles"] [data-slot="nav-list-option"]'));
  eq('the list is one tab stop',
    await page.locator('[data-testid="navlist-roles"] [tabindex="0"]').count(), 1);
  const detail0 = await text('[data-testid="navlist-detail-name"]').catch(() => '');
  await page.locator('[data-testid="navlist-roles"] [data-index="0"]').click();
  await page.waitForTimeout(700);
  const detail1 = await text('[data-testid="navlist-detail-name"]').catch(() => '');
  check('clicking a row drives the detail pane', detail0 !== detail1, `"${detail0}" then "${detail1}"`);
  // arrow keys
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await page.locator('[data-testid="navlist-roles"] [data-index="0"]').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(400);
  const focusIdx = await page.evaluate(() => document.activeElement.getAttribute('data-index'));
  eq('arrow keys move between rows', focusIdx, '2');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  const detail2 = await text('[data-testid="navlist-detail-name"]').catch(() => '');
  check('the keyboard choice drives the detail pane', detail2 !== detail1, `"${detail1}" then "${detail2}"`);
  await page.keyboard.press('End');
  await page.waitForTimeout(400);
  const endIdx = await page.evaluate(() => document.activeElement.getAttribute('data-index'));
  const disabledIdx = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid="navlist-roles"] [data-slot="nav-list-option"]')];
    const i = rows.findIndex(r => r.getAttribute('aria-disabled') === 'true');
    return { disabled: i, last: rows.length - 1 };
  });
  check('End skips a disabled row', endIdx !== String(disabledIdx.last) || disabledIdx.disabled === -1,
    `End landed on ${endIdx}, disabled row is ${disabledIdx.disabled}, last is ${disabledIdx.last}`);
  const scrollAfter = await page.evaluate(() => window.scrollY);
  eq('arrow keys did not scroll the page', scrollAfter, scrollBefore);
  eq('the navigation-mode list is a nav',
    await page.locator('[data-testid="navlist-nav"]').first().evaluate(el => el.tagName), 'NAV');

  // ── console hygiene + mobile overflow ───────────────────────────────────────
  objRow = 'REQ-FN-006';
  console.log('\nCross-cutting');
  eq('no console or page errors across the run', consoleErrors.length, 0);
  if (consoleErrors.length) console.log('    ' + consoleErrors.slice(0, 5).join('\n    '));

  const mobile = await ctx.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/components/code-editor', '/components/typing', '/components/log-view', '/components/nav-list']) {
    await mobile.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await mobile.waitForTimeout(1200);
    const over = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    eq(`no horizontal overflow at 390px on ${route}`, over, 0);
  }
  await mobile.close();

  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`\n${pass}/${pass + fail} checks passed`);
  if (fail) { console.log('\nFailures:'); failures.forEach(f => console.log('  - ' + f)); }
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
