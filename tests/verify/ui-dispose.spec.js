// REQ-UI-028 — no control reports an unhandled error when its page stops answering during dispose.
//
// The defect Chatur reported on ToggleGroup (TR-013) was one instance of a pattern: a control's
// DisposeAsync calls the browser, the page has closed or reloaded, the call is never answered, the
// server cancels it after its one-minute limit, and the TaskCanceledException escapes as
// "Unhandled exception rendering component". This script makes every demo page do exactly that:
// it opens the page (and, where the page has one, an overlay), stops the page answering browser
// calls, leaves the page inside the app so the server disposes its controls, waits past the limit
// and reads the server log. A control named in a DisposeAsync frame there has the defect.
//
// Run: SMOKE_URL=http://localhost:PORT node tests/verify/ui-dispose.spec.js
//      APP_LOG=<the server log> is read from tests/.artifacts/verify/ when it is not given.
//      ROUTES=/components/nav-list,/components/tree-view limits the run to those pages.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.SMOKE_URL;
if (!BASE) { console.error('SMOKE_URL is not set'); process.exit(2); }
const OUT = process.env.OUT_DIR || path.join(process.cwd(), 'tests', '.artifacts', 'dispose');
fs.mkdirSync(OUT, { recursive: true });
const WAIT_MS = Number(process.env.DISPOSE_WAIT_MS || 72000);
const BATCH = Number(process.env.DISPOSE_BATCH || 62);
// Where every page is sent: a page whose own first render calls no script module.
const AWAY = '/components/badge';

const findAppLog = () => {
  if (process.env.APP_LOG) return process.env.APP_LOG;
  const vDir = path.join(process.cwd(), 'tests', '.artifacts', 'verify');
  const vKeyed = path.join(vDir, `app-${new URL(BASE).port}.log`);
  if (fs.existsSync(vKeyed)) return vKeyed;
  try {
    const vBoot = JSON.parse(fs.readFileSync(path.join(vDir, 'boot.json'), 'utf8'));
    if (vBoot.url === BASE && vBoot.log) return path.join(process.cwd(), vBoot.log);
  } catch { /* no boot record: reported below */ }
  return '';
};
const APP_LOG = findAppLog();

// Every route the demo serves, read from the pages themselves so a new page is covered
// without editing this file.
const allRoutes = () => {
  const vRoot = path.join(process.cwd(), 'demos', 'TrBlazeUI.Demo.Shared', 'Pages');
  const vFound = new Set();
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.razor')) {
        for (const m of fs.readFileSync(p, 'utf8').matchAll(/^@page\s+"([^"{]+)"/gm)) vFound.add(m[1]);
      }
    }
  };
  walk(vRoot);
  return [...vFound].filter(r => r !== AWAY).sort();
};

// Pages whose script-using part only exists while an overlay is open: open one first.
// The trigger is the first button in the page's own content that announces a popup (or, where the
// page's triggers announce none, the first one that says "Open"); the page chrome is skipped.
const openFirst = async (p, aOptions) => {
  const vFound = await p.evaluate(aOnlyText => {
    const vAll = [...document.querySelectorAll('main button, main [role="combobox"]')]
      .filter(e => !e.closest('[data-slot*="sidebar"], header, aside') && !e.disabled);
    const vPick = (aOnlyText ? null : vAll.find(e => e.hasAttribute('aria-haspopup')))
      || vAll.find(e => /^(open|show)\b/i.test((e.textContent || '').trim()));
    if (!vPick) return false;
    vPick.setAttribute('data-probe-target', '');
    return true;
  }, !!(aOptions && aOptions.byText));
  if (!vFound) throw new Error('no trigger found');
  await p.locator('[data-probe-target]').first().click(aOptions && aOptions.right ? { button: 'right' } : {});
};
const OPENERS = {
  '/components/dialog': openFirst,
  '/components/alert-dialog': openFirst,
  '/components/sheet': openFirst,
  '/components/drawer': p => openFirst(p, { byText: true }),
  '/components/popover': openFirst,
  '/components/dropdown-menu': openFirst,
  '/components/select': openFirst,
  '/components/combobox': openFirst,
  '/components/multiselect': openFirst,
  '/components/date-picker': openFirst,
  '/components/menubar': p => p.locator('main [role="menubar"] button, main [role="menubar"] [role="menuitem"]').first().click(),
  '/components/navigation-menu': p => p.locator('main nav button').first().click(),
  '/components/context-menu': p => p.locator('main [data-slot="context-menu-trigger"], main .border-dashed').first().click({ button: 'right' }),
  '/primitives/dialog': openFirst,
  '/primitives/sheet': openFirst,
  '/primitives/popover': openFirst,
  '/primitives/dropdown-menu': openFirst,
  '/primitives/select': openFirst,
};

const results = [];
const check = (name, ok, detail) => {
  results.push({ id: `REQ-UI-028 ${name}`, pass: !!ok, detail: ok ? undefined : String(detail) });
  console.log(ok ? `  ok   ${name}` : `  FAIL ${name} — ${detail}`);
};

// Stop the page answering browser calls from the server, and nothing else: its own events (the
// navigation that follows) still go out, so the circuit stays up and the server disposes the
// page's controls into silence. The reply's target name travels as plain bytes in the message.
const STOP_ANSWERING = () => {
  const vSend = WebSocket.prototype.send;
  window.__droppedReplies = 0;
  WebSocket.prototype.send = function (aData) {
    try {
      const vBytes = typeof aData === 'string' ? null : new Uint8Array(aData.buffer || aData);
      const vText = vBytes ? new TextDecoder('latin1').decode(vBytes) : aData;
      if (vText.includes('EndInvokeJSFromDotNet')) { window.__droppedReplies++; return; }
    } catch { /* not a message this patch understands: let it through */ }
    return vSend.call(this, aData);
  };
};

