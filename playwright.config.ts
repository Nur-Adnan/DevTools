import { defineConfig, devices } from "@playwright/test"

const isCI = process.env.CI === "true"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry"
  },
  projects: isCI
    ? [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] }
        }
      ]
    : [
        {
          name: "chromium",
          use: { ...devices["Desktop Chrome"] }
        },
        {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] }
        },
        {
          name: "webkit",
          use: { ...devices["Desktop Safari"] }
        }
      ]
})
