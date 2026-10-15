import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5178',
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5178 --strictPort',
    port: 5178,
    reuseExistingServer: !process.env.CI,
  },
  reporter: 'list',
})
