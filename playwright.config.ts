import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/verify',
  // tests/verify/ holds two kinds of file. The *.spec.ts files are @playwright/test specs the
  // runner owns. The *.spec.js files are standalone plain-Playwright scripts, each run directly
  // with `SMOKE_URL=… node tests/verify/<name>.spec.js`; they self-execute on import, so leaving
  // them in the default testMatch made the runner launch them at collection time and abort the
  // whole run on the first one whose SMOKE_URL was unset. Only .ts is collected.
  testMatch: '**/*.spec.ts',
  outputDir: './tests/.artifacts/test-results',
  reporter: 'line',
  use: { baseURL: process.env.BASE_URL, headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
