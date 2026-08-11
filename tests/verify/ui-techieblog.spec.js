// TechieBlog feedback verifier — docs/TechieBlog-TrBlazeUI-Feedback.md.
// Self-contained plain-Playwright script (repo has no @playwright/test harness); run with:
//   SMOKE_URL=http://<host>:<port> node tests/verify/ui-techieblog.spec.js
// Asserts the acceptance criteria for the splatting sweep (TR-021/030/040/046/047/048/051),
// the accessibility fixes (TR-031/044/045/052/054/055/061/063/064), the behavioural fixes
// (TR-020/049/053/057/058/065), the utility bundle (TR-019/043/050) and the new components.
const { chromium } = require('playwright');

const BASE = process.env.SMOKE_URL || 'http://localhost:5183';
const URL = BASE + '/verify-techieblog';
const OUT = process.env.OUT_DIR || __dirname + '/../../test-results';

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('[data-testid="verify-heading"]', { timeout: 30000 });
  // Blazor Server needs the circuit up before anything interactive is meaningful.
  await page.waitForTimeout(1500);

  // ---- §4a render gate: the page rendered, not an ErrorBoundary ----------------------------
  const bodyText = await page.textContent('body');
  check('render-gate', !/Something went wrong|An unhandled error/i.test(bodyText),
    'no error boundary on the page');

  // ---- TR-021/030/040/046/047/048/051 — splatting ------------------------------------------
  const splatIds = ['splat-h1', 'splat-p', 'splat-breadcrumb', 'splat-breadcrumb-list',
    'splat-breadcrumb-item', 'splat-breadcrumb-link', 'splat-label', 'splat-input',
    'splat-alert', 'splat-alert-title', 'splat-alert-desc', 'splat-rating',
    'tabs-list', 'tab-one', 'tab-panel-one', 'select-trigger', 'select-value',
    'item-group', 'item-1', 'nav-menu', 'nav-list', 'nav-link-1'];
  for (const id of splatIds) {
    const n = await page.locator(`[data-testid="${id}"]`).count();
    check(`splat-${id}`, n > 0, `${n} element(s) carry data-testid="${id}"`);
  }

  // ---- TR-031/045/052 — Rating -------------------------------------------------------------
  const rating = await page.evaluate(() => {
    const g = document.querySelector('[data-testid="rating-interactive"]');
    const opts = [...g.querySelectorAll('[role="radio"]')];
    const ro = document.querySelector('[data-testid="rating-readonly"]');
    const dec = document.querySelector('[data-testid="rating-decorative"]');
    const grads = [...g.querySelectorAll('linearGradient')].map(e => e.id);
    return {
      groupRole: g.getAttribute('role'),
      optionCount: opts.length,
      optionTags: [...new Set(opts.map(o => o.tagName))],
      focusable: opts.filter(o => o.tabIndex >= 0).length,
      ariaChecked: opts.map(o => o.getAttribute('aria-checked')),
      readOnlyRole: ro.getAttribute('role'),
      readOnlyRadios: ro.querySelectorAll('[role="radio"]').length,
      readOnlyLabel: ro.getAttribute('aria-label'),
      readOnlyFocusables: ro.querySelectorAll('[tabindex]:not([tabindex="-1"]),button:not([disabled])').length,
      decorativeFocusables: [...dec.querySelectorAll('*')].filter(e => e.tabIndex >= 0).length,
      duplicateGradientIds: grads.length - new Set(grads).size,
    };
  });
  check('tr031-rating-options-are-buttons', rating.optionTags.length === 1 && rating.optionTags[0] === 'BUTTON',
    `option tags: ${rating.optionTags.join(',')}`);
  check('tr031-rating-roving-tabindex', rating.focusable === 1,
    `${rating.focusable} of ${rating.optionCount} options are focusable (expect exactly 1)`);
  check('tr031-rating-aria-checked-literal',
    rating.ariaChecked.every(v => v === 'true' || v === 'false') && rating.ariaChecked.includes('true'),
    `aria-checked = [${rating.ariaChecked.join(',')}]`);
  check('tr031-rating-unique-gradient-ids', rating.duplicateGradientIds === 0,
    `${rating.duplicateGradientIds} duplicate <linearGradient id> values`);
  check('tr045-readonly-is-img', rating.readOnlyRole === 'img' && rating.readOnlyRadios === 0,
    `role=${rating.readOnlyRole}, ${rating.readOnlyRadios} radio(s), label="${rating.readOnlyLabel}"`);
  check('tr052-readonly-not-a-tab-stop', rating.readOnlyFocusables === 0,
    `${rating.readOnlyFocusables} focusable element(s) inside a read-only rating`);
  check('tr052-focusable-false-not-a-tab-stop', rating.decorativeFocusables === 0,
    `${rating.decorativeFocusables} focusable element(s) inside Focusable="false"`);

  // Keyboard operability: focus the reachable star and press ArrowRight.
  await page.locator('[data-testid="rating-interactive"] [role="radio"][tabindex="0"]').focus();
  const before = (await page.textContent('[data-testid="rating-value"]')).trim();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const after = (await page.textContent('[data-testid="rating-value"]')).trim();
  check('tr031-rating-keyboard-operable', before !== after, `value ${before} -> ${after}`);

  // ---- TR-054/TR-063 — Tabs ---------------------------------------------------------------
  const tabs = await page.evaluate(() => {
    const read = sel => [...document.querySelectorAll(`${sel} [role="tab"]`)].map(t => ({
      selected: t.getAttribute('aria-selected'),
      controls: t.getAttribute('aria-controls'),
      controlsExists: t.getAttribute('aria-controls')
        ? !!document.getElementById(t.getAttribute('aria-controls')) : null,
    }));
    return {
      withPanels: read('[data-testid="tabs-with-panels"]'),
      noPanels: read('[data-testid="tabs-no-panels"]'),
      listRole: document.querySelector('[data-testid="tabs-list"]').getAttribute('role'),
      orphanTabs: [...document.querySelectorAll('[role="tab"]')]
        .filter(t => !t.closest('[role="tablist"]')).length,
    };
  });
  check('tr063-aria-selected-literal',
    tabs.withPanels.every(t => t.selected === 'true' || t.selected === 'false')
    && tabs.withPanels.filter(t => t.selected === 'true').length === 1,
    `aria-selected = [${tabs.withPanels.map(t => t.selected).join(',')}]`);
  check('tr054-aria-controls-resolves',
    tabs.withPanels.every(t => t.controlsExists === true),
    `targets exist: [${tabs.withPanels.map(t => t.controlsExists).join(',')}]`);
  check('tr054-no-dangling-aria-controls-without-panels',
    tabs.noPanels.every(t => t.controls === null),
    `aria-controls on panel-less tabs = [${tabs.noPanels.map(t => t.controls).join(',')}]`);
  check('tr064-every-tab-has-a-tablist', tabs.orphanTabs === 0,
    `${tabs.orphanTabs} role="tab" element(s) with no role="tablist" ancestor`);
  check('tabs-list-role', tabs.listRole === 'tablist', `TabsList role=${tabs.listRole}`);

  // ---- TR-049/TR-058 — Select shows item Text on first paint --------------------------------
  const selectText = (await page.textContent('[data-testid="select-value"]')).trim();
  check('tr058-select-first-paint-text', selectText === '-- Select Category --',
    `trigger reads "${selectText}" (raw bound value is "0")`);

  // ---- TR-055/TR-061 — ItemGroup list semantics --------------------------------------------
  const list = await page.evaluate(() => {
    const g = document.querySelector('[data-testid="item-group"]');
    return {
      groupRole: g.getAttribute('role'),
      children: [...g.children].map(c => c.getAttribute('role')),
    };
  });
  check('tr061-items-are-listitems',
    list.groupRole === 'list' && list.children.every(r => r === 'listitem'),
    `role="list" children roles = [${list.children.join(',')}]`);

  // ---- TR-044 — NavigationMenu links are Tab reachable --------------------------------------
  const nav = await page.evaluate(() => {
    const links = [...document.querySelectorAll('[data-testid="nav-menu"] a')];
    return {
      count: links.length,
      reachable: links.filter(a => a.tabIndex >= 0).length,
      roles: links.map(a => a.getAttribute('role')),
    };
  });
  check('tr044-nav-links-reachable', nav.count > 0 && nav.reachable === nav.count,
    `${nav.reachable} of ${nav.count} links reachable, roles=[${nav.roles.join(',')}]`);

  // ---- TR-020 — Typography Size actually shrinks --------------------------------------------
  const type = await page.evaluate(() => ({
    def: getComputedStyle(document.querySelector('[data-testid="type-default"]')).fontSize,
    small: getComputedStyle(document.querySelector('[data-testid="type-small"]')).fontSize,
  }));
  check('tr020-typography-size-wins', parseFloat(type.small) < parseFloat(type.def),
    `default ${type.def} vs Size=Xl2 ${type.small}`);

  // ---- TR-053/TR-057 — fast typing must not drop or reorder characters ----------------------
  const target = 'cg-subscribe-cg0808c@techieblog.test';
  await page.locator('[data-testid="typing-input"]').click();
  await page.locator('[data-testid="typing-input"]').type(target, { delay: 30 });
  await page.waitForTimeout(1200);
  const typedDom = await page.inputValue('[data-testid="typing-input"]');
  const typedEcho = (await page.textContent('[data-testid="typing-echo"]')).trim();
  check('tr053-input-keeps-every-character', typedDom === target,
    `DOM value "${typedDom}"`);
  check('tr053-input-binding-agrees', typedEcho === target, `bound value "${typedEcho}"`);

  const areaTarget = '## Live heading with more text';
  await page.locator('[data-testid="typing-textarea"]').click();
  await page.locator('[data-testid="typing-textarea"]').type(areaTarget, { delay: 15 });
  await page.waitForTimeout(1200);
  const areaDom = await page.inputValue('[data-testid="typing-textarea"]');
  check('tr057-textarea-keeps-every-character', areaDom === areaTarget, `DOM value "${areaDom}"`);

  // ---- TR-019/TR-043/TR-050 — utilities that used to be absent from the bundle --------------
  const css = await page.evaluate(() => {
    const probe = document.createElement('div');
    document.body.appendChild(probe);
    const read = cls => {
      probe.className = cls;
      const cs = getComputedStyle(probe);
      return { maxWidth: cs.maxWidth, gap: cs.gap, minWidth: cs.minWidth, flexBasis: cs.flexBasis };
    };
    const out = {
      maxW7xl: read('max-w-7xl').maxWidth,
      gap6: read('gap-6').gap,
      minW3xl: read('min-w-3xl').minWidth,
      top1: (() => { probe.className = 'top-1'; return getComputedStyle(probe).top; })(),
      w36: (() => { probe.className = 'w-36'; return getComputedStyle(probe).width; })(),
    };
    probe.remove();
    return out;
  });
  check('tr019-max-w-7xl', css.maxW7xl !== 'none', `max-width: ${css.maxW7xl}`);
  check('tr019-gap-6', css.gap6 !== 'normal' && css.gap6 !== '0px', `gap: ${css.gap6}`);
  check('tr043-min-w-3xl', css.minW3xl !== '0px' && css.minW3xl !== 'auto', `min-width: ${css.minW3xl}`);
  check('tr019-top-1', css.top1 !== 'auto', `top: ${css.top1}`);
  check('tr019-w-36', css.w36 !== 'auto' && css.w36 !== '0px', `width: ${css.w36}`);

  const grid = await page.evaluate(() =>
    getComputedStyle(document.querySelector('[data-testid="utility-probe"]')).gridTemplateColumns);
  check('tr019-responsive-grid-cols', grid.split(' ').length === 3,
    `lg:grid-cols-3 resolved to "${grid}"`);

  // ---- TR-059 — Prose keeps a wide table out of the page's own scroll ------------------------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const reflow = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    tableScrolls: (() => {
      const t = document.querySelector('[data-slot="prose"] table');
      return t ? getComputedStyle(t).overflowX : null;
    })(),
  }));
  check('tr059-prose-table-scrolls-itself', reflow.tableScrolls === 'auto',
    `table overflow-x: ${reflow.tableScrolls}`);
  check('tr059-no-page-horizontal-scroll', reflow.overflow <= 0,
    `page overflows by ${reflow.overflow}px at 390px`);
  await page.setViewportSize({ width: 1280, height: 900 });

  // ---- New components render ----------------------------------------------------------------
  for (const id of ['prose', 'stat-group', 'stat-1', 'timeline', 'timeline-1', 'stepper',
    'step-1', 'password-strength', 'code-block', 'sortable', 'centered-panel']) {
    const n = await page.locator(`[data-testid="${id}"]`).count();
    check(`new-component-${id}`, n > 0, `${n} element(s)`);
  }
  const stepCurrent = await page.getAttribute('[data-testid="step-2"]', 'aria-current');
  check('stepper-aria-current', stepCurrent === 'step', `step 2 aria-current=${stepCurrent}`);

  // TR-002 — reorder with the buttons, keyboard-operable by construction.
  const orderBefore = (await page.textContent('[data-testid="sortable-order"]')).trim();
  await page.locator('[data-testid="sortable"] li').nth(1).getByRole('button').first().click();
  await page.waitForTimeout(500);
  const orderAfter = (await page.textContent('[data-testid="sortable-order"]')).trim();
  check('tr002-sortable-reorders', orderBefore !== orderAfter, `${orderBefore} -> ${orderAfter}`);

  // ---- No unhandled JS errors anywhere in the run -------------------------------------------
  check('no-page-errors', pageErrors.length === 0, pageErrors.join(' | ') || 'none');

  // ---- §4b visual truth ---------------------------------------------------------------------
  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: `${OUT}/techieblog-1280.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/techieblog-390.png`, fullPage: true });

  await browser.close();

  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('FAILED: ' + failed.map(f => f.id).join(', '));
    process.exit(1);
  }
})().catch(e => { console.error(e); process.exit(1); });
