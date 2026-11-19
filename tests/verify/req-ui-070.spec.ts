// Acceptance test for TrStudio consumer feedback TR-016 (docs/TrStudio-TrBlazeUI-Feedback.md): a Badge
// whose Class changed after a click was reported to keep its first class (the text changed, the
// colour did not). The page flips one bool that changes each badge's Class - and one badge's Variant -
// and the rendered element must follow every change, both ways.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Page: /verify-trstudio-tr016. Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

test.describe('TrStudio TR-016 — a Badge draws its new Class when the value changes', () => {
  test('REQ-UI-070 the class and colour of an Outline badge follow its Class both ways', async ({ page }) => {
    await page.goto(`${BASE}/verify-trstudio-tr016`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const vBadge = page.getByTestId('comfy-badge');
    await expect(vBadge).toHaveText('Not connected');
    await expect(vBadge).toHaveClass(/\bbadge-warn\b/);
    await expect(vBadge).toHaveCSS('color', 'rgb(194, 65, 12)');

    await page.getByTestId('toggle-connected').click();
    await expect(vBadge).toHaveText('Connected');
    await expect(vBadge).toHaveClass(/\bbadge-ok\b/);
    await expect(vBadge).not.toHaveClass(/\bbadge-warn\b/);
    await expect(vBadge).toHaveCSS('color', 'rgb(21, 128, 61)');

    await page.getByTestId('toggle-connected').click();
    await expect(vBadge).toHaveText('Not connected');
    await expect(vBadge).toHaveClass(/\bbadge-warn\b/);
    await expect(vBadge).not.toHaveClass(/\bbadge-ok\b/);
  });

  test('REQ-UI-070 a Variant and a Class that change together both reach the element', async ({ page }) => {
    await page.goto(`${BASE}/verify-trstudio-tr016`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const vBadge = page.getByTestId('variant-badge');
    await expect(vBadge).toHaveClass(/\bitalic\b/);
    await expect(vBadge).toHaveClass(/bg-alert-warning-bg/);

    await page.getByTestId('toggle-connected').click();
    await expect(vBadge).toHaveText('Ready');
    await expect(vBadge).toHaveClass(/\bfont-bold\b/);
    await expect(vBadge).not.toHaveClass(/\bitalic\b/);
    await expect(vBadge).toHaveClass(/bg-alert-success-bg/);
    await expect(vBadge).not.toHaveClass(/bg-alert-warning-bg/);
  });
});
