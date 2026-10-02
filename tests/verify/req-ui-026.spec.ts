// Acceptance tests for Chatur consumer-feedback batch 3 (docs/Chatur-TrBlazeUI-Feedback.md,
// TR-011 to TR-013, filed 2026-09-30 and 2026-10-01): REQ-UI-026, REQ-UI-027 and the TR-013
// defect on REQ-UI-021.
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. The measurements live in tests/verify/ui-chatur-3.spec.js (a plain-Playwright script, 1280
// and 390, screenshots under tests/.artifacts/chatur-3/); this file is the runner-visible form: it
// runs that script once and asserts its checks, which are tagged with the row each one grades.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type Check = { id: string; pass: boolean; detail?: string };

const OUT = path.join(process.cwd(), 'tests', '.artifacts', 'chatur-3');
let objChecks: Check[] = [];

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  // The TR-013 check waits past the server's one-minute limit on an unanswered browser call.
  test.setTimeout(600000);
  try {
    execFileSync('node', [path.join('tests', 'verify', 'ui-chatur-3.spec.js')], {
      env: { ...process.env, SMOKE_URL: process.env.BASE_URL || 'http://localhost:5213', OUT_DIR: OUT },
      stdio: 'pipe',
      timeout: 590000,
    });
  } catch {
    // A failing check exits 1; the results file still says which, and the tests below report it.
  }
  objChecks = JSON.parse(fs.readFileSync(path.join(OUT, 'results.json'), 'utf8'));
});

function expectAll(aPrefix: string) {
  const vMine = objChecks.filter(c => c.id.startsWith(aPrefix));
  expect(vMine.length, `checks tagged ${aPrefix}`).toBeGreaterThan(0);
  const vFailed = vMine.filter(c => !c.pass).map(c => `${c.id}: ${c.detail ?? ''}`);
  expect(vFailed, 'failed checks').toEqual([]);
}

test.describe('Chatur batch 3 — consumer-feedback fixes (TR-011…TR-013)', () => {
  test('REQ-UI-026 DataTable body rows, the header row and the choose-all control carry the attributes passed for them, and keep their own styling and selection', () => {
    expectAll('REQ-UI-026');
  });

  test('REQ-UI-027 ToggleGroup OnVariant paints the chosen item card or primary from the shipped stylesheet, and accent when nothing is set', () => {
    expectAll('REQ-UI-027');
  });

  test('REQ-UI-021 TR-013 a ToggleGroup whose page stops answering during dispose logs no unhandled cancelled-task error', () => {
    expectAll('REQ-UI-021 TR-013');
  });
});
