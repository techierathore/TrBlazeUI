// Acceptance test for Chatur consumer feedback TR-027 (docs/Chatur-TrBlazeUI-Feedback.md): the shipped
// stylesheet had no place-items-center, so Chatur's Start tiles (a 36 px grid holding an 18 px icon)
// drew the icon in the tile's top-left corner. The bundle now carries the place-items, place-content
// and place-self utilities.
//
// The tile is drawn on a blank page that loads trblazeui.css and nothing else, so the demo's own
// app.css can never supply the class and hide a gap in the shipped bundle.
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const CSS = `${BASE}/_content/TrBlazeUI.Components/trblazeui.css`;

test.describe('Chatur TR-027 — the shipped stylesheet carries the place-* utilities', () => {
  test('REQ-UI-072 trblazeui.css defines place-items, place-content and place-self', async ({ request }) => {
    const vResponse = await request.get(CSS);
    expect(vResponse.ok()).toBe(true);
    const vText = await vResponse.text();
    for (const vClass of ['place-items-center', 'place-items-start', 'place-items-end', 'place-items-stretch',
      'place-content-center', 'place-content-between', 'place-self-center', 'place-self-auto']) {
      expect(vText, `.${vClass} is in the bundle`).toContain(`.${vClass}{`);
    }
    expect(vText, 'and its responsive form').toContain('.sm\\:place-items-center');
  });

  test('REQ-UI-072 with only trblazeui.css loaded, a grid tile centres its icon', async ({ page }) => {
    await page.goto(CSS);
    await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${CSS}"></head><body>
      <button><span id="tile" class="grid h-9 w-9 place-items-center rounded-lg">
        <svg id="icon" width="18" height="18" viewBox="0 0 24 24"><rect width="24" height="24"/></svg>
      </span></button>
      <div id="box" class="grid h-24 w-24 place-content-center"><span id="dot" class="block h-4 w-4"></span></div>
    </body></html>`, { waitUntil: 'load' });

    const vTile = (await page.locator('#tile').boundingBox())!;
    const vIcon = (await page.locator('#icon').boundingBox())!;
    expect(vTile.width).toBeCloseTo(36, 0);
    expect(Math.abs((vIcon.x + vIcon.width / 2) - (vTile.x + vTile.width / 2)), 'icon centred across').toBeLessThanOrEqual(1);
    expect(Math.abs((vIcon.y + vIcon.height / 2) - (vTile.y + vTile.height / 2)), 'icon centred down').toBeLessThanOrEqual(1);

    const vBox = (await page.locator('#box').boundingBox())!;
    const vDot = (await page.locator('#dot').boundingBox())!;
    expect(Math.abs((vDot.x + vDot.width / 2) - (vBox.x + vBox.width / 2))).toBeLessThanOrEqual(1);
    expect(Math.abs((vDot.y + vDot.height / 2) - (vBox.y + vBox.height / 2))).toBeLessThanOrEqual(1);
  });
});
