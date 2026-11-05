// Part B of the standalone-script rows (see req-ui-legacy-a.spec.ts for why this file exists):
// REQ-UI-015 (ui-trstudio.spec.js), REQ-UI-018 and REQ-UI-012 (ui-techieblog.spec.js, the
// attribute-splatting sweep), REQ-UI-019 and REQ-UI-009 (ui-tflens.spec.js, whose TR-008 checks are
// the icon-name resolution). A title carrying two ids proves both rows with one script run.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'child_process';
import path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const REPO = path.resolve(__dirname, '../..');

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

test.describe('Standalone verifier scripts, one per row — part B', () => {
  test('REQ-UI-015 TrStudio TR-001 to TR-011 fixes pass ui-trstudio.spec.js', () => {
    test.setTimeout(600_000);
    const vTail = runScript('ui-trstudio.spec.js');
    console.log(vTail);
    expect(vTail).not.toMatch(/\bFAIL(ED)?\b/);
  });

  test('REQ-UI-018 REQ-UI-012 TechieBlog feedback and the attribute-splatting sweep pass ui-techieblog.spec.js', () => {
    test.setTimeout(600_000);
    const vTail = runScript('ui-techieblog.spec.js');
    console.log(vTail);
    expect(vTail).not.toMatch(/\bFAIL(ED)?\b/);
  });

  test('REQ-UI-019 REQ-UI-009 TfLens feedback fixes and icon-name resolution pass ui-tflens.spec.js', () => {
    test.setTimeout(600_000);
    const vTail = runScript('ui-tflens.spec.js');
    console.log(vTail);
    expect(vTail).not.toMatch(/\bFAIL(ED)?\b/);
  });
});
