import { test, expect } from "@playwright/test"

test.describe("Authentication Flows", () => {
  test("should redirect unauthenticated dashboard visits to sign-in page", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL("**/sign-in**")
    expect(page.url()).toContain("/sign-in")
  })

  test("should show an error message when signing in with incorrect credentials", async ({ page }) => {
    await page.goto("/sign-in")
    
    // Fill credentials
    await page.fill('input[type="email"]', "wrong@example.com")
    await page.fill('input[type="password"]', "wrongpassword")
    await page.click('button[type="submit"]')

    // Look for Clerk error text or default alerts
    const errorNotice = page.locator(".cl-errorMessage, [role='alert'], :text('incorrect')")
    await expect(errorNotice).toBeVisible()
  })

  test("should redirect to dashboard on successful registration", async ({ page }) => {
    await page.goto("/sign-up")

    await page.fill('input[name="firstName"]', "John")
    await page.fill('input[name="lastName"]', "Doe")
    await page.fill('input[type="email"]', `user_${Date.now()}@example.com`)
    await page.fill('input[type="password"]', "SecurePass123!")
    await page.click('button[type="submit"]')

    await page.waitForURL("**/dashboard")
    expect(page.url()).toContain("/dashboard")
  })
})
