// Acceptance test for TechieBlog consumer feedback TR-075
// (docs/TechieBlog-TrBlazeUI-Feedback.md): REQ-UI-055 a styled Select inside DialogContent
// returns focus to its trigger after an option is picked, so Escape still dismisses the dialog.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.setViewportSize({ width: 1280, height: 900 });
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

test.describe('TechieBlog TR-075 — Select focus returns to trigger inside a Dialog', () => {
  test('REQ-UI-055 after picking a Select option, Escape dismisses the parent dialog', async ({ page }) => {
    await open(page, '/components/dialog');

    await page.locator('[data-testid="dialog-tr075-open"]').click();
    const vPanel = page.locator('[data-testid="dialog-tr075-panel"]');
    await expect(vPanel).toBeVisible();

    const vTrigger = page.locator('[data-testid="dialog-tr075-select"]');
    await vTrigger.click();
    const vOptions = page.locator('[data-testid="dialog-tr075-options"]');
    await expect(vOptions).toBeVisible();

    await page.getByRole('option', { name: 'Banana' }).click();
    await expect(vOptions).toBeHidden();
    await expect(page.locator('[data-testid="dialog-tr075-value"]')).toContainText('Selected: banana');

    // Focus must be back on the Select trigger, not on <body>.
    await expect.poll(async () => {
      const vActive = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      return vActive;
    }, { message: 'focus returns to the Select trigger after selection' }).toBe('dialog-tr075-select');

    // With focus inside the dialog, Escape dismisses it.
    await page.keyboard.press('Escape');
    await expect(vPanel).toBeHidden();
  });
});
