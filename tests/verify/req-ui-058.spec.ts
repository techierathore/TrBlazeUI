// Acceptance test for Lekhak consumer feedback TR-010
// (docs/Lekhak-TrBlazeUI-Feedback.md): a CardHeader without a CardAction must stay a
// single-column grid so a CardDescription sits under the title and the card does not
// overflow a 390 px viewport.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.setViewportSize({ width: 390, height: 844 });
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

test.describe('Lekhak TR-010 — CardHeader without CardAction keeps description under title', () => {
  test('REQ-UI-058 a CardDescription stays under the title and the card fits 390 px', async ({ page }) => {
    await open(page, '/components/card');

    const vCard = page.locator('[data-testid="card-tr010"]');
    const vHeader = vCard.locator('[data-testid="card-tr010-header"]').first();
    await expect(vHeader).toBeVisible();

    // No CardAction is rendered in this header.
    await expect(vHeader.locator('[data-slot="card-action"]')).toHaveCount(0);

    // The description must sit below the title, not beside it.
    const vTitle = vHeader.locator('h3').first();
    const vDescription = vHeader.locator('p').first();
    await expect(vTitle).toBeVisible();
    await expect(vDescription).toBeVisible();
    await expect(vTitle).toContainText('Embedding model');
    await expect(vDescription).toContainText('BGE-M3');

    const vTitleBox = await vTitle.boundingBox();
    const vDescriptionBox = await vDescription.boundingBox();
    expect(vTitleBox && vDescriptionBox, 'title and description are both drawn').toBeTruthy();

    expect(vDescriptionBox!.y,
      'description starts below the title').toBeGreaterThanOrEqual(vTitleBox!.y + vTitleBox!.height - 2);

    // The header and card must not overflow the 390 px viewport.
    const vViewportWidth = 390;
    const vCardBox = await vCard.boundingBox();
    expect(vCardBox, 'card has a layout box').toBeTruthy();
    expect(vCardBox!.x + vCardBox!.width,
      'card fits inside the 390 px viewport').toBeLessThanOrEqual(vViewportWidth);
  });
});
