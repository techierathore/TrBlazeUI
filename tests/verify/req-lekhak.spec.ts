// Acceptance tests for Lekhak's consumer feedback (docs/Lekhak-TrBlazeUI-Feedback.md, re-checked by
// Lekhak on 2.1.6 on 2026-10-09): REQ-UI-047 (TR-002) the trblazeui-host cascade layer, REQ-FN-012
// (TR-003) the reference's import block beside Fluent UI Blazor, REQ-UI-048 (TR-004) the sidebar width
// tokens through :where(:root), REQ-UI-049 (TR-006) a filled Button that draws no border under host CSS.
//
// Each title starts with the checklist row id, which is how tf-verify-tests.sh maps a test to a row.
// Host CSS is injected into the running demo as a <style> tag, which is what a host's own stylesheet
// is to the cascade. Base URL: BASE_URL, else the demo's default http://localhost:5213.
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';

const BASE = process.env.BASE_URL || 'http://localhost:5213';
const REPO = path.resolve(__dirname, '../..');

async function open(aPage: Page, aRoute: string): Promise<void> {
  await aPage.goto(`${BASE}${aRoute}`, { waitUntil: 'networkidle' });
  await aPage.waitForTimeout(1500);
}

// A host reboot of the kind Lekhak had (Fluent UI's), placed in the documented host layer.
const HOST_LAYER_CSS = `
@layer trblazeui-host {
  h2[data-testid="host-probe"] { font-size: 41px; }
  button { border: 1px solid rgb(255, 0, 0); border-radius: 0; }
}`;

async function borderOf(aPage: Page, aName: string) {
  return aPage.getByRole('button', { name: aName, exact: true }).first().evaluate(aButton => {
    const vStyle = getComputedStyle(aButton);
    return { width: vStyle.borderTopWidth, color: vStyle.borderTopColor, radius: vStyle.borderTopLeftRadius };
  });
}

