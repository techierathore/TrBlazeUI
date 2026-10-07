// Acceptance test for Chatur consumer-feedback batch 6 (docs/Chatur-TrBlazeUI-Feedback.md,
// TR-018, filed 2026-10-07 against 2.1.3): REQ-UI-033 EditorTabs.CloseContent, the close mark drawn
// by the consumer (a text ×) in place of the built-in svg, with the button's accessible name kept.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Measured in-process against the demo page and its data-testid anchors. Base URL: BASE_URL, else
// the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

test.describe('Chatur batch 6 — consumer-feedback fix (TR-018)', () => {
  test('REQ-UI-033 CloseContent draws the close mark as text, keeps the accessible name, and a strip without it keeps the svg', async ({ page }) => {
    await open(page, '/components/code-editor');

    // Every close button in the CloseContent strip holds the text glyph and no svg.
    const vTextCloses = page.locator('[data-testid="editor-tabs-text-close"] [data-slot="editor-tab-close"]');
    await expect(vTextCloses, 'three tabs, three close buttons').toHaveCount(3);
    for (let vIndex = 0; vIndex < 3; vIndex++) {
      const vClose = vTextCloses.nth(vIndex);
      await expect(vClose.locator('svg'), `close ${vIndex} draws no svg`).toHaveCount(0);
      expect((await vClose.innerText()).trim(), `close ${vIndex} draws the × glyph`).toBe('×');
      expect(await vClose.getAttribute('aria-label'), `close ${vIndex} keeps its accessible name`).toMatch(/^Close /);
    }

    // The accessible name is the button's own, unchanged by the content.
    const vProcessesClose = page.locator('[data-testid="tab-text-processes"] [data-slot="editor-tab-close"]');
    await expect(vProcessesClose).toHaveAttribute('aria-label', 'Close Processes');

    // The button still works: closing removes the tab and the page records the label.
    await vProcessesClose.click();
    await expect(page.locator('[data-testid="text-close-last-closed"]')).toHaveText('Processes');
    await expect(page.locator('[data-testid="tab-text-processes"]')).toHaveCount(0);
    await expect(vTextCloses).toHaveCount(2);

    // A strip without CloseContent is unchanged: each close button holds exactly one svg.
    const vDefaultCloses = page.locator('[data-testid="editor-tabs"] [data-slot="editor-tab-close"]');
    await expect(vDefaultCloses, 'default strip keeps its three close buttons').toHaveCount(3);
    for (let vIndex = 0; vIndex < 3; vIndex++) {
      await expect(vDefaultCloses.nth(vIndex).locator('svg'), `default close ${vIndex} keeps the svg`).toHaveCount(1);
      expect((await vDefaultCloses.nth(vIndex).innerText()).trim(), `default close ${vIndex} draws no text`).toBe('');
    }
  });
});
