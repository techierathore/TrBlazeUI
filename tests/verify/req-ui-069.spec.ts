// Acceptance test for Sevak consumer feedback TR-050 (docs/Sevak-TrBlazeUI-Feedback.md): DatePicker's
// calendar closed only on a click outside it. Escape did nothing while the focus was on its button,
// and a second click on the button left it open, so a keyboard user could not close it without
// picking a date. Now Escape closes it from the button or from inside the calendar and puts the
// focus back on the button, and a second click on the button closes it, as Select does.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Page: the DatePicker demo, first picker (/components/date-picker).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page, Locator } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function openPage(aPage: Page, aWidth = 1280): Promise<Locator> {
  await aPage.setViewportSize({ width: aWidth, height: 900 });
  await aPage.goto(`${BASE}/components/date-picker`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
  // Held by its id: the name changes once a date is picked.
  const vId = await aPage.getByRole('button', { name: /Pick a date/ }).first().getAttribute('id');
  expect(vId, 'the button carries the trigger id').toBeTruthy();
  return aPage.locator(`[id="${vId}"]`);
}

// The calendar the button controls, found through its aria-controls.
async function calendarOf(aPage: Page, aButton: Locator): Promise<Locator> {
  const vId = await aButton.getAttribute('aria-controls');
  expect(vId, 'the button names the calendar it opens').toBeTruthy();
  return aPage.locator(`[id="${vId}"]`);
}

const focusedIsButton = (aPage: Page, aButton: Locator) =>
  aButton.evaluate((aElement) => document.activeElement === aElement);

test.describe('Sevak TR-050 — DatePicker closes on Escape and on a second click of its button', () => {
  for (const vWidth of [1280, 390]) {
    test(`REQ-UI-069 at ${vWidth} px Escape on the button closes the calendar and keeps the focus there`, async ({ page }) => {
      const vButton = await openPage(page, vWidth);
      await vButton.click();
      const vCalendar = await calendarOf(page, vButton);
      await expect(vCalendar).toBeVisible();
      await expect(vButton).toHaveAttribute('aria-expanded', 'true');

      await page.keyboard.press('Escape');
      await expect(vCalendar).toBeHidden();
      await expect(vButton).toHaveAttribute('aria-expanded', 'false');
      expect(await focusedIsButton(page, vButton), 'the focus stays on the button').toBe(true);
    });
  }

  test('REQ-UI-069 a second click on the button closes the calendar; a third opens it again', async ({ page }) => {
    const vButton = await openPage(page);
    await vButton.click();
    const vCalendar = await calendarOf(page, vButton);
    await expect(vCalendar).toBeVisible();

    await vButton.click();
    await expect(vCalendar).toBeHidden();

    await vButton.click();
    await expect(vCalendar).toBeVisible();
  });

  test('REQ-UI-069 Escape from inside the calendar closes it and gives the focus back to the button', async ({ page }) => {
    const vButton = await openPage(page);
    await vButton.click();
    const vCalendar = await calendarOf(page, vButton);
    await expect(vCalendar).toBeVisible();

    // Moving the month inside the calendar must not count as a click on the button.
    const vBefore = (await vCalendar.textContent()) || '';
    await vCalendar.getByRole('button', { name: 'Go to next month' }).click();
    await expect(vCalendar).toBeVisible();
    await expect.poll(async () => (await vCalendar.textContent()) || '').not.toBe(vBefore);

    await vCalendar.locator('button[tabindex="0"]').first().focus();
    await page.keyboard.press('Escape');
    await expect(vCalendar).toBeHidden();
    await expect.poll(() => focusedIsButton(page, vButton), { message: 'the focus is back on the button' }).toBe(true);
  });

  test('REQ-UI-069 picking a day and a click outside still close the calendar', async ({ page }) => {
    const vButton = await openPage(page);
    await vButton.click();
    let vCalendar = await calendarOf(page, vButton);
    await vCalendar.locator('button:not([disabled])', { hasText: /^15$/ }).first().click();
    await expect(vCalendar).toBeHidden();
    await expect(vButton).not.toContainText('Pick a date');

    await vButton.click();
    vCalendar = await calendarOf(page, vButton);
    await expect(vCalendar).toBeVisible();
    await page.mouse.click(5, 880);
    await expect(vCalendar).toBeHidden();
  });
});