test.describe('Lekhak feedback — host CSS, imports, tokens and Button borders', () => {
  test('REQ-UI-047 trblazeui-layers.css gives host CSS a layer that beats Preflight and loses to the components', async ({ page, request }) => {
    // The order file ships, and its order is the shipped stylesheet's own with trblazeui-host after base.
    const vLayers = await (await request.get(`${BASE}/_content/TrBlazeUI.Components/trblazeui-layers.css`)).text();
    const vDeclared = /@layer\s+([a-z\-,\s]+);/.exec(vLayers)?.[1].split(',').map(aName => aName.trim()) ?? [];
    expect(vDeclared, 'the order file declares the host slot between base and components')
      .toEqual(['properties', 'theme', 'base', 'trblazeui-host', 'components', 'utilities']);

    const vBundle = await (await request.get(`${BASE}/_content/TrBlazeUI.Components/trblazeui.css`)).text();
    const vShipped: string[] = [];
    for (const vMatch of vBundle.matchAll(/@layer\s+([a-z\-]+)/g)) {
      if (!vShipped.includes(vMatch[1])) vShipped.push(vMatch[1]);
    }
    expect(vShipped, 'the layer names are public: a Tailwind upgrade that renames one fails here')
      .toEqual(vDeclared.filter(aName => aName !== 'trblazeui-host'));

    // In the running page, host CSS in the slot beats Preflight and loses to the components.
    await open(page, '/components/button');
    await page.addStyleTag({ content: HOST_LAYER_CSS });
    await page.evaluate(() => {
      const vProbe = document.createElement('h2');
      vProbe.dataset.testid = 'host-probe';
      vProbe.textContent = 'Host heading';
      document.body.appendChild(vProbe);
    });
    const vHeading = await page.locator('[data-testid="host-probe"]').evaluate(aNode => getComputedStyle(aNode).fontSize);
    expect(vHeading, 'the host heading keeps its size against Preflight').toBe('41px');
    const vDefault = await borderOf(page, 'Default');
    expect(vDefault.radius, 'the Button keeps its own radius against the host').not.toBe('0px');
  });

  test('REQ-FN-012 the reference import block compiles beside Fluent UI Blazor with the documented aliases', async () => {
    test.setTimeout(600_000);
    const vReference = fs.readFileSync(path.join(REPO, 'docs/TrBlazeUI-AI-Reference.md'), 'utf8');
    const vImportsAt = vReference.indexOf('### _Imports.razor');
    const vBlock = /```razor\n([\s\S]*?)```/.exec(vReference.slice(vImportsAt))?.[1] ?? '';
    expect(vBlock, 'the import block is found').toContain('@using TrBlazeUI.Components.Button');
    expect(vBlock, 'ApexCharts is chart-page only').not.toContain('@using ApexCharts');
    const vCoexistAt = vReference.indexOf('### Beside another component library');
    expect(vCoexistAt, 'the reference has the coexistence section').toBeGreaterThan(vImportsAt);
    const vAliases = /```razor\n([\s\S]*?)```/.exec(vReference.slice(vCoexistAt))?.[1] ?? '';
    expect(vAliases).toContain('@using TrToastService = TrBlazeUI.Components.Toast.ToastService');

    // Build a throwaway Razor library holding the block, Fluent UI's imports and the aliases, and a
    // page that uses the three shared names on both sides.
    const vBin = ['Debug', 'Release']
      .map(aConfig => path.join(REPO, `src/TrBlazeUI.Components/bin/${aConfig}/net10.0`))
      .filter(aDir => fs.existsSync(path.join(aDir, 'TrBlazeUI.Components.dll')))
      .sort((aLeft, aRight) => fs.statSync(path.join(aRight, 'TrBlazeUI.Components.dll')).mtimeMs
        - fs.statSync(path.join(aLeft, 'TrBlazeUI.Components.dll')).mtimeMs)[0];
    expect(vBin, 'a built TrBlazeUI.Components is on disk').toBeTruthy();
    const vDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trblazeui-coexist-'));
    const vRefs = ['TrBlazeUI.Components', 'TrBlazeUI.Primitives', 'TrBlazeUI.Icons.Lucide']
      .map(aName => `<Reference Include="${aName}"><HintPath>${path.join(vBin, aName + '.dll')}</HintPath></Reference>`).join('');
    fs.writeFileSync(path.join(vDir, 'Coexist.csproj'), `<Project Sdk="Microsoft.NET.Sdk.Razor">
  <PropertyGroup><TargetFramework>net10.0</TargetFramework><Nullable>enable</Nullable>
    <TreatWarningsAsErrors>false</TreatWarningsAsErrors></PropertyGroup>
  <ItemGroup><SupportedPlatform Include="browser" />
    <PackageReference Include="Microsoft.FluentUI.AspNetCore.Components" Version="4.14.4" />
    <PackageReference Include="Blazor-ApexCharts" Version="6.1.0" />${vRefs}</ItemGroup>
</Project>`);
    fs.writeFileSync(path.join(vDir, '_Imports.razor'),
      `@using Microsoft.AspNetCore.Components.Web\n@using Microsoft.FluentUI.AspNetCore.Components\n${vBlock}\n${vAliases}`);
    fs.writeFileSync(path.join(vDir, 'Page.razor'), `@inject TrToastService Toasts
<FluentButton Appearance="Appearance.Accent" Type="Microsoft.FluentUI.AspNetCore.Components.ButtonType.Button">Fluent</FluentButton>
<Button Type="TrButtonType.Submit" OnClick="@(() => Toasts.Success(\"Saved\"))">Save</Button>
<ToastProvider Position="TrToastPosition.BottomRight" />
`);
    const vDotnet = fs.existsSync(path.join(os.homedir(), '.dotnet/dotnet')) ? path.join(os.homedir(), '.dotnet/dotnet') : 'dotnet';
    let vOutput = '';
    let vPassed = true;
    try {
      vOutput = execFileSync(vDotnet, ['build', vDir, '-nologo', '-v:q'], { encoding: 'utf8', stdio: 'pipe' });
    } catch (aError: any) {
      vPassed = false;
      vOutput = `${aError.stdout ?? ''}${aError.stderr ?? ''}`;
    }
    fs.rmSync(vDir, { recursive: true, force: true });
    expect(vOutput, 'no ambiguous name').not.toContain('CS0104');
    expect(vPassed, `the block builds beside Fluent UI:\n${vOutput.slice(-2000)}`).toBe(true);
  });

  test('REQ-UI-048 a host value for the sidebar width tokens wins over the library declaration', async ({ page }) => {
    await open(page, '/components/button');
    // Same layer as the library, lower specificity than :root: only a :where(:root) declaration loses.
    await page.addStyleTag({ content: '@layer base { html { --sidebar-width: 20rem; --sidebar-width-mobile: 21rem; --sidebar-width-icon: 4rem; } }' });
    const vTokens = await page.evaluate(() => {
      const vStyle = getComputedStyle(document.documentElement);
      return ['--sidebar-width', '--sidebar-width-mobile', '--sidebar-width-icon'].map(aName => vStyle.getPropertyValue(aName).trim());
    });
    expect(vTokens, 'all three host values win').toEqual(['20rem', '21rem', '4rem']);
  });

  test('REQ-UI-049 filled Buttons draw no border under a host button rule, and Outline keeps its own', async ({ page }) => {
    await open(page, '/components/button');
    await page.addStyleTag({ content: HOST_LAYER_CSS });
    for (const vName of ['Default', 'Secondary', 'Destructive', 'Ghost']) {
      const vBorder = await borderOf(page, vName);
      expect(vBorder.width, `${vName} draws no border`).toBe('0px');
    }
    const vOutline = await borderOf(page, 'Outline');
    expect(vOutline.width, 'Outline keeps its 1px border').toBe('1px');
    expect(vOutline.color, 'in its own colour, not the host red').not.toBe('rgb(255, 0, 0)');
  });
});
