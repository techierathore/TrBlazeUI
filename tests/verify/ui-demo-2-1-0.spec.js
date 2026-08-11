// 2.1.0 demo-page verifier — exercises the new components and the fix demonstrations on the
// existing component pages, on a running demo app. Self-contained plain-Playwright script
// (repo has no @playwright/test harness); run with:
//   SMOKE_URL=http://<host>:<port> node tests/verify/ui-demo-2-1-0.spec.js
// Complements tests/verify/ui-techieblog.spec.js, which asserts the library behaviour itself on
// the /verify-techieblog harness; this one asserts that the DOCUMENTED EXAMPLES actually work.
const { chromium } = require('playwright');
const BASE = process.env.SMOKE_URL;
const results = [];
const check = (id, cond, detail) => { results.push({id, pass: !!cond}); console.log(`${cond?'PASS':'FAIL'}  ${id}  ${detail||''}`); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(['clipboard-read','clipboard-write'], { origin: BASE });
  const errs = [];
  const open = async (path) => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(`${path}: ${e.message}`));
    await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await p.waitForTimeout(1800);
    return p;
  };

  // ---- Stepper: Next advances aria-current
  let p = await open('/components/stepper');
  const stepLabel = () => p.evaluate(() =>
    document.querySelector('nav[aria-label="Publishing progress"] [aria-current="step"]')?.innerText.replace(/\s+/g, ' ').trim());
  const stepBefore = await stepLabel();
  await p.getByRole('button', { name: 'Next' }).click();
  await p.waitForTimeout(600);
  const stepAfter = await stepLabel();
  check('stepper-next', stepBefore !== stepAfter && !!stepAfter, `"${stepBefore}" -> "${stepAfter}"`);
  await p.close();

  // ---- SortableList: move up reorders and announces
  p = await open('/components/sortable-list');
  const orderOf = () => p.evaluate(() =>
    [...document.querySelectorAll('code')].map(c => c.innerText).find(x => x.includes('Part one')));
  const orderBefore = await orderOf();
  await p.locator('ol li').nth(1).getByRole('button').first().click();
  await p.waitForTimeout(700);
  const orderAfter = await orderOf();
  const live = await p.evaluate(() => document.querySelector('[aria-live="polite"]')?.innerText);
  check('sortable-reorder', orderBefore !== orderAfter, `${orderBefore} -> ${orderAfter}`);
  check('sortable-announced', /moved to position/.test(live || ''), `live region: "${live}"`);
  await p.close();

  // ---- PasswordStrength: level changes as you type
  p = await open('/components/password-strength');
  const weak = await p.evaluate(() => document.querySelector('[aria-live="polite"]')?.innerText);
  await p.locator('#pw-demo').fill('P@ssw0rd!LongEnough');
  await p.waitForTimeout(700);
  const strong = await p.evaluate(() => document.querySelector('[aria-live="polite"]')?.innerText);
  check('password-strength-live', weak !== strong, `"${weak}" -> "${strong}"`);
  await p.close();

  // ---- CodeBlock: copy button reports success
  p = await open('/components/code-block');
  await p.getByRole('button', { name: /copy code/i }).first().click();
  await p.waitForTimeout(600);
  const copied = await p.evaluate(() => document.body.innerText.includes('Copied'));
  check('codeblock-copy', copied, 'button switches to "Copied"');
  await p.close();

  // ---- AnchorNav: scrollspy marks a section current
  p = await open('/components/anchor-nav');
  await p.evaluate(() => document.getElementById('skills')?.scrollIntoView());
  await p.waitForTimeout(900);
  const current = await p.evaluate(() => document.querySelector('nav [aria-current="location"]')?.textContent?.trim());
  check('anchornav-scrollspy', !!current, `active link: "${current}"`);
  await p.close();

  // ---- Prose: table scrolls itself at 390px
  p = await open('/components/prose');
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(500);
  const reflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('prose-no-page-overflow', reflow <= 0, `page overflow ${reflow}px at 390px`);
  await p.close();

  // ---- Stat / Timeline render
  p = await open('/components/stat');
  const tiles = await p.locator('[data-slot], .grid > *').count();
  check('stat-renders', (await p.evaluate(() => document.body.innerText.includes('Years of experience'))), `${tiles} nodes`);
  await p.close();

  p = await open('/components/timeline');
  const li = await p.locator('ol li').count();
  check('timeline-renders', li >= 3, `${li} timeline entries`);
  await p.close();

  // ---- CenteredPanel renders
  p = await open('/components/centered-panel');
  check('centeredpanel-renders', await p.evaluate(() => document.body.innerText.includes('Email verified')), '');
  await p.close();

  // ---- DataTable Refresh(): approving repaints the CellTemplate
  p = await open('/components/datatable');
  await p.getByRole('button', { name: 'Approve' }).first().click();
  await p.waitForTimeout(800);
  const approvedCount = await p.evaluate(() =>
    [...document.querySelectorAll('td')].filter(td => td.innerText.trim() === 'Approved').length);
  check('datatable-refresh', approvedCount >= 2, `${approvedCount} rows read "Approved" after an in-place edit`);
  await p.close();

  // ---- Nested dialogs: the inner one is on top AND clickable
  p = await open('/components/dialog');
  await p.getByRole('button', { name: 'Open the first dialog' }).click();
  await p.waitForTimeout(700);
  await p.getByRole('button', { name: 'Choose an image' }).click();
  await p.waitForTimeout(800);
  const portalOrder = await p.evaluate(() =>
    [...document.querySelectorAll('.trblazeui-portal')].map(d => d.dataset.portalId));
  await p.getByRole('button', { name: '3', exact: true }).click();
  await p.waitForTimeout(800);
  const picked = await p.evaluate(() => document.body.innerText.includes('Image 3'));
  check('stacked-dialog-order', portalOrder.length === 2, `portals in DOM order: ${portalOrder.join(', ')}`);
  check('stacked-dialog-clickable', picked, 'the later-opened dialog receives the click');
  await p.close();

  // ---- What's new page: splatting hooks land, no crash
  p = await open('/whats-new');
  const hooks = await p.evaluate(() => document.querySelectorAll('[data-testid^="wn-"]').length);
  check('whatsnew-splatting', hooks >= 12, `${hooks} elements carry a data-testid`);
  await p.screenshot({ path: process.env.OUT_DIR + '/whats-new-1280.png', fullPage: false });
  await p.close();

  check('no-page-errors', errs.length === 0, errs.join(' | ') || 'none');
  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) { console.log('FAILED: ' + failed.map(f => f.id).join(', ')); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
