// REQ-UI-019 verifier spec — TfLens consumer feedback (docs/TfLens-TrBlazeUI-Feedback.md).
// Self-contained plain-Playwright script (repo has no @playwright/test harness); run with:
//   SMOKE_URL=http://<host>:<port> node tests/verify/ui-tflens.spec.js
// Gates: §4a data-render (controls actually render their data) and §4b visual-truth
// (desktop + mobile, no page overflow, zero console/page errors).
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.SMOKE_URL || 'http://localhost:5213';
const OUT = process.env.OUT_DIR || __dirname + '/../.artifacts/req-ui-019';

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

const pageErrors = [];

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(900); // Blazor Server circuit + interactive render
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => pageErrors.push(`${page.url()} :: ${String(e).slice(0, 200)}`));
  page.on('console', m => { if (m.type() === 'error') pageErrors.push(`${page.url()} :: console ${m.text().slice(0, 200)}`); });

  // ============================== TR-009 / TR-012 / TR-025 — DataTable ==============================
  await goto(page, '/components/datatable');

  // TR-009: pagination off must render EVERY row, not InitialPageSize (was 5 of 500).
  const tr009 = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="tr009-all-rows"]');
    if (!el) return null;
    const t = el.querySelector('table');
    return { rows: t ? t.querySelectorAll('tbody tr').length : -1, hasPager: /Page \d+ of \d+/.test(el.textContent) };
  });
  check('tr009-renders-all-rows', tr009 && tr009.rows === 12,
    `pagination-off grid rendered ${tr009 ? tr009.rows : 'N/A'} rows (expected 12, all of Data)`);
  check('tr009-no-pager', tr009 && !tr009.hasPager, 'no pager chrome when ShowPagination="false"');

  // TR-012: ShowHeader="false" must suppress <thead> without disturbing the body.
  const tr012 = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="tr012-no-header"]');
    if (!el) return null;
    const t = el.querySelector('table');
    return { theads: t ? t.querySelectorAll('thead').length : -1, rows: t ? t.querySelectorAll('tbody tr').length : -1 };
  });
  check('tr012-no-thead', tr012 && tr012.theads === 0, `thead count = ${tr012 ? tr012.theads : 'N/A'} (expected 0)`);
  check('tr012-body-intact', tr012 && tr012.rows > 0, `key/value rows still render: ${tr012 ? tr012.rows : 'N/A'}`);

  // TR-025: Compact density must actually reduce horizontal cell padding vs Comfortable.
  const tr025 = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="tr025-compact"] tbody td');
    const f = document.querySelector('[data-testid="tr025-comfortable"] tbody td');
    const px = el => el ? parseFloat(getComputedStyle(el).paddingLeft) : null;
    return { compact: px(c), comfortable: px(f) };
  });
  check('tr025-compact-tighter',
    tr025.compact !== null && tr025.comfortable !== null && tr025.compact < tr025.comfortable,
    `compact padding-left=${tr025.compact}px vs comfortable=${tr025.comfortable}px`);

  // ============================== TR-016 — Badge semantics ==============================
  await goto(page, '/components/badge');
  const tr016 = await page.evaluate(() => {
    const g = k => {
      const el = document.querySelector(`[data-testid="tr016-badge-${k}"]`);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, fg: cs.color };
    };
    return { success: g('success'), warning: g('warning'), info: g('info'), destructive: g('destructive') };
  });
  const distinct = new Set([tr016.success?.bg, tr016.warning?.bg, tr016.info?.bg, tr016.destructive?.bg].filter(Boolean));
  check('tr016-variants-render', !!(tr016.success && tr016.warning && tr016.info),
    `success/info/warning badges present`);
  check('tr016-semantics-distinct', distinct.size === 4,
    `success/info/warning/destructive have ${distinct.size} distinct backgrounds (expected 4 — warning must not read as error)`);

  // Contrast: the whole point of the variant is legible status text.
  // The tokens are oklch(); rather than reimplement the colour-space conversion, let the browser
  // do it — paint each colour into a 1x1 canvas and read the sRGB pixel back.
  const ratios = await page.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const toRgb = css => {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000';
      ctx.fillStyle = css; ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    const lum = rgb => {
      const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const out = {};
    for (const k of ['success', 'info', 'warning', 'destructive']) {
      const el = document.querySelector(`[data-testid="tr016-badge-${k}"]`);
      if (!el) { out[k] = null; continue; }
      const cs = getComputedStyle(el);
      const [l1, l2] = [lum(toRgb(cs.color)), lum(toRgb(cs.backgroundColor))].sort((a, b) => b - a);
      out[k] = (l1 + 0.05) / (l2 + 0.05);
    }
    return out;
  });
  for (const k of ['success', 'info', 'warning']) {
    const ratio = ratios[k];
    check(`tr016-${k}-contrast`, ratio !== null && ratio >= 4.5,
      `${k} text/bg contrast = ${ratio ? ratio.toFixed(2) : 'N/A'}:1 (WCAG AA 4.5:1)`);
  }

  // ============================== TR-024 — Tabs Class actually overrides ==============================
  await goto(page, '/components/tabs');
  const tr024 = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="tr024-tabs-list-compact"]');
    return c ? { h: c.getBoundingClientRect().height, pad: getComputedStyle(c).paddingTop } : null;
  });
  // h-9 = 36px must win over the built-in h-10 = 40px. Before the cn() fix the cascade kept h-10.
  check('tr024-class-overrides-track', tr024 && Math.abs(tr024.h - 36) < 2,
    `TabsList Class="h-9 p-0" produced height ${tr024 ? tr024.h.toFixed(1) : 'N/A'}px (expected 36, built-in h-10 was 40)`);

  // ============================== TR-027 — Breadcrumb wrap ==============================
  await goto(page, '/components/breadcrumb');
  const tr027 = await page.evaluate(() => {
    const g = sel => {
      const el = document.querySelector(sel);
      const ol = el ? el.querySelector('ol') : null;
      if (!ol) return null;
      const cs = getComputedStyle(ol);
      return { wrap: cs.flexWrap, rowGap: cs.rowGap, colGap: cs.columnGap, lines: ol.getBoundingClientRect().height };
    };
    return { nowrap: g('[data-testid="tr027-breadcrumb-nowrap-trail"]'), wrapped: g('[data-testid="tr027-breadcrumb-wrap-trail"]') };
  });
  check('tr027-wrap-false-honoured', tr027.nowrap && tr027.nowrap.wrap === 'nowrap',
    `Wrap="false" → flex-wrap:${tr027.nowrap ? tr027.nowrap.wrap : 'N/A'}`);

  // Squeeze BOTH rails until the trail cannot fit, then compare. Without the squeeze the demo's
  // 256px rail happens to fit the trail, so neither wraps and the comparison proves nothing.
  const tr027squeeze = await page.evaluate(() => {
    const g = sel => document.querySelector(sel);
    const a = g('[data-testid="tr027-breadcrumb-nowrap-trail"]');
    const b = g('[data-testid="tr027-breadcrumb-wrap-trail"]');
    if (!a || !b) return null;
    a.parentElement.style.width = '150px';
    b.parentElement.style.width = '150px';
    void a.offsetWidth; void b.offsetWidth;
    const h = el => el.querySelector('ol').getBoundingClientRect().height;
    const ol = el => el.querySelector('ol');
    return {
      nowrapH: h(a), wrapH: h(b),
      nowrapOverflows: ol(a).scrollWidth > ol(a).clientWidth + 1,
    };
  });
  check('tr027-holds-one-line-under-pressure',
    tr027squeeze && tr027squeeze.nowrapOverflows && tr027squeeze.wrapH > tr027squeeze.nowrapH,
    `squeezed to 150px: Wrap="false" trail stays ${tr027squeeze ? tr027squeeze.nowrapH.toFixed(0) : 'N/A'}px (one line, overflowing=${tr027squeeze ? tr027squeeze.nowrapOverflows : 'N/A'}) while the wrapping trail grows to ${tr027squeeze ? tr027squeeze.wrapH.toFixed(0) : 'N/A'}px`);
  check('tr027-gap-single-axis', tr027.nowrap && parseFloat(tr027.nowrap.rowGap) === 0,
    `row-gap = ${tr027.nowrap ? tr027.nowrap.rowGap : 'N/A'} (a wrapped row must not pay the column spacing again)`);

  // ============================== TR-018 — closed Collapsible occupies no box ==============================
  await goto(page, '/components/collapsible');
  const tr018 = await page.evaluate(() => {
    const wrap = document.querySelector('[data-testid="tr018-collapsible-closed"]');
    if (!wrap) return null;
    const inner = wrap.querySelector('[data-testid="tr018-collapsible-closed-inner"]');
    const sib = document.querySelector('[data-testid="tr018-collapsible-closed-sibling"]');
    const content = wrap.querySelector('[data-testid="tr018-collapsible-closed-content"]');
    const r = el => el ? el.getBoundingClientRect() : null;
    const ir = r(inner), sr = r(sib), cr = r(content);
    return {
      innerH: ir ? ir.height : null,
      innerBottom: ir ? ir.bottom : null,
      sibTop: sr ? sr.top : null,
      contentDisplay: content ? getComputedStyle(content).display : null,
      contentHidden: content ? content.hasAttribute('hidden') : null,
      overlap: (ir && sr) ? Math.max(0, ir.bottom - sr.top) : null,
    };
  });
  check('tr018-closed-no-layout-box', tr018 && tr018.innerH === 0,
    `closed panel's inner child rect height = ${tr018 ? tr018.innerH : 'N/A'}px (was 20px; must be 0)`);
  check('tr018-closed-display-none', tr018 && tr018.contentDisplay === 'none',
    `closed content display = ${tr018 ? tr018.contentDisplay : 'N/A'}, hidden attr = ${tr018 ? tr018.contentHidden : 'N/A'}`);
  check('tr018-no-sibling-overlap', tr018 && tr018.overlap === 0,
    `overlap with the next sibling = ${tr018 ? tr018.overlap : 'N/A'}px (was 45px)`);

  // Opening it must still reveal the content (the animation must not have been traded away).
  const openBtn = await page.$('[data-testid="tr018-collapsible-closed-trigger"]');
  if (openBtn) {
    await openBtn.click();
    await page.waitForTimeout(500);
    const openedH = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="tr018-collapsible-closed-inner"]');
      return el ? el.getBoundingClientRect().height : null;
    });
    check('tr018-opens-normally', openedH > 0, `after opening, inner height = ${openedH}px`);
  } else check('tr018-opens-normally', false, 'trigger not found');

  // ============================== TR-014 — AlertDialog / Dialog Escape ==============================
  await goto(page, '/components/alert-dialog');
  // (a) Escape now closes by default.
  await page.click('[data-testid="tr014-alert-escape-open"]');
  await page.waitForSelector('[role="alertdialog"]', { timeout: 8000 });
  await page.waitForTimeout(400);
  const beforeEsc = await page.$$eval('[role="alertdialog"]', n => n.length);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const afterEsc = await page.$$eval('[role="alertdialog"]', n => n.length);
  check('tr014-alert-escape-closes', beforeEsc === 1 && afterEsc === 0,
    `alertdialog count ${beforeEsc} → ${afterEsc} across Escape (was 1 → 1)`);

  // (b) The opt-out still works — a fix that removes the choice is not a fix.
  await page.click('[data-testid="tr014-alert-noescape-open"]');
  await page.waitForSelector('[role="alertdialog"]', { timeout: 8000 });
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const optOut = await page.$$eval('[role="alertdialog"]', n => n.length);
  check('tr014-alert-optout-respected', optOut === 1, `CloseOnEscape="false" kept it open (count=${optOut})`);
  await page.keyboard.press('Escape'); // leave clean
  const cancel = await page.$('[role="alertdialog"] button');
  if (cancel) { await cancel.click(); await page.waitForTimeout(400); }

  // (c) Escape survives a content re-render — the reported second half.
  await goto(page, '/components/dialog');
  await page.click('[data-testid="tr014-dialog-rerender-open"]');
  await page.waitForSelector('[data-testid="tr014-dialog-rerender"]', { timeout: 8000 });
  await page.waitForTimeout(400);
  await page.click('[data-testid="tr014-dialog-rerender-validate"]');   // re-renders the body, destroying focus
  await page.waitForTimeout(600);
  const rerendered = await page.$$eval('[data-testid="tr014-dialog-rerender"]', n => n.length);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const afterRerenderEsc = await page.$$eval('[data-testid="tr014-dialog-rerender"]', n => n.length);
  check('tr014-escape-survives-rerender', rerendered === 1 && afterRerenderEsc === 0,
    `dialog count ${rerendered} → ${afterRerenderEsc} after a body re-render then Escape`);

  // ============================== TR-019 — header/footer pinned, body scrolls ==============================
  await page.click('[data-testid="tr019-scroll-body-open"]');
  await page.waitForSelector('[data-testid="tr019-scroll-body"]', { timeout: 8000 });
  await page.waitForTimeout(600);
  const tr019 = await page.evaluate(() => {
    const body = document.querySelector('[data-testid="tr019-scroll-body-body"]');
    const header = document.querySelector('[data-testid="tr019-scroll-body-header"]');
    const footer = document.querySelector('[data-testid="tr019-scroll-body-footer"]');
    const panel = document.querySelector('[data-testid="tr019-scroll-body"]');
    if (!body || !panel) return null;
    const before = { header: header.getBoundingClientRect().top, footer: footer.getBoundingClientRect().bottom };
    body.scrollTop = body.scrollHeight;           // scroll the body to its end
    const after = { header: header.getBoundingClientRect().top, footer: footer.getBoundingClientRect().bottom };
    const pr = panel.getBoundingClientRect();
    return {
      bodyScrollable: body.scrollHeight > body.clientHeight + 1,
      headerMoved: Math.abs(after.header - before.header),
      footerMoved: Math.abs(after.footer - before.footer),
      panelTop: pr.top,
      footerInView: after.footer <= window.innerHeight + 1,
    };
  });
  check('tr019-body-scrolls', tr019 && tr019.bodyScrollable, 'the body region is the scroller');
  check('tr019-header-pinned', tr019 && tr019.headerMoved < 1, `header moved ${tr019 ? tr019.headerMoved.toFixed(1) : 'N/A'}px while the body scrolled`);
  check('tr019-footer-pinned', tr019 && tr019.footerMoved < 1, `footer moved ${tr019 ? tr019.footerMoved.toFixed(1) : 'N/A'}px`);
  check('tr019-footer-reachable', tr019 && tr019.footerInView, 'the primary action stays on screen');
  // REQ-UI-016 regression: the panel top must never go above the 16px gutter.
  check('tr019-req016-top-hold', tr019 && tr019.panelTop >= 0,
    `panel top = ${tr019 ? tr019.panelTop.toFixed(1) : 'N/A'}px (REQ-UI-016 requires >= 0)`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // ============================== TR-008 — Lucide alias names render ==============================
  // The library's OWN demos already used an aliased spelling and were rendering nothing.
  await goto(page, '/components/dropdown-menu');
  const trigger = await page.$('button');
  if (trigger) { await trigger.click(); await page.waitForTimeout(700); }
  const tr008 = await page.evaluate(() => ({
    missing: document.querySelectorAll('[data-trblazeui-missing-icon]').length,
    svgs: document.querySelectorAll('svg').length,
  }));
  check('tr008-no-missing-placeholders', tr008.missing === 0,
    `${tr008.missing} data-trblazeui-missing-icon placeholders on a page using the aliased name "check-circle" (${tr008.svgs} svgs rendered)`);

  // ============================== §4b visual truth — desktop + mobile ==============================
  const routes = ['/components/datatable', '/components/badge', '/components/tabs', '/components/breadcrumb',
                  '/components/collapsible', '/components/dialog', '/components/alert-dialog', '/charts/bar'];
  for (const w of [1280, 390]) {
    await page.setViewportSize({ width: w, height: w === 390 ? 844 : 900 });
    for (const r of routes) {
      await goto(page, r);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check(`visual-${w}-${r.replace(/\//g, '_')}`, overflow <= 0, `horizontal overflow = ${overflow}px`);
    }
    await goto(page, '/components/datatable');
    await page.screenshot({ path: `${OUT}/datatable-${w}.png`, fullPage: false });
    await goto(page, '/components/badge');
    await page.screenshot({ path: `${OUT}/badge-${w}.png`, fullPage: false });
  }

  check('no-page-errors', pageErrors.length === 0, pageErrors.length ? pageErrors.slice(0, 4).join(' | ') : '0 console/page errors across all routes');

  await browser.close();

  const passed = results.filter(r => r.pass).length;
  console.log(`\n==== REQ-UI-019 (TfLens) : ${passed}/${results.length} ====`);
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify({ passed, total: results.length, results, pageErrors }, null, 2));
  process.exit(passed === results.length ? 0 : 1);
})();
