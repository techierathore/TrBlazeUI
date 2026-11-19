// Acceptance test for TfLens consumer feedback TR-041 (docs/TfLens-TrBlazeUI-Feedback.md):
// DataTableColumn's header took plain text only, and a title attribute on the column was dropped, so
// a column whose name is short but whose meaning is not could not explain itself where the reader
// looks. DataTableColumn now takes HeaderTitle (the header cell's title, the browser's own tooltip)
// and HeaderTemplate (any content in place of the label, such as a Tooltip).
//
// Page: /verify-tflens-tr041. The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

test.describe('TfLens TR-041 — a DataTable column header can explain itself', () => {
  test('REQ-UI-071 HeaderTitle puts a title on the header cell, and a sortable column still sorts', async ({ page }) => {
    await page.goto(`${BASE}/verify-tflens-tr041`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const vChecks = page.getByRole('columnheader', { name: 'checks ran on' });
    await expect(vChecks).toHaveAttribute('title', 'The machines whose drift checks ran in the last 24 hours');

    const vRoute = page.getByRole('columnheader', { name: /^route/ });
    await expect(vRoute).toHaveAttribute('title', 'The route the drift was measured on');
    await expect(vRoute).toHaveAttribute('aria-sort', 'none');
    await vRoute.click();
    await expect(vRoute).toHaveAttribute('aria-sort', 'ascending');

    // A column without HeaderTitle gets no empty title attribute.
    expect(await page.getByRole('columnheader', { name: 'drift' }).getAttribute('title')).toBeNull();
  });

  test('REQ-UI-071 HeaderTemplate renders its own content, and its Tooltip opens on hover', async ({ page }) => {
    await page.goto(`${BASE}/verify-tflens-tr041`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const vHeader = page.getByRole('columnheader', { name: /window/ });
    await expect(vHeader.getByTestId('window-explain')).toBeVisible();
    await vHeader.getByTestId('window-explain').hover();
    await expect(page.getByText('How long a run may take before it counts as late')).toBeVisible();
  });
});
