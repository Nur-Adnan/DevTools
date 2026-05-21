import { test, expect } from "@playwright/test"

test.describe("Ingest Pipeline Integration", () => {
  test("should support complete project log ingestion workflow", async ({ page }) => {
    // 1. Authenticate and open Dashboard
    await page.goto("/dashboard")
    
    // 2. Create a new telemetry tracking project
    await page.click('button:has-text("New Project"), button:has-text("Create Project")')
    await page.fill('input[placeholder="Project Name"], input[name="projectName"]', "E2E Ingestion Test Project")
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")')

    // 3. Extract the generated API Key
    const apiKeyContainer = page.locator("[data-testid='api-key'], code:text('pg_')")
    await expect(apiKeyContainer).toBeVisible()
    const apiKey = (await apiKeyContainer.textContent())?.trim() || ""
    expect(apiKey.startsWith("pg_")).toBe(true)

    // 4. Dispatch a real log telemetry payload using native fetch
    const logMessage = `E2E automated runtime error - ${Date.now()}`
    const fetchResponse = await page.evaluate(async ({ key, msg }) => {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "authorization": `Bearer ${key}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          type: "ERROR",
          message: msg,
          stackTrace: "Error: E2E test\n at main.js:23",
          metadata: { engine: "playwright" }
        })
      })
      return { status: res.status, body: await res.json() }
    }, { key: apiKey, msg: logMessage })

    expect(fetchResponse.status).toBe(200)
    expect(fetchResponse.body).toHaveProperty("id")

    // 5. Confirm the log instantly renders on the dashboard
    await page.goto("/dashboard")
    const logItem = page.locator(`text=${logMessage}`)
    await expect(logItem).toBeVisible({ timeout: 10000 })
  })
})
