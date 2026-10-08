// Acceptance test for Sevak TR-041 (docs/Sevak-TrBlazeUI-Feedback.md): REQ-UI-044 — a Select inside a
// Dialog never freezes the page. Reproduced on 2.1.4 on 2026-10-08 by making the Select's script fail
// to load: the error banner showed and the page stopped answering (Escape no longer closed the dialog).
// A positioning failure left the list parked off-screen. Both failure paths are forced here through
// Playwright request interception, which the Server demo cannot tell from a real host failure.
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

async function errorBannerShowing(aPage: Page): Promise<boolean> {
  return aPage.evaluate(() => {
    const vBanner = document.querySelector('#blazor-error-ui');
    return vBanner ? getComputedStyle(vBanner).display !== 'none' : false;
  });
}

/** Opens the nested-portal dialog on the Dialog demo and clicks the Select inside it. */
async function openSelectInsideDialog(aPage: Page): Promise<void> {
  await aPage.click('[data-testid="portal-regression-open"]');
  await aPage.waitForSelector('[data-testid="portal-regression-outer"]', { timeout: 5000 });
  await aPage.click('[data-testid="portal-regression-select"]');
  await aPage.waitForTimeout(1200);
}

/** The page still answers: Escape closes the dialog and it can be opened again. */
async function pageStillAnswers(aPage: Page): Promise<void> {
  await aPage.keyboard.press('Escape');
  await expect(aPage.locator('[data-testid="portal-regression-outer"]'), 'Escape closed the dialog').toHaveCount(0, { timeout: 3000 });
  await aPage.click('[data-testid="portal-regression-open"]', { timeout: 3000 });
  await expect(aPage.locator('[data-testid="portal-regression-outer"]'), 'the dialog opened again').toHaveCount(1, { timeout: 3000 });
  expect(await errorBannerShowing(aPage), 'no error banner').toBe(false);
}

test.describe('Sevak feedback — a Select inside a Dialog never freezes the page (TR-041)', () => {
  test('REQ-UI-044 when the Select script cannot load, the list still opens and the page keeps answering', async ({ page }) => {
    const vConsole: string[] = [];
    page.on('console', m => vConsole.push(m.text()));
    await page.route('**/js/primitives/select.js', r => r.abort());
    await open(page, '/components/dialog');

    await openSelectInsideDialog(page);
    expect(await errorBannerShowing(page), 'no error banner after the failed import').toBe(false);
    const vOptions = page.locator('[data-testid="portal-regression-options"] [role="option"]');
    await expect(vOptions, 'the listbox still renders its options').toHaveCount(3);
    await expect(vOptions.first()).toBeVisible();
    // The failure is reported, not thrown: on Blazor Server the warning ("Select could not load its
    // script") goes to the server log (tests/.artifacts/verify/app-<port>.log), not the browser
    // console, so the browser side only proves there is no unhandled error.
    expect(vConsole.some(l => /unhandled|Unhandled exception/.test(l)), 'no unhandled error reached the browser').toBe(false);
    // A click still picks an option through Blazor's own event path.
    await page.getByRole('option', { name: 'Preview', exact: true }).click();
    await expect(page.locator('[data-testid="portal-regression-select"]')).toContainText('Preview');

    await pageStillAnswers(page);
  });

  test('REQ-UI-044 when positioning fails, the list is placed under its trigger instead of off-screen', async ({ page }) => {
    await page.route('**/js/primitives/positioning.js', async r => {
      const vRes = await r.fetch();
      const vBody = (await vRes.text()).replace(
        'export async function computePosition(',
        'export async function computePosition(){ throw new Error("TR-041 forced positioning failure"); }\nasync function _origComputePosition(');
      await r.fulfill({ response: vRes, body: vBody, headers: { ...vRes.headers(), 'content-type': 'text/javascript' } });
    });
    await open(page, '/components/dialog');

    await openSelectInsideDialog(page);
    expect(await errorBannerShowing(page), 'no error banner after the positioning failure').toBe(false);
    const vList = page.locator('[data-testid="portal-regression-options"]');
    await expect(vList).toBeVisible();
    const vTrigger = await page.locator('[data-testid="portal-regression-select"]').boundingBox();
    const vListBox = await vList.boundingBox();
    expect(vTrigger && vListBox, 'both boxes measured').toBeTruthy();
    // On screen, directly under the trigger (the fallback placement), not at -9999px.
    expect(vListBox!.y, 'the list sits below the trigger').toBeGreaterThanOrEqual(vTrigger!.y + vTrigger!.height - 1);
    expect(vListBox!.y, 'the list is on screen').toBeLessThan(800);
    expect(vListBox!.x, 'the list is on screen horizontally').toBeGreaterThanOrEqual(0);

    await pageStillAnswers(page);
  });
});
