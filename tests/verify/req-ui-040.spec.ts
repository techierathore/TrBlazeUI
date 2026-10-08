// Acceptance tests for Sevak consumer feedback (docs/Sevak-TrBlazeUI-Feedback.md, filed against
// 1.0.7): REQ-UI-040 the plain-markup Table family (TR-028), REQ-UI-041 CardTitle/AlertTitle `As`
// heading level (TR-008), REQ-UI-043 chart root elements take unmatched attributes (TR-044 census).
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. Measured in-process against the demo pages and their data-testid anchors. Base URL:
// BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

test.describe('Sevak feedback — table family, heading levels, chart attributes', () => {
  test('REQ-UI-040 the Table family renders a styled table from plain markup with no record type, toolbar or pager', async ({ page }) => {
    await open(page, '/components/table');

    const vTable = page.locator('[data-testid="table-demo"]');
    await expect(vTable, 'the data-testid lands on the table element').toHaveCount(1);
    expect(await vTable.evaluate(el => el.tagName)).toBe('TABLE');
    await expect(vTable).toHaveAttribute('data-slot', 'table');
    expect(await vTable.evaluate(el => el.parentElement?.getAttribute('data-slot'))).toBe('table-container');

    await expect(vTable.locator('thead[data-slot="table-header"]')).toHaveCount(1);
    await expect(vTable.locator('tbody[data-slot="table-body"] > tr')).toHaveCount(4);
    await expect(vTable.locator('tfoot[data-slot="table-footer"]')).toHaveCount(1);
    await expect(vTable.locator('caption[data-slot="table-caption"]')).toHaveText('A list of recent invoices.');
    await expect(vTable.locator('thead th[data-slot="table-head"]')).toHaveCount(4);
    await expect(vTable.locator('tbody td[data-slot="table-cell"]')).toHaveCount(16);

    // No DataTable machinery: no toolbar, no pager, no role=grid.
    await expect(page.locator('[data-testid="table-section"] [data-slot="datatable-select-all"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="table-section"] [role="grid"]')).toHaveCount(0);
    expect(await page.locator('[data-testid="table-section"]').innerText()).not.toContain('Rows per page');

    // A selected row carries the state; every body row draws its bottom border.
    const vSelected = page.locator('[data-testid="table-row-selected"]');
    await expect(vSelected).toHaveAttribute('data-state', 'selected');
    await expect(vSelected).toHaveAttribute('data-slot', 'table-row');
    const vBorder = await vTable.locator('tbody > tr').first().evaluate(el => getComputedStyle(el).borderBottomWidth);
    expect(vBorder, 'body rows are ruled').not.toBe('0px');
    const vSelectedBg = await vSelected.evaluate(el => getComputedStyle(el).backgroundColor);
    const vPlainBg = await vTable.locator('tbody > tr').first().evaluate(el => getComputedStyle(el).backgroundColor);
    expect(vSelectedBg, 'the selected row is tinted').not.toBe(vPlainBg);

    await expect(page.locator('[data-testid="table-total"]')).toHaveText('$1,200');
  });

  test('REQ-UI-041 CardTitle and AlertTitle render the element As names, with the default unchanged', async ({ page }) => {
    await open(page, '/components/card');
    expect(await page.locator('[data-testid="card-title-h2"]').evaluate(el => el.tagName)).toBe('H2');
    const vCardClass = (await page.locator('[data-testid="card-title-h2"]').getAttribute('class')) ?? '';
    expect(vCardClass, 'the h2 keeps the title classes').toContain('text-2xl');
    // The first card on the page uses the default and is still an h3.
    const vDefaultCard = page.locator('.rounded-lg h3').filter({ hasText: 'Card Title' });
    await expect(vDefaultCard, 'a CardTitle without As is still an h3').toHaveCount(1);

    await open(page, '/components/alert');
    expect(await page.locator('[data-testid="alert-title-h3"]').evaluate(el => el.tagName)).toBe('H3');
    const vAlertClass = (await page.locator('[data-testid="alert-title-h3"]').getAttribute('class')) ?? '';
    expect(vAlertClass, 'the h3 keeps the title classes').toContain('font-medium');
    const vDefaultAlertTitles = page.locator('[role="alert"] h5');
    expect(await vDefaultAlertTitles.count(), 'alerts without As still render h5 titles').toBeGreaterThan(0);
  });

  test('REQ-UI-043 a chart root takes unmatched attributes and the chart still draws', async ({ page }) => {
    await open(page, '/charts/bar');
    const vRoot = page.locator('[data-testid="bar-chart-root"]');
    await expect(vRoot).toHaveCount(1);
    await expect(vRoot).toHaveAttribute('data-slot', 'bar-chart');
    // ApexCharts draws after its script loads; on a loaded machine that can take several seconds.
    await expect(vRoot.locator('.apexcharts-canvas'), 'the chart drew inside the attributed root').toHaveCount(1, { timeout: 20000 });
    expect(await vRoot.locator('svg').count(), 'the canvas holds the chart svg').toBeGreaterThan(0);
  });
});
