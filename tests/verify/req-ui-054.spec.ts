// Acceptance test for Sevak consumer feedback TR-046 (docs/Sevak-TrBlazeUI-Feedback.md):
// REQ-UI-054 FileUpload AriaLabel and InputId reach the rendered file input.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

test.describe('Sevak TR-046 — FileUpload aria-label and input id', () => {
  test('REQ-UI-054 AriaLabel and InputId reach the rendered file input', async ({ page }) => {
    await open(page, '/components/file-upload');

    const vInput = page.locator('[data-testid="fileupload-tr046-control"] input[type="file"]');
    await expect(vInput).toBeAttached();
    await expect(vInput).toHaveAttribute('id', 'tr046-upload');
    await expect(vInput).toHaveAttribute('aria-label', 'Profile photo upload');

    // The page's <label for="tr046-upload"> is wired to the same id.
    const vLabel = page.locator('label[for="tr046-upload"]');
    await expect(vLabel).toHaveText('Profile photo');
  });
});
