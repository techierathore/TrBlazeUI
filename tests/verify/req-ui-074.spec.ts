// Acceptance test for Chatur consumer feedback TR-026 (docs/Chatur-TrBlazeUI-Feedback.md): a styled
// Select's list was always exactly its button's width (inline width, min-width and max-width), so
// Chatur's tier options wrapped onto two lines in a 160 px picker. The styled SelectContent now takes
// MatchTriggerWidth; false makes the button's width a minimum, so the list grows to its options.
// The default is unchanged.
//
// Page: /verify-chatur-tr026. The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function openList(aPage: Page, aTrigger: string) {
  const vTrigger = aPage.getByTestId(aTrigger);
  const vList = aPage.getByRole('listbox');
  // Under load the first click can land before the page is interactive; press again until it opens.
  await expect(async () => {
    if (!(await vList.isVisible())) await vTrigger.click();
    await expect(vList).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20000 });
  await aPage.waitForTimeout(300);
  return { trigger: (await vTrigger.boundingBox())!, list: (await vList.boundingBox())! };
}

// True when every option is one line tall. One line is 32 px (py-1.5 around a 20 px text-sm line);
// an option that wraps is 52 px. (A text-range check would count the option's absolutely placed
// check-mark icon as a line of its own.)
const optionsOnOneLine = (aPage: Page) => aPage.getByRole('option').evaluateAll((aOptions) =>
  aOptions.every((aOption) => aOption.getBoundingClientRect().height < 40));

test.describe('Chatur TR-026 — a Select\'s list can be wider than its button', () => {
  for (const vWidth of [1280, 390]) {
    test(`REQ-UI-074 at ${vWidth} px MatchTriggerWidth="false" lets the tier list grow so each option stays on one line`, async ({ page }) => {
      await page.setViewportSize({ width: vWidth, height: 900 });
      await page.goto(`${BASE}/verify-chatur-tr026`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      const vBoxes = await openList(page, 'tier-wide-trigger');
      expect(vBoxes.trigger.width).toBeCloseTo(160, 0);
      expect(vBoxes.list.width, 'wider than its 160 px button').toBeGreaterThan(170);
      expect(vBoxes.list.x + vBoxes.list.width, 'and still inside the window').toBeLessThanOrEqual(vWidth);
      expect(await optionsOnOneLine(page), 'no option wraps').toBe(true);

      await page.getByRole('option', { name: 'Tier 3 — on this machine' }).click();
      await expect(page.getByTestId('tier-wide-trigger')).toContainText('Tier 3 — on this machine');
    });
  }

  test('REQ-UI-074 with short options the list is never narrower than its button', async ({ page }) => {
    await page.goto(`${BASE}/verify-chatur-tr026`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const vBoxes = await openList(page, 'short-trigger');
    expect(vBoxes.list.width).toBeGreaterThanOrEqual(vBoxes.trigger.width - 0.5);
  });

  test('REQ-UI-074 by default the list still matches its button exactly', async ({ page }) => {
    await page.goto(`${BASE}/verify-chatur-tr026`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const vBoxes = await openList(page, 'tier-default-trigger');
    expect(Math.abs(vBoxes.list.width - vBoxes.trigger.width)).toBeLessThanOrEqual(0.5);
    // Held to 160 px the long options wrap - Chatur's symptom, and proof the one-line check bites.
    expect(await optionsOnOneLine(page)).toBe(false);
  });
});
