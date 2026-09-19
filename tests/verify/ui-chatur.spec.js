// Verifier spec — Chatur consumer feedback TR-001…TR-004 (docs/Chatur-TrBlazeUI-Feedback.md),
// row REQ-UI-021: ScrollArea StickToEnd, TreeView, DiffView, joined ToggleGroup.
// Self-contained plain-Playwright script; run with:
//   SMOKE_URL=http://<host>:<port> APP_LOG=tests/.artifacts/verify/app-<port>.log node tests/verify/ui-chatur.spec.js
// Gates: data-render (behaviour measured in the DOM, not assumed) and visual-truth (1280 + 390,
// no page overflow, zero console/page errors, screenshots under tests/.artifacts/chatur/).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.SMOKE_URL || 'http://localhost:5213';
const OUT = process.env.OUT_DIR || path.join(__dirname, '..', '.artifacts', 'chatur');
const APP_LOG = process.env.APP_LOG || '';

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

async function goto(page, route) {
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500); // Blazor Server circuit + first-render JS attach
}

const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

async function scrollArea(page, w) {
  await goto(page, '/components/scroll-area');
  const vp = page.locator('[data-testid=stick-to-end-area] [data-slot=scroll-area-viewport]');
  const metrics = () => vp.evaluate(v => ({ top: v.scrollTop, h: v.scrollHeight, c: v.clientHeight, gap: v.scrollHeight - v.scrollTop - v.clientHeight }));
  const add = async n => { for (let i = 0; i < n; i++) await page.click('[data-testid=stick-to-end-add]'); await page.waitForTimeout(300); };

  await add(30);
  let m = await metrics();
  check(`TR-001 ${w} root Class height bounds the viewport`, m.c <= 240 && m.h > m.c, `clientHeight=${m.c} scrollHeight=${m.h}`);
  check(`TR-001 ${w} follows new lines`, m.gap <= 2, `gap=${m.gap}`);

  await page.click('[data-testid=stick-to-end-toggle]');
  await page.waitForTimeout(1600);
  m = await metrics();
  const last = await vp.evaluate(v => v.innerText.trim().split('\n').pop());
  check(`TR-001 ${w} follows a running stream`, m.gap <= 2, `gap=${m.gap} last="${last}"`);

  await vp.evaluate(v => { v.scrollTop = 0; v.dispatchEvent(new Event('scroll')); });
  await page.waitForTimeout(1200);
  m = await metrics();
  const state1 = await page.textContent('[data-testid=stick-to-end-state]');
  check(`TR-001 ${w} reader scrolled up: view stays put while lines arrive`, m.top === 0 && m.gap > 50, `scrollTop=${m.top} gap=${m.gap}`);
  check(`TR-001 ${w} AtEndChanged(false) raised`, /Paused/.test(state1) && await page.isVisible('[data-testid=stick-to-end-jump]'), state1);

  await page.click('[data-testid=stick-to-end-jump]');
  await page.waitForTimeout(1200);
  m = await metrics();
  const state2 = await page.textContent('[data-testid=stick-to-end-state]');
  check(`TR-001 ${w} ScrollToEndAsync resumes following`, m.gap <= 2 && /Following/.test(state2), `gap=${m.gap} state=${state2}`);

  await vp.evaluate(v => { v.scrollTop = 0; v.dispatchEvent(new Event('scroll')); });
  await page.waitForTimeout(500);
  await vp.evaluate(v => { v.scrollTop = v.scrollHeight; v.dispatchEvent(new Event('scroll')); });
  await page.waitForTimeout(1200);
  m = await metrics();
  const state3 = await page.textContent('[data-testid=stick-to-end-state]');
  check(`TR-001 ${w} scrolling back to the end resumes following`, m.gap <= 2 && /Following/.test(state3), `gap=${m.gap} state=${state3}`);

  await page.click('[data-testid=stick-to-end-toggle]'); // stop
  check(`TR-001 ${w} no page overflow`, await noOverflow(page));
  await page.locator('[data-testid=stick-to-end-section]').screenshot({ path: path.join(OUT, `scroll-area-${w}.png`) });
}

