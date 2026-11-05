// Rows whose acceptance is proved by a standalone plain-Playwright script under tests/verify/
// (*.spec.js, run with SMOKE_URL). The @playwright/test runner collects only *.spec.ts, so without
// this file those rows have no test carrying their id and a scope-all verify writes them
// "not measured" (seen 2026-11-05). Each test here runs one script against BASE_URL and fails
// when the script exits non-zero. Titles start with the row id, which is how tf-verify-tests.sh
// maps a test to a row. Part A: REQ-UI-004, REQ-UI-014, REQ-UI-016; part B is req-ui-legacy-b.spec.ts.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const REPO = path.resolve(__dirname, '../..');

// Runs one standalone script and returns its last output lines; a non-zero exit throws.
function runScript(aName: string, aExtraEnv: Record<string, string> = {}): string {
  const vOut = execFileSync('node', [path.join(REPO, 'tests/verify', aName)], {
    cwd: REPO,
    encoding: 'utf8',
    env: { ...process.env, SMOKE_URL: BASE, ...aExtraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 540_000,
  });
  const vLines = vOut.trim().split('\n');
  return vLines.slice(-3).join('\n');
}

test.describe('Standalone verifier scripts, one per row — part A', () => {
  test('REQ-UI-004 reactive overlays rendered by PortalHost pass ui-ui004.spec.js', () => {
    test.setTimeout(600_000);
    const vTail = runScript('ui-ui004.spec.js', { OUT_DIR: 'tests/.artifacts/req-ui-004' });
    console.log(vTail);
    expect(vTail).not.toMatch(/\bFAIL(ED)?\b/);
  });

  test('REQ-UI-014 AstroLyfe TR-001 to TR-009 fixes pass ui-ui014.spec.js', () => {
    test.setTimeout(600_000);
    const vTail = runScript('ui-ui014.spec.js');
    console.log(vTail);
    expect(vTail).not.toMatch(/\bFAIL(ED)?\b/);
  });

  test('REQ-UI-016 AstroLyfe TR-010 to TR-012 fixes pass ui-ui016.spec.js', () => {
    test.setTimeout(600_000);
    const vTail = runScript('ui-ui016.spec.js');
    console.log(vTail);
    expect(vTail).not.toMatch(/\bFAIL(ED)?\b/);
  });
});
