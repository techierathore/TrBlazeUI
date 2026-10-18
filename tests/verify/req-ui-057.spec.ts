// Acceptance test for Lekhak consumer feedback TR-009
// (docs/Lekhak-TrBlazeUI-Feedback.md): REQ-UI-057 CardAction sits at the right edge of the
// title row when placed inside CardHeader.
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

test.describe('Lekhak TR-009 — CardAction positioned at the header right edge', () => {
  test('REQ-UI-057 CardAction aligns to the right of the header on the title row', async ({ page }) => {
    await open(page, '/components/card');

    const vCard = page.locator('[data-testid="card-tr009"]');
    const vAction = vCard.locator('[data-slot="card-action"]').first();
    await expect(vAction).toBeVisible();

    const vHeaderBox = await vCard.locator('[data-testid="card-tr009-header"]').first().boundingBox();
    const vActionBox = await vAction.boundingBox();
    expect(vHeaderBox && vActionBox, 'header and action are both drawn').toBeTruthy();

    // The header has padding, so the action aligns with the content box's right edge rather than
    // the outer border box. Subtract the header's right padding before comparing.
    const vHeaderPaddingRight = await vCard.locator('[data-testid="card-tr009-header"]').first()
      .evaluate(aNode => parseFloat(getComputedStyle(aNode).paddingRight));
    expect(vActionBox!.x + vActionBox!.width,
      'action right edge aligns with header content right edge').toBeGreaterThanOrEqual(
        vHeaderBox!.x + vHeaderBox!.width - vHeaderPaddingRight - 4);

    // The action sits on the title row, not below the description.
    expect(vActionBox!.y, 'action is at the top of the header').toBeLessThan(vHeaderBox!.y + vHeaderBox!.height / 2);
  });
});
