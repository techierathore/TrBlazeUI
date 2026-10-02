// Chatur consumer-feedback batch 3 (docs/Chatur-TrBlazeUI-Feedback.md, TR-011 to TR-013, filed
// 2026-09-30 and 2026-10-01). Covers REQ-UI-026 (DataTable part attributes), REQ-UI-027
// (ToggleGroup OnVariant) and the TR-013 defect on REQ-UI-021 (ToggleGroup dispose).
// Run: SMOKE_URL=http://localhost:PORT node tests/verify/ui-chatur-3.spec.js
//      APP_LOG=<the server log> is read from tests/.artifacts/verify/ when it is not given.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.SMOKE_URL;
if (!BASE) { console.error('SMOKE_URL is not set'); process.exit(2); }
const OUT = process.env.OUT_DIR || path.join(process.cwd(), 'tests', '.artifacts', 'chatur-3');
fs.mkdirSync(OUT, { recursive: true });

// The server log is the only place TR-013 shows: the browser has gone by the time it is written.
const findAppLog = () => {
  if (process.env.APP_LOG) return process.env.APP_LOG;
  const vDir = path.join(process.cwd(), 'tests', '.artifacts', 'verify');
  const vPort = new URL(BASE).port;
  const vKeyed = path.join(vDir, `app-${vPort}.log`);
  if (fs.existsSync(vKeyed)) return vKeyed;
  try {
    const vBoot = JSON.parse(fs.readFileSync(path.join(vDir, 'boot.json'), 'utf8'));
    if (vBoot.url === BASE && vBoot.log) return path.join(process.cwd(), vBoot.log);
  } catch { /* no boot record: the check below reports the log as unreadable */ }
  return '';
};
const APP_LOG = findAppLog();

// Every check is tagged with the checklist row it grades, so tf-verify-tests.sh can map the
// results back to a row through the .ts wrapper (tests/verify/req-ui-026.spec.ts).
let objRow = 'REQ-UI-000';
const results = [];
const check = (name, ok, detail) => {
  results.push({ id: `${objRow} ${name}`, pass: !!ok, detail: ok ? undefined : String(detail) });
  console.log(ok ? `  ok   ${name}` : `  FAIL ${name} — ${detail}`);
};
const eq = (name, actual, expected) =>
  check(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);

