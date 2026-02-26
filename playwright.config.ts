import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'apps/web/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] }
    }
  ],
  webServer: {
    command: process.env.CI
      ? 'node apps/web/.output/server/index.mjs'
      : 'pnpm --filter @ripple/web dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
})
