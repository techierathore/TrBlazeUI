// REQ-UI-020 verifier spec — TfLens consumer feedback TR-028…TR-035
// (docs/TfLens-TrBlazeUI-Feedback.md).
// Self-contained plain-Playwright script (repo has no @playwright/test harness); run with:
//   SMOKE_URL=http://<host>:<port> node tests/verify/ui-tflens-2.spec.js
// Gates: §4a data-render (controls actually render their data) and §4b visual-truth
// (desktop + mobile, no page overflow, zero console/page errors).
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.SMOKE_URL || 'http://localhost:5213';
const OUT = process.env.OUT_DIR || __dirname + '/../.artifacts/req-ui-020';

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

const pageErrors = [];

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200); // Blazor Server circuit + interactive render
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => pageErrors.push(`${page.url()} :: ${String(e).slice(0, 200)}`));
  page.on('console', m => { if (m.type() === 'error') pageErrors.push(`${page.url()} :: console ${m.text().slice(0, 200)}`); });

  await goto(page, '/verify-tflens-2');
  await page.waitForTimeout(1800); // ApexCharts mount

  // ==================== TR-028 — chart options reach ApexCharts ====================
  const tr028 = await page.evaluate(() => {
    const scope = sel => document.querySelector(sel);
    const count = (root, sel) => root ? root.querySelectorAll(sel).length : -1;
    const styled = scope('[data-testid="tr028-styled"]');
    const def = scope('[data-testid="tr028-default"]');
    const stroke = root => {
      const l = root && root.querySelector('.apexcharts-gridline');
      return l ? getComputedStyle(l).stroke : null;
    };
    const bare = scope('[data-testid="tr028-bare-container"]');
    const card = scope('[data-testid="tr028-card-container"]');
    const cs = el => el ? getComputedStyle(el) : null;
    const b = cs(bare), c = cs(card);
    return {
      styledGridlines: count(styled, '.apexcharts-gridline'),
      styledYLabels: count(styled, '.apexcharts-yaxis-label'),
      styledDataLabels: count(styled, '.apexcharts-datalabel, .apexcharts-datalabels text'),
      styledBars: count(styled, '.apexcharts-bar-area'),
      defaultGridlines: count(def, '.apexcharts-gridline'),
      defaultYLabels: count(def, '.apexcharts-yaxis-label'),
      defaultBars: count(def, '.apexcharts-bar-area'),
      styledGridBorders: count(styled, '.apexcharts-grid-borders line'),
      defaultGridBorders: count(def, '.apexcharts-grid-borders line'),
      styledGridStroke: stroke(styled),
      defaultGridStroke: stroke(def),
      bareBorder: b && parseFloat(b.borderTopWidth),
      bareShadow: b && b.boxShadow,
      barePadding: b && b.paddingTop,
      cardBorder: c && parseFloat(c.borderTopWidth),
      cardShadow: c && c.boxShadow !== 'none',
      cardPadding: c && c.paddingTop,
    };
  });
  check('tr028-options-suppress-grid', tr028.styledGridlines === 0 && tr028.styledGridBorders === 0,
    `Options{Grid: Show=false, X/Y lines off} -> ${tr028.styledGridlines} gridlines and ${tr028.styledGridBorders} grid borders (expected 0/0; the default chart has ${tr028.defaultGridlines}/${tr028.defaultGridBorders})`);
  check('tr028-callers-grid-replaces-the-wrappers',
    tr028.styledGridStroke !== tr028.defaultGridStroke,
    `the caller's Grid object is the one ApexCharts received, not the wrapper's: styled stroke ${tr028.styledGridStroke} vs default ${tr028.defaultGridStroke} (the wrapper's is var(--border))`);
  check('tr028-options-suppress-yaxis', tr028.styledYLabels === 0,
    `Options{Yaxis[0].Show=false} -> ${tr028.styledYLabels} y-axis labels (expected 0; the default chart has ${tr028.defaultYLabels})`);
  check('tr028-options-keep-the-chart', tr028.styledBars === 3,
    `the steered chart still draws its bars: ${tr028.styledBars} (expected 3)`);
  check('tr028-defaults-untouched', tr028.defaultGridlines > 0 && tr028.defaultYLabels > 0 && tr028.defaultBars === 3,
    `a chart with no Options keeps every wrapper default: ${tr028.defaultGridlines} gridlines, ${tr028.defaultYLabels} y labels, ${tr028.defaultBars} bars`);
  check('tr028-bare-container', tr028.bareBorder === 0 && tr028.bareShadow === 'none' && tr028.barePadding === '0px',
    `Bare container paints no card: border ${tr028.bareBorder}px, shadow ${tr028.bareShadow}, padding ${tr028.barePadding}`);
  check('tr028-default-container-unchanged', tr028.cardBorder === 1 && tr028.cardShadow && tr028.cardPadding === '24px',
    `default container still paints its card: border ${tr028.cardBorder}px, shadow ${tr028.cardShadow}, padding ${tr028.cardPadding}`);

  // ==================== TR-034 — the element a Badge renders ====================
  const tr034 = await page.evaluate(() => {
    const inline = document.querySelector('[data-testid="tr034-inline"]');
    const asDiv = document.querySelector('[data-testid="tr034-asdiv"]');
    return {
      inlineTag: inline && inline.tagName,
      inlineParent: inline && inline.parentElement.tagName,
      inlineDisplay: inline && getComputedStyle(inline).display,
      asDivTag: asDiv && asDiv.tagName,
      // a <div> inside a <p> is auto-closed by the parser; a <span> is not
      stillInsideParagraph: inline ? inline.closest('p') !== null : false,
    };
  });
  check('tr034-badge-is-a-span', tr034.inlineTag === 'SPAN',
    `Badge renders <${(tr034.inlineTag || '?').toLowerCase()}> (expected span)`);
  check('tr034-badge-sits-in-a-sentence', tr034.stillInsideParagraph && tr034.inlineParent === 'P',
    `the pill stays inside its <p> (parent = ${tr034.inlineParent}) instead of being parsed out of it`);
  check('tr034-badge-still-inline-flex', tr034.inlineDisplay === 'inline-flex',
    `appearance unchanged: display ${tr034.inlineDisplay}`);
  check('tr034-asdiv-escape-hatch', tr034.asDivTag === 'DIV',
    `As="div" still renders <${(tr034.asDivTag || '?').toLowerCase()}> for markup that depended on it`);

  // ==================== TR-029 — a long label under width pressure ====================
  const tr029 = await page.evaluate(() => {
    const read = key => {
      const el = document.querySelector(`[data-testid="tr029-${key}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || 16;
      return {
        w: Math.round(r.width), h: Math.round(r.height),
        lines: Math.max(1, Math.round((r.height - 4) / lh)),
        radius: Math.round(parseFloat(cs.borderTopLeftRadius)),
        whiteSpace: cs.whiteSpace, textAlign: cs.textAlign, overflow: cs.overflow,
      };
    };
    return { def: read('default'), wrap: read('wrap'), trunc: read('truncate') };
  });
  check('tr029-default-holds-one-line', tr029.def && tr029.def.lines === 1 && tr029.def.whiteSpace === 'nowrap',
    `default badge: ${tr029.def && tr029.def.lines} line(s), white-space ${tr029.def && tr029.def.whiteSpace} — a long label no longer folds into a rounded-full box`);
  check('tr029-wrap-grows-the-pill', tr029.wrap && tr029.wrap.lines >= 2 && tr029.wrap.whiteSpace === 'normal',
    `Wrap="true": ${tr029.wrap && tr029.wrap.lines} lines at ${tr029.wrap && tr029.wrap.h}px tall, white-space ${tr029.wrap && tr029.wrap.whiteSpace}`);
  check('tr029-wrap-drops-the-pill-radius',
    tr029.wrap && tr029.wrap.radius < tr029.wrap.h / 2,
    `Wrap="true" radius ${tr029.wrap && tr029.wrap.radius}px on a ${tr029.wrap && tr029.wrap.h}px box (was 33554432px, which is what cut into the text)`);
  check('tr029-wrap-is-left-aligned', tr029.wrap && (tr029.wrap.textAlign === 'start' || tr029.wrap.textAlign === 'left'),
    `Wrap="true" text-align ${tr029.wrap && tr029.wrap.textAlign}`);
  check('tr029-truncate-clips', tr029.trunc && tr029.trunc.lines === 1 && tr029.trunc.overflow === 'hidden',
    `Truncate="true": ${tr029.trunc && tr029.trunc.lines} line, overflow ${tr029.trunc && tr029.trunc.overflow}`);

  // ==================== TR-030 — a disclosure header spanning its row ====================
  const tr030 = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="tr030-trigger"]');
    const badge = document.querySelector('[data-testid="tr030-badge"]');
    const box = document.querySelector('[data-testid="tr030-box"]');
    if (!t || !badge || !box) return null;
    const tr = t.getBoundingClientRect();
    const br = badge.getBoundingClientRect();
    const cs = getComputedStyle(box);
    // clientWidth, not the bounding rect: the rect includes the box's 1px borders.
    const inner = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return {
      cls: t.className,
      triggerW: Math.round(tr.width), availableW: Math.round(inner),
      badgeRightGap: Math.round(tr.right - br.right),
      display: getComputedStyle(t).display,
    };
  });
  check('tr030-class-reaches-the-button', tr030 && /\bw-full\b/.test(tr030.cls) && /\btext-left\b/.test(tr030.cls),
    `CollapsibleTrigger Class lands on the real <button>: "${tr030 && tr030.cls}"`);
  check('tr030-trigger-fills-its-row', tr030 && Math.abs(tr030.triggerW - tr030.availableW) <= 1,
    `trigger is ${tr030 && tr030.triggerW}px of the ${tr030 && tr030.availableW}px available`);
  check('tr030-badge-sits-flush-right', tr030 && tr030.badgeRightGap <= 2,
    `the spacer pushes the badge to the right edge: ${tr030 && tr030.badgeRightGap}px gap`);

  // ==================== TR-031 — a header over its figures ====================
  const tr031 = await page.evaluate(() => {
    const t = document.querySelector('[data-testid="tr031-table"] table');
    if (!t) return null;
    const ths = [...t.querySelectorAll('thead th')];
    const read = i => {
      const th = ths[i];
      if (!th) return null;
      const label = th.querySelector('div > span') || th.querySelector('span');
      const box = th.querySelector('div');
      const cell = t.querySelector(`tbody tr td:nth-child(${i + 1})`);
      return {
        justify: box ? getComputedStyle(box).justifyContent : null,
        thAlign: getComputedStyle(th).textAlign,
        cellAlign: cell ? getComputedStyle(cell).textAlign : null,
        cellColor: cell ? getComputedStyle(cell).color : null,
        labelRightGap: label ? Math.round(th.getBoundingClientRect().right - label.getBoundingClientRect().right) : null,
        cellRightGap: cell ? Math.round(cell.getBoundingClientRect().right - cell.getBoundingClientRect().right) : null,
      };
    };
    return { model: read(0), input: read(1), output: read(2), cached: read(3) };
  });
  check('tr031-align-end-moves-the-header', tr031 && tr031.input.justify === 'flex-end',
    `Align="End" header label box justify-content = ${tr031 && tr031.input.justify} (was "normal", which is why text-right moved nothing)`);
  check('tr031-align-end-moves-the-cells', tr031 && tr031.input.cellAlign === 'right',
    `Align="End" body cells text-align = ${tr031 && tr031.input.cellAlign}`);
  check('tr031-headerclass-still-honoured', tr031 && tr031.output.justify === 'flex-end',
    `HeaderClass="text-right" with no Align still reaches the label box: justify-content = ${tr031 && tr031.output.justify}`);
  check('tr031-align-survives-a-cell-colour',
    tr031 && tr031.cached.cellAlign === 'right' && tr031.cached.cellColor && tr031.cached.cellColor !== tr031.model.cellColor,
    `a column with both Align and CellClass="text-muted-foreground" keeps both: align ${tr031 && tr031.cached.cellAlign}, colour ${tr031 && tr031.cached.cellColor} vs default ${tr031 && tr031.model.cellColor}`);
  // `start` and `left` are the same thing in an LTR document; the browser reports whichever the
  // cascade landed on.
  check('tr031-text-columns-untouched',
    tr031 && tr031.model.justify === 'flex-start' && ['left', 'start'].includes(tr031.model.cellAlign),
    `an unaligned column is unchanged: justify ${tr031 && tr031.model.justify}, cells ${tr031 && tr031.model.cellAlign}`);

  // ==================== TR-032 — the select's own arrow ====================
  const tr032 = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="tr032-select"]');
    if (!s) return null;
    const cs = getComputedStyle(s);
    return {
      hasUrlClass: /bg-\[url/.test(s.className),
      backgroundImage: cs.backgroundImage.slice(0, 40),
      backgroundRepeat: cs.backgroundRepeat,
      appearance: cs.appearance || cs.webkitAppearance,
      paddingRight: cs.paddingRight,
    };
  });
  check('tr032-chevron-class-survives-the-merge', tr032 && tr032.hasUrlClass,
    `the bg-[url(...)] chevron class is on the rendered element (the injection guard used to delete it)`);
  check('tr032-select-paints-an-arrow', tr032 && tr032.backgroundImage.startsWith('url('),
    `computed background-image = ${tr032 && tr032.backgroundImage}… (was "none")`);
  check('tr032-arrow-has-room', tr032 && tr032.backgroundRepeat === 'no-repeat' && parseFloat(tr032.paddingRight) >= 24,
    `background-repeat ${tr032 && tr032.backgroundRepeat}, padding-right ${tr032 && tr032.paddingRight}`);

  // ==================== TR-033 — the filter drawn outside the grid ====================
  const beforeRows = await page.evaluate(() =>
    document.querySelectorAll('[data-testid="tr033-table"] tbody tr').length);
  check('tr033-grid-starts-unfiltered', beforeRows === 3, `card-header-filtered grid shows ${beforeRows} rows`);

  const headerFilter = await page.$('[data-testid="tr033-header-filter"] input, input[data-testid="tr033-header-filter"]');
  if (headerFilter) {
    await headerFilter.click();
    await headerFilter.type('escaped', { delay: 30 });
    await page.waitForTimeout(900);
  }
  const afterRows = await page.evaluate(() =>
    document.querySelectorAll('[data-testid="tr033-table"] tbody tr').length);
  const toolbarInGrid = await page.evaluate(() =>
    document.querySelectorAll('[data-testid="tr033-table"] input[placeholder="Search..."]').length);
  check('tr033-external-input-drives-the-grid', afterRows === 1,
    `typing in the card header narrowed the grid to ${afterRows} row(s) from ${beforeRows} — the grid's own filtering, not a second hand-written one`);
  check('tr033-no-toolbar-was-needed', toolbarInGrid === 0,
    `the grid rendered no toolbar of its own (${toolbarInGrid} built-in search boxes)`);

  const tr033b = await page.evaluate(() => {
    const scope = document.querySelector('[data-testid="tr033-nochooser"]');
    if (!scope) return null;
    return {
      searchBoxes: scope.querySelectorAll('input[placeholder="Search..."]').length,
      columnsButtons: [...scope.querySelectorAll('button')].filter(b => /Columns/.test(b.textContent)).length,
    };
  });
  check('tr033-chooser-is-separable',
    tr033b && tr033b.searchBoxes === 1 && tr033b.columnsButtons === 0,
    `ShowColumnChooser="false": ${tr033b && tr033b.searchBoxes} search box, ${tr033b && tr033b.columnsButtons} Columns button`);

  const toolbarInput = await page.$('[data-testid="tr033-nochooser"] input[placeholder="Search..."]');
  if (toolbarInput) {
    await toolbarInput.click();
    await toolbarInput.type('spec', { delay: 30 });
    await page.waitForTimeout(900);
  }
  const echo = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="tr033-echo"]');
    return el ? el.textContent.trim() : '';
  });
  check('tr033-toolbar-writes-back', /bound search text:\s*spec/.test(echo),
    `the built-in box wrote back to the bound field — "${echo}"`);

  // ==================== TR-035 — the phone menu's width ====================
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on('pageerror', e => pageErrors.push(`${mobile.url()} :: ${String(e).slice(0, 200)}`));
  mobile.on('console', m => { if (m.type() === 'error') pageErrors.push(`${mobile.url()} :: console ${m.text().slice(0, 200)}`); });
  await mobile.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await mobile.waitForTimeout(1500);

  const trigger = await mobile.$('[data-sidebar="trigger"], button[aria-label*="idebar"], button[aria-label*="enu"]');
  if (trigger) {
    await trigger.click();
    await mobile.waitForTimeout(900);
  }
  const tr035 = await mobile.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const sheet = document.querySelector('.trblazeui-portal [data-side], [role="dialog"][data-side], [data-state="open"][data-side]');
    return {
      tokenDesktop: root.getPropertyValue('--sidebar-width').trim(),
      tokenMobile: root.getPropertyValue('--sidebar-width-mobile').trim(),
      readers: [...document.querySelectorAll('*')]
        .filter(e => typeof e.className === 'string' && /sidebar-width-mobile/.test(e.className)).length,
      sheetWidth: sheet ? Math.round(sheet.getBoundingClientRect().width) : null,
      sheetClass: sheet ? String(sheet.className).slice(0, 80) : null,
    };
  });
  check('tr035-mobile-token-is-read', tr035.readers >= 1,
    `${tr035.readers} element(s) now size themselves from --sidebar-width-mobile (was 0 — the token was declared and read by nothing)`);
  if (tr035.sheetWidth !== null) {
    check('tr035-phone-menu-is-18rem', tr035.sheetWidth === 288,
      `the slid-out menu measures ${tr035.sheetWidth}px (expected 288 = 18rem; was 256 = --sidebar-width)`);
  } else {
    check('tr035-phone-menu-is-18rem', false, 'the phone sheet could not be opened on this route');
  }

  // ==================== §4b visual truth ====================
  for (const [label, p, w, h] of [['desktop', page, 1280, 900], ['mobile', mobile, 390, 844]]) {
    const target = label === 'desktop' ? page : mobile;
    if (label === 'mobile') {
      await target.goto(BASE + '/verify-tflens-2', { waitUntil: 'networkidle', timeout: 60000 });
      await target.waitForTimeout(1800);
    }
    const overflow = await target.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    check(`visual-no-h-overflow-${label}`, overflow.scrollW <= overflow.clientW + 1,
      `scrollWidth ${overflow.scrollW} vs clientWidth ${overflow.clientW} @${w}`);
    await target.screenshot({ path: `${OUT}/verify-tflens-2-${label}.png`, fullPage: true });
  }

  check('no-console-or-page-errors', pageErrors.length === 0,
    pageErrors.length ? pageErrors.slice(0, 3).join(' | ') : 'zero console/page errors across both viewports');

  await browser.close();

  const passed = results.filter(r => r.pass).length;
  fs.writeFileSync(`${OUT}/results.json`,
    JSON.stringify({ req: 'REQ-UI-020', total: results.length, passed, results }, null, 2));
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exit(passed === results.length ? 0 : 1);
})();
