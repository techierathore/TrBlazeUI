// Acceptance tests for REQ-UI-052 (Lekhak TR-007): InputGroupButton is the button itself. The
// reference's InputGroup example renders exactly one button, and the attributes the consumer puts on
// InputGroupButton (title, data-testid, aria-*) reach that button.
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const REPO = path.resolve(__dirname, '../..');

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

test.describe('REQ-UI-052 InputGroupButton is the button itself', () => {
  test('REQ-UI-052 the reference example renders one button that carries its own attributes', async ({ page }) => {
    await open(page, '/components/input-group');

    const vNested = await page.evaluate(() => document.querySelectorAll('button button').length);
    expect(vNested, 'no button is nested inside another button anywhere on the page').toBe(0);

    const vExample = page.locator('[data-testid="ig-reference-example"]');
    const vButtons = vExample.locator('button');
    await expect(vButtons, 'the reference example renders exactly one button').toHaveCount(1);

    const vGo = vButtons.first();
    await expect(vGo, 'data-testid reaches the button').toHaveAttribute('data-testid', 'ig-reference-go');
    await expect(vGo, 'title reaches the button').toHaveAttribute('title', 'Run search');
    await expect(vGo, 'AriaLabel reaches the button').toHaveAttribute('aria-label', 'Run search');

    await vExample.locator('input').fill('lanterns');
    await vGo.click();
    await expect(page.locator('[data-testid="ig-reference-result"]'), 'clicking the one button runs the search')
      .toHaveText('Searched for: lanterns');
  });

  test('REQ-UI-052 the AI reference never shows a Button inside InputGroupButton', async () => {
    const vReference = fs.readFileSync(path.join(REPO, 'docs/TrBlazeUI-AI-Reference.md'), 'utf8').replace(/\r\n/g, '\n');
    const vStart = vReference.indexOf('### InputGroup\n');
    expect(vStart, 'the reference has an InputGroup section').toBeGreaterThan(-1);
    const vNext = vReference.indexOf('\n### ', vStart + 1);
    const vSection = vReference.slice(vStart, vNext === -1 ? undefined : vNext);

    const vBlocks = [...vSection.matchAll(/```razor\n([\s\S]*?)```/g)].map(aMatch => aMatch[1]);
    expect(vBlocks.length, 'the InputGroup section has razor examples').toBeGreaterThan(0);
    for (const vBlock of vBlocks) {
      for (const vMatch of vBlock.matchAll(/<InputGroupButton\b([\s\S]*?)<\/InputGroupButton>/g)) {
        expect(vMatch[1], 'no <Button> between <InputGroupButton> and </InputGroupButton>').not.toMatch(/<Button\b/);
      }
    }

    expect(vReference, 'the NEVER Do list forbids a Button inside InputGroupButton')
      .toContain('NEVER put a `<Button>` inside `<InputGroupButton>`');
  });
});
