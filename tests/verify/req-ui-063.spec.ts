// Acceptance tests for Chatur consumer-feedback TR-023 and TR-024 (docs/Chatur-TrBlazeUI-Feedback.md,
// filed 2026-11-04 against 2.2.2):
//   REQ-UI-063 the arrow keys reach a MenubarSubTrigger in its on-screen place, not after every
//              plain item of the list.
//   REQ-UI-064 a submenu list that fits neither side of the window at 390 px is pulled back inside
//              it, over part of its parent list, and its items still work.
//
// Titles start with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page, Locator } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const MARGIN = 8;

async function open(aPage: Page, aPath: string, aWidth = 1280): Promise<void> {
  await aPage.setViewportSize({ width: aWidth, height: 900 });
  await aPage.goto(`${BASE}${aPath}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

const byId = (aPage: Page, aId: string): Locator => aPage.locator(`[data-testid="${aId}"]`);

// The text of the menu row that has the focus, trimmed. Anything else that has the focus reads as
// its role in brackets, so a list holding the expected text never passes.
async function focusedText(aPage: Page): Promise<string> {
  return aPage.evaluate(() => {
    const vElement = document.activeElement;
    const vRole = vElement?.getAttribute('role') || '';
    if (!vRole.startsWith('menuitem')) return `[${vRole || vElement?.tagName || 'none'}]`;
    return (vElement?.textContent || '').replace(/\s+/g, ' ').trim();
  });
}

// Presses ArrowDown aCount times and returns the row that has the focus after each press.
async function walkDown(aPage: Page, aCount: number): Promise<string[]> {
  const vRows: string[] = [];
  for (let vI = 0; vI < aCount; vI++) {
    await aPage.keyboard.press('ArrowDown');
    await aPage.waitForTimeout(120);
    vRows.push(await focusedText(aPage));
  }
  return vRows;
}

test.describe('Chatur TR-023 — the arrow keys reach a submenu row in its place', () => {
  test('REQ-UI-063 ArrowDown walks the File menu in document order, submenu rows in their place', async ({ page }) => {
    await open(page, '/components/menubar');
    await byId(page, 'menubar-sub-file').click();

    // The File menu draws: New project, Recent projects ▸, Save (disabled), Recent folders ▸, Close project.
    const vRows = await walkDown(page, 4);
    expect(vRows[0]).toBe('New project');
    expect(vRows[1], 'the first ▸ row comes second, not after every plain item').toContain('Recent projects');
    expect(vRows[2], 'the disabled Save is skipped; the second ▸ row is next').toContain('Recent folders');
    expect(vRows[3], 'the plain item after the ▸ rows comes last').toBe('Close project');

    // ArrowUp walks the same order backwards, and End lands on the last row, not on a ▸ row.
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => focusedText(page)).toContain('Recent folders');
    await page.keyboard.press('End');
    await expect.poll(() => focusedText(page)).toBe('Close project');
    await page.keyboard.press('Home');
    await expect.poll(() => focusedText(page)).toBe('New project');

    // The ▸ row reached by the arrows still opens from the keyboard.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toContain('Recent folders');
    await page.keyboard.press('ArrowRight');
    await expect(byId(page, 'menubar-sub-folders-list')).toBeVisible();
    await expect.poll(() => focusedText(page)).toContain('ChaturUI');
    await page.keyboard.press('Escape');
    await expect(byId(page, 'menubar-sub-folders-list')).toBeHidden();
    await expect.poll(() => focusedText(page)).toContain('Recent folders');

    // Pointing at a ▸ row makes it the current row, so ArrowDown continues from it.
    await byId(page, 'menubar-sub-recent').hover();
    await expect(byId(page, 'menubar-sub-recent-list')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page), { message: 'from Recent projects, down skips Save and lands on Recent folders' }).toContain('Recent folders');
    await page.keyboard.press('Escape');
  });
});

test.describe('Chatur TR-024 — a submenu with no room on either side stays inside the window', () => {
  test('REQ-UI-064 at 390 px File ▸ Recent folders is pulled back inside the window and its items still work', async ({ page }) => {
    await open(page, '/components/menubar', 390);
    await byId(page, 'menubar-sub-file').click();
    const vRow = byId(page, 'menubar-sub-folders');
    await vRow.click();
    const vList = byId(page, 'menubar-sub-folders-list');
    await expect(vList).toBeVisible();
    await expect.poll(async () => (await vList.getAttribute('style')) || '', { message: 'the list carries a pull-back' }).toContain('calc(100% - ');

    const vBox = await vList.boundingBox();
    const vRowBox = await vRow.boundingBox();
    expect(vBox!.x + vBox!.width, 'the list ends inside the window, with a margin').toBeLessThanOrEqual(390 - MARGIN + 1);
    expect(vBox!.x, 'and starts inside it').toBeGreaterThanOrEqual(MARGIN - 1);
    expect(vBox!.width, 'it is wider than either side of the File list has room for').toBeGreaterThan(390 - (vRowBox!.x + vRowBox!.width));
    expect(vBox!.width).toBeGreaterThan(vRowBox!.x);

    // The rows are not clipped: the last item's text ends inside the window too.
    const vItem = byId(page, 'menubar-sub-folder-components');
    const vItemBox = await vItem.boundingBox();
    expect(vItemBox!.x + vItemBox!.width).toBeLessThanOrEqual(390 - MARGIN + 1);
    await vItem.click();
    await expect(byId(page, 'menubar-sub-choice')).toContainText('Components');
    await expect(vList).toBeHidden();
  });

  test('REQ-UI-064 at 1280 px the same list opens beside its row with no pull-back', async ({ page }) => {
    await open(page, '/components/menubar');
    await byId(page, 'menubar-sub-file').click();
    const vRow = byId(page, 'menubar-sub-folders');
    await vRow.hover();
    const vList = byId(page, 'menubar-sub-folders-list');
    await expect(vList).toBeVisible();
    await expect(vList).toHaveAttribute('data-side', 'right');
    expect(await vList.getAttribute('style'), 'no pull-back when the list fits').toBeNull();
    const vRowBox = await vRow.boundingBox();
    const vBox = await vList.boundingBox();
    expect(vBox!.x, 'the list opens to the right of its row').toBeGreaterThanOrEqual(vRowBox!.x + vRowBox!.width - 2);
    await page.keyboard.press('Escape');
  });
});
