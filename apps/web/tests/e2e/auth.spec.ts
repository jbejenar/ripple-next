import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign in and see dashboard', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="submit"]')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible()
  })
})
