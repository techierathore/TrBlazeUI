// Acceptance test for Sevak consumer feedback TR-045 (docs/Sevak-TrBlazeUI-Feedback.md):
// REQ-UI-053 the toast description must clear WCAG 2.1 AA contrast — it is no longer dimmed with
// opacity-90 and uses the full foreground colour.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

// Sample a CSS colour value into sRGB [r,g,b,a] by drawing it on a canvas.
async function sampleColor(aPage: Page, aColor: string): Promise<[number, number, number, number]> {
  return aPage.evaluate((aColorValue) => {
    const vCanvas = document.createElement('canvas');
    vCanvas.width = 1;
    vCanvas.height = 1;
    const vCtx = vCanvas.getContext('2d')!;
    vCtx.fillStyle = aColorValue;
    vCtx.fillRect(0, 0, 1, 1);
    return Array.from(vCtx.getImageData(0, 0, 1, 1).data) as [number, number, number, number];
  }, aColor);
}

// Relative luminance of an sRGB colour (ignoring alpha).
function luminance(aR: number, aG: number, aB: number): number {
  const vChannel = (aValue: number) => {
    const vS = aValue / 255;
    return vS <= 0.03928 ? vS / 12.92 : Math.pow((vS + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * vChannel(aR) + 0.7152 * vChannel(aG) + 0.0722 * vChannel(aB);
}

function contrast(aL1: number, aL2: number): number {
  return (Math.max(aL1, aL2) + 0.05) / (Math.min(aL1, aL2) + 0.05);
}

test.describe('Sevak TR-045 — toast description contrast', () => {
  test('REQ-UI-053 the toast description is not dimmed and clears 4.5:1 contrast', async ({ page }) => {
    await open(page, '/components/toast');

    // Show a persistent toast so the description stays in the DOM.
    await page.locator('[data-testid="toast-tr045-trigger"]').click();
    const vToast = page.locator('[role="alert"]').last();
    await expect(vToast).toBeVisible();

    const vDescription = vToast.locator('div.text-sm:not(.font-semibold)');
    await expect(vDescription).toHaveText('This description is drawn at full opacity so it stays legible.');

    const vClass = await vDescription.getAttribute('class') ?? '';
    expect(vClass, 'description must not dim with opacity-90').not.toContain('opacity-90');

    const vForeground = await vDescription.evaluate(aNode => getComputedStyle(aNode).color);
    const vBackground = await vToast.evaluate(aNode => getComputedStyle(aNode).backgroundColor);
    const vFgRgba = await sampleColor(page, vForeground);
    const vBgRgba = await sampleColor(page, vBackground);
    expect(vFgRgba[3], 'description colour is fully opaque').toBe(255);
    expect(vBgRgba[3], 'toast background is fully opaque').toBe(255);
    const vRatio = contrast(luminance(vFgRgba[0], vFgRgba[1], vFgRgba[2]), luminance(vBgRgba[0], vBgRgba[1], vBgRgba[2]));
    expect(vRatio, `description contrast ${vRatio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });
});
