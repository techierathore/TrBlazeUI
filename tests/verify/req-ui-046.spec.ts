// Acceptance test for Chatur consumer-feedback TR-019 (docs/Chatur-TrBlazeUI-Feedback.md, filed
// 2026-10-07 against 2.1.4): REQ-UI-046 DataTableColumn.HideBelow, a column whose header and cells
// are hidden below a screen width and shown again above it.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Measured in-process against the DataTable demo page and its data-testid anchors. Base URL:
// BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aWidth: number): Promise<void> {
  await aPage.setViewportSize({ width: aWidth, height: 900 });
  await aPage.goto(`${BASE}/components/datatable`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

// The headers of the table that are drawn (display is not none), in order.
async function shownHeaders(aPage: Page): Promise<string[]> {
  return aPage.locator('[data-testid="req-ui-046-table"] thead th').evaluateAll(aCells =>
    aCells.filter(aCell => getComputedStyle(aCell).display !== 'none').map(aCell => (aCell.textContent || '').trim()));
}

// The number of drawn cells in the first body row.
async function shownCellsInFirstRow(aPage: Page): Promise<number> {
  return aPage.locator('[data-testid="req-ui-046-table"] tbody tr').first().locator('td').evaluateAll(aCells =>
    aCells.filter(aCell => getComputedStyle(aCell).display !== 'none').length);
}

test.describe('Chatur TR-019 — a DataTable column hidden below a screen width', () => {
  test('REQ-UI-046 HideBelow drops the header and cells on a phone and brings them back on wider screens', async ({ page }) => {
    // 390 px: below sm and md, so Email and Role are gone, header and cells together.
    await open(page, 390);
    expect(await shownHeaders(page), 'phone width shows Name and Status only').toEqual(['Name', 'Status']);
    expect(await shownCellsInFirstRow(page), 'phone width draws two cells per row').toBe(2);
    const vPageScroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(vPageScroll, 'the page does not scroll sideways at 390').toBeLessThanOrEqual(0);

    // 700 px: at or above sm, below md, so Email is back and Role is still hidden.
    await open(page, 700);
    expect(await shownHeaders(page), 'tablet width brings Email back').toEqual(['Name', 'Email', 'Status']);
    expect(await shownCellsInFirstRow(page)).toBe(3);

    // 1280 px: every column shows, and a shown cell is a real table cell, not a block.
    await open(page, 1280);
    expect(await shownHeaders(page), 'desktop width shows every column').toEqual(['Name', 'Email', 'Role', 'Status']);
    expect(await shownCellsInFirstRow(page)).toBe(4);
    const vEmailDisplay = await page.locator('[data-testid="req-ui-046-table"] thead th').nth(1)
      .evaluate(aCell => getComputedStyle(aCell).display);
    expect(vEmailDisplay, 'a column shown again keeps table-cell display').toBe('table-cell');

    // A table without HideBelow is unchanged at phone width: the first demo grid keeps all five headers.
    await open(page, 390);
    const vPlainHeaders = await page.locator('table').first().locator('thead th').evaluateAll(aCells =>
      aCells.filter(aCell => getComputedStyle(aCell).display !== 'none').length);
    expect(vPlainHeaders, 'a grid without HideBelow hides nothing').toBeGreaterThanOrEqual(5);
  });
});