async function toggleGroup(page, w) {
  await goto(page, '/components/toggle-group');
  const group = page.locator('[data-testid=view-switch]');
  const items = group.locator('[data-slot=toggle-group-item]');
  const role = await group.getAttribute('role');
  const roles = await items.evaluateAll(els => els.map(e => e.getAttribute('role') + ':' + e.getAttribute('aria-checked')));
  check(`TR-004 ${w} single choice is a radiogroup of radios`, role === 'radiogroup' && roles.join() === 'radio:true,radio:false,radio:false', `${role} ${roles}`);

  const boxes = await items.evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return { l: r.left, r: r.right, tl: s.borderTopLeftRadius, bl: s.borderLeftWidth }; }));
  const gaps = [boxes[1].l - boxes[0].r, boxes[2].l - boxes[1].r];
  const groupStyle = await group.evaluate(e => ({ radius: getComputedStyle(e).borderTopLeftRadius, border: getComputedStyle(e).borderTopWidth }));
  check(`TR-004 ${w} items drawn joined`, gaps.every(g => Math.abs(g) <= 1) && boxes[1].tl === '0px' && groupStyle.radius !== '0px' && groupStyle.border === '1px', `gaps=${gaps} innerRadius=${boxes[1].tl} group=${JSON.stringify(groupStyle)}`);
  check(`TR-004 ${w} a divider between joined items (border-l survives the class merge)`, boxes.map(b => b.bl).join() === '0px,1px,1px', boxes.map(b => b.bl).join());

  await page.click('[data-testid=view-board]');
  await page.waitForTimeout(300);
  check(`TR-004 ${w} AllowDeselect=false keeps the one choice`, (await page.getAttribute('[data-testid=view-board]', 'aria-checked')) === 'true' && /View: board/.test(await page.textContent('[data-testid=view-selected]')));

  await page.click('[data-testid=view-table]');
  await page.waitForTimeout(300);
  const after = await items.evaluateAll(els => els.map(e => e.getAttribute('aria-checked')));
  check(`TR-004 ${w} choosing another item moves the choice`, after.join() === 'false,true,false' && /View: table/.test(await page.textContent('[data-testid=view-selected]')), after.join());

  const tabStops = await items.evaluateAll(els => els.map(e => e.getAttribute('tabindex')));
  check(`TR-004 ${w} one Tab stop, on the chosen item`, tabStops.join() === '-1,0,-1', tabStops.join());

  await page.focus('[data-testid=view-table]');
  const y0 = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('ArrowRight');
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  await page.keyboard.press('ArrowDown');
  const focused2 = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  const y1 = await page.evaluate(() => window.scrollY);
  check(`TR-004 ${w} arrow keys move focus (wrapping), Space chooses, page does not scroll`,
    focused === 'view-list' && focused2 === 'view-board' && (await page.getAttribute('[data-testid=view-board]', 'aria-checked')) === 'true' && y0 === y1,
    `focus=${focused},${focused2} scrollY ${y0}->${y1}`);

  // The original single-choice group keeps its old behaviour (AllowDeselect defaults to true).
  const first = page.locator('[data-slot=toggle-group]').first().locator('[data-slot=toggle-group-item][data-state=on]');
  await first.click();
  await page.waitForTimeout(300);
  check(`TR-004 ${w} default group can still be emptied`, (await page.locator('[data-slot=toggle-group]').first().locator('[data-state=on]').count()) === 0);

  check(`TR-004 ${w} no page overflow`, await noOverflow(page));
  await page.locator('[data-testid=joined-section]').screenshot({ path: path.join(OUT, `toggle-group-${w}.png`) });
}

