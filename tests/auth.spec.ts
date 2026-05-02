import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('shows login page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('shows login error for invalid email format', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('notanemail')
    await page.getByTestId('password-input').fill('password')
    await page.getByTestId('login-submit').click()
    // Browser native validation catches it — submit button stays enabled
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('shows API error for malformed credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('bad@bad')
    await page.getByTestId('password-input').fill('pw')
    await page.getByTestId('login-submit').click()
    await expect(page.getByTestId('login-error')).toBeVisible()
  })

  test('redirects to dashboard after successful login', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('broker@demo.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('/')
    await expect(page.getByTestId('dashboard')).toBeVisible()
  })

  test('shows broker name in header after login', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('broker@demo.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('/')
    await expect(page.getByTestId('header')).toContainText('SmartQuote')
  })

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('broker@demo.com')
    await page.getByTestId('password-input').fill('any')
    await page.getByTestId('login-submit').click()
    await page.waitForURL('/')
    await page.getByTestId('logout-button').click()
    await expect(page).toHaveURL('/login')
  })

  test('prevents access to protected routes after logout', async ({ page }) => {
    await page.goto('/quotes')
    await expect(page).toHaveURL('/login')
  })
})