const noOverflow = page =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function dataTable(page, w) {
  objRow = 'REQ-UI-026';
  console.log(`\nREQ-UI-026 — DataTable part attributes @${w}`);
  await page.goto(`${BASE}/components/datatable`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);

  const paged = '[data-testid="req-ui-026-paged"]';
  const single = '[data-testid="req-ui-026-single"]';

  // Body rows: one hook per row, built from the row's own item.
  const rows = await page.evaluate(sel => [...document.querySelectorAll(`${sel} tbody tr`)].map(r => ({
    id: r.getAttribute('data-testid'), cls: r.className, role: r.getAttribute('role'),
    selected: r.getAttribute('aria-selected'), cells: r.querySelectorAll('td').length,
    text: r.innerText.trim().length,
  })), paged);
  eq(`${w} paged grid renders one page of rows`, rows.length, 5);
  check(`${w} every body row carries its own hook from RowAttributes`,
    rows.length > 0 && rows.every(r => /^person-row-\d+$/.test(r.id || '')) && new Set(rows.map(r => r.id)).size === rows.length,
    JSON.stringify(rows.map(r => r.id)));
  check(`${w} a class entry is added to the row's own classes, not swapped for them`,
    rows.every(r => r.cls.includes('font-medium') && r.cls.includes('border-b')), rows[0] && rows[0].cls);
  check(`${w} the row keeps its role, selection state and data`,
    rows.every(r => r.role === 'row' && r.selected === 'false' && r.cells === 3 && r.text > 0), JSON.stringify(rows[0]));

  // Header row.
  eq(`${w} the header row carries its hook from HeaderRowAttributes`,
    await page.locator(`${paged} thead tr[data-testid="people-head"]`).count(), 1);
  eq(`${w} the hook is on the header row only, not on a body row`,
    await page.locator(`${paged} tbody tr[data-testid="people-head"]`).count(), 0);
  const headCls = await page.locator(`${single} thead tr[data-testid="comments-head"]`).first().getAttribute('class').catch(() => null);
  check(`${w} a class entry on the header row is merged with its own classes`,
    !!headCls && headCls.includes('bg-muted') && headCls.includes('border-b'), headCls);

  // Choose-all, paged: the control the user operates is the menu button.
  const all = page.locator(`${paged} [data-testid="people-choose-all"]`);
  eq(`${w} paged: SelectAllAttributes lands on exactly one control`, await all.count(), 1);
  const allInfo = await all.first().evaluate(el => ({
    tag: el.tagName, slot: el.getAttribute('data-slot'), name: el.getAttribute('aria-label'),
    inWrapper: !!el.closest('[data-slot="datatable-select-all"]'), inHead: !!el.closest('thead'),
  })).catch(e => ({ error: String(e) }));
  check(`${w} paged: it is the menu button, still carrying the grid's own slot and state-carrying name`,
    allInfo.tag === 'BUTTON' && allInfo.slot === 'datatable-select-all-trigger' && /No rows selected, 500 in all/.test(allInfo.name || '') && allInfo.inWrapper && allInfo.inHead,
    JSON.stringify(allInfo));
  await all.first().click();
  await page.getByRole('menuitem', { name: /Select all on this page/ }).click();
  await page.waitForTimeout(600);
  const afterPick = await page.evaluate(sel => ({
    selected: [...document.querySelectorAll(`${sel} tbody tr`)].filter(r => r.getAttribute('aria-selected') === 'true').length,
    hooks: [...document.querySelectorAll(`${sel} tbody tr`)].filter(r => /^person-row-\d+$/.test(r.getAttribute('data-testid') || '')).length,
    name: document.querySelector(`${sel} [data-testid="people-choose-all"]`)?.getAttribute('aria-label'),
  }), paged);
  check(`${w} paged: the hooked control still selects the page and reports it`,
    afterPick.selected === 5 && afterPick.hooks === 5 && /^5 of 500 rows selected/.test(afterPick.name || ''), JSON.stringify(afterPick));
  const firstBefore = rows[0] && rows[0].id;
  await page.locator(`${paged} :is(a, button):has-text("Next")`).first().click();
  await page.waitForTimeout(700);
  const page2 = await page.evaluate(sel => [...document.querySelectorAll(`${sel} tbody tr`)].map(r => r.getAttribute('data-testid')), paged);
  check(`${w} paged: the next page's rows carry their own hooks`,
    page2.length === 5 && page2.every(i => /^person-row-\d+$/.test(i || '')) && page2[0] !== firstBefore, JSON.stringify(page2));

  // Choose-all, one page: the control is the plain checkbox.
  const one = page.locator(`${single} [data-testid="comments-choose-all"]`);
  eq(`${w} one page: SelectAllAttributes lands on exactly one control`, await one.count(), 1);
  const oneInfo = await one.first().evaluate(el => ({
    role: el.getAttribute('role'), name: el.getAttribute('aria-label'), checked: el.getAttribute('aria-checked'),
    inWrapper: !!el.closest('[data-slot="datatable-select-all"]'),
  })).catch(e => ({ error: String(e) }));
  check(`${w} one page: it is the checkbox, with its name and inside the fixed wrapper`,
    oneInfo.role === 'checkbox' && oneInfo.name === 'Select all rows' && oneInfo.checked === 'false' && oneInfo.inWrapper, JSON.stringify(oneInfo));
  await one.first().click();
  await page.waitForTimeout(600);
  const oneAfter = await page.evaluate(sel => ({
    checked: document.querySelector(`${sel} [data-testid="comments-choose-all"]`)?.getAttribute('aria-checked'),
    rows: [...document.querySelectorAll(`${sel} tbody tr`)].map(r => `${r.getAttribute('data-testid')}:${r.getAttribute('aria-selected')}`),
  }), single);
  check(`${w} one page: the hooked checkbox selects every row, each still carrying its hook`,
    oneAfter.checked === 'true' && oneAfter.rows.length === 3 && oneAfter.rows.every(r => /^comment-row-\w+:true$/.test(r)), JSON.stringify(oneAfter));

  // The fixed hook, and grids that pass nothing.
  const fixed = await page.evaluate(() => {
    const wrappers = [...document.querySelectorAll('[data-slot="datatable-select-all"]')];
    return {
      wrappers: wrappers.length,
      eachHoldsOneControl: wrappers.every(x => x.querySelectorAll('button').length === 1),
      plainGridRowHooks: document.querySelectorAll('[data-testid="req-ui-005-grid"] tbody tr[data-testid]').length,
      plainGridHeadHooks: document.querySelectorAll('[data-testid="req-ui-005-grid"] thead tr[data-testid]').length,
      plainGridRows: document.querySelectorAll('[data-testid="req-ui-005-grid"] tbody tr').length,
    };
  });
  check(`${w} every choose-all control sits in the fixed data-slot="datatable-select-all" wrapper`,
    fixed.wrappers >= 4 && fixed.eachHoldsOneControl, JSON.stringify(fixed));
  check(`${w} a grid that passes none of the three is unchanged`,
    fixed.plainGridRows === 5 && fixed.plainGridRowHooks === 0 && fixed.plainGridHeadHooks === 0, JSON.stringify(fixed));

  eq(`${w} no sideways scroll on the DataTable screen`, await noOverflow(page), 0);
  await page.locator('[data-testid="req-ui-026"]').screenshot({ path: path.join(OUT, `datatable-attributes-${w}.png`) });
}

