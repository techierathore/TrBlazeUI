// Acceptance test for the Chatur output strip's line count (the owner's report of 19 Nov 2026,
// recorded in docs/Chatur-TrBlazeUI-Feedback.md): LogView's stated count - the role="status" summary
// such as "2 lines, 0 warnings, 0 failures." - was rebuilt only after 1.5 s without new output, so
// while a program kept writing it said "2 lines" beside 4. The panel now withdraws a count as soon as
// it is out of date, states the new one when the output pauses, and while the output never pauses
// it still states a fresh count at least every few seconds.
//
// The panel is fed the way Chatur's OutputStrip feeds it: one List<LogLine>, appended to and
// re-rendered line by line. The title starts with the checklist row id (tf-verify-tests.sh).
// Page: /verify-chatur-log-count. Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

// The lines on screen and the count the panel states, read in one go so they come from one paint.
async function snapshot(aPage: Page): Promise<{ shown: number; stated: string }> {
  return aPage.getByTestId('chatur-log').evaluate((aPanel) => ({
    shown: aPanel.querySelectorAll('[data-slot="log-view-line"]').length,
    stated: (aPanel.querySelector('[data-slot="log-view-status"]')?.textContent || '').trim(),
  }));
}

const statedNumber = (aStated: string): number | null => {
  const vMatch = /^(\d+) lines?,/.exec(aStated);
  return vMatch ? Number(vMatch[1]) : null;
};

test.describe('Chatur — LogView never states a line count other than the lines it shows', () => {
  test('REQ-UI-073 after 2 more lines arrive the panel no longer says "2 lines", then says "4 lines"', async ({ page }) => {
    await page.goto(`${BASE}/verify-chatur-log-count`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.getByTestId('add-two').click();
    await expect.poll(async () => (await snapshot(page)).stated, { timeout: 6000 })
      .toBe('2 lines, 0 warnings, 0 failures.');

    await page.getByTestId('add-two').click();
    await expect.poll(async () => (await snapshot(page)).shown).toBe(4);
    const vRightAfter = await snapshot(page);
    expect(statedNumber(vRightAfter.stated), `with 4 lines shown the panel states "${vRightAfter.stated}"`).not.toBe(2);

    await expect.poll(async () => (await snapshot(page)).stated, { timeout: 6000 })
      .toBe('4 lines, 0 warnings, 0 failures.');
  });

  test('REQ-UI-073 while a program keeps writing, every count the panel states matches the lines shown', async ({ page }) => {
    await page.goto(`${BASE}/verify-chatur-log-count`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.getByTestId('add-two').click();
    await expect.poll(async () => (await snapshot(page)).stated, { timeout: 6000 }).toMatch(/^2 lines/);

    // Every change to the stated count is recorded in the page, with the lines shown at that moment,
    // so nothing depends on how often the test can look while the server is busy.
    await page.getByTestId('chatur-log').evaluate((aPanel) => {
      const vStatus = aPanel.querySelector('[data-slot="log-view-status"]')!;
      const vSeen: { stated: string; shown: number }[] = [];
      (window as unknown as { tfStated: typeof vSeen }).tfStated = vSeen;
      new MutationObserver(() => {
        vSeen.push({
          stated: (vStatus.textContent || '').trim(),
          shown: aPanel.querySelectorAll('[data-slot="log-view-line"]').length,
        });
      }).observe(vStatus, { childList: true, characterData: true, subtree: true });
    });

    await page.getByTestId('stream').click();
    await expect.poll(async () => (await snapshot(page)).shown, { timeout: 10000 }).toBe(14);
    const vRecords = await page.evaluate(() =>
      (window as unknown as { tfStated: { stated: string; shown: number }[] }).tfStated);
    const vStatedCounts = vRecords.filter((aRecord) => statedNumber(aRecord.stated) !== null);
    const vWrong = vStatedCounts.filter((aRecord) => statedNumber(aRecord.stated) !== aRecord.shown)
      .map((aRecord) => `${aRecord.stated} with ${aRecord.shown} shown`);
    expect(vWrong, 'no stated count contradicts the lines on screen').toEqual([]);
    expect(vStatedCounts.some((aRecord) => aRecord.shown > 2 && aRecord.shown < 14),
      `a fresh count is stated while the output never pauses (${JSON.stringify(vRecords)})`).toBe(true);

    await expect.poll(async () => (await snapshot(page)).stated, { timeout: 8000 })
      .toBe('14 lines, 0 warnings, 0 failures.');
  });
});
