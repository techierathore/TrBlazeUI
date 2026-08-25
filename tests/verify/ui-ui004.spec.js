// REQ-UI-004 focused runtime verification for reactive overlays rendered by PortalHost.
// Run with: SMOKE_URL=http://localhost:5183 OUT_DIR=tests/.artifacts/req-ui-004 node tests/verify/ui-ui004.spec.js
const { chromium } = require('playwright');
const fs = require('fs');

const base = process.env.SMOKE_URL || 'http://localhost:5183';
const output = process.env.OUT_DIR || 'tests/.artifacts/req-ui-004';
fs.mkdirSync(output, { recursive: true });

async function verifyViewport(browser, width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/components/dialog`, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(1800);
  await page.getByTestId('portal-regression-open').click();

  const outer = page.getByTestId('portal-regression-outer');
  try {
    await outer.waitFor({ state: 'visible', timeout: 5000 });
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      trigger: document.querySelector('[data-testid="portal-regression-open"]')?.outerHTML,
      portals: [...document.querySelectorAll('.trblazeui-portal')].map(element => element.outerHTML.slice(0, 240)),
      dialogs: document.querySelectorAll('[role="dialog"]').length,
      bodyHasFixture: document.body.innerText.includes('Portal regression fixture')
    }));
    throw new Error(`Outer dialog did not open: ${JSON.stringify(diagnostics)}; ${error.message}`);
  }
  await page.getByTestId('portal-regression-inner-open').click();
  const inner = page.getByTestId('portal-regression-inner');
  try {
    await inner.waitFor({ state: 'visible', timeout: 5000 });
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      trigger: document.querySelector('[data-testid="portal-regression-inner-open"]')?.outerHTML,
      portals: [...document.querySelectorAll('.trblazeui-portal')].map(element => element.dataset.portalId),
      dialogs: document.querySelectorAll('[role="dialog"]').length
    }));
    throw new Error(`Inner dialog did not open: ${JSON.stringify(diagnostics)}; ${error.message}`);
  }

  const dialogPortals = await page.locator('.trblazeui-portal').count();
  if (dialogPortals < 1) throw new Error(`Expected a document-level dialog portal, found ${dialogPortals}`);

  await page.keyboard.press('Tab');
  const focusInsideInner = await inner.evaluate((element) => element.contains(document.activeElement));
  if (!focusInsideInner) throw new Error('Focus escaped the literal child dialog');
  await page.getByRole('button', { name: 'Close child dialog' }).click();

  const trigger = page.getByTestId('portal-regression-select');
  await trigger.click();
  await page.waitForTimeout(1000);
  const options = page.getByRole('option');
  if (await options.count() !== 3) {
    throw new Error(`Expected three mouse options, found ${await options.count()}; trigger=${await trigger.evaluate(element => element.outerHTML)}`);
  }
  await options.filter({ hasText: 'Preview' }).click();
  await page.getByTestId('portal-regression-selection').getByText('Preview').waitFor();

  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('option').first().waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'listbox');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.getByTestId('portal-regression-selection').getByText('Nightly').waitFor();

  const visual = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    outer: document.querySelector('[data-testid="portal-regression-outer"]')?.getBoundingClientRect().toJSON()
  }));
  if (visual.overflow > 0) throw new Error(`Page overflows viewport by ${visual.overflow}px`);
  if (!visual.outer || visual.outer.width <= 0 || visual.outer.height <= 0) throw new Error('Outer dialog has no layout box');
  if (errors.length) throw new Error(`Page errors: ${errors.join(' | ')}`);

  await page.screenshot({ path: `${output}/${label}.png`, fullPage: false });
  await page.close();
  console.log(`PASS REQ-UI-004 ${label}: nested dialog, focus trap, mouse/keyboard Select, visual bounds`);
}

(async () => {
  const browser = await chromium.launch();
  try {
    await verifyViewport(browser, 1280, 900, 'desktop');
    await verifyViewport(browser, 390, 844, 'mobile');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
