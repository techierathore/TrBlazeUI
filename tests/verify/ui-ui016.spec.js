// REQ-UI-016 verifier spec — AstroLyfe UAT-2/3 feedback TR-010/011/012.
// Self-contained plain-Playwright script (repo has no @playwright/test harness); run with:
//   SMOKE_URL=http://<host>:<port> node tests/verify/ui-ui016.spec.js
// Gates: §4a data-render (tables actually render their rows), the three TR acceptance
// criteria, and §4b visual-truth (desktop + mobile screenshots, no page overflow).
const { chromium } = require('playwright');

const BASE = process.env.SMOKE_URL || 'http://localhost:5213';
const URL = BASE + '/verify-ui016';
const OUT = process.env.OUT_DIR || __dirname + '/../../test-results';

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

// Opens the tall dialog at the given viewport and measures where it actually lands.
async function measureDialog(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.click('[data-testid="tr011-open"]');
  await page.waitForSelector('[data-testid="tr011-content"]', { timeout: 10000 });
  await page.waitForTimeout(400); // open animation
  const box = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="tr011-content"]');
    const title = document.querySelector('[data-testid="tr011-title"]');
    const cs = getComputedStyle(el);
    return {
      top: el.getBoundingClientRect().top,
      bottom: el.getBoundingClientRect().bottom,
      titleTop: title ? title.getBoundingClientRect().top : null,
      maxHeight: cs.maxHeight,
      overflowY: cs.overflowY,
    };
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  return box;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newContext({ viewport: { width: 1366, height: 720 } }).then(c => c.newPage());
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  check('http-200', resp && resp.status() === 200, 'status=' + (resp && resp.status()));
  await page.waitForSelector('[data-testid="verify-heading"]', { timeout: 15000 });
  await page.waitForTimeout(1500); // Blazor Server circuit connect

  // ---- §4a render gate: the tables must actually paint their rows ----
  const bareRows = await page.locator('[data-testid="tr010-bare"] tbody tr').count();
  check('render-bare-rows', bareRows === 3, `bare table tbody rows=${bareRows} (expect 3)`);
  const pagedRows = await page.locator('[data-testid="tr010-paged"] tbody tr').count();
  check('render-paged-rows', pagedRows === 5, `paged table page-1 rows=${pagedRows} (expect 5 of 12)`);

  // ---- TR-010: bare table = no toolbar, no pagination ----
  const bareSearch = await page.locator('[data-testid="tr010-bare"] input[type="search"], [data-testid="tr010-bare"] input[placeholder*="Search" i]').count();
  check('tr010-no-toolbar', bareSearch === 0, `bare table search inputs=${bareSearch} (expect 0)`);
  const bareText = await page.locator('[data-testid="tr010-bare"]').innerText();
  check('tr010-no-pagination', !/Rows per page|Page \d+ of \d+/i.test(bareText),
    'bare table pagination chrome absent: ' + JSON.stringify(bareText.slice(-60)));

  // ---- TR-010: >PageSize rows still paginate ----
  const pagedText = await page.locator('[data-testid="tr010-paged"]').innerText();
  check('tr010-paginates-when-needed', /Page 1 of 3/i.test(pagedText),
    '12 rows @PageSize 5 shows "Page 1 of 3"');

  // ---- TR-010: toolbar remains available on opt-in ----
  const optInSearch = await page.locator('[data-testid="tr010-optin"] input[placeholder*="Search" i]').count();
  check('tr010-toolbar-optin', optInSearch === 1, `ShowToolbar="true" search inputs=${optInSearch} (expect 1)`);

  // ---- TR-011: tall dialog clamped inside the viewport at both reported sizes ----
  for (const [w, h] of [[1366, 720], [1280, 600]]) {
    const box = await measureDialog(page, w, h);
    check(`tr011-top-onscreen-${w}x${h}`, box.top >= 0,
      `dialog top=${Math.round(box.top)}px (was -245/-305 before fix)`);
    check(`tr011-title-visible-${w}x${h}`, box.titleTop !== null && box.titleTop >= 0,
      `title top=${box.titleTop === null ? 'n/a' : Math.round(box.titleTop)}px`);
    check(`tr011-internal-scroll-${w}x${h}`, box.maxHeight !== 'none' && box.overflowY === 'auto',
      `max-height=${box.maxHeight} overflow-y=${box.overflowY}`);
    check(`tr011-bottom-onscreen-${w}x${h}`, box.bottom <= h + 1,
      `dialog bottom=${Math.round(box.bottom)}px vs viewport ${h}`);
  }
  await page.setViewportSize({ width: 1366, height: 720 });

  // ---- TR-012: open listbox stays opaque with the HOST token sheet stripped ----
  // Disables every stylesheet that defines --popover outside the library bundle, leaving
  // only trblazeui.css — i.e. exactly an AstroLyfe-style host that ships no token set.
  const stripped = await page.evaluate(() => {
    let vDisabled = 0;
    for (const sheet of Array.from(document.styleSheets)) {
      const href = sheet.href || '';
      if (href.includes('trblazeui.css')) continue;
      try {
        if (sheet.ownerNode) { sheet.disabled = true; vDisabled++; }
      } catch { /* cross-origin sheet — cannot inspect, leave enabled */ }
    }
    // Belt and braces: also clear any inline token declarations on the root element.
    document.documentElement.style.removeProperty('--popover');
    document.documentElement.style.removeProperty('--popover-foreground');
    return vDisabled;
  });
  await page.click('[data-testid="tr012-trigger"]');
  await page.waitForSelector('[role="option"]', { timeout: 10000 });
  await page.waitForTimeout(300);
  const popover = await page.evaluate(() => {
    const opt = document.querySelector('[role="option"]');
    const panel = opt.closest('[role="listbox"]') || opt.parentElement.parentElement;
    const cs = getComputedStyle(panel);
    return { bg: cs.backgroundColor, fg: getComputedStyle(opt).color, token: getComputedStyle(document.documentElement).getPropertyValue('--popover').trim() };
  });
  const transparent = /rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(popover.bg);
  check('tr012-popover-opaque', !transparent,
    `${stripped} host sheet(s) disabled; listbox background=${popover.bg}, --popover="${popover.token}"`);
  check('tr012-popover-foreground', popover.fg && popover.fg !== popover.bg,
    `item color=${popover.fg}`);
  await page.keyboard.press('Escape');

  // ---- §4b visual truth: screenshots + no page horizontal overflow ----
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: OUT + '/ui016-desktop.png', fullPage: true });
  const deskOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('visual-no-overflow-1366', deskOverflow <= 0, `desktop scrollWidth-clientWidth=${deskOverflow}`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + '/ui016-mobile.png', fullPage: true });
  const mobOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('visual-no-overflow-390', mobOverflow <= 0, `mobile scrollWidth-clientWidth=${mobOverflow}`);

  const mobileBox = await measureDialog(page, 390, 844);
  check('tr011-top-onscreen-390x844', mobileBox.top >= 0, `mobile dialog top=${Math.round(mobileBox.top)}px`);

  check('no-console-errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length === 0 ? 0 : 1);
})();
