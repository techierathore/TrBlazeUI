// REQ-UI-014 verifier spec — AstroLyfe feedback TR-003 (SelectTrigger accessible name).
// Self-contained plain-Playwright script (repo has no @playwright/test harness); run with:
//   SMOKE_URL=http://<host>:<port> node tests/verify/ui-ui014.spec.js
// Gates: the accessible-name acceptance criteria (Chromium's own name computation via
// getByRole name-matching + ariaSnapshot) and, when @axe-core is resolvable, the exact
// axe `button-name` rule AstroLyfe used. A <button role="combobox"> is NOT a
// name-from-content role, so this fails unless the trigger carries aria-labelledby/aria-label.
const { chromium } = require('playwright');

const BASE = process.env.SMOKE_URL || 'http://localhost:5213';
const URL = BASE + '/verify-ui014';

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

// Optional: axe-core is installed in a sibling consumer repo, not here. Resolve it if we can.
let AxeBuilder = null;
try { AxeBuilder = require('/mnt/c/1MyCode/AstroLyfe/node_modules/@axe-core/playwright').default; } catch { /* run without axe */ }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newContext({ viewport: { width: 1366, height: 720 } }).then(c => c.newPage());
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  check('http-200', resp && resp.status() === 200, 'status=' + (resp && resp.status()));
  await page.waitForSelector('[data-testid="verify-heading"]', { timeout: 15000 });
  await page.waitForTimeout(1500); // Blazor Server circuit connect

  // Chromium's accessible-name computation for the combobox role. Playwright's role
  // locator name option matches the computed accessible name (aria-labelledby/aria-label),
  // NOT descendant inner text for non-name-from-content roles — exactly what axe checks.
  const nameOf = async (testid) => {
    const loc = page.locator(`[data-testid="${testid}"]`);
    return (await loc.ariaSnapshot()).trim();
  };

  // ---- TR-003 · a valued trigger exposes its value as the accessible name ----
  // The bound value "Patreon" is the accessible name. (Its full display text "Patreon
  // (Seeker)" only resolves after the listbox first opens, since SelectContent items
  // register lazily — but the raw value is already a valid non-empty name, which is all
  // TR-003 / axe button-name requires. A bare `- combobox` with no quoted name is the bug.)
  const valuedSnap = await nameOf('tr003-valued');
  check('tr003-valued-has-name', /- combobox "Patreon/.test(valuedSnap),
    `aria snapshot: ${JSON.stringify(valuedSnap)}`);
  check('tr003-valued-labelledby', await page.locator('[data-testid="tr003-valued"]').getAttribute('aria-labelledby') !== null,
    'trigger carries aria-labelledby');

  // ---- TR-003 · a placeholder-only trigger still has a non-empty accessible name ----
  const phSnap = await nameOf('tr003-placeholder');
  check('tr003-placeholder-has-name', /- combobox "Select a role"/.test(phSnap),
    `aria snapshot: ${JSON.stringify(phSnap)}`);

  // ---- TR-003 · an explicit AriaLabel wins over the default value-derived name ----
  const alSnap = await nameOf('tr003-arialabel');
  check('tr003-arialabel-overrides', /- combobox "Choose your role"/.test(alSnap),
    `aria snapshot: ${JSON.stringify(alSnap)}`);
  // and the default aria-labelledby must NOT be emitted when the author set a name
  const alLabelledBy = await page.locator('[data-testid="tr003-arialabel"]').getAttribute('aria-labelledby');
  check('tr003-arialabel-no-default-labelledby', alLabelledBy === null,
    `aria-labelledby=${JSON.stringify(alLabelledBy)} (expect null so aria-label wins)`);

  // ---- axe button-name: the exact rule AstroLyfe reported (critical) ----
  if (AxeBuilder) {
    const axe = await new AxeBuilder({ page }).withRules(['button-name']).analyze();
    const violations = axe.violations.filter(v => v.id === 'button-name');
    const nodes = violations.flatMap(v => v.nodes.map(n => n.target.join(' ')));
    check('tr003-axe-button-name-clean', violations.length === 0,
      `button-name violations=${violations.length}${nodes.length ? ' at ' + JSON.stringify(nodes) : ''}`);
  } else {
    console.log('SKIP  tr003-axe-button-name-clean  (@axe-core/playwright not resolvable)');
  }

  check('no-console-errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length === 0 ? 0 : 1);
})();