async function toggleGroup(page, w) {
  objRow = 'REQ-UI-027';
  console.log(`\nREQ-UI-027 — ToggleGroup OnVariant @${w}`);
  await page.goto(`${BASE}/components/toggle-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  // The items fade between colours. A reading taken part-way through a fade is neither the old
  // colour nor the new one, so the colours are read with the fades switched off.
  await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });

  const measure = () => page.evaluate(() => {
    const probe = document.createElement('div');
    document.body.appendChild(probe);
    const tok = n => { probe.style.backgroundColor = `var(${n})`; return getComputedStyle(probe).backgroundColor; };
    const tokens = {};
    for (const n of ['--accent', '--accent-foreground', '--card', '--card-foreground', '--primary', '--primary-foreground', '--muted'])
      tokens[n] = tok(n);
    probe.remove();
    const group = id => {
      const g = document.querySelector(`[data-testid="${id}"]`);
      const on = g?.querySelector('[data-slot=toggle-group-item][data-state=on]');
      const off = g?.querySelector('[data-slot=toggle-group-item][data-state=off]');
      const cs = el => el ? getComputedStyle(el) : null;
      return {
        onText: on?.textContent.trim(), onBg: cs(on)?.backgroundColor, onColor: cs(on)?.color,
        offBg: cs(off)?.backgroundColor, track: cs(g)?.backgroundColor,
      };
    };
    return { tokens, accent: group('on-accent'), card: group('on-card'), primary: group('on-primary'), legacy: group('view-switch') };
  });

  for (const mode of ['light', 'dark']) {
    await page.evaluate(m => document.documentElement.classList.toggle('dark', m === 'dark'), mode);
    await page.waitForTimeout(400);
    const m = await measure();
    const t = m.tokens;
    check(`${w} ${mode}: a group that sets nothing keeps the accent look`,
      m.accent.onBg === t['--accent'] && m.accent.onColor === t['--accent-foreground'] && m.legacy.onBg === t['--accent'],
      JSON.stringify({ accent: m.accent, legacy: m.legacy.onBg, token: t['--accent'] }));
    check(`${w} ${mode}: OnVariant="Card" paints the chosen item with the card colour and its text colour`,
      m.card.onBg === t['--card'] && m.card.onColor === t['--card-foreground'],
      JSON.stringify({ card: m.card, token: t['--card'], text: t['--card-foreground'] }));
    check(`${w} ${mode}: OnVariant="Primary" paints the chosen item with the primary colour and its text colour`,
      m.primary.onBg === t['--primary'] && m.primary.onColor === t['--primary-foreground'],
      JSON.stringify({ primary: m.primary, token: t['--primary'], text: t['--primary-foreground'] }));
    check(`${w} ${mode}: an item that is not chosen stays clear, on the group's own track`,
      /rgba\(0, 0, 0, 0\)|transparent/.test(m.card.offBg || '') && m.card.track === t['--muted'] && /rgba\(0, 0, 0, 0\)|transparent/.test(m.primary.offBg || ''),
      JSON.stringify({ off: m.card.offBg, track: m.card.track, muted: t['--muted'] }));
    if (mode === 'light') {
      check(`${w} the three looks are three different colours on this theme`,
        new Set([m.accent.onBg, m.card.onBg, m.primary.onBg]).size === 3, JSON.stringify([m.accent.onBg, m.card.onBg, m.primary.onBg]));
      await page.locator('[data-testid="on-variant-section"]').screenshot({ path: path.join(OUT, `toggle-on-variant-${w}.png`) });
    } else {
      await page.locator('[data-testid="on-variant-section"]').screenshot({ path: path.join(OUT, `toggle-on-variant-${w}-dark.png`) });
    }
  }
  await page.evaluate(() => document.documentElement.classList.remove('dark'));

  // The look follows the choice, and holds under the pointer.
  await page.locator('[data-testid="on-card"] [data-slot=toggle-group-item][data-state=off]').click();
  await page.waitForTimeout(500);
  const moved = await measure();
  check(`${w} choosing the other item moves the card look to it`,
    moved.card.onText === 'Automatic' && moved.card.onBg === moved.tokens['--card'] && /rgba\(0, 0, 0, 0\)|transparent/.test(moved.card.offBg || ''),
    JSON.stringify(moved.card));
  if (w >= 1000) {
    await page.locator('[data-testid="on-primary"] [data-slot=toggle-group-item][data-state=on]').hover();
    await page.waitForTimeout(400);
    const hovered = await measure();
    check(`${w} the chosen item keeps its look under the pointer`,
      hovered.primary.onBg === hovered.tokens['--primary'] && hovered.primary.onColor === hovered.tokens['--primary-foreground'],
      JSON.stringify(hovered.primary));
    await page.mouse.move(0, 0);
  }
  eq(`${w} no sideways scroll on the Toggle Group screen`, await noOverflow(page), 0);
}

