// Acceptance tests for Chatur consumer-feedback batch 2 (docs/Chatur-TrBlazeUI-Feedback.md,
// filed 2026-09-21): REQ-UI-005, REQ-UI-006, REQ-UI-017, REQ-FN-006, REQ-UI-022, REQ-UI-023,
// REQ-UI-024, REQ-UI-025.
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a
// row. The measurements live in tests/verify/ui-chatur-2.spec.js (a plain-Playwright script);
// this file is the runner-visible form: it runs that script once and asserts its checks, which
// are tagged with the row each one grades.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type Check = { id: string; pass: boolean; detail?: string };

const OUT = path.join(process.cwd(), 'tests', '.artifacts', 'chatur-2');
let objChecks: Check[] = [];

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  test.setTimeout(600000);
  try {
    execFileSync('node', [path.join('tests', 'verify', 'ui-chatur-2.spec.js')], {
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

test.describe('Chatur batch 2 — consumer-feedback fixes', () => {
  test('REQ-UI-005 the DataTable choose-all control announces none, some and all, and SelectedCount reaches the page', () => {
    expectAll('REQ-UI-005');
  });

  test('REQ-UI-006 a Stepper or Timeline step carries its own status with a glyph and an accessible name, not colour alone', () => {
    expectAll('REQ-UI-006');
  });

  test('REQ-UI-017 SortableList shows each row position, moves a row with its buttons and takes one out, each announced', () => {
    expectAll('REQ-UI-017');
  });

  test('REQ-UI-022 CodeEditor binds two ways, numbers its lines and indents on Tab without trapping focus; EditorTabs closes a file and marks unsaved work', () => {
    expectAll('REQ-UI-022');
  });

  test('REQ-UI-023 Typing sits inline and announces once; Progress can run without claiming a percentage', () => {
    expectAll('REQ-UI-023');
  });

  test('REQ-UI-024 LogView marks each line, keeps its height, follows the newest line and stops when the reader scrolls back', () => {
    expectAll('REQ-UI-024');
  });

  test('REQ-UI-025 NavList carries the chosen row two ways, moves with the arrow keys and drives the detail pane', () => {
    expectAll('REQ-UI-025');
  });

  test('REQ-FN-006 every screen the reference cites renders with no console error and no sideways scroll on a phone', () => {
    expectAll('REQ-FN-006');
  });
});
