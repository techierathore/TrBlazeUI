// Acceptance tests for the rows touched by the TfLens TR-028…TR-035 fix cycle.
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// The measurements mirror tests/verify/ui-tflens-2.spec.js; this file is the runner-visible form.
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const APP_LOG = process.env.APP_LOG || path.join(process.cwd(), 'tests', '.artifacts', 'verify', 'app-5213.log');
const LABELS = '.apexcharts-datalabel, .apexcharts-datalabels text, .apexcharts-pie-label';

async function openHarness(page: Page) {
  await page.goto(`${BASE}/verify-tflens-2`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1800); // Blazor Server circuit + ApexCharts mount
}

test.describe('REQ-UI-020 — TfLens post-2.1.0 consumer-feedback fixes (TR-028…TR-035)', () => {
  test('REQ-UI-020 TR-028 a chart can be steered through Options without dropping the wrapper', async ({ page }) => {
    await openHarness(page);

    const styled = page.locator('[data-testid="tr028-styled"]');
    const def = page.locator('[data-testid="tr028-default"]');

    // The caller asked for no gridlines and no y axis, and got them.
    await expect(styled.locator('.apexcharts-gridline')).toHaveCount(0);
    await expect(styled.locator('.apexcharts-grid-borders line')).toHaveCount(0);
    await expect(styled.locator('.apexcharts-yaxis-label')).toHaveCount(0);
    // …while still being a chart.
    await expect(styled.locator('.apexcharts-bar-area')).toHaveCount(3);

    // A chart passing no Options keeps every wrapper default, so the parameter costs nothing.
    expect(await def.locator('.apexcharts-gridline').count()).toBeGreaterThan(0);
    expect(await def.locator('.apexcharts-yaxis-label').count()).toBeGreaterThan(0);
    await expect(def.locator('.apexcharts-bar-area')).toHaveCount(3);
  });

  test('REQ-UI-020 TR-028 ChartContainer Bare drops the card chrome and the default keeps it', async ({ page }) => {
    await openHarness(page);

    const bare = page.locator('[data-testid="tr028-bare-container"]');
    const card = page.locator('[data-testid="tr028-card-container"]');

    expect(await bare.evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('0px');
    expect(await bare.evaluate(el => getComputedStyle(el).boxShadow)).toBe('none');
    expect(await bare.evaluate(el => getComputedStyle(el).paddingTop)).toBe('0px');

    expect(await card.evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('1px');
    expect(await card.evaluate(el => getComputedStyle(el).boxShadow)).not.toBe('none');
    expect(await card.evaluate(el => getComputedStyle(el).paddingTop)).toBe('24px');
  });

  test('REQ-UI-020 TR-034 a Badge renders a span and can sit inside a sentence', async ({ page }) => {
    await openHarness(page);

    const inline = page.locator('[data-testid="tr034-inline"]');
    expect(await inline.evaluate(el => el.tagName)).toBe('SPAN');
    expect(await inline.evaluate(el => el.closest('p') !== null)).toBe(true);
    expect(await inline.evaluate(el => getComputedStyle(el).display)).toBe('inline-flex');

    // The escape hatch for markup that depended on the old tag.
    expect(await page.locator('[data-testid="tr034-asdiv"]').evaluate(el => el.tagName)).toBe('DIV');
  });

  test('REQ-UI-020 TR-029 a long Badge label wraps, truncates or holds one line as asked', async ({ page }) => {
    await openHarness(page);

    const read = (key: string) =>
      page.locator(`[data-testid="tr029-${key}"]`).evaluate(el => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const lh = parseFloat(cs.lineHeight) || 16;
        return {
          h: Math.round(r.height),
          lines: Math.max(1, Math.round((r.height - 4) / lh)),
          radius: Math.round(parseFloat(cs.borderTopLeftRadius)),
          whiteSpace: cs.whiteSpace,
          textAlign: cs.textAlign,
          overflow: cs.overflow,
        };
      });

    const def = await read('default');
    expect(def.lines).toBe(1);
    expect(def.whiteSpace).toBe('nowrap');

    const wrap = await read('wrap');
    expect(wrap.lines).toBeGreaterThanOrEqual(2);
    expect(wrap.whiteSpace).toBe('normal');
    // The pill radius must not exceed half the box, or the end caps cut into the text.
    expect(wrap.radius).toBeLessThan(wrap.h / 2);
    expect(['start', 'left']).toContain(wrap.textAlign);

    const trunc = await read('truncate');
    expect(trunc.lines).toBe(1);
    expect(trunc.overflow).toBe('hidden');
  });

  test('REQ-UI-020 TR-031 a column header aligns over its figures', async ({ page }) => {
    await openHarness(page);

    const columns = await page.locator('[data-testid="tr031-table"] table').evaluate(t => {
      const ths = [...t.querySelectorAll('thead th')];
      const read = (i: number) => {
        const th = ths[i];
        const box = th.querySelector('div');
        const cell = t.querySelector(`tbody tr td:nth-child(${i + 1})`);
        return {
          justify: box ? getComputedStyle(box).justifyContent : null,
          cellAlign: cell ? getComputedStyle(cell).textAlign : null,
          cellColor: cell ? getComputedStyle(cell).color : null,
        };
      };
      return { model: read(0), input: read(1), output: read(2), cached: read(3) };
    });

    // Align reaches the label's own flex box - text-align on the th never could.
    expect(columns.input.justify).toBe('flex-end');
    expect(columns.input.cellAlign).toBe('right');
    // HeaderClass="text-right" with no Align is still honoured.
    expect(columns.output.justify).toBe('flex-end');
    // Alignment and a cell colour survive together.
    expect(columns.cached.cellAlign).toBe('right');
    expect(columns.cached.cellColor).not.toBe(columns.model.cellColor);
    // An unaligned column is untouched.
    expect(columns.model.justify).toBe('flex-start');
  });

  test('REQ-UI-020 TR-032 a NativeSelect paints its own chevron', async ({ page }) => {
    await openHarness(page);

    const select = page.locator('[data-testid="tr032-select"]');
    expect(await select.evaluate(el => /bg-\[url/.test(el.className))).toBe(true);
    expect(await select.evaluate(el => getComputedStyle(el).backgroundImage)).toMatch(/^url\(/);
    expect(await select.evaluate(el => getComputedStyle(el).backgroundRepeat)).toBe('no-repeat');
    expect(await select.evaluate(el => parseFloat(getComputedStyle(el).paddingRight))).toBeGreaterThanOrEqual(24);
  });

  test('REQ-UI-020 TR-033 a grid filter can live outside the grid and the column chooser is separable', async ({ page }) => {
    await openHarness(page);

    const rows = page.locator('[data-testid="tr033-table"] tbody tr');
    await expect(rows).toHaveCount(3);
    // The grid draws no toolbar of its own here.
    await expect(page.locator('[data-testid="tr033-table"] input[placeholder="Search..."]')).toHaveCount(0);

    // A filter the page owns drives the grid's own filtering.
    await page.locator('[data-testid="tr033-header-filter"]').fill('escaped');
    await page.waitForTimeout(900);
    await expect(rows).toHaveCount(1);

    // The chooser can be dropped without losing the search box.
    const scope = page.locator('[data-testid="tr033-nochooser"]');
    await expect(scope.locator('input[placeholder="Search..."]')).toHaveCount(1);
    await expect(scope.getByRole('button', { name: /Columns/ })).toHaveCount(0);

    // …and the built-in box writes back to the bound field.
    await scope.locator('input[placeholder="Search..."]').fill('spec');
    await page.waitForTimeout(900);
    await expect(page.locator('[data-testid="tr033-echo"]')).toContainText('bound search text: spec');
  });

  test('REQ-UI-020 TR-030 a CollapsibleTrigger Class reaches the button and spans its row', async ({ page }) => {
    await openHarness(page);

    const trigger = page.locator('[data-testid="tr030-trigger"]');
    const cls = await trigger.evaluate(el => el.className);
    expect(cls).toContain('w-full');
    expect(cls).toContain('text-left');

    const geometry = await page.evaluate(() => {
      const box = document.querySelector('[data-testid="tr030-box"]') as HTMLElement;
      const t = document.querySelector('[data-testid="tr030-trigger"]') as HTMLElement;
      const badge = document.querySelector('[data-testid="tr030-badge"]') as HTMLElement;
      const cs = getComputedStyle(box);
      return {
        available: box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
        trigger: t.getBoundingClientRect().width,
        badgeGap: t.getBoundingClientRect().right - badge.getBoundingClientRect().right,
      };
    });
    expect(Math.abs(geometry.trigger - geometry.available)).toBeLessThanOrEqual(1);
    expect(geometry.badgeGap).toBeLessThanOrEqual(2);
  });

  test('REQ-UI-020 TR-037 the chart shorthand draws data labels by every route that asks for them', async ({ page }) => {
    await page.goto(`${BASE}/verify-tflens-3`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    const labels = (id: string) => page.locator(`[data-testid="${id}"]`).locator(LABELS);

    // ShowDataLabels, Options.DataLabels.Enabled and the configurator each reach the built-in series.
    expect(await labels('tr037-param').count()).toBeGreaterThanOrEqual(3);
    expect(await labels('tr037-options').count()).toBeGreaterThanOrEqual(3);
    const formatted = await labels('tr037-configurator').allTextContents();
    expect(formatted.length).toBeGreaterThanOrEqual(3);
    for (const text of formatted) {
      expect(text.trim()).toMatch(/M$/);
    }
    // A sibling chart type takes the flag the same way.
    expect(await labels('tr037-pie').count()).toBeGreaterThanOrEqual(1);
    // Nothing asked for labels here, so there are none - and the bars are still drawn.
    await expect(labels('tr037-off')).toHaveCount(0);
    await expect(page.locator('[data-testid="tr037-off"] .apexcharts-bar-area')).toHaveCount(3);
  });

  test('REQ-UI-020 TR-038 Truncate and Wrap never change a Badge colour', async ({ page }) => {
    await page.goto(`${BASE}/verify-tflens-3`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    const rows = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="tr038-"][data-testid$="-default"]')].map(el => {
        const variant = el.getAttribute('data-testid')!.replace(/^tr038-/, '').replace(/-default$/, '');
        const color = (mode: string) =>
          getComputedStyle(document.querySelector(`[data-testid="tr038-${variant}-${mode}"]`)!).color;
        return { variant, def: color('default'), truncate: color('truncate'), wrap: color('wrap') };
      }));

    expect(rows.length).toBeGreaterThanOrEqual(7);
    for (const row of rows) {
      // The box paints red, so a badge that lost its own colour would read red here.
      expect(row.def, `${row.variant} default`).not.toBe('rgb(220, 0, 0)');
      expect(row.truncate, `${row.variant} truncate`).toBe(row.def);
      expect(row.wrap, `${row.variant} wrap`).toBe(row.def);
    }

    const outline = page.locator('[data-testid="tr038-Outline-truncate"]');
    await expect(outline).toHaveClass(/\btext-foreground\b/);
    await expect(outline).toHaveClass(/\btext-ellipsis\b/);

    // The merge: a non-colour text utility keeps the colour; same-axis pairs still conflict.
    const cn = await page.locator('[data-testid^="tr038-cn-"]').allTextContents();
    expect(cn.map(c => c.trim())).toEqual([
      'text-foreground text-ellipsis',
      'text-muted-foreground text-clip',
      'text-foreground text-nowrap',
      'text-primary-foreground text-balance',
      'text-clip',
      'text-nowrap',
      'text-foreground',
    ]);
  });

  test('REQ-UI-020 the harness renders clean at 1280 and 390 with no sideways scroll', async ({ browser }) => {
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport });
      const errors: string[] = [];
      page.on('pageerror', e => errors.push(String(e)));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

      await openHarness(page);
      await page.goto(`${BASE}/verify-tflens-3`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);

      const overflow = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollW, `no horizontal overflow @${viewport.width}`).toBeLessThanOrEqual(overflow.clientW + 1);
      expect(errors, `no console or page errors @${viewport.width}`).toEqual([]);

      await page.close();
    }
  });
});