// TR-013. A ToggleGroup's dispose makes two calls to the browser: "detach", then the dispose of
// its script module. When the page closes or reloads between them the second call is never
// answered, and the server cancels it after its one-minute limit. That cancellation used to
// escape as "Unhandled exception rendering component: A task was canceled". The page is made to
// stop answering exactly there, which is what a closing page does, and the server log is read.
async function toggleGroupDispose(browser) {
  objRow = 'REQ-UI-021';
  console.log('\nREQ-UI-021 — TR-013 ToggleGroup dispose');
  if (!APP_LOG || !fs.existsSync(APP_LOG)) {
    check('TR-013 the server log can be read', false, `no log found for ${BASE} (set APP_LOG)`);
    return;
  }
  const start = fs.statSync(APP_LOG).size;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/components/toggle-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const groups = await page.locator('[data-slot=toggle-group]').count();
  const patched = await page.evaluate(() => {
    if (!window.DotNet || typeof window.DotNet.disposeJSObjectReferenceById !== 'function') return false;
    window.__moduleDisposeCalls = 0;
    window.DotNet.disposeJSObjectReferenceById = () => { window.__moduleDisposeCalls++; return new Promise(() => {}); };
    return true;
  });
  check('TR-013 the page can be made to stop answering the module dispose', patched, 'DotNet.disposeJSObjectReferenceById not found');
  await page.evaluate(() => Blazor.navigateTo('/components/toggle'));
  await page.waitForTimeout(1500);
  const calls = await page.evaluate(() => window.__moduleDisposeCalls);
  check('TR-013 leaving the page disposes every ToggleGroup and each reaches its module dispose',
    page.url().endsWith('/components/toggle') && groups > 0 && calls >= groups, `groups=${groups} unanswered dispose calls=${calls} url=${page.url()}`);

  // The plainer form of the same thing: leave the page inside the app and close the tab at once.
  for (let i = 0; i < 6; i++) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/components/toggle-group`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    p.evaluate(() => Blazor.navigateTo('/components/toggle')).catch(() => {});
    await p.waitForTimeout(i * 4);
    await p.close();
  }

  // Past the server's one-minute limit on an unanswered call, with room to write the log.
  await page.waitForTimeout(Number(process.env.TR013_WAIT_MS || 72000));
  const tail = fs.readFileSync(APP_LOG, 'utf8').slice(start);
  const lines = tail.split('\n');
  const unhandled = lines.filter(l => /Unhandled exception/.test(l));
  const canceled = lines.filter(l => /task was canceled|TaskCanceledException/i.test(l));
  const named = lines.filter(l => /ToggleGroup/.test(l));
  check('TR-013 the server log holds no unhandled error after the page stopped answering',
    unhandled.length === 0, `${unhandled.length} line(s): ${unhandled.slice(0, 2).join(' || ').slice(0, 240)}`);
  check('TR-013 no cancelled-task error is reported', canceled.length === 0, `${canceled.length} line(s)`);
  check('TR-013 nothing in the log names ToggleGroup', named.length === 0, named.slice(0, 2).join(' || ').slice(0, 240));
  // The circuit is still alive after the cancelled calls: the page that stayed open still works.
  await page.goto(`${BASE}/components/toggle-group`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.locator('[data-testid="view-table"]').click();
  await page.waitForTimeout(500);
  const view = await page.locator('[data-testid="view-selected"]').innerText().catch(() => '');
  check('TR-013 a ToggleGroup still works afterwards', /View: table/.test(view), view);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const w of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    for (const [name, fn, row] of [['datatable', dataTable, 'REQ-UI-026'], ['toggle-group', toggleGroup, 'REQ-UI-027']]) {
      const before = errors.length;
      try { await fn(page, w); } catch (e) { objRow = row; check(`${w} ${name} ran`, false, String(e).split('\n')[0]); }
      objRow = row;
      check(`${w} ${name}: zero console errors`, errors.length === before, errors.slice(before).join(' || ').slice(0, 300));
    }
    await page.close();
  }
  try { await toggleGroupDispose(browser); }
  catch (e) { objRow = 'REQ-UI-021'; check('TR-013 dispose check ran', false, String(e).split('\n')[0]); }
  await browser.close();

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} passed`);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  process.exit(passed === results.length ? 0 : 1);
})();
