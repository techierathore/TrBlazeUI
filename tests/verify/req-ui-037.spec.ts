// Acceptance tests for Sevak consumer feedback (docs/Sevak-TrBlazeUI-Feedback.md), builder B:
// REQ-UI-037 NumericInput/Slider ARIA range attributes (TR-033, TR-034), REQ-UI-038 NumberInput
// fails the build (TR-039), REQ-UI-039 Textarea Rows/MaxRows (TR-026), REQ-UI-042 Select placeholder
// when no item carries the bound value (TR-024).
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. Measured in-process against the demo pages. Base URL: BASE_URL, else http://localhost:5213.
import { test, expect, Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const INVARIANT_NUMBER = /^-?\d+(\.\d+)?$/;

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

test.describe('Sevak feedback — builder B (TR-033, TR-034, TR-039, TR-026, TR-024)', () => {
  test('REQ-UI-037 NumericInput is a spinbutton whose range attributes are invariant numbers, and so are the Slider\'s', async ({ page }) => {
    await open(page, '/components/numeric-input');

    const vPlain = page.locator('[data-testid="numeric-plain"] input');
    await expect(vPlain, 'a NumericInput without buttons is still a spinbutton').toHaveAttribute('role', 'spinbutton');
    expect(await vPlain.getAttribute('aria-valuenow'), 'aria-valuenow is a dot-decimal number').toMatch(INVARIANT_NUMBER);

    const vButtons = page.locator('[data-testid="numeric-buttons"] input');
    await expect(vButtons).toHaveAttribute('role', 'spinbutton');
    for (const vAttr of ['aria-valuemin', 'aria-valuemax', 'aria-valuenow']) {
      expect(await vButtons.getAttribute(vAttr), `${vAttr} is a dot-decimal number`).toMatch(INVARIANT_NUMBER);
    }

    // Every numeric input on the page carries the role: range attributes are valid nowhere else.
    const vWithoutRole = await page.locator('input[inputmode]:not([role="spinbutton"])').count();
    expect(vWithoutRole, 'no numeric input carries range attributes without the spinbutton role').toBe(0);

    await open(page, '/components/slider');
    const vSliders = page.locator('[role="slider"]');
    expect(await vSliders.count()).toBeGreaterThan(0);
    for (let vI = 0; vI < await vSliders.count(); vI++) {
      for (const vAttr of ['aria-valuemin', 'aria-valuemax', 'aria-valuenow']) {
        expect(await vSliders.nth(vI).getAttribute(vAttr), `slider ${vI} ${vAttr}`).toMatch(INVARIANT_NUMBER);
      }
    }
  });

  test('REQ-UI-038 NumberInput exists only as a build-breaking shim that names NumericInput', async () => {
    // The compile-time proof is the CS0619 error a razor file using <NumberInput> produces, recorded
    // in the row's Remark when it was built. This guards the shim so it cannot quietly disappear.
    const vFile = path.resolve(__dirname, '../../src/TrBlazeUI.Components/Components/NumericInput/NumberInput.cs');
    const vSource = fs.readFileSync(vFile, 'utf8');
    expect(vSource, 'the shim is Obsolete').toContain('[Obsolete(');
    expect(vSource, 'the Obsolete attribute is an error, not a warning').toContain('error: true');
    expect(vSource, 'the message names the real component').toContain('use NumericInput<TValue>');
    expect(vSource).toContain('class NumberInput<TValue>');
  });

  test('REQ-UI-039 a Textarea with Rows and MaxRows starts at Rows lines, grows with its text and scrolls at MaxRows', async ({ page }) => {
    await open(page, '/components/textarea');

    const vBox = page.locator('[data-testid="textarea-rows"]');
    await expect(vBox).toHaveAttribute('rows', '3');

    const vBefore = await vBox.evaluate(el => {
      const vCs = getComputedStyle(el);
      return { h: el.clientHeight, maxH: vCs.maxHeight, minH: vCs.minHeight, lineH: vCs.lineHeight };
    });
    expect(vBefore.maxH, 'MaxRows gives a computed max-height').not.toBe('none');
    expect(vBefore.minH, 'Rows gives a computed min-height').not.toBe('0px');

    await vBox.click();
    await vBox.type(Array.from({ length: 10 }, (_, vI) => `line ${vI + 1}`).join('\n'));
    await page.waitForTimeout(400);

    const vAfter = await vBox.evaluate(el => ({ h: el.clientHeight, scrollH: el.scrollHeight }));
    expect(vAfter.h, 'the box grew from its three-line start').toBeGreaterThan(vBefore.h);
    expect(vAfter.scrollH, 'past MaxRows the box scrolls instead of growing').toBeGreaterThan(vAfter.h);
    expect(vAfter.h, 'the cap is at most the max-height').toBeLessThanOrEqual(Math.ceil(parseFloat(vBefore.maxH)));
  });

  test('REQ-UI-042 a Select bound to a value no item carries shows its placeholder, and the picked item\'s text afterwards', async ({ page }) => {
    await open(page, '/components/select');

    const vTrigger = page.locator('[data-testid="select-int-trigger"]');
    expect((await vTrigger.innerText()).trim(), 'the int default 0 matches no item, so the placeholder shows').toBe('Select a number');

    await vTrigger.click();
    await page.getByRole('option', { name: 'Three', exact: true }).click();
    await page.waitForTimeout(300);
    expect((await vTrigger.innerText()).trim()).toBe('Three');
  });
});
