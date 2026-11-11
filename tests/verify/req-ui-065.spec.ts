// Acceptance test for Sevak consumer feedback TR-048 (docs/Sevak-TrBlazeUI-Feedback.md): on 2.1.9 a
// Select bound to "" whose items never carry "" ended the session as soon as its list was opened.
// SelectValue reached the context through `dynamic` and passed the value as a variable typed `object`,
// so the run-time binder looked for HasItemWithValue(object) and threw inside the render. Same cause as
// TechieBlog TR-077 (REQ-UI-061), fixed in 2.2.2; that test re-renders first, this one makes opening
// the list the very first interaction, as Sevak did, and covers the DisplayTextSelector shapes.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Harness page: demos/TrBlazeUI.Demo.Shared/Pages/VerifySevakTr048.razor (/verify-sevak-tr048).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

const CASES = [
  { id: 'plain', placeholder: 'Choose a status', pick: 'Closed' },
  { id: 'selector', placeholder: 'Choose a priority', pick: 'High' },
  { id: 'bound', placeholder: 'Choose an owner', pick: 'Ravi' },
];

/** Collects page errors and console errors so a binder exception cannot slip by. */
function watchErrors(aPage: Page): string[] {
  const vErrors: string[] = [];
  aPage.on('pageerror', e => vErrors.push(e.message));
  aPage.on('console', m => { if (m.type() === 'error') vErrors.push(m.text()); });
  return vErrors;
}

test.describe('Sevak TR-048 — a Select bound to an empty string opens and keeps its placeholder', () => {
  for (const c of CASES) {
    test(`REQ-UI-065 opening a Select bound to "" first thing shows the list and keeps the placeholder (${c.id})`, async ({ page }) => {
      const vErrors = watchErrors(page);
      await page.goto(`${BASE}/verify-sevak-tr048`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid="verify-heading"]');
      await page.waitForTimeout(1500);

      await expect(page.getByTestId(`${c.id}-value`)).toHaveText(c.placeholder);

      // Sevak's step: click the trigger. On 2.1.9 this is where the session ended.
      await page.getByTestId(`${c.id}-trigger`).click();
      await expect(page.getByRole('option', { name: c.pick })).toBeVisible();
      await expect(page.getByTestId(`${c.id}-value`)).toHaveText(c.placeholder);

      await page.keyboard.press('Escape');
      await expect(page.getByTestId(`${c.id}-value`)).toHaveText(c.placeholder);

      // Open again and pick: a real choice still shows the item's text.
      await page.getByTestId(`${c.id}-trigger`).click();
      await page.getByRole('option', { name: c.pick }).click();
      await expect(page.getByTestId(`${c.id}-value`)).toHaveText(c.pick);

      await expect(page.locator('#blazor-error-ui')).toBeHidden();
      expect(vErrors.filter(e => /RuntimeBinder|unhandled|HasItemWithValue|overloaded method/i.test(e))).toEqual([]);
    });
  }

  test('REQ-UI-065 the Select demo shows the placeholder for a value no item carries, open and closed', async ({ page }) => {
    const vErrors = watchErrors(page);
    await page.goto(`${BASE}/components/select`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(page.getByTestId('select-unmatched-value')).toHaveText('Choose a status');
    await page.getByTestId('select-unmatched-trigger').click();
    await expect(page.getByRole('option', { name: 'Closed' })).toBeVisible();
    await expect(page.getByTestId('select-unmatched-value')).toHaveText('Choose a status');
    await page.keyboard.press('Escape');

    await expect(page.locator('#blazor-error-ui')).toBeHidden();
    expect(vErrors.filter(e => /RuntimeBinder|unhandled|HasItemWithValue|overloaded method/i.test(e))).toEqual([]);
  });
});
