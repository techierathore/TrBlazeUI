// Acceptance test for REQ-UI-028 — no control reports an unhandled error when its page stops
// answering during dispose (the pattern behind Chatur TR-013, swept across the library).
//
// The title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. The measurement lives in tests/verify/ui-dispose.spec.js (a plain-Playwright script that
// drives every demo page and reads the server log); this file is the runner-visible form: it
// runs that script once and asserts its checks.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type Check = { id: string; pass: boolean; detail?: string };

const OUT = path.join(process.cwd(), 'tests', '.artifacts', 'dispose');
let objChecks: Check[] = [];

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  // Every batch of pages waits past the server's one-minute limit on an unanswered browser call.
  test.setTimeout(900000);
  try {
    execFileSync('node', [path.join('tests', 'verify', 'ui-dispose.spec.js')], {
      env: { ...process.env, SMOKE_URL: process.env.BASE_URL || 'http://localhost:5213', OUT_DIR: OUT },
      stdio: 'pipe',
      timeout: 880000,
    });
  } catch {
    // A failing check exits 1; the results file still says which, and the test below reports it.
  }
  objChecks = JSON.parse(fs.readFileSync(path.join(OUT, 'results.json'), 'utf8'));
});

test.describe('REQ-UI-028 — dispose on a page that has stopped answering', () => {
  test('REQ-UI-028 no control on any demo page logs an unhandled cancelled-task error when its page stops answering during dispose', () => {
    const vMine = objChecks.filter(c => c.id.startsWith('REQ-UI-028'));
    expect(vMine.length, 'checks tagged REQ-UI-028').toBeGreaterThan(0);
    const vFailed = vMine.filter(c => !c.pass).map(c => `${c.id}: ${c.detail ?? ''}`);
    expect(vFailed, 'failed checks').toEqual([]);
  });
});
