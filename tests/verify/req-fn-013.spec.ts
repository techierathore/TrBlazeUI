// Acceptance test for REQ-FN-013: the published Auto demo host serves _framework/blazor.web.js and
// its pages are interactive. Found 2026-11-05: with the WebAssembly render mode and no
// MapStaticAssets(), the framework mapped a catch-all _framework/{*path} endpoint that excludes
// blazor.web.js, so the script answered 404 and no menu ever opened. Run with BASE_URL pointing at
// the booted Auto host (tf-verify-boot.sh --project demos/TrBlazeUI.Demo.Auto/...). The same checks
// hold on the Server host, so the test is safe under any head; the ledger records which one booted.
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

test.describe('Demo hosts', () => {
  test('REQ-FN-013 the host serves blazor.web.js and a menu opens on click', async ({ page, request }) => {
    const vScript = await request.get(`${BASE}/_framework/blazor.web.js`);
    expect(vScript.status(), '_framework/blazor.web.js answers 200').toBe(200);
    expect((await vScript.body()).length, 'and carries the script').toBeGreaterThan(10_000);

    const vFailed: string[] = [];
    page.on('response', aResponse => {
      if (aResponse.status() >= 400) vFailed.push(`${aResponse.status()} ${aResponse.url()}`);
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/components/menubar`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    expect(vFailed, 'no request on the page fails').toEqual([]);
    expect(await page.evaluate(() => typeof (window as unknown as { Blazor?: unknown }).Blazor), 'Blazor started').toBe('object');

    await page.locator('[data-testid="menubar-sub-file"]').click();
    await expect(page.locator('[role="menu"]').first(), 'the File menu opens, so the page is interactive').toBeVisible();
    await page.keyboard.press('Escape');
  });
});
