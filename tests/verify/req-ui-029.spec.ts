// Acceptance test for REQ-UI-029 — a Switch that is off can draw a visible border through
// Outlined (Chatur TR-014, docs/Chatur-TrBlazeUI-Feedback.md).
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. Unlike the batch-3 specs this one measures in-process: it needs only the Switch demo page
// (/components/switch) and the data-testid anchors of its "Outlined" section. Base URL handling
// matches the other specs: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

type Border = { style: string; color: string; width: string };

async function readBorder(aPage: Page, aTestId: string): Promise<Border> {
  return aPage.locator(`[data-testid="${aTestId}"]`).evaluate(el => {
    const vCs = getComputedStyle(el);
    return { style: vCs.borderTopStyle, color: vCs.borderTopColor, width: vCs.borderTopWidth };
  });
}

/** The theme's --border resolved by the browser to the same colour format a border reports. */
async function themeBorderColour(aPage: Page): Promise<string> {
  return aPage.evaluate(() => {
    const vProbe = document.createElement('div');
    vProbe.style.borderTop = '2px solid var(--border)';
    document.body.appendChild(vProbe);
    const vColour = getComputedStyle(vProbe).borderTopColor;
    vProbe.remove();
    return vColour;
  });
}

function isTransparent(aColour: string): boolean {
  return aColour === 'transparent' || /rgba\(0,\s*0,\s*0,\s*0\)/.test(aColour) || /\/\s*0\)$/.test(aColour);
}

test.describe('REQ-UI-029 — Switch Outlined (Chatur TR-014)', () => {
  test('REQ-UI-029 an Outlined switch draws a border in the theme border colour while off and a transparent one while on, and a default switch is unchanged', async ({ page }) => {
    await page.goto(`${BASE}/components/switch`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);

    const vThemeBorder = await themeBorderColour(page);
    expect(isTransparent(vThemeBorder), `--border resolves to a visible colour (${vThemeBorder})`).toBe(false);

    // Outlined, off: a solid, visible border in the theme border colour.
    const vOff = await readBorder(page, 'switch-outlined-off');
    expect(vOff.style, 'outlined-off border-style').toBe('solid');
    expect(vOff.width, 'outlined-off border width unchanged (border-2)').toBe('2px');
    expect(isTransparent(vOff.color), `outlined-off border colour is visible (${vOff.color})`).toBe(false);
    expect(vOff.color, 'outlined-off border colour equals --border').toBe(vThemeBorder);
    // The rule must show against its own track: themes commonly set --input equal to --border,
    // so a border on the default bg-input track would be invisible.
    const vOffTrack = await page.locator('[data-testid="switch-outlined-off"]').evaluate(el => getComputedStyle(el).backgroundColor);
    expect(vOffTrack, 'outlined-off track colour differs from its border colour').not.toBe(vOff.color);

    // Outlined, on: transparent.
    const vOn = await readBorder(page, 'switch-outlined-on');
    expect(isTransparent(vOn.color), `outlined-on border colour is transparent (${vOn.color})`).toBe(true);
    expect(vOn.width, 'outlined-on border width unchanged (border-2)').toBe('2px');

    // Not outlined, off: transparent, as before the change.
    const vDefault = await readBorder(page, 'switch-default-off');
    expect(isTransparent(vDefault.color), `default off border colour is transparent (${vDefault.color})`).toBe(true);
    expect(vDefault.width, 'default border width unchanged (border-2)').toBe('2px');

    // Turning the outlined-off switch on makes its border transparent.
    const vSwitch = page.locator('[data-testid="switch-outlined-off"]');
    await vSwitch.click();
    await expect(vSwitch).toHaveAttribute('aria-checked', 'true');
    await expect.poll(async () => isTransparent((await readBorder(page, 'switch-outlined-off')).color),
      { message: 'outlined switch border turns transparent once it is on', timeout: 5000 }).toBe(true);
  });
});
