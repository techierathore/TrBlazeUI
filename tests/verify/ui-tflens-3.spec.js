// Verifier spec — TfLens consumer feedback TR-036…TR-038 (docs/TfLens-TrBlazeUI-Feedback.md),
// rows REQ-UI-001 (TR-036) and REQ-UI-020 (TR-037, TR-038).
// Self-contained plain-Playwright script; run with:
//   SMOKE_URL=http://<host>:<port> APP_LOG=tests/.artifacts/verify/app-5213.log node tests/verify/ui-tflens-3.spec.js
// Gates: data-render (labels, colours and log actually measured) and visual-truth
// (desktop + mobile, no page overflow, zero console/page errors).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.SMOKE_URL || 'http://localhost:5213';
const OUT = process.env.OUT_DIR || path.join(__dirname, '..', '.artifacts', 'tflens-3');
const APP_LOG = process.env.APP_LOG || path.join(__dirname, '..', '.artifacts', 'verify', 'app-5213.log');

const results = [];
function check(id, cond, detail) {
  results.push({ id, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${id}  ${detail || ''}`);
}

const LABELS = '.apexcharts-datalabel, .apexcharts-datalabels text, .apexcharts-pie-label';
const logText = () => (fs.existsSync(APP_LOG) ? fs.readFileSync(APP_LOG, 'utf8') : null);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function goto(page, route) {
  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000); // Blazor Server circuit + ApexCharts mount
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });

    await goto(page, '/verify-tflens-3');

    // ==================== TR-037 — every route reaches the shorthand's series ====================
    const tr037 = await page.evaluate(sel => {
      const read = id => {
        const root = document.querySelector(`[data-testid="${id}"]`);
        if (!root) return null;
        return {
          bars: root.querySelectorAll('.apexcharts-bar-area').length,
          slices: root.querySelectorAll('.apexcharts-pie-area').length,
          labels: [...root.querySelectorAll(sel)].map(t => t.textContent.trim()).filter(Boolean),
        };
      };
      return {
        param: read('tr037-param'), options: read('tr037-options'),
        configurator: read('tr037-configurator'), off: read('tr037-off'), pie: read('tr037-pie'),
      };
    }, LABELS);

    check(`TR-037 ShowDataLabels draws a label per bar @${width}`,
      tr037.param && tr037.param.bars === 3 && tr037.param.labels.length >= 3, JSON.stringify(tr037.param));
    check(`TR-037 Options.DataLabels.Enabled draws labels @${width}`,
      tr037.options && tr037.options.bars === 3 && tr037.options.labels.length >= 3, JSON.stringify(tr037.options));
    check(`TR-037 OptionsConfigurator draws formatted labels @${width}`,
      tr037.configurator && tr037.configurator.labels.length >= 3 && tr037.configurator.labels.every(l => /M$/.test(l)),
      JSON.stringify(tr037.configurator));
    check(`TR-037 a chart that asks for no labels shows none @${width}`,
      tr037.off && tr037.off.bars === 3 && tr037.off.labels.length === 0, JSON.stringify(tr037.off));
    check(`TR-037 a pie shorthand draws its labels @${width}`,
      tr037.pie && tr037.pie.slices === 3 && tr037.pie.labels.length >= 1, JSON.stringify(tr037.pie));

    // ==================== TR-038 — Truncate and Wrap never change a badge's colour ====================
    const tr038 = await page.evaluate(() => {
      const variants = [...document.querySelectorAll('[data-testid$="-default"][data-testid^="tr038-"]')]
        .map(el => el.getAttribute('data-testid').replace(/^tr038-/, '').replace(/-default$/, ''));
      return variants.map(v => {
        const read = mode => {
          const el = document.querySelector(`[data-testid="tr038-${v}-${mode}"]`);
          const cs = getComputedStyle(el);
          return { color: cs.color, overflow: cs.overflow, textOverflow: cs.textOverflow, cls: el.className };
        };
        return { variant: v, def: read('default'), truncate: read('truncate'), wrap: read('wrap') };
      });
    });
    check(`TR-038 the matrix covers every variant @${width}`, tr038.length >= 7, `${tr038.length} variants`);
    for (const row of tr038) {
      check(`TR-038 ${row.variant} keeps its colour under Truncate and Wrap @${width}`,
        row.truncate.color === row.def.color && row.wrap.color === row.def.color && row.def.color !== 'rgb(220, 0, 0)',
        `default ${row.def.color} · truncate ${row.truncate.color} · wrap ${row.wrap.color}`);
      check(`TR-038 ${row.variant} Truncate still truncates @${width}`,
        row.truncate.overflow === 'hidden' && row.truncate.textOverflow === 'ellipsis', row.truncate.textOverflow);
    }
    const outline = tr038.find(r => r.variant === 'Outline');
    check(`TR-038 Outline Truncate carries text-foreground and text-ellipsis @${width}`,
      outline && /\btext-foreground\b/.test(outline.truncate.cls) && /\btext-ellipsis\b/.test(outline.truncate.cls),
      outline && outline.truncate.cls);

    // The merge on the named pairings.
    const cn = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="tr038-cn-"]')]
      .map(li => ({ input: li.getAttribute('data-input'), out: li.textContent.trim().split(/\s+/) })));
    const expectCn = [
      ['text-foreground', 'text-ellipsis'],
      ['text-muted-foreground', 'text-clip'],
      ['text-foreground', 'text-nowrap'],
      ['text-primary-foreground', 'text-balance'],
      ['text-clip'],
      ['text-nowrap'],
      ['text-foreground'],
    ];
    expectCn.forEach((want, i) => {
      const got = cn[i] ? cn[i].out : [];
      check(`TR-038 cn(${cn[i] && cn[i].input}) = ${want.join(' ')} @${width}`,
        got.length === want.length && want.every(w => got.includes(w)), got.join(' '));
    });

    // ==================== Visual truth ====================
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
    }));
    check(`no horizontal overflow @${width}`, overflow.scrollW <= overflow.clientW + 1, JSON.stringify(overflow));
    await page.screenshot({ path: path.join(OUT, `verify-tflens-3-${width}.png`), fullPage: true });
    check(`no console or page errors @${width}`, errors.length === 0, errors.join(' | '));
    await page.close();
  }

  // ==================== TR-036 — leaving a page with an opened popup logs nothing ====================
  const teardown = [
    { route: '/verify-tflens-3', trigger: '[data-testid="tr036-select"] button, button[role="combobox"]' },
    { route: '/components/select', trigger: 'button[role="combobox"]' },
    { route: '/components/dropdown-menu', trigger: 'button[aria-haspopup], button[aria-expanded="false"]' },
    { route: '/components/popover', trigger: 'button[aria-haspopup], button[aria-expanded="false"]' },
  ];
  if (logText() === null) {
    check('TR-036 server log readable', false, `APP_LOG not found: ${APP_LOG}`);
  } else {
    for (const t of teardown) {
      const before = logText().length;
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await goto(page, t.route);
      let opened = false;
      try {
        await page.locator(t.trigger).first().click({ timeout: 5000 });
        await page.waitForTimeout(800);
        opened = (await page.locator('[role="listbox"], [role="menu"], [role="dialog"], [data-state="open"]').count()) > 0;
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      } catch (e) {
        opened = false;
      }
      await page.goto('about:blank'); // a full navigation ends the circuit
      await page.close();
      await sleep(6000);
      const added = logText().slice(before);
      const unhandled = (added.match(/Unhandled exception in circuit/g) || []).length;
      check(`TR-036 ${t.route} opened its popup`, opened, String(opened));
      check(`TR-036 leaving ${t.route} logs no unhandled circuit exception`, unhandled === 0,
        `${unhandled} unhandled; JSDisconnected mentions ${(added.match(/JSDisconnectedException/g) || []).length}`);
    }
  }

  // ==================== Regression: the REQ-UI-020 harness chart ====================
  const reg = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await goto(reg, '/verify-tflens-2');
  const tr028 = await reg.evaluate(sel => {
    const count = (id, s) => document.querySelector(`[data-testid="${id}"]`).querySelectorAll(s).length;
    return {
      styledBars: count('tr028-styled', '.apexcharts-bar-area'),
      styledLabels: count('tr028-styled', sel),
      styledGridlines: count('tr028-styled', '.apexcharts-gridline'),
      defaultBars: count('tr028-default', '.apexcharts-bar-area'),
      defaultLabels: count('tr028-default', sel),
    };
  }, LABELS);
  check('TR-028 regression: the Options chart still has bars, no grid, and now its labels',
    tr028.styledBars === 3 && tr028.styledGridlines === 0 && tr028.styledLabels >= 3, JSON.stringify(tr028));
  check('TR-028 regression: the default chart still has bars and no labels',
    tr028.defaultBars === 3 && tr028.defaultLabels === 0, JSON.stringify(tr028));
  await reg.close();

  await browser.close();
  const failed = results.filter(r => !r.pass).length;
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, results }, null, 2));
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
