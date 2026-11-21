// Acceptance tests for AstroLyfe consumer feedback TR-016, TR-019, TR-021 and TR-022
// (docs/AstroLyfe-TrBlazeUI-Feedback.md), rows REQ-UI-084 to REQ-UI-087.
//
// Page: /verify-astrolyfe. The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

/** Opens the harness and collects page errors so a render exception cannot slip by. */
async function openPage(aPage: Page): Promise<string[]> {
  const vErrors: string[] = [];
  aPage.on('pageerror', (e) => vErrors.push(e.message));
  aPage.on('console', (m) => { if (m.type() === 'error') vErrors.push(m.text()); });
  await aPage.goto(`${BASE}/verify-astrolyfe`, { waitUntil: 'networkidle' });
  await aPage.waitForSelector('[data-testid="verify-heading"]');
  await aPage.waitForTimeout(1500);
  return vErrors;
}

test.describe('AstroLyfe TR-016 — a SelectItem with only Text draws it', () => {
  test('REQ-UI-084 the closed trigger reads the item text and the open list shows every Text', async ({ page }) => {
    const vErrors = await openPage(page);

    await expect(page.getByTestId('text-value')).toHaveText('KP');

    await page.getByTestId('text-trigger').click();
    await expect(page.getByRole('option', { name: 'KP', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'New KP', exact: true })).toBeVisible();

    await page.getByRole('option', { name: 'New KP', exact: true }).click();
    await expect(page.getByTestId('text-value')).toHaveText('New KP');
    await expect(page.getByTestId('text-echo')).toHaveText('N');
    expect(vErrors.filter((e) => /unhandled|Exception/i.test(e))).toEqual([]);
  });
});

test.describe('AstroLyfe TR-021 — Combobox Id reaches the trigger', () => {
  test('REQ-UI-085 Id is on the combobox button, a label points at it and the list still opens and closes', async ({ page }) => {
    const vErrors = await openPage(page);

    const vTrigger = page.locator('button#pick-chart');
    await expect(vTrigger).toHaveCount(1);
    await expect(vTrigger).toHaveAttribute('role', 'combobox');
    await expect(page.locator('label[for="pick-chart"]')).toHaveCount(1);

    await vTrigger.click();
    await expect(page.getByRole('option', { name: 'Horary' })).toBeVisible();
    await page.getByRole('option', { name: 'Horary' }).click();
    await expect(page.getByTestId('chart-echo')).toHaveText('horary');
    await expect(vTrigger).toContainText('Horary');

    // The click-outside handler finds the trigger by id, so it must still close the list from the
    // page and keep it open for a click that lands on the list itself.
    await vTrigger.click();
    await expect(page.getByRole('option', { name: 'Natal' })).toBeVisible();
    await page.getByTestId('verify-heading').click();
    await expect(page.getByRole('option', { name: 'Natal' })).toBeHidden();
    await vTrigger.click();
    await expect(page.getByRole('option', { name: 'Natal' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('option', { name: 'Natal' })).toBeHidden();
    await expect(page.locator('#blazor-error-ui')).toBeHidden();
    expect(vErrors.filter((e) => /does not have \[Parameter\]|unhandled/i.test(e))).toEqual([]);
  });
});

test.describe('AstroLyfe TR-022 — a Select inside a modal Dialog opens', () => {
  test('REQ-UI-086 the list opens above the dialog and a choice can be made', async ({ page }) => {
    const vErrors = await openPage(page);

    await page.getByTestId('open-editor').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByTestId('mode-trigger').click();
    await expect(page.getByRole('option', { name: 'Any', exact: true })).toBeVisible();
    await page.getByRole('option', { name: 'Any', exact: true }).click();
    await expect(page.getByTestId('mode-value')).toHaveText('Any');
    await expect(page.getByTestId('mode-echo')).toHaveText('Any');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#blazor-error-ui')).toBeHidden();
    expect(vErrors.filter((e) => /unhandled/i.test(e))).toEqual([]);
  });
});

test.describe('AstroLyfe TR-019 — FileUpload DropzoneContent is drawn and listed', () => {
  test('REQ-UI-087 the drop area shows the app text and the AI reference names DropzoneContent', async ({ page }) => {
    await openPage(page);
    await expect(page.getByTestId('drop-text')).toHaveText('Drop a CSV file here or choose one');
    await expect(page.getByText('Drag and drop files here')).toHaveCount(0);

    const vReference = readFileSync(join(__dirname, '..', '..', 'docs', 'TrBlazeUI-AI-Reference.md'), 'utf8');
    const vSection = vReference.slice(vReference.indexOf('### FileUpload'), vReference.indexOf('### MultiSelect'));
    expect(vSection).toContain('DropzoneContent');
  });
});