async function treeView(page, w) {
  await goto(page, '/components/tree-view');
  const tree = page.locator('[data-testid=tree-files]');
  const attr = (sel, a) => page.getAttribute(sel, a);
  check(`TR-002 ${w} role=tree with treeitems`, (await tree.getAttribute('role')) === 'tree' && (await tree.locator('[role=treeitem]').count()) === 6);
  check(`TR-002 ${w} initial state`, (await attr('[data-testid=tree-src]', 'aria-expanded')) === 'true'
    && (await attr('[data-testid=tree-components]', 'aria-expanded')) === 'false'
    && (await attr('[data-testid=tree-program]', 'aria-selected')) === 'true');
  const stops = await tree.locator('[role=treeitem]').evaluateAll(els => els.filter(e => e.getAttribute('tabindex') === '0').map(e => e.getAttribute('data-testid')));
  check(`TR-002 ${w} one Tab stop, on the selected row`, stops.join() === 'tree-program', stops.join());

  await page.click('[data-testid=tree-components] > [data-slot=tree-item-row]');
  await page.waitForTimeout(400);
  const selected = await page.textContent('[data-testid=tree-selected]');
  check(`TR-002 ${w} click selects and opens a branch`, (await attr('[data-testid=tree-components]', 'aria-expanded')) === 'true'
    && await page.isVisible('[data-testid=tree-diffview]') && selected.trim() === 'src/Components', selected);
  const trailing = await page.textContent('[data-testid=tree-components] > [data-slot=tree-item-row] [data-slot=tree-item-trailing]');
  const icons = await tree.locator('[data-slot=tree-item-icon] svg').count();
  check(`TR-002 ${w} icon and trailing badge per row`, trailing.trim() === '3' && icons >= 8, `badge="${trailing.trim()}" icons=${icons}`);
  const pads = await page.evaluate(() => ['tree-src', 'tree-components', 'tree-diffview'].map(id =>
    parseFloat(getComputedStyle(document.querySelector(`[data-testid=${id}] > [data-slot=tree-item-row]`)).paddingInlineStart)));
  check(`TR-002 ${w} rows indent by level`, pads[0] < pads[1] && pads[1] < pads[2], pads.join());
  const levels = await page.evaluate(() => ['tree-src', 'tree-components', 'tree-diffview'].map(id => document.querySelector(`[data-testid=${id}]`).getAttribute('aria-level')));
  check(`TR-002 ${w} aria-level`, levels.join() === '1,2,3', levels.join());

  await page.focus('[data-testid=tree-src]');
  const y0 = await page.evaluate(() => window.scrollY);
  const at = () => page.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.querySelector(':scope > [data-slot=tree-item-row] [data-slot=tree-item-label]')?.textContent.trim());
  const seq = [];
  await page.keyboard.press('ArrowDown'); seq.push(await at());             // Components
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(300);   // close Components
  const closed = await attr('[data-testid=tree-components]', 'aria-expanded');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300);  // open
  const opened = await attr('[data-testid=tree-components]', 'aria-expanded');
  await page.keyboard.press('ArrowRight'); seq.push(await at());            // first child Button.razor
  await page.keyboard.press('ArrowLeft'); seq.push(await at());             // back to parent
  await page.keyboard.press('End'); seq.push(await at());                   // README.md
  await page.keyboard.press('Home'); seq.push(await at());                  // src
  await page.keyboard.press('r'); seq.push(await at());                     // type-ahead README.md
  await page.keyboard.press('ArrowUp'); seq.push(await at());               // packages
  await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  const y1 = await page.evaluate(() => window.scrollY);
  const sel2 = (await page.textContent('[data-testid=tree-selected]')).trim();
  check(`TR-002 ${w} keyboard: arrows, Right/Left open-close-parent-child, Home/End, type-ahead, Enter selects`,
    seq.join() === 'tree-components,Button.razor,tree-components,tree-readme,tree-src,tree-readme,tree-packages'
      && closed === 'false' && opened === 'true' && sel2 === 'packages' && y0 === y1,
    `seq=${seq.join()} closed=${closed} opened=${opened} selected=${sel2} scrollY ${y0}->${y1}`);

  await page.keyboard.press('ArrowRight'); // open packages -> OnExpand loads children
  await page.waitForTimeout(250);
  const loadingShown = await page.isVisible('[data-testid=tree-packages] [data-slot=tree-item-loading]');
  const busy = await attr('[data-testid=tree-packages]', 'aria-busy');
  await page.waitForTimeout(1300);
  const kids = await page.locator('[data-testid=tree-packages] [role=group] > [role=treeitem]').count();
  const busyAfter = await attr('[data-testid=tree-packages]', 'aria-busy');
  check(`TR-002 ${w} children load on demand with a loading line`, loadingShown && busy === 'true' && kids === 3 && busyAfter === null,
    `loading=${loadingShown} busy=${busy} kids=${kids} busyAfter=${busyAfter}`);

  check(`TR-002 ${w} no page overflow`, await noOverflow(page));
  await page.locator('[data-testid=tree-files-section]').screenshot({ path: path.join(OUT, `tree-view-${w}.png`) });
}

