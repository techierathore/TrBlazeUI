// Acceptance tests for Chatur consumer-feedback batch 5 (docs/Chatur-TrBlazeUI-Feedback.md,
// TR-015 to TR-017, filed 2026-10-06 against 2.1.2): REQ-UI-030 EditorTabs.TabAttributes,
// REQ-UI-031 StepperItem.Icon, REQ-UI-032 BadgeVariant.Danger and a Class text colour that
// replaces the variant's.
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. Measured in-process against the demo pages and their data-testid anchors. Base URL: BASE_URL,
// else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1800);
}

/** A CSS colour expression resolved by the browser to the format getComputedStyle reports. */
async function resolve(aPage: Page, aProperty: 'color' | 'backgroundColor', aValue: string): Promise<string> {
  return aPage.evaluate(([vProperty, vValue]) => {
    const vProbe = document.createElement('span');
    (vProbe.style as unknown as Record<string, string>)[vProperty] = vValue;
    document.body.appendChild(vProbe);
    const vResolved = (getComputedStyle(vProbe) as unknown as Record<string, string>)[vProperty];
    vProbe.remove();
    return vResolved;
  }, [aProperty, aValue] as const);
}

test.describe('Chatur batch 5 — consumer-feedback fixes (TR-015…TR-017)', () => {
  test('REQ-UI-030 each EditorTabs tab carries the attributes its item returns and keeps its own classes', async ({ page }) => {
    await open(page, '/components/code-editor');

    const vTab = page.locator('[data-testid="tab-program-cs"]');
    await expect(vTab, 'the Program.cs tab carries its own data-testid').toHaveCount(1);
    await expect(vTab).toHaveAttribute('data-slot', 'editor-tab');
    await expect(vTab).toHaveAttribute('data-tab-id', 'Program.cs');
    await expect(page.locator('[data-testid="tab-editor-razor"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="tab-appsettings-json"]')).toHaveCount(1);

    // A class entry is merged, not swapped for the tab's own classes.
    const vClass = (await vTab.getAttribute('class')) ?? '';
    expect(vClass, 'marker class from TabAttributes').toContain('demo-tab-hooked');
    expect(vClass, 'tab keeps its own border class').toContain('border-r');

    // The strip still works through the hooked tab: clicking another tab's label makes it active.
    await page.locator('[data-testid="tab-editor-razor"] [data-slot="editor-tab-label"]').click();
    await expect(page.locator('[data-testid="editor-active"]')).toHaveText('Editor.razor');
    await expect(page.locator('[data-testid="tab-editor-razor"]')).toHaveAttribute('data-active', 'true');
  });

  test('REQ-UI-031 a StepperItem Icon replaces the marker glyph and the marker keeps its accessible name', async ({ page }) => {
    await open(page, '/components/stepper');

    for (const [vId, vLabel] of [['icon-step-done', 'Done'], ['icon-step-running', 'Running'], ['icon-step-waiting', 'Waiting']]) {
      const vMarker = page.locator(`[data-testid="${vId}"] [data-slot="stepper-item-marker"]`);
      await expect(vMarker.locator('svg'), `${vId} marker holds an icon`).toHaveCount(1);
      await expect(vMarker, `${vId} marker keeps its role`).toHaveAttribute('role', 'img');
      await expect(vMarker, `${vId} marker keeps its name`).toHaveAttribute('aria-label', vLabel);
      expect((await vMarker.innerText()).trim(), `${vId} marker draws no text glyph`).toBe('');
      // Computed size, not the bounding box: the spinner's box grows while it is rotated.
      const vSize = await vMarker.locator('svg').evaluate(el => {
        const vCs = getComputedStyle(el);
        return [vCs.width, vCs.height];
      });
      expect(vSize, `${vId} icon is sized to 1rem inside the 28px marker`).toEqual(['16px', '16px']);
    }

    // A step without Icon keeps its glyph.
    const vGlyph = page.locator('[data-testid="icon-step-glyph"] [data-slot="stepper-item-marker"]');
    await expect(vGlyph.locator('svg')).toHaveCount(0);
    await expect(vGlyph).toHaveText('✕');
    await expect(vGlyph).toHaveAttribute('aria-label', 'Failed');
  });

  test('REQ-UI-032 Badge Danger paints the danger tint with the danger text colour, and a Class text colour replaces the variant\'s', async ({ page }) => {
    await open(page, '/components/badge');

    const vDanger = page.locator('[data-testid="badge-danger"]');
    const vStyle = await vDanger.evaluate(el => {
      const vCs = getComputedStyle(el);
      return { bg: vCs.backgroundColor, fg: vCs.color };
    });
    expect(vStyle.bg, 'Danger background is --alert-danger-bg').toBe(await resolve(page, 'backgroundColor', 'var(--alert-danger-bg)'));
    expect(vStyle.fg, 'Danger text is --alert-danger-foreground').toBe(await resolve(page, 'color', 'var(--alert-danger-foreground)'));
    expect(vStyle.bg, 'Danger is a tint, not the solid destructive fill').not.toBe(await resolve(page, 'backgroundColor', 'var(--destructive)'));

    // Same construction as the other status variants.
    const vWarningClass = (await page.locator('[data-testid="tr016-badge-warning"]').getAttribute('class')) ?? '';
    const vDangerClass = (await vDanger.getAttribute('class')) ?? '';
    expect(vWarningClass.replace(/warning/g, 'danger'), 'Danger mirrors Warning class for class').toBe(vDangerClass);

    // Class="text-destructive" on a Secondary badge replaces text-secondary-foreground.
    const vColoured = page.locator('[data-testid="badge-class-colour"]');
    const vColouredClass = (await vColoured.getAttribute('class')) ?? '';
    expect(vColouredClass, 'caller colour present').toContain('text-destructive');
    expect(vColouredClass, 'variant colour removed').not.toContain('text-secondary-foreground');
    expect(await vColoured.evaluate(el => getComputedStyle(el).color), 'label paints --destructive')
      .toBe(await resolve(page, 'color', 'var(--destructive)'));
  });
});
