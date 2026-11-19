// Acceptance test for a defect the 2026-11-19 suite run found once req-ui-020's teardown tests read the
// live server log: KeyboardShortcutService unregistered a shortcut with an un-awaited
// InvokeVoidAsync, so a page that registered shortcuts and was left after its circuit closed left a
// JSDisconnectedException in a task nobody observed, and the finalizer logged
// "Unobserved task exception". The call is now observed and a gone page counts as nothing to undo.
//
// Page: /components/menubar (it registers Ctrl+T, Ctrl+N and more). The server log is read from
// APP_LOG; the test is skipped when it cannot be read, as req-ui-020's are.
// The title starts with the checklist row id (tf-verify-tests.sh).
// Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const APP_LOG = process.env.APP_LOG || path.join(process.cwd(), 'tests', '.artifacts', 'verify', 'app-5213.log');

test.describe('Keyboard shortcuts — leaving the page logs no unobserved task exception', () => {
  test('REQ-UI-079 the Menubar demo, left after its circuit closed, leaves no unobserved JSDisconnectedException', async ({ browser }) => {
    test.skip(!fs.existsSync(APP_LOG), `server log not readable here (${APP_LOG}); set APP_LOG`);
    test.setTimeout(120000);

    const vBefore = fs.readFileSync(APP_LOG, 'utf8').length;
    for (let vRound = 0; vRound < 2; vRound++) {
      const vPage = await browser.newPage();
      await vPage.goto(`${BASE}/components/menubar`, { waitUntil: 'networkidle', timeout: 60000 });
      await vPage.waitForTimeout(2500);
      await vPage.goto('about:blank');
      await vPage.close();
    }
    await new Promise((aResolve) => setTimeout(aResolve, 4000));
    // An unobserved fault surfaces only when its task is finalized, so force that.
    for (let vIndex = 0; vIndex < 3; vIndex++) {
      await fetch(`${BASE}/verify/gc`, { method: 'POST' });
      await new Promise((aResolve) => setTimeout(aResolve, 700));
    }

    const vAdded = fs.readFileSync(APP_LOG, 'utf8').slice(vBefore);
    expect((vAdded.match(/Unobserved task exception/g) || []).length, 'unobserved task exceptions').toBe(0);
    expect((vAdded.match(/Unhandled exception in circuit/g) || []).length, 'unhandled circuit exceptions').toBe(0);
  });
});
