// Acceptance tests for Chatur consumer-feedback TR-020 and TR-021 (docs/Chatur-TrBlazeUI-Feedback.md,
// filed 2026-10-13 against 2.1.6):
//   REQ-UI-050 submenus for Menubar, DropdownMenu and ContextMenu — a row marked ▸ opens a list beside
//              it, ArrowRight opens, ArrowLeft or Escape closes, three levels deep.
//   REQ-UI-051 a disabled MenubarItem or MenubarCheckboxItem renders aria-disabled="true" and
//              data-disabled, so toBeDisabled() and a screen reader see it.
//
// Titles start with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page, Locator } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aPath: string, aWidth = 1280): Promise<void> {
  await aPage.setViewportSize({ width: aWidth, height: 900 });
  await aPage.goto(`${BASE}${aPath}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

const byId = (aPage: Page, aId: string): Locator => aPage.locator(`[data-testid="${aId}"]`);

// The text of the menu row that has the focus, trimmed. Anything else that has the focus (a whole
// list, the page) reads as its role in brackets, so a list holding the expected text never passes.
async function focusedText(aPage: Page): Promise<string> {
  return aPage.evaluate(() => {
    const vElement = document.activeElement;
    const vRole = vElement?.getAttribute('role') || '';
    if (!vRole.startsWith('menuitem')) return `[${vRole || vElement?.tagName || 'none'}]`;
    return (vElement?.textContent || '').replace(/\s+/g, ' ').trim();
  });
}

// The list opens beside its row: its left edge is at or past the row's right edge, or (flipped) its
// right edge at or before the row's left edge.
async function expectBeside(aRow: Locator, aList: Locator): Promise<void> {
  const vRow = await aRow.boundingBox();
  const vList = await aList.boundingBox();
  expect(vRow && vList, 'row and list are both drawn').toBeTruthy();
  const vRight = vList!.x >= vRow!.x + vRow!.width - 2;
  const vLeft = vList!.x + vList!.width <= vRow!.x + 2;
  expect(vRight || vLeft, 'the list opens to the side of its row, not over or under it').toBe(true);
}

test.describe('Chatur TR-020 — submenus in Menubar, DropdownMenu and ContextMenu', () => {
  test('REQ-UI-050 Menubar submenu opens beside its ▸ row on hover and nests three levels', async ({ page }) => {
    await open(page, '/components/menubar');
    await byId(page, 'menubar-sub-file').click();

    const vRecent = byId(page, 'menubar-sub-recent');
    await expect(vRecent).toBeVisible();
    await expect(vRecent).toHaveAttribute('aria-haspopup', 'menu');
    await expect(vRecent).toHaveAttribute('aria-expanded', 'false');

    // The ▸ is drawn at the right of the row.
    const vChevron = vRecent.locator('span[aria-hidden="true"]');
    await expect(vChevron).toHaveText('▸');
    const vRowBox = await vRecent.boundingBox();
    const vChevronBox = await vChevron.boundingBox();
    expect(vRowBox!.x + vRowBox!.width - (vChevronBox!.x + vChevronBox!.width), 'the ▸ sits at the right edge').toBeLessThan(16);

    // Level 2 and level 3 open beside their rows.
    await vRecent.hover();
    const vRecentList = byId(page, 'menubar-sub-recent-list');
    await expect(vRecentList).toBeVisible();
    await expect(vRecent).toHaveAttribute('aria-expanded', 'true');
    await expect(vRecentList).toHaveAttribute('role', 'menu');
    await expectBeside(vRecent, vRecentList);

    const vMore = byId(page, 'menubar-sub-more');
    await vMore.hover();
    const vMoreList = byId(page, 'menubar-sub-more-list');
    await expect(vMoreList).toBeVisible();
    await expectBeside(vMore, vMoreList);

    // Choosing an item three levels down runs it and closes the whole menu.
    await byId(page, 'menubar-sub-sevak').click();
    await expect(byId(page, 'menubar-sub-choice')).toContainText('Sevak');
    await expect(vRecent).toBeHidden();

    // View ▸ Zoom opens the same way.
    await byId(page, 'menubar-sub-view').click();
    await byId(page, 'menubar-sub-zoom').hover();
    await expect(byId(page, 'menubar-sub-zoom-list')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('REQ-UI-050 Menubar submenu keyboard: ArrowRight opens, ArrowLeft and Escape close one level', async ({ page }) => {
    await open(page, '/components/menubar');
    await byId(page, 'menubar-sub-file').click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toContain('Recent projects');

    await page.keyboard.press('ArrowRight');
    await expect(byId(page, 'menubar-sub-recent-list')).toBeVisible();
    await expect.poll(() => focusedText(page), { message: 'ArrowRight focuses the first item of the submenu' }).toBe('Chatur');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toContain('More');
    await page.keyboard.press('ArrowRight');
    await expect(byId(page, 'menubar-sub-more-list')).toBeVisible();
    await expect.poll(() => focusedText(page), { message: 'level 3 opens from the keyboard' }).toBe('Sevak');

    await page.keyboard.press('ArrowLeft');
    await expect(byId(page, 'menubar-sub-more-list')).toBeHidden();
    await expect.poll(() => focusedText(page), { message: 'ArrowLeft puts the focus back on the row' }).toContain('More');

    await page.keyboard.press('Escape');
    await expect(byId(page, 'menubar-sub-recent-list')).toBeHidden();
    await expect.poll(() => focusedText(page), { message: 'Escape closes one level and focuses its row' }).toContain('Recent projects');
    await expect(byId(page, 'menubar-sub-save'), 'the File menu itself is still open').toBeVisible();

    // Down from the row continues in the File menu, skipping the disabled Save.
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toBe('New project');

    await page.keyboard.press('Escape');
    await expect(byId(page, 'menubar-sub-save')).toBeHidden();
  });

  test('REQ-UI-050 Menubar submenu stays on screen at phone width', async ({ page }) => {
    await open(page, '/components/menubar', 390);
    await byId(page, 'menubar-sub-file').click();
    await byId(page, 'menubar-sub-recent').click();
    await byId(page, 'menubar-sub-more').click();
    const vList = byId(page, 'menubar-sub-more-list');
    await expect(vList).toBeVisible();
    const vBox = await vList.boundingBox();
    expect(vBox!.x + vBox!.width, 'the third level ends inside the 390 px screen').toBeLessThanOrEqual(391);
    expect(vBox!.x, 'and starts inside it').toBeGreaterThanOrEqual(-1);
  });

  test('REQ-UI-050 DropdownMenu submenu opens and closes from the keyboard, three levels', async ({ page }) => {
    await open(page, '/components/dropdown-menu');
    await byId(page, 'dropdown-sub-open').click();
    await page.waitForTimeout(1200);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toContain('Send to');

    await page.keyboard.press('ArrowRight');
    await expect(byId(page, 'dropdown-sub-send-list')).toBeVisible();
    await expectBeside(byId(page, 'dropdown-sub-send'), byId(page, 'dropdown-sub-send-list'));
    await expect.poll(() => focusedText(page)).toBe('Email');

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page), { message: 'the arrows stay inside the submenu' }).toContain('Apps');
    await page.keyboard.press('ArrowRight');
    await expect(byId(page, 'dropdown-sub-apps-list')).toBeVisible();
    await expect.poll(() => focusedText(page)).toBe('Slack');

    await page.keyboard.press('Escape');
    await expect(byId(page, 'dropdown-sub-apps-list')).toBeHidden();
    await expect.poll(() => focusedText(page)).toContain('Apps');
    await page.keyboard.press('ArrowLeft');
    await expect(byId(page, 'dropdown-sub-send-list')).toBeHidden();
    await expect.poll(() => focusedText(page)).toContain('Send to');

    // Hover opens it too, and an item deep down runs and closes the dropdown.
    await byId(page, 'dropdown-sub-send').hover();
    await byId(page, 'dropdown-sub-apps').hover();
    await byId(page, 'dropdown-sub-slack').click();
    await expect(page.getByText('Last action:')).toContainText('Slack');
    await expect(byId(page, 'dropdown-sub-send')).toBeHidden();
  });

  test('REQ-UI-050 ContextMenu submenu opens on hover and from the keyboard', async ({ page }) => {
    await open(page, '/components/context-menu');
    await byId(page, 'context-sub-area').click({ button: 'right' });
    const vRow = byId(page, 'context-sub-open-with');
    await expect(vRow).toBeVisible();
    await expect(vRow.locator('span[aria-hidden="true"]')).toHaveText('▸');

    await vRow.hover();
    await expect(byId(page, 'context-sub-open-with-list')).toBeVisible();
    await expectBeside(vRow, byId(page, 'context-sub-open-with-list'));
    await byId(page, 'context-sub-other').hover();
    await expect(byId(page, 'context-sub-other-list')).toBeVisible();
    await byId(page, 'context-sub-hex').click();
    await expect(page.getByText('Last action: Hex viewer')).toBeVisible();

    await byId(page, 'context-sub-area').click({ button: 'right' });
    await page.waitForTimeout(1200);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await expect(byId(page, 'context-sub-open-with-list')).toBeVisible();
    await expect.poll(() => focusedText(page)).toBe('Editor');
    await page.keyboard.press('ArrowLeft');
    await expect(byId(page, 'context-sub-open-with-list')).toBeHidden();
    await expect.poll(() => focusedText(page)).toContain('Open with');
  });
});

test.describe('Chatur TR-021 — a disabled menu item is announced as disabled', () => {
  test('REQ-UI-051 disabled MenubarItem and MenubarCheckboxItem carry aria-disabled and data-disabled', async ({ page }) => {
    await open(page, '/components/menubar');

    await byId(page, 'menubar-sub-file').click();
    const vSave = byId(page, 'menubar-sub-save');
    await expect(vSave).toHaveAttribute('aria-disabled', 'true');
    await expect(vSave).toHaveAttribute('data-disabled', '');
    await expect(vSave).toBeDisabled();
    const vNew = page.getByRole('menuitem', { name: 'New project' });
    await expect(vNew, 'an enabled item is not marked').not.toHaveAttribute('aria-disabled', /.*/);
    await expect(vNew).toBeEnabled();
    await page.keyboard.press('Escape');

    await page.getByRole('menuitem', { name: 'Edit' }).last().click();
    await expect(byId(page, 'menubar-sub-redo')).toBeDisabled();
    await page.keyboard.press('Escape');

    await byId(page, 'menubar-sub-view').click();
    const vWrap = byId(page, 'menubar-sub-wrap');
    await expect(vWrap).toHaveAttribute('role', 'menuitemcheckbox');
    await expect(vWrap).toHaveAttribute('aria-disabled', 'true');
    await expect(vWrap).toHaveAttribute('data-disabled', '');
    await expect(vWrap).toBeDisabled();
    await page.keyboard.press('Escape');

    // The same on a ContextMenuItem.
    await open(page, '/components/context-menu');
    await byId(page, 'context-sub-area').click({ button: 'right' });
    await expect(byId(page, 'context-sub-delete')).toBeDisabled();
  });
});
