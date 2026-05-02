import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('renders stats grid', async ({ page }) => {
    await expect(page.getByTestId('stats-grid')).toBeVisible()
    // Wait for loading skeleton to resolve
    await page.waitForSelector('[data-testid="stats-grid"] .border-l-4')
    const cards = page.getByTestId('stats-grid').locator('.border-l-4')
    await expect(cards).toHaveCount(4)
  })

  test('shows recent quotes list', async ({ page }) => {
    await expect(page.getByTestId('recent-quotes')).toBeVisible()
    const items = page.getByTestId('recent-quotes').locator('a')
    await expect(items).not.toHaveCount(0)
  })

  test('quick actions navigate to correct quote type', async ({ page }) => {
    await page.getByTestId('quick-action-car').click()
    await expect(page).toHaveURL(/\/quotes\/new\?type=car/)
    await expect(page.getByTestId('type-car')).toHaveClass(/border-blue-500/)
  })

  test('quick action house navigates correctly', async ({ page }) => {
    await page.getByTestId('quick-action-house').click()
    await expect(page).toHaveURL(/\/quotes\/new\?type=house/)
    await expect(page.getByTestId('type-house')).toHaveClass(/border-blue-500/)
  })

  test('quick action health navigates correctly', async ({ page }) => {
    await page.getByTestId('quick-action-health').click()
    await expect(page).toHaveURL(/\/quotes\/new\?type=health/)
    await expect(page.getByTestId('type-health')).toHaveClass(/border-blue-500/)
  })

  test('new quote button navigates to new quote page', async ({ page }) => {
    await page.getByTestId('new-quote-button').click()
    await expect(page).toHaveURL('/quotes/new')
    await expect(page.getByTestId('new-quote-page')).toBeVisible()
  })

  test('clicking recent quote navigates to detail page', async ({ page }) => {
    const firstLink = page.getByTestId('recent-quotes').locator('a').first()
    await firstLink.click()
    await expect(page).toHaveURL(/\/quotes\/q-/)
    await expect(page.getByTestId('quote-detail')).toBeVisible()
  })
})