async function diffView(page, w) {
  await goto(page, '/components/diff-view');
  const dv = page.locator('[data-testid=diff-view]');
  check(`TR-003 ${w} side by side by default`, (await dv.getAttribute('data-mode')) === 'side-by-side');
  const summary = (await dv.locator('[data-slot=diff-view-summary]').innerText()).replace(/\s+/g, ' ').trim();
  check(`TR-003 ${w} summary counts`, summary === '+3 -8', summary);
  const header = (await dv.locator('[data-slot=diff-hunk-header]').first().innerText());
  check(`TR-003 ${w} one part with its unified header`, (await dv.locator('[data-slot=diff-hunk-header]').count()) === 1 && header.includes('@@ -13,16 +13,11 @@'), header.split('\n')[0]);
  const fold = dv.locator('[data-slot=diff-fold] button');
  const foldText = (await fold.innerText()).trim();
  check(`TR-003 ${w} unchanged stretch folds`, (await fold.count()) === 1 && /Show 12 unchanged lines/.test(foldText), foldText);

  const tints = await page.evaluate(() => {
    const cell = (kind, idx) => { const r = document.querySelector(`[data-testid=diff-view] tr[data-kind=${kind}]`); return r ? getComputedStyle(r.querySelectorAll('td')[idx]).backgroundColor : null; };
    const rows = [...document.querySelectorAll('[data-testid=diff-view] tbody tr[data-kind]')];
    const signs = rows.map(r => [...r.querySelectorAll('td[aria-hidden=true]')].map(t => t.textContent.trim()).join('')).join('|');
    return { changedLeft: cell('changed', 2), changedRight: cell('changed', 5), removedOnly: cell('removed', 2), unchanged: cell('unchanged', 2), signs };
  });
  check(`TR-003 ${w} removed and added lines tinted from the theme, unchanged not`,
    tints.changedLeft && tints.changedRight && tints.changedLeft !== tints.changedRight && tints.unchanged === 'rgba(0, 0, 0, 0)' && tints.changedLeft !== 'rgba(0, 0, 0, 0)',
    JSON.stringify(tints).slice(0, 220));
  check(`TR-003 ${w} +/- signs mark changes (not colour alone)`, /-\+/.test(tints.signs) && /-/.test(tints.signs));
  const numbers = await page.evaluate(() => [...document.querySelector('[data-testid=diff-view] tr[data-kind=changed]').querySelectorAll('td')].map(t => t.textContent.trim()));
  check(`TR-003 ${w} line numbers on both sides`, numbers[0] === '16' && numbers[3] === '16', numbers.join('|').slice(0, 120));

  const rowsBefore = await dv.locator('tbody tr[data-kind]').count();
  await fold.click();
  await page.waitForTimeout(400);
  const rowsAfter = await dv.locator('tbody tr[data-kind]').count();
  check(`TR-003 ${w} a folded part opens`, rowsAfter === rowsBefore + 12 && (await dv.locator('[data-slot=diff-fold]').count()) === 0, `${rowsBefore} -> ${rowsAfter}`);

  await page.click('[data-testid=hunk-accept-0]');
  await page.waitForTimeout(300);
  const action = await page.textContent('[data-testid=diff-last-action]');
  check(`TR-003 ${w} per-part button slot receives its part`, action.includes('Accepted part 1 (@@ -13,16 +13,11 @@)'), action);

  await page.click('[data-testid=diff-mode-inline]');
  await page.waitForTimeout(400);
  const inlineCols = await page.evaluate(() => [...document.querySelectorAll('[data-testid=diff-view] tbody tr[data-kind]')].map(r => r.querySelectorAll('td').length));
  const inlineKinds = await page.evaluate(() => [...document.querySelectorAll('[data-testid=diff-view] tbody tr[data-kind]')].map(r => r.dataset.kind[0]).join(''));
  check(`TR-003 ${w} inline layout`, (await dv.getAttribute('data-mode')) === 'inline' && inlineCols.every(c => c === 4) && /r{6}a/.test(inlineKinds),
    `cols=${[...new Set(inlineCols)]} kinds=${inlineKinds}`);

  const empty = (await page.textContent('[data-testid=diff-empty] [data-slot=diff-view-empty]')).trim();
  check(`TR-003 ${w} same texts say so`, empty === 'No differences', empty);
  check(`TR-003 ${w} no page overflow`, await noOverflow(page));
  await page.locator('[data-testid=diff-section]').screenshot({ path: path.join(OUT, `diff-view-${w}.png`) });
}

