// Acceptance tests for Sevak consumer feedback (docs/Sevak-TrBlazeUI-Feedback.md, filed against
// 1.0.7, triaged 2026-10-07 against the current source): REQ-UI-034 AlertDialogAction/Cancel.OnClick
// (TR-044), REQ-UI-035 the empty toast viewport lets clicks through (TR-043), REQ-UI-036 the
// Success/Info/Warning toast variants (TR-023).
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. Measured in-process against the demo pages and their data-testid anchors. Base URL: BASE_URL,
// else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

/** A CSS colour expression resolved by the browser to the format getComputedStyle reports. */
async function resolve(aPage: Page, aProperty: 'color' | 'backgroundColor', aValue: string): Promise<string> {
  return aPage.evaluate(([vProperty, vValue]) => {
    const vProbe = document.createElement('span');
    (vProbe.style as unknown as Record<string, string>)[vProperty] = vValue;
    document.body.appendChild(vProbe);
    const vResolved = (getComputedStyle(vProbe) as unknown as Record<string, string>)[vProperty];
    vProbe.remove();
    return vResolved;
  }, [aProperty, aValue] as const);
}

const VIEWPORT = 'div.fixed.z-\\[100\\]';

test.describe('Sevak — consumer-feedback fixes (TR-044, TR-043, TR-023)', () => {
  test('REQ-UI-034 an AlertDialogAction OnClick runs and the dialog closes; Cancel the same', async ({ page }) => {
    await open(page, '/components/alert-dialog');

    await page.locator('[data-testid="alertdialog-onclick-open"]').click();
    await expect(page.locator('[role="alertdialog"]'), 'the dialog opened').toHaveCount(1);
    await page.locator('[data-testid="alertdialog-onclick-action"]').click();
    await expect(page.locator('[data-testid="alertdialog-onclick-count"]'), 'the action handler ran').toHaveText('1');
    await expect(page.locator('[role="alertdialog"]'), 'the dialog closed').toHaveCount(0);

    await page.locator('[data-testid="alertdialog-onclick-open"]').click();
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(1);
    await page.locator('[data-testid="alertdialog-onclick-cancel"]').click();
    await expect(page.locator('[data-testid="alertdialog-onclick-cancel-count"]'), 'the cancel handler ran').toHaveText('1');
    await expect(page.locator('[data-testid="alertdialog-onclick-count"]'), 'the action count is unchanged').toHaveText('1');
    await expect(page.locator('[role="alertdialog"]')).toHaveCount(0);
  });

  test('REQ-UI-035 an empty toast viewport lets clicks through, and a shown toast takes its own', async ({ page }) => {
    await open(page, '/components/toast');

    const vViewport = page.locator(VIEWPORT);
    await expect(vViewport, 'one toast viewport').toHaveCount(1);
    await expect(vViewport.locator('[role="alert"]'), 'no toast is showing').toHaveCount(0);
    expect(await vViewport.evaluate(el => getComputedStyle(el).pointerEvents), 'the viewport takes no pointer events').toBe('none');

    const vHit = await page.evaluate(() => {
      const vEl = document.elementFromPoint(window.innerWidth - 30, window.innerHeight - 30);
      return vEl ? { cls: vEl.className, isViewport: vEl.matches('div.fixed.z-\\[100\\]') } : null;
    });
    expect(vHit, 'something is under the corner').not.toBeNull();
    expect(vHit!.isViewport, `the corner click reaches the page, not the viewport (${vHit!.cls})`).toBe(false);

    await page.locator('[data-testid="toast-info"]').click();
    const vToast = vViewport.locator('[role="alert"]').first();
    await expect(vToast).toBeVisible();
    expect(await vToast.evaluate(el => getComputedStyle(el).pointerEvents), 'a toast takes its own clicks').toBe('auto');
  });

  test('REQ-UI-036 Warning, Info and Success toasts paint the status tints', async ({ page }) => {
    await open(page, '/components/toast');
    const vToasts = page.locator(`${VIEWPORT} [role="alert"]`);

    for (const [vButton, vToken] of [
      ['toast-warning', '--alert-warning-bg'],
      ['toast-info', '--alert-info-bg'],
      ['toast-success-variant', '--alert-success-bg'],
    ] as const) {
      await page.locator('button:has-text("Dismiss All")').click();
      await expect(vToasts).toHaveCount(0);
      await page.locator(`[data-testid="${vButton}"]`).click();
      await expect(vToasts).toHaveCount(1);
      const vBg = await vToasts.first().evaluate(el => getComputedStyle(el).backgroundColor);
      expect(vBg, `${vButton} paints ${vToken}`).toBe(await resolve(page, 'backgroundColor', `var(${vToken})`));
      expect(vBg, `${vButton} is a tint, not the destructive fill`).not.toBe(await resolve(page, 'backgroundColor', 'var(--destructive)'));
    }
  });
});
