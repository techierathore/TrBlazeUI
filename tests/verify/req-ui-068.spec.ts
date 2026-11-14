// Acceptance test for Sevak consumer feedback TR-049 (docs/Sevak-TrBlazeUI-Feedback.md): on 2.1.9 a
// SidebarProvider torn down after its JavaScript side was gone ended the session with
// "JS object instance with ID ... does not exist (has it been disposed?)". In a WebView a reload
// leaves exactly that state: the .NET side lives on, every JavaScript object it held is gone, and the
// teardown that follows calls into them. DisposeAsync caught JSDisconnectedException and
// TaskCanceledException only; the JSException escaped into the renderer.
//
// The browser makes the same state on demand: DotNet.disposeJSObjectReference releases a reference
// by its id, so releasing every id from 1 up (0 is the window itself) leaves each control holding
// ids the page no longer knows, while the circuit stays connected. The first test does that and then
// unmounts the sidebar; the second does it on every demo page and then leaves the page inside the app,
// so every control on it is disposed into released references.
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Harness page: demos/TrBlazeUI.Demo.Shared/Pages/VerifySevakTr049.razor (/verify-sevak-tr049).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
// Where every page is sent: a page whose own first render calls no script module.
const AWAY = '/components/badge';

/** Releases every JavaScript object reference the page holds except the window (id 0). */
const RELEASE_ALL = () => {
  const vDotNet = (window as unknown as { DotNet: { disposeJSObjectReference(a: unknown): void } }).DotNet;
  for (let i = 1; i < 20000; i++) {
    vDotNet.disposeJSObjectReference({ __jsObjectId: i });
  }
};

/** Collects page errors and console errors so an escaped teardown exception cannot slip by. */
function watchErrors(aPage: Page): string[] {
  const vErrors: string[] = [];
  aPage.on('pageerror', e => vErrors.push(e.message));
  aPage.on('console', m => { if (m.type() === 'error') vErrors.push(m.text()); });
  return vErrors;
}

/** The errors that mean a teardown fault reached the renderer or ended the circuit. */
const fatal = (aErrors: string[]) =>
  aErrors.filter(e => /does not exist|has it been disposed|unhandled exception|circuit has closed|DisposeAsync/i.test(e));

// Pages whose script-using part only exists while an overlay is open: open one first (the same
// list and trigger rule as tests/verify/ui-dispose.spec.js).
const openFirst = async (aPage: Page, aByText = false) => {
  const vFound = await aPage.evaluate(aOnlyText => {
    const vAll = [...document.querySelectorAll('main button, main [role="combobox"]')]
      .filter(e => !e.closest('[data-slot*="sidebar"], header, aside') && !(e as HTMLButtonElement).disabled);
    const vPick = (aOnlyText ? null : vAll.find(e => e.hasAttribute('aria-haspopup')))
      || vAll.find(e => /^(open|show)\b/i.test((e.textContent || '').trim()));
    if (!vPick) return false;
    vPick.setAttribute('data-probe-target', '');
    return true;
  }, aByText);
  if (vFound) await aPage.locator('[data-probe-target]').first().click();
};
const OPENERS: Record<string, (aPage: Page) => Promise<void>> = {
  '/components/dialog': p => openFirst(p),
  '/components/alert-dialog': p => openFirst(p),
  '/components/sheet': p => openFirst(p),
  '/components/drawer': p => openFirst(p, true),
  '/components/popover': p => openFirst(p),
  '/components/dropdown-menu': p => openFirst(p),
  '/components/select': p => openFirst(p),
  '/components/combobox': p => openFirst(p),
  '/components/multiselect': p => openFirst(p),
  '/components/date-picker': p => openFirst(p),
  '/components/menubar': p => p.locator('main [role="menubar"] button, main [role="menubar"] [role="menuitem"]').first().click(),
  '/components/navigation-menu': p => p.locator('main nav button').first().click(),
  '/components/context-menu': p => p.locator('main [data-slot="context-menu-trigger"], main .border-dashed').first().click({ button: 'right' }),
  '/primitives/dialog': p => openFirst(p),
  '/primitives/sheet': p => openFirst(p),
  '/primitives/popover': p => openFirst(p),
  '/primitives/dropdown-menu': p => openFirst(p),
  '/primitives/select': p => openFirst(p),
};

