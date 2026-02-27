import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign in via SSO and see dashboard', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('[data-testid="submit"]')).toContainText('Sign in with SSO')
    await page.click('[data-testid="submit"]')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible()
  })
})