async function leaveSilently(ctx, route) {
  const page = await ctx.newPage();
  const info = { route, opened: null, dropped: 0, left: false, error: null };
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1500);
    if (OPENERS[route]) {
      try {
        await OPENERS[route](page);
        await page.waitForTimeout(900);
        info.opened = await page.locator('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [data-state="open"]:not(button)').count() > 0;
      } catch (e) { info.opened = false; info.openError = String(e).split('\n')[0].slice(0, 120); }
    }
    await page.evaluate(STOP_ANSWERING);
    await page.evaluate(aTo => Blazor.navigateTo(aTo), AWAY);
    await page.waitForTimeout(2500);
    info.left = page.url().endsWith(AWAY);
    info.dropped = await page.evaluate(() => window.__droppedReplies);
  } catch (e) { info.error = String(e).split('\n')[0].slice(0, 160); }
  return { page, info };
}

// One log entry per unhandled error: the first TrBlazeUI frame says which control and which method.
// An entry with no TrBlazeUI frame at all was thrown by the framework's own component (its
// Virtualize has this same defect); the library cannot catch that, so it is counted apart.
function offenders(aTail) {
  const vOut = [];
  const vBlocks = aTail.split(/\n(?=\w+: )/);
  for (const b of vBlocks) {
    if (!/Unhandled exception rendering component/.test(b)) continue;
    const m = b.match(/at (TrBlazeUI\.[\w.]+?)(?:`\d+)?\.(?:<)?(\w+)(?:>d__\d+\.MoveNext)?\(/);
    if (m) { vOut.push(`${m[1].replace(/^TrBlazeUI\.(Components|Primitives)\./, '')}.${m[2]}`); continue; }
    const f = b.match(/at (Microsoft\.AspNetCore\.Components\.Web\.[\w.]+?)(?:`\d+)?\.(\w+)\(/);
    vOut.push(f ? `framework:${f[1].split('.').pop()}.${f[2]}` : 'unknown frame');
  }
  return vOut;
}

(async () => {
  if (!APP_LOG || !fs.existsSync(APP_LOG)) {
    check('the server log can be read', false, `no log found for ${BASE} (set APP_LOG)`);
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
    process.exit(1);
  }
  const routes = process.env.ROUTES ? process.env.ROUTES.split(',') : allRoutes();
  const start = fs.statSync(APP_LOG).size;
  const browser = await chromium.launch();
  const infos = [];

  for (let i = 0; i < routes.length; i += BATCH) {
    const batch = routes.slice(i, i + BATCH);
    console.log(`\nbatch ${i / BATCH + 1}: ${batch.length} page(s)`);
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const opened = [];
    // A few at a time: forty first renders at once would starve each other.
    for (let j = 0; j < batch.length; j += 6) {
      opened.push(...await Promise.all(batch.slice(j, j + 6).map(r => leaveSilently(ctx, r))));
    }
    infos.push(...opened.map(o => o.info));
    // Past the server's one-minute limit on an unanswered call, with room to write the log.
    await opened[0].page.waitForTimeout(WAIT_MS);
    await ctx.close();
  }
  await browser.close();
  await new Promise(r => setTimeout(r, 3000));

  const tail = fs.readFileSync(APP_LOG, 'utf8').slice(start);
  fs.writeFileSync(path.join(OUT, 'app-log-tail.txt'), tail);
  const all = offenders(tail);
  const counts = {};
  for (const o of all) counts[o] = (counts[o] || 0) + 1;
  const framework = Object.keys(counts).filter(k => k.startsWith('framework:')).sort();
  const own = Object.keys(counts).filter(k => !k.startsWith('framework:'));
  const dispose = own.filter(k => /\.Dispose(Async)?$/.test(k)).sort();
  const other = own.filter(k => !/\.Dispose(Async)?$/.test(k)).sort();
  if (framework.length) console.log('thrown by the framework\'s own components, not by this library:', framework.map(k => `${k} ×${counts[k]}`).join(', '));

  const failed = infos.filter(x => x.error || !x.left);
  const silent = infos.filter(x => !x.error && x.left);
  const withReplies = silent.filter(x => x.dropped > 0);
  const overlays = infos.filter(x => x.opened !== null);
  console.log(`\npages: ${infos.length} · left silently: ${silent.length} · server calls left unanswered on: ${withReplies.length} · overlays opened: ${overlays.filter(x => x.opened).length}/${overlays.length}`);
  console.log('unhandled, by first frame:', JSON.stringify(counts, null, 1));

  check('every demo page was opened and left inside the app', failed.length === 0,
    failed.slice(0, 5).map(x => `${x.route}: ${x.error || 'did not leave'}`).join(' || '));
  check('the server made calls that went unanswered, so the limit was really reached', withReplies.length >= Math.min(10, silent.length),
    `only ${withReplies.length} page(s) had an unanswered call`);
  check('an overlay was open on the pages that have one', overlays.filter(x => x.opened).length >= Math.ceil(overlays.length * 0.7),
    overlays.filter(x => !x.opened).map(x => `${x.route}${x.openError ? ` (${x.openError})` : ''}`).join(', '));
  check('no control lets a cancelled call escape from its dispose', dispose.length === 0,
    dispose.map(k => `${k} ×${counts[k]}`).join(', '));
  check('no control lets a cancelled call escape anywhere else', other.length === 0,
    other.map(k => `${k} ×${counts[k]}`).join(', '));

  fs.writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify({ infos, counts }, null, 1));
  const passed = results.filter(r => r.pass).length;
  console.log(`\n${passed}/${results.length} passed`);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  process.exit(passed === results.length ? 0 : 1);
})();
