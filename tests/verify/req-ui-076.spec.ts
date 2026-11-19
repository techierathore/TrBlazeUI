// Acceptance test for Chatur consumer feedback TR-025 (docs/Chatur-TrBlazeUI-Feedback.md): at 390 px a
// submenu with no room on either side is pulled back inside the window (TR-024), but where it goes
// was worked out once, when it opened. Chatur re-reads its recent projects each time File is pressed,
// so the rows can change while the list is open; the list then grew past the place worked out for
// it and its right edge ended at 385.95 instead of 382 (390 - 8). The placement is now worked out
// again whenever the list renders, from a measurement that does not depend on the last placement.
//
// Page: /verify-chatur-tr025: the rows change from three names to Chatur's six 700 ms after File is
// pressed, as Chatur's LoadRecentAsync does.
// The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const MARGIN = 8;

test.describe('Chatur TR-025 — a pulled-back submenu keeps its 8 px margin when its rows wrap', () => {
  test('REQ-UI-076 at 390 px File ▸ Recent projects ▸ keeps 8 px from both window edges', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(`${BASE}/verify-chatur-tr025`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.getByTestId('tr025-file').click();
    await page.getByTestId('tr025-recent').click();
    const vList = page.getByTestId('tr025-recent-list');
    await expect(vList).toBeVisible();
    // The six rows arrive while the list is open.
    await expect(page.getByTestId('tr025-recent-SetEstFixture')).toBeVisible();
    await page.waitForTimeout(600);

    const vBox = (await vList.boundingBox())!;
    expect(vBox.x + vBox.width, 'right edge at most 382 (390 - 8)').toBeLessThanOrEqual(390 - MARGIN + 0.5);
    expect(vBox.x, 'left edge at least 8').toBeGreaterThanOrEqual(MARGIN - 0.5);

    // Every row is inside the window too, and still works.
    for (const vName of ['WbAFilesApp', 'reportspec-proj', 'SetEstFixture']) {
      const vRow = (await page.getByTestId(`tr025-recent-${vName}`).boundingBox())!;
      expect(vRow.x + vRow.width).toBeLessThanOrEqual(390 - MARGIN + 0.5);
    }
    await page.getByTestId('tr025-recent-reportspec-proj').click();
    await expect(page.getByTestId('tr025-choice')).toHaveText('reportspec-proj');
  });

  test('REQ-UI-076 at 1280 px the same list opens beside its row with no pull-back', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE}/verify-chatur-tr025`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.getByTestId('tr025-file').click();
    const vRow = page.getByTestId('tr025-recent');
    await vRow.hover();
    const vList = page.getByTestId('tr025-recent-list');
    await expect(vList).toBeVisible();
    await expect(vList).toHaveAttribute('data-side', 'right');
    expect(await vList.getAttribute('style'), 'no pull-back when the list fits').toBeNull();
    const vRowBox = (await vRow.boundingBox())!;
    const vBox = (await vList.boundingBox())!;
    expect(vBox.x).toBeGreaterThanOrEqual(vRowBox.x + vRowBox.width - 2);
  });
});
