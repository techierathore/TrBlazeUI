// REQ-UI-015 verifier spec — TrStudio feedback TR-001..TR-011 (UI-observable subset).
// Self-contained plain-Playwright script (repo has no @playwright/test harness); run with:
//   SMOKE_URL=http://<host>:<port> node tests/verify/ui-trstudio.spec.js
// Gates: §4a data-render (splat present + table render-truth), TR-009 controlled state,
// TR-010 no page overflow @390px, §4b visual-truth (desktop + mobile screenshots).
const { chromium } = require('playwright');

const BASE = process.env.SMOKE_URL || 'http://172.18.144.1:5213';
const URL = BASE + '/verify-trstudio';
const OUT = process.env.OUT_DIR || __dirname + '/../../test-results';

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newContext({ viewport: { width: 1280, height: 800 } }).then(c => c.newPage());
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  check('http-200', resp && resp.status() === 200, 'status=' + (resp && resp.status()));
  await page.waitForSelector('[data-testid="verify-heading"]', { timeout: 15000 });
  await page.waitForTimeout(1500); // Blazor Server circuit connect

  // §4a render gate — CaptureUnmatchedValues splat present on rendered DOM
  for (const [id, tr] of [
    ['registry-table', 'TR-001 DataTable'], ['auth-failure-alert', 'TR-002 Alert'],
    ['synthetic', 'TR-008 Checkbox'], ['nsfw-plain', 'TR-008 Switch'],
    ['count-badge', 'TR-004 Badge'], ['pw-error', 'TR-004 FieldError'],
  ]) {
    const el = await page.$(`[data-testid="${id}"]`);
    check(`${tr}: [data-testid=${id}]`, !!el, el ? 'present' : 'MISSING');
  }

  // §4a render-truth — table rows/cells non-empty
  const alpha = await page.$('[data-testid="registry-table"] >> text=Alpha');
  const active = await page.$('[data-testid="registry-table"] >> text=Active');
  check('TR-001 render-truth', !!alpha && !!active, 'rows Alpha/Active');
  const alertText = await page.textContent('[data-testid="auth-failure-alert"]');
  check('TR-002 render-truth', /Auth failed/.test(alertText || ''), 'alert text present');

  // Positive control — uncontrolled Switch DOES flip (proves clicks are live)
  const plain = page.locator('[data-testid="nsfw-plain"]');
  const pb = await plain.getAttribute('aria-checked');
  await plain.click(); await page.waitForTimeout(600);
  const pa = await plain.getAttribute('aria-checked');
  check('control: uncontrolled switch flips', pb === 'false' && pa === 'true', `before=${pb} after=${pa}`);

  // TR-009 — controlled/gated Switch must NOT flip
  const gated = page.locator('[data-testid="gated-switch"]');
  const gb = await gated.getAttribute('aria-checked');
  await gated.click(); await page.waitForTimeout(600);
  const ga = await gated.getAttribute('aria-checked');
  const gstate = (await page.textContent('[data-testid="gated-state"]') || '').trim();
  check('TR-009 gated switch stays off', gb === 'false' && ga === 'false', `before=${gb} after=${ga} bound="${gstate}"`);

  // TR-010 — no page horizontal overflow @390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  check('TR-010 no overflow @390px', m.sw <= m.cw + 1, `scrollWidth=${m.sw} clientWidth=${m.cw}`);
  check('TR-010 narrow table renders', !!(await page.$('[data-testid="narrow-table"]')), 'present');

  // §4b visual-truth — screenshots at both widths
  await page.screenshot({ path: OUT + '/verify-390.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 800 }); await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + '/verify-desktop.png', fullPage: true });

  check('no console/page errors', errors.length === 0, errors.length ? errors.slice(0, 3).join(' | ') : 'clean');

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log('\n==== ' + (results.length - failed.length) + '/' + results.length + ' passed ====');
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
