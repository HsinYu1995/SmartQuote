import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Quote Detail', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('shows full detail for an approved car quote', async ({ page }) => {
    await page.goto('/quotes/q-001')
    await expect(page.getByTestId('quote-detail')).toBeVisible()
    await expect(page.getByTestId('quote-ref')).toContainText('SQ-2024-001001')
    await expect(page.getByTestId('detail-monthly')).toBeVisible()
    await expect(page.getByTestId('detail-annual')).toBeVisible()
  })

  test('shows correct client name for q-001', async ({ page }) => {
    await page.goto('/quotes/q-001')
    await expect(page.getByTestId('quote-detail')).toContainText('Maria Garcia')
  })

  test('shows rejection message for rejected quote', async ({ page }) => {
    await page.goto('/quotes/q-004')
    await expect(page.getByTestId('quote-detail')).toBeVisible()
    await expect(page.getByText('Coverage Unavailable')).toBeVisible()
  })

  test('breadcrumb back link navigates to history', async ({ page }) => {
    await page.goto('/quotes/q-001')
    await page.getByRole('link', { name: '← History' }).click()
    await expect(page).toHaveURL('/quotes')
  })

  test('shows 404-like message for unknown quote id', async ({ page }) => {
    await page.goto('/quotes/nonexistent-id')
    await expect(page.getByText('Quote not found')).toBeVisible()
  })

  test('shows premium breakdown bars', async ({ page }) => {
    await page.goto('/quotes/q-001')
    await expect(page.getByTestId('quote-detail')).toBeVisible()
    const breakdown = page.locator('.w-32.h-2')
    await expect(breakdown).not.toHaveCount(0)
  })

  test('shows property details for house quote', async ({ page }) => {
    await page.goto('/quotes/q-002')
    await expect(page.getByTestId('quote-detail')).toBeVisible()
    await expect(page.getByText('Robert Chen')).toBeVisible()
    await expect(page.getByText('1998')).toBeVisible()
  })

  test('shows health details for health quote', async ({ page }) => {
    await page.goto('/quotes/q-003')
    await expect(page.getByTestId('quote-detail')).toBeVisible()
    await expect(page.getByText('Sarah Williams')).toBeVisible()
    await expect(page.getByText('PPO')).toBeVisible()
  })
})
