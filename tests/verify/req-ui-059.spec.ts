// Acceptance test for TechieBlog consumer feedback TR-076
// (/mnt/c/1MyCode/TechieBlog/docs/TechieBlog-TrBlazeUI-Feedback.md): SidebarMenuButton and
// SidebarMenuSubButton rendered IsActive as the bare boolean attribute data-active="", while their
// classes key on data-[active=true], so the active item painted exactly like its neighbours; an
// Href + Match auto-activated link set aria-current but no visible style either.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Harness page: demos/TrBlazeUI.Demo.Shared/Pages/VerifyTr076.razor (/verify-tr076).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

interface Probe {
  openTag: string;
  dataActive: string | null;
  ariaCurrent: string | null;
  bg: string;
  weight: string;
}

async function probe(aPage: Page, aTestId: string): Promise<Probe> {
  return aPage.evaluate(id => {
    const vEl = document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    const vStyle = getComputedStyle(vEl);
    return {
      openTag: vEl.outerHTML.slice(0, vEl.outerHTML.indexOf('>') + 1),
      dataActive: vEl.getAttribute('data-active'),
      ariaCurrent: vEl.getAttribute('aria-current'),
      bg: vStyle.backgroundColor,
      weight: vStyle.fontWeight,
    };
  }, aTestId);
}

const IS_ACTIVE_PAIRS = [['btn-active', 'btn-inactive'], ['link-active', 'link-inactive'], ['sub-active', 'sub-inactive']];
const MATCH_PAIRS = [['match-active', 'match-inactive'], ['sub-match-active', 'sub-match-inactive']];

test.describe('TechieBlog TR-076 — sidebar active item renders and paints its active state', () => {
  test('REQ-UI-059 an active sidebar item renders data-active="true" and its background differs from an inactive one', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/verify-tr076`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="verify-heading"]');
    await page.waitForTimeout(1500);

    // Rendered markup: explicit "true" / "false", never the empty boolean form; aria-current kept.
    for (const [vOn, vOff] of IS_ACTIVE_PAIRS) {
      const vActive = await probe(page, vOn);
      const vInactive = await probe(page, vOff);
      expect(vActive.openTag, vOn).toContain('data-active="true"');
      expect(vInactive.openTag, vOff).toContain('data-active="false"');
      expect(vActive.ariaCurrent, vOn).toBe('page');
      expect(vInactive.ariaCurrent, vOff).toBeNull();
    }
    expect((await probe(page, 'match-active')).ariaCurrent).toBe('page');

    // Computed style: the active item paints, in light and in dark mode, for both activation paths.
    for (const vTheme of ['light', 'dark']) {
      await page.evaluate(t => document.documentElement.classList.toggle('dark', t === 'dark'), vTheme);
      await page.waitForTimeout(200);
      for (const [vOn, vOff] of [...IS_ACTIVE_PAIRS, ...MATCH_PAIRS]) {
        const vActive = await probe(page, vOn);
        const vInactive = await probe(page, vOff);
        expect(vActive.bg, `${vTheme} ${vOn}`).not.toBe('rgba(0, 0, 0, 0)');
        expect(vActive.bg, `${vTheme} ${vOn} vs ${vOff}`).not.toBe(vInactive.bg);
        if (!vOn.startsWith('sub')) {
          expect(vActive.weight, `${vTheme} ${vOn}`).toBe('500');
        }
      }
    }
  });
});
