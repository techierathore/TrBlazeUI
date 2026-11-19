// Acceptance test for Sevak consumer feedback TR-042 (docs/Sevak-TrBlazeUI-Feedback.md): on 1.0.7
// Combobox had a public Id property that was not a [Parameter], so Id="task-goal-picker" threw
// "has a property matching the name 'Id', but it does not have [Parameter]" and ended the session.
// Fixed in 2.1.4 (Id is private, unmatched attributes reach the root); no test held it until now.
//
// Page: /verify-sevak-tr042, Sevak's Add task dialog with Id and id on two pickers.
// The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

test.describe('Sevak TR-042 — a Combobox takes Id or id inside a Dialog', () => {
  test('REQ-UI-078 the dialog opens, both ids reach the page and the session keeps answering', async ({ page }) => {
    const vErrors: string[] = [];
    page.on('console', (aMessage) => { if (aMessage.type() === 'error') vErrors.push(aMessage.text()); });
    await page.goto(`${BASE}/verify-sevak-tr042`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.getByTestId('open-add-task').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#task-goal-picker')).toHaveCount(1);
    await expect(page.locator('#task-other-goal-picker')).toHaveCount(1);
    await expect(page.locator('#blazor-error-ui')).toBeHidden();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByTestId('ping').click();
    await expect(page.getByTestId('ping-count')).toHaveText('1');
    expect(vErrors.filter((aError) => /does not have \[Parameter\]|unhandled/i.test(aError))).toEqual([]);
  });
});
