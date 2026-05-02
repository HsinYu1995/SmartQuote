import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Quote History', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/quotes')
  })

  test('renders quote history page with table', async ({ page }) => {
    await expect(page.getByTestId('quote-history')).toBeVisible()
    await expect(page.getByTestId('quotes-table')).toBeVisible()
  })

  test('shows filter controls', async ({ page }) => {
    await expect(page.getByTestId('filters')).toBeVisible()
    await expect(page.getByTestId('search-input')).toBeVisible()
    await expect(page.getByTestId('type-filter')).toBeVisible()
    await expect(page.getByTestId('status-filter')).toBeVisible()
  })

  test('search filters results by client name', async ({ page }) => {
    await page.getByTestId('search-input').fill('Maria')
    await page.waitForTimeout(600)
    const rows = page.getByTestId('quotes-table').locator('tbody tr')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('Maria')
    }
  })

  test('type filter narrows results to car only', async ({ page }) => {
    await page.getByTestId('type-filter').selectOption('car')
    await page.waitForTimeout(600)
    const typeBadges = page.getByTestId('quotes-table').getByText('car')
    const otherBadges = page.getByTestId('quotes-table').getByText('house')
    await expect(typeBadges).not.toHaveCount(0)
    await expect(otherBadges).toHaveCount(0)
  })

  test('status filter narrows results', async ({ page }) => {
    await page.getByTestId('status-filter').selectOption('approved')
    await page.waitForTimeout(600)
    const pendingBadges = page.getByTestId('quotes-table').getByText('Pending')
    await expect(pendingBadges).toHaveCount(0)
  })

  test('clear filters resets to all results', async ({ page }) => {
    await page.getByTestId('type-filter').selectOption('car')
    await page.waitForTimeout(300)
    const filteredCount = await page.getByTestId('quotes-table').locator('tbody tr').count()

    await page.getByTestId('clear-filters').click()
    await page.waitForTimeout(600)
    const allCount = await page.getByTestId('quotes-table').locator('tbody tr').count()
    expect(allCount).toBeGreaterThanOrEqual(filteredCount)
  })

  test('clicking view link navigates to quote detail', async ({ page }) => {
    const firstViewLink = page.getByTestId('quotes-table').locator('a').filter({ hasText: 'View' }).first()
    await firstViewLink.click()
    await expect(page.getByTestId('quote-detail')).toBeVisible()
  })

  test('new quote link navigates to quote form', async ({ page }) => {
    await page.getByTestId('new-quote-link').click()
    await expect(page).toHaveURL('/quotes/new')
    await expect(page.getByTestId('new-quote-page')).toBeVisible()
  })

  test('search by reference number works', async ({ page }) => {
    await page.getByTestId('search-input').fill('SQ-2024')
    await page.waitForTimeout(600)
    const rows = page.getByTestId('quotes-table').locator('tbody tr')
    await expect(rows).not.toHaveCount(0)
  })
})
