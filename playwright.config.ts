import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: 'e2e/steps/**/*.ts',
})

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'
const isExternal = baseURL.startsWith('http') && !baseURL.includes('localhost')

export default defineConfig({
  testDir,
  fullyParallel: false,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(isExternal ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  }),
})
