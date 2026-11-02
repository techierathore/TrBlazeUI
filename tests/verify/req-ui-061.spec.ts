// Acceptance test for TechieBlog consumer feedback TR-077
// (/mnt/c/1MyCode/TechieBlog/docs/TechieBlog-TrBlazeUI-Feedback.md): on 2.2.1 a Select bound to a value
// no item carries (TechieBlog: TValue="string" bound to "") threw RuntimeBinderException from
// SelectValue.GetSelectedText as soon as the page re-rendered. SelectValue reached the context through
// `dynamic` and passed the value as a statically typed `object`, so the binder looked for
// HasItemWithValue(object) and found only HasItemWithValue(TValue).
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Harness page: demos/TrBlazeUI.Demo.Shared/Pages/VerifyTr077.razor (/verify-tr077).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

test.describe('TechieBlog TR-077 — Select bound to an unmatched value survives a re-render', () => {
  test('REQ-UI-061 a Select bound to an empty string keeps its placeholder and does not throw when the page re-renders', async ({ page }) => {
    const vErrors: string[] = [];
    page.on('pageerror', e => vErrors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') vErrors.push(m.text()); });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/verify-tr077`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="verify-heading"]');
    await page.waitForTimeout(1500);

    // First paint. (The int Select may show its raw "9" until its items register: the documented
    // first-paint fallback, Sevak TR-024. The assertion on it comes after the re-renders below.)
    await expect(page.getByTestId('bulk-value')).toHaveText('Bulk Actions');

    // The consumer's path: type in a search box, which re-renders the page on every keystroke.
    await page.getByTestId('search').fill('fxv0');
    await page.getByTestId('search').blur();
    await expect(page.getByTestId('search-echo')).toHaveText('fxv0');

    // And an explicit re-render from a button, as the Delete button did.
    for (let i = 1; i <= 3; i++) {
      await page.getByTestId('rerender').click();
      await expect(page.getByTestId('render-count')).toHaveText(String(i));
    }

    // Open and close the listbox, so the items have certainly registered, then re-render again.
    await page.getByTestId('bulk-trigger').click();
    await expect(page.getByRole('option', { name: 'Publish' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByTestId('rerender').click();
    await expect(page.getByTestId('render-count')).toHaveText('4');

    await expect(page.getByTestId('bulk-value')).toHaveText('Bulk Actions');
    await expect(page.getByTestId('number-value')).toHaveText('Pick a number');
    await expect(page.locator('#blazor-error-ui')).toBeHidden();
    expect(vErrors.filter(e => /RuntimeBinder|unhandled|HasItemWithValue/i.test(e))).toEqual([]);

    // A real pick still shows the item's text.
    await page.getByTestId('bulk-trigger').click();
    await page.getByRole('option', { name: 'Delete' }).click();
    await expect(page.getByTestId('bulk-value')).toHaveText('Delete');
    await page.getByTestId('rerender').click();
    await expect(page.getByTestId('bulk-value')).toHaveText('Delete');
  });
});
