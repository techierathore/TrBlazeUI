// Acceptance test for Sevak consumer feedback TR-047 (docs/Sevak-TrBlazeUI-Feedback.md): CodeBlock's
// copy button took no label, no attributes and reported nothing back, so an app could neither translate
// it, nor address it from a test, nor show its own message. CodeBlock now takes CopyLabel,
// CopyButtonAttributes and OnCopied (CodeBlockCopyResult.Copied | Failed).
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Page: the CodeBlock demo, section "Your own label and your own message" (/components/code-block).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

test.describe('Sevak TR-047 — CodeBlock copy button takes a label, attributes and reports the result', () => {
  test('REQ-UI-066 the copy button carries the app label and attributes, and OnCopied reports a successful copy', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(`${BASE}/components/code-block`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const vButton = page.getByTestId('code-block-copy-button');
    await expect(vButton).toHaveText('Kopieren');
    await expect(vButton).toHaveAttribute('aria-label', 'Kopieren');
    await expect(vButton).toHaveAttribute('title', 'In die Zwischenablage kopieren');
    // The attributes land on the button, not on the block's root.
    await expect(page.getByTestId('code-block-own-label').locator('button')).toHaveCount(1);
    await expect(page.getByTestId('code-block-copy-message')).toHaveText('');

    await vButton.click();
    await expect(page.getByTestId('code-block-copy-message')).toHaveText('Befehl kopiert.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('dotnet add package TrBlazeUI.Components');

    // A block without CopyLabel keeps its defaults.
    const vDefault = page.locator('[data-slot="code-block"]').first().locator('button');
    await expect(vDefault).toHaveText('Copy');
    await expect(vDefault).toHaveAttribute('aria-label', 'Copy code');
  });

  test('REQ-UI-066 OnCopied reports a refused copy so the page can show its own message', async ({ page }) => {
    // Make the browser refuse both copy paths.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
      document.execCommand = () => false;
    });
    await page.goto(`${BASE}/components/code-block`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.getByTestId('code-block-copy-button').click();
    await expect(page.getByTestId('code-block-copy-message')).toHaveText(/Kopieren nicht möglich/);
    await expect(page.getByTestId('code-block-copy-button')).toHaveText('Press Ctrl+C');
  });
});
