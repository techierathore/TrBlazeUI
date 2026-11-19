// Acceptance test for MyDiary consumer feedback TR-001 (MyDiary-TrBlazeUI-Feedback.md): the Calendar
// could not mark the days that have content, so a journal could not show at a glance which days hold
// an entry. Calendar now takes MarkedDates (which days to mark) and MarkedLabel (what a screen reader
// hears for a marked day). A changed set of marks - or a changed Class - reaches the grid on the
// parent's next render; the calendar used to skip renders unless the selected or shown month moved.
//
// Page: /verify-mydiary-tr001, November 2026 with entries on the 3rd, 10th and 19th.
// The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

const day = (aPage: Page, aDay: number) =>
  aPage.getByTestId('diary-calendar').locator('button[id]:not([disabled])', { hasText: new RegExp(`^${aDay}\\b`) }).first();

test.describe('MyDiary TR-001 — the Calendar can mark the days that have content', () => {
  test('REQ-UI-077 marked days carry a dot and a spoken label; other days do not', async ({ page }) => {
    await page.goto(`${BASE}/verify-mydiary-tr001`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    for (const vDay of [3, 10, 19]) {
      const vButton = day(page, vDay);
      await expect(vButton).toHaveAttribute('data-marked', 'true');
      await expect(vButton.locator('[data-slot="calendar-day-mark"]')).toBeVisible();
      await expect(vButton).toHaveAccessibleName(`${vDay}, has an entry`);
    }
    const vPlain = day(page, 4);
    await expect(vPlain).not.toHaveAttribute('data-marked', 'true');
    await expect(vPlain.locator('[data-slot="calendar-day-mark"]')).toHaveCount(0);
    await expect(vPlain).toHaveAccessibleName('4');

    // A marked day can still be picked.
    await day(page, 19).click();
    await expect(page.getByTestId('diary-picked')).toHaveText('2026-11-19');
  });

  test('REQ-UI-077 a mark added after the first render, and a new Class, reach the grid', async ({ page }) => {
    await page.goto(`${BASE}/verify-mydiary-tr001`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await expect(day(page, 25)).not.toHaveAttribute('data-marked', 'true');
    await page.getByTestId('diary-add-entry').click();
    await expect(day(page, 25)).toHaveAttribute('data-marked', 'true');
    await expect(page.getByTestId('diary-calendar')).toHaveClass(/\bborder-primary\b/);
  });
});
