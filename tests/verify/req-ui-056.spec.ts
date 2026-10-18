// Acceptance test for Lekhak consumer feedback TR-008
// (docs/Lekhak-TrBlazeUI-Feedback.md): REQ-UI-056 NumericInput supports nullable binding so
// an empty box binds null instead of the numeric type's default.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

test.describe('Lekhak TR-008 — NumericInput nullable value binding', () => {
  test('REQ-UI-056 clearing the input binds null for a nullable int', async ({ page }) => {
    await open(page, '/components/numeric-input');

    const vInput = page.locator('[data-testid="numeric-tr008-input"] input');
    await expect(vInput).toHaveValue('42');
    await expect(page.locator('[data-testid="numeric-tr008-value"]')).toContainText('Value: 42');

    await vInput.click();
    await vInput.fill('');
    await vInput.blur();

    await expect(page.locator('[data-testid="numeric-tr008-value"]')).toContainText('Value: null');

    // Typing a new value restores the non-null binding.
    await vInput.fill('7');
    await vInput.blur();
    await expect(page.locator('[data-testid="numeric-tr008-value"]')).toContainText('Value: 7');
  });
});
