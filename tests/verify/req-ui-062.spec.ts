// Acceptance test for Chatur consumer feedback TR-022
// (/mnt/c/1MyCode/Chatur/docs/Chatur-TrBlazeUI-Feedback.md): a focused Input or SelectTrigger carried
// ring-offset-2, so a 4px band was drawn outside the border; with a Label directly above the field the
// band touched the label, which read as missing padding in every dialog. Menu items were 8px across.
//
// Measured on a focused field inside a Dialog at 1280 and 390 wide:
//   - the ring offset is 0 (the band outside the border is the ring alone, at most 3px);
//   - a Label placed directly before the field keeps a gap, and the ring does not reach it;
//   - a Label + field pair inside a `grid gap-2` keeps exactly its grid gap (no second gap added);
//   - a DropdownMenuItem is 10px across.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Harness page: demos/TrBlazeUI.Demo.Shared/Pages/VerifyTr022Chatur.razor (/verify-chatur-tr022).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

interface FieldProbe {
  offsetVar: string;
  band: number;
  gap: number;
}

/** Focuses the field and measures its ring band and the gap to the label above it. */
async function probeField(aPage: Page, aLabelId: string, aFieldId: string): Promise<FieldProbe> {
  await aPage.getByTestId(aFieldId).focus();
  await aPage.waitForTimeout(250);
  return aPage.evaluate(([aLabel, aField]) => {
    const vLabel = document.querySelector(`[data-testid="${aLabel}"]`) as HTMLElement;
    const vField = document.querySelector(`[data-testid="${aField}"]`) as HTMLElement;
    const vStyle = getComputedStyle(vField);
    // Each box-shadow layer ends with its spread ("... 0px 0px 0px 4px"); the widest one is the band
    // drawn outside the border.
    const vSpreads = [...vStyle.boxShadow.matchAll(/(-?[\d.]+)px(?=\s*(,|$|inset))/g)].map(m => parseFloat(m[1]));
    return {
      offsetVar: vStyle.getPropertyValue('--tw-ring-offset-width').trim(),
      band: vSpreads.length ? Math.max(...vSpreads) : 0,
      gap: vField.getBoundingClientRect().top - vLabel.getBoundingClientRect().bottom,
    };
  }, [aLabelId, aFieldId]);
}

for (const vWidth of [1280, 390]) {
  test(`REQ-UI-062 a focused field in a Dialog has no ring offset and its Label keeps a gap at ${vWidth}`, async ({ page }) => {
    await page.setViewportSize({ width: vWidth, height: 900 });
    await page.goto(`${BASE}/verify-chatur-tr022`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="verify-heading"]');
    await page.waitForTimeout(1500);

    await page.getByTestId('open-dialog').click();
    await expect(page.getByTestId('dialog')).toBeVisible();

    for (const [vLabel, vField] of [['label-input', 'field-input'], ['label-textarea', 'field-textarea'], ['label-select', 'field-select']]) {
      const vProbe = await probeField(page, vLabel, vField);
      console.log(`${vWidth} ${vField}: offset=${vProbe.offsetVar || '(unset)'} band=${vProbe.band}px gap=${vProbe.gap.toFixed(1)}px`);
      expect(['', '0', '0px'], `${vField} ring offset`).toContain(vProbe.offsetVar);
      expect(vProbe.band, `${vField} band outside the border`).toBeGreaterThan(0);
      expect(vProbe.band, `${vField} band outside the border`).toBeLessThanOrEqual(3);
      expect(vProbe.gap, `${vField} gap under its label`).toBeGreaterThanOrEqual(6);
      expect(vProbe.gap - vProbe.band, `${vField} ring clear of its label`).toBeGreaterThanOrEqual(3);
    }

    // A grid that sets its own gap keeps exactly that gap (gap-2 = 8px), not 8px plus the label gap.
    const vGrid = await probeField(page, 'label-grid', 'field-grid');
    expect(vGrid.gap, 'grid gap-2 pair').toBeGreaterThanOrEqual(7.5);
    expect(vGrid.gap, 'grid gap-2 pair').toBeLessThanOrEqual(8.5);

    // The dialog still fits the screen.
    const vBox = await page.getByTestId('dialog').boundingBox();
    expect(vBox!.x).toBeGreaterThanOrEqual(0);
    expect(vBox!.x + vBox!.width).toBeLessThanOrEqual(vWidth);
    await page.screenshot({ path: `tests/.artifacts/verify/req-ui-062-dialog-${vWidth}.png` });

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('dialog')).toBeHidden();

    // Menu items and labels are 10px across.
    await page.getByTestId('menu-trigger').click();
    await expect(page.getByTestId('menu-item')).toBeVisible();
    for (const vId of ['menu-item', 'menu-label']) {
      const vPad = await page.getByTestId(vId).evaluate(e => [getComputedStyle(e).paddingLeft, getComputedStyle(e).paddingRight]);
      expect(vPad, vId).toEqual(['10px', '10px']);
    }
  });
}
