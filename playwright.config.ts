import { defineConfig, devices } from '@playwright/test'

const base = process.env.NUXT_APP_BASE_URL || '/Agentic-Eval/'
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : 3,
  use: { baseURL: `http://127.0.0.1:4173${base}`, trace: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: `http://127.0.0.1:4173${base}`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
})
