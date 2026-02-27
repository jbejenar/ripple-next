import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
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
    ...(!process.env.CI
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
          },
          {
            name: 'mobile',
            use: { ...devices['iPhone 14'] }
          }
        ]
      : [])
  ],
  webServer: {
    command: process.env.CI ? 'node .output/server/index.mjs' : 'nuxi dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
})