// The class-merge fix behind the ToggleGroup divider also restores side borders other components
// always asked for: Timeline's rail is `border-s border-border`, and measured 0px before the fix.
async function classMerge(page, w) {
  await goto(page, '/components/timeline');
  const rail = await page.$eval('ol', e => getComputedStyle(e).borderInlineStartWidth);
  check(`class-merge ${w} Timeline rail (border-s) renders`, rail === '1px', rail);

  // The AI reference's own examples, compiled as written on /verify-chatur, also render and work.
  await goto(page, '/verify-chatur');
  const parts = await page.evaluate(() => ({
    tree: document.querySelectorAll('[role=tree] [role=treeitem]').length,
    radios: document.querySelectorAll('[role=radiogroup] [role=radio]').length,
    diff: document.querySelector('[data-slot=diff-hunk-header]')?.textContent.includes('@@ -1,3 +1,3 @@'),
    log: !!document.querySelector('[data-slot=scroll-area-viewport][data-at-end=true]'),
  }));
  check(`reference ${w} examples render as written`, parts.tree === 3 && parts.radios === 2 && parts.diff && parts.log, JSON.stringify(parts));
  const vw = await page.evaluate(() => document.querySelector('[data-slot=diff-view] .overflow-x-auto').scrollWidth > document.querySelector('[data-slot=diff-view] .overflow-x-auto').clientWidth);
  check(`reference ${w} side by side scrolls inside its frame on a phone, not the page`, (w === 390 ? vw : !vw) && await noOverflow(page), `innerScroll=${vw}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const logStart = APP_LOG && fs.existsSync(APP_LOG) ? fs.statSync(APP_LOG).size : 0;
  const browser = await chromium.launch();
  for (const w of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    for (const [name, fn] of [['scroll-area', scrollArea], ['toggle-group', toggleGroup], ['tree-view', treeView], ['diff-view', diffView], ['class-merge', classMerge]]) {
      try { await fn(page, w); } catch (e) { check(`${name} ${w} ran`, false, String(e).split('\n')[0]); }
    }
    check(`console ${w} zero errors`, errors.length === 0, errors.join(' || ').slice(0, 300));
    await page.close();
  }
  await browser.close();

  if (APP_LOG && fs.existsSync(APP_LOG)) {
    const tail = fs.readFileSync(APP_LOG, 'utf8').slice(logStart);
    const bad = tail.split('\n').filter(l => /fail:|Unhandled|Exception/.test(l));
    check('app log: no exceptions during the run', bad.length === 0, bad.slice(0, 3).join(' || ').slice(0, 300));
  }

  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} passed`);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  process.exit(passed === results.length ? 0 : 1);
})();
