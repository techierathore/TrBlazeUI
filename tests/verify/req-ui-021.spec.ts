// Acceptance tests for REQ-UI-021 — Chatur consumer feedback TR-001…TR-004
// (docs/Chatur-TrBlazeUI-Feedback.md). Each title starts with the checklist row id, which is how
// tf-verify-tests.sh maps a test to a row. The measurements live in tests/verify/ui-chatur.spec.js
// (a plain-Playwright script, 1280 + 390, screenshots under tests/.artifacts/chatur/); this file is
// the runner-visible form: it runs that script once and asserts its checks entry by entry.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type Check = { id: string; pass: boolean; detail?: string };

const OUT = path.join(process.cwd(), 'tests', '.artifacts', 'chatur');
let objChecks: Check[] = [];

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  test.setTimeout(480000);
  try {
    execFileSync('node', [path.join('tests', 'verify', 'ui-chatur.spec.js')], {
      env: { ...process.env, SMOKE_URL: process.env.BASE_URL || 'http://localhost:5213', OUT_DIR: OUT },
      stdio: 'pipe',
      timeout: 470000,
    });
  } catch {
    // A failing check exits 1; the results file still says which, and the tests below report it.
  }
  objChecks = JSON.parse(fs.readFileSync(path.join(OUT, 'results.json'), 'utf8'));
});

function expectAll(aPrefix: RegExp) {
  const vMine = objChecks.filter(c => aPrefix.test(c.id));
  expect(vMine.length, `checks matching ${aPrefix}`).toBeGreaterThan(0);
  const vFailed = vMine.filter(c => !c.pass).map(c => `${c.id}: ${c.detail ?? ''}`);
  expect(vFailed, 'failed checks').toEqual([]);
}

test.describe('REQ-UI-021 — Chatur consumer-feedback fixes (TR-001…TR-004)', () => {
  test('REQ-UI-021 TR-001 a ScrollArea with StickToEnd follows new lines, pauses when the reader scrolls up, resumes at the end', () => {
    expectAll(/^TR-001 /);
  });

  test('REQ-UI-021 TR-002 a TreeView opens, closes, selects one row, moves by keyboard, shows icon and trailing badge, loads children on demand', () => {
    expectAll(/^TR-002 /);
  });

  test('REQ-UI-021 TR-003 a DiffView shows before and after side by side or inline with numbers, tints, folds and per-part buttons', () => {
    expectAll(/^TR-003 /);
  });

  test('REQ-UI-021 TR-004 a joined ToggleGroup keeps exactly one choice, with dividers, one Tab stop and arrow keys', () => {
    expectAll(/^TR-004 /);
  });

  test('REQ-UI-021 the reference examples compile and render, side borders survive the class merge, no errors at 1280 and 390', () => {
    expectAll(/^(reference|class-merge|console|app log) /);
  });
});