/** Every route the demo serves, read from the pages themselves so a new page is covered. */
function allRoutes(): string[] {
  const vRoot = path.join(process.cwd(), 'demos', 'TrBlazeUI.Demo.Shared', 'Pages');
  const vFound = new Set<string>();
  const walk = (aDir: string) => {
    for (const e of fs.readdirSync(aDir, { withFileTypes: true })) {
      const vPath = path.join(aDir, e.name);
      if (e.isDirectory()) walk(vPath);
      else if (e.name.endsWith('.razor')) {
        for (const m of fs.readFileSync(vPath, 'utf8').matchAll(/^@page\s+"([^"{]+)"/gm)) vFound.add(m[1]);
      }
    }
  };
  walk(vRoot);
  const vAll = [...vFound].filter(r => r !== AWAY).sort();
  // SWEEP_SHARD=i/n runs every n-th page from the i-th (0-based), so a long sweep can be split.
  const vShard = /^(\d+)\/(\d+)$/.exec(process.env.SWEEP_SHARD || '');
  return vShard ? vAll.filter((_, i) => i % Number(vShard[2]) === Number(vShard[1])) : vAll;
}

test.describe('Sevak TR-049 — a teardown after the page released its JavaScript objects keeps the session', () => {
  test('REQ-UI-068 removing a SidebarProvider whose JavaScript objects are already released leaves the session answering', async ({ page }) => {
    const vErrors = watchErrors(page);
    await page.goto(`${BASE}/verify-sevak-tr049`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="verify-heading"]');
    await expect(page.getByTestId('sidebar-state')).toHaveText('mounted');
    await page.waitForTimeout(1500); // the provider imports sidebar.js after its first render

    // The state a WebView reload leaves: every JavaScript object the .NET side holds is gone.
    await page.evaluate(RELEASE_ALL);

    // Sevak's teardown: the sidebar goes away while the session lives on.
    await page.getByTestId('toggle-sidebar').click();
    await expect(page.getByTestId('sidebar-state')).toHaveText('removed');
    await page.waitForTimeout(1000);

    // On 2.1.9 the session ended here: the error bar shows and nothing answers any more.
    await expect(page.locator('#blazor-error-ui')).toBeHidden();
    await page.getByTestId('ping').click();
    await expect(page.getByTestId('ping-count')).toHaveText('1');
    expect(fatal(vErrors), 'teardown errors in the console').toEqual([]);
  });

  test('REQ-UI-068 reloading demo pages that hold a sidebar leaves no error in the console', async ({ page }) => {
    const vErrors = watchErrors(page);
    for (const vRoute of ['/', '/components/sidebar', '/components/responsive-nav', '/verify-sevak-tr049']) {
      await page.goto(`${BASE}${vRoute}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await expect(page.locator('#blazor-error-ui')).toBeHidden();
    }
    expect(vErrors, 'console errors across the reloads').toEqual([]);
  });

  test('REQ-UI-068 no demo page ends the session when it is left after the page released its JavaScript objects', async ({ browser }) => {
    test.setTimeout(1800000);
    const vFailed: string[] = [];
    const vQueue = allRoutes();
    // Three pages at a time, each its own session: the whole demo in about four minutes.
    const vSweep = async () => {
      for (let vRoute = vQueue.shift(); vRoute !== undefined; vRoute = vQueue.shift()) {
        const vPage = await browser.newPage();
        const vErrors = watchErrors(vPage);
        try {
          await vPage.goto(`${BASE}${vRoute}`, { waitUntil: 'networkidle', timeout: 45000 });
          await vPage.waitForTimeout(1200);
          if (OPENERS[vRoute]) {
            await OPENERS[vRoute](vPage).catch(() => undefined);
            await vPage.waitForTimeout(700);
          }
          await vPage.evaluate(RELEASE_ALL);
          await vPage.evaluate(aTo => (window as unknown as { Blazor: { navigateTo(a: string): void } }).Blazor.navigateTo(aTo), AWAY);
          await vPage.waitForTimeout(1500);
          const vErrorBar = await vPage.locator('#blazor-error-ui').isVisible();
          const vFatal = fatal(vErrors);
          if (vErrorBar || vFatal.length > 0) {
            vFailed.push(`${vRoute}: ${vErrorBar ? 'error bar shown; ' : ''}${vFatal.join(' | ').slice(0, 300)}`);
          }
        } catch (e) {
          vFailed.push(`${vRoute}: ${String(e).split('\n')[0].slice(0, 160)}`);
        } finally {
          await vPage.close();
        }
      }
    };
    await Promise.all([vSweep(), vSweep(), vSweep()]);
    expect(vFailed, 'pages whose teardown ended the session').toEqual([]);
  });
});
