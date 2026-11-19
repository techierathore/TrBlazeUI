// Acceptance test for TrStudio consumer feedback TR-015 (docs/TrStudio-TrBlazeUI-Feedback.md): in a Mac
// Catalyst web view the sidebar's phone mode lagged one window resize behind. sidebar.js read
// window.innerWidth inside a ResizeObserver callback, WKWebView had not updated innerWidth yet, and no
// later callback corrected the mode, so a one-step resize 1280 -> 390 left the docked sidebar.
//
// Chromium updates innerWidth in time, so the test makes it report late the way WKWebView does: the
// value only catches up 400 ms after each resize. The fix decides the mode from matchMedia and
// re-checks on the window's own resize event, so it follows the window regardless.
// Page: any demo page (the demo's MainLayout holds a SidebarProvider). The desktop sidebar is an
// <aside data-side>; in phone mode it is a Sheet that renders no aside until opened.
// The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:5213';

const dockedSidebars = (aPage: Page) => aPage.locator('aside[data-side]').count();

async function lagInnerWidth(aPage: Page): Promise<void> {
  await aPage.addInitScript(() => {
    const vOwn = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    const vProto = Object.getOwnPropertyDescriptor(Window.prototype, 'innerWidth');
    const vRead = vOwn?.get ? () => vOwn.get!.call(window) : vProto?.get ? () => vProto.get!.call(window)
      : () => document.documentElement.clientWidth;
    let vStale = vRead();
    window.addEventListener('resize', () => { setTimeout(() => { vStale = vRead(); }, 400); });
    Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => vStale });
  });
}

test.describe('TrStudio TR-015 — the sidebar\'s phone mode follows a one-step window resize', () => {
  test('REQ-UI-075 1280 -> 390 -> 1280 in single steps switches the sidebar each time, with innerWidth reporting late', async ({ page }) => {
    await lagInnerWidth(page);
    await page.setViewportSize({ width: 1280, height: 844 });
    await page.goto(`${BASE}/components/badge`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await expect.poll(() => dockedSidebars(page), { message: 'docked at 1280' }).toBeGreaterThan(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => dockedSidebars(page), { message: 'phone mode at 390', timeout: 3000 }).toBe(0);
    // It stays right once the late innerWidth has caught up as well.
    await page.waitForTimeout(800);
    expect(await dockedSidebars(page)).toBe(0);

    await page.setViewportSize({ width: 1280, height: 844 });
    await expect.poll(() => dockedSidebars(page), { message: 'docked again at 1280', timeout: 3000 }).toBeGreaterThan(0);
  });

  test('REQ-UI-075 a page opened at 390 starts in phone mode and a 767/768 step crosses the breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/components/badge`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    expect(await dockedSidebars(page)).toBe(0);

    await page.setViewportSize({ width: 768, height: 844 });
    await expect.poll(() => dockedSidebars(page), { timeout: 3000 }).toBeGreaterThan(0);
    await page.setViewportSize({ width: 767, height: 844 });
    await expect.poll(() => dockedSidebars(page), { timeout: 3000 }).toBe(0);
  });
});