test.describe('Rows the fix cycle touched', () => {
  test('REQ-UI-002 NativeSelect and the form components still render and bind', async ({ page }) => {
    await page.goto(`${BASE}/components/native-select`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);

    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    // The chevron that the class merge used to delete.
    expect(await select.evaluate(el => getComputedStyle(el).backgroundImage)).toMatch(/^url\(/);
    // Binding still works.
    const options = await select.locator('option').count();
    expect(options).toBeGreaterThan(1);
  });

  test('REQ-UI-003 the shell composes and the phone menu is --sidebar-width-mobile wide', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    // The phone menu is a Sheet that only mounts once it is opened, so open it before measuring.
    const trigger = page.locator('[data-sidebar="trigger"], button[aria-label*="idebar"], button[aria-label*="enu"]').first();
    await trigger.click();
    await page.waitForTimeout(900);

    const tokens = await page.evaluate(() => {
      const r = getComputedStyle(document.documentElement);
      const sheet = document.querySelector('[data-side]') as HTMLElement | null;
      return {
        mobile: r.getPropertyValue('--sidebar-width-mobile').trim(),
        readers: [...document.querySelectorAll('*')]
          .filter(e => typeof e.className === 'string' && /sidebar-width-mobile/.test(e.className)).length,
        sheetWidth: sheet ? Math.round(sheet.getBoundingClientRect().width) : null,
      };
    });
    expect(tokens.mobile).toBe('18rem');
    // The token is read by something now; it used to be declared and read by nothing.
    expect(tokens.readers).toBeGreaterThanOrEqual(1);
    // 18rem, not the desktop column's 16rem/256px.
    expect(tokens.sheetWidth).toBe(288);
    await page.close();
  });

  test('REQ-UI-005 the DataTable demo still sorts, paginates and selects', async ({ page }) => {
    await page.goto(`${BASE}/components/datatable`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    const tables = page.locator('table');
    expect(await tables.count()).toBeGreaterThan(0);
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0);
    // Header labels are still rendered inside their flex box, now with an alignment on it.
    const headerBox = page.locator('table thead th div').first();
    await expect(headerBox).toBeVisible();
    expect(await headerBox.evaluate(el => getComputedStyle(el).display)).toBe('flex');
  });

  test('REQ-UI-006 display components render and still forward style/id/data-*', async ({ page }) => {
    await page.goto(`${BASE}/components/badge`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);

    const badges = page.locator('span[class*="rounded-full"][class*="inline-flex"]');
    expect(await badges.count()).toBeGreaterThan(0);
    // Splatting is unaffected by the element change.
    await page.goto(`${BASE}/verify-tflens-2`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-testid="tr034-inline"]')).toBeVisible();
  });

  test('REQ-UI-008 each chart type still renders with theme colours', async ({ page }) => {
    for (const route of ['bar', 'line', 'area', 'pie', 'radar', 'radial']) {
      await page.goto(`${BASE}/charts/${route}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1800);
      const svgs = await page.locator('.apexcharts-svg').count();
      expect(svgs, `${route} chart renders`).toBeGreaterThan(0);
    }
  });

  test('REQ-UI-001 TR-036 leaving a page with an opened Select logs no unhandled circuit exception', async ({ browser }) => {
    test.skip(!fs.existsSync(APP_LOG), `server log not readable here (${APP_LOG}); set APP_LOG`);

    for (const route of ['/verify-tflens-3', '/components/select']) {
      const before = fs.readFileSync(APP_LOG, 'utf8').length;
      const page = await browser.newPage();
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(2000);

      await page.locator('button[role="combobox"]').first().click();
      await expect(page.locator('[role="listbox"]').first()).toBeVisible();
      await page.keyboard.press('Escape');

      // A full navigation ends the circuit - the ordinary way a Blazor Server page ends.
      await page.goto('about:blank');
      await page.close();
      await new Promise(r => setTimeout(r, 6000));

      const added = fs.readFileSync(APP_LOG, 'utf8').slice(before);
      expect((added.match(/Unhandled exception in circuit/g) || []).length, `${route} teardown`).toBe(0);
    }
  });

  test('REQ-UI-008 TR-039 leaving a page that holds a chart logs no unobserved task exception', async ({ browser }) => {
    test.skip(!fs.existsSync(APP_LOG), `server log not readable here (${APP_LOG}); set APP_LOG`);
    test.setTimeout(120000);

    for (const route of ['/charts/bar', '/charts/pie', '/verify-tflens-3']) {
      const before = fs.readFileSync(APP_LOG, 'utf8').length;
      const page = await browser.newPage();
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);
      expect(await page.locator('.apexcharts-svg').count(), `${route} draws its charts`).toBeGreaterThan(0);

      await page.goto('about:blank');
      await page.close();
      await new Promise(r => setTimeout(r, 4000));
      // The fault only surfaces when its task is finalized, so force that rather than wait for a GC.
      for (let i = 0; i < 3; i++) {
        await fetch(`${BASE}/verify/gc`, { method: 'POST' });
        await new Promise(r => setTimeout(r, 700));
      }

      const added = fs.readFileSync(APP_LOG, 'utf8').slice(before);
      expect((added.match(/Unobserved task exception/g) || []).length, `${route} teardown`).toBe(0);
      expect((added.match(/Unhandled exception in circuit/g) || []).length, `${route} circuit`).toBe(0);
    }
  });

  test('REQ-UI-002 TR-040 InputGroupInput debounces ValueChanged and still binds', async ({ page }) => {
    await page.goto(`${BASE}/verify-tflens-3`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    const debounced = page.locator('[data-testid="tr040-debounced"]');
    await debounced.pressSequentially('escaped', { delay: 30 });
    // The box itself shows every keystroke at once; only the notification waits.
    await expect(debounced).toHaveValue('escaped');
    const echo = page.locator('[data-testid="tr040-debounced-echo"]');
    await expect(echo).toContainText('value: escaped', { timeout: 5000 });
    // A burst of 7 keystrokes collapses. A loaded server can space two keys past the 600 ms window,
    // so the bound is "fewer than one per key" rather than exactly one.
    const calls = Number((await echo.textContent())!.match(/calls: (\d+)/)![1]);
    expect(calls).toBeGreaterThanOrEqual(1);
    expect(calls).toBeLessThan(7);

    // With no debounce the same group raises one call per keystroke, as before.
    await page.locator('[data-testid="tr040-immediate"]').pressSequentially('abc', { delay: 80 });
    await page.waitForTimeout(600);
    await expect(page.locator('[data-testid="tr040-immediate-echo"]')).toHaveText('calls: 3; value: abc');
  });

  test('REQ-UI-001 the Collapsible primitive still opens, closes and takes a Class', async ({ page }) => {
    await page.goto(`${BASE}/verify-tflens-2`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);

    const trigger = page.locator('[data-testid="tr030-trigger"]');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await page.waitForTimeout(500);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await page.waitForTimeout(500);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
