import { test, expect } from '@playwright/test'
import { fillClientForm } from './helpers'

async function fillHouseForm(page: import('@playwright/test').Page) {
  await page.getByTestId('property-address').fill('456 Oak Avenue')
  await page.getByTestId('property-city').fill('Seattle')
  await page.getByTestId('property-state').selectOption('WA')
  await page.getByTestId('property-zip').fill('98101')
  await page.getByTestId('year-built').fill('1998')
  await page.getByTestId('square-footage').fill('2400')
  await page.getByTestId('construction-type').selectOption('brick')
  await page.getByTestId('roof-type').selectOption('asphalt')
  await page.getByTestId('roof-age').fill('8')
  await page.getByTestId('occupancy').selectOption('owner')
  await page.getByTestId('estimated-value').fill('650000')
  await page.getByTestId('desired-coverage').fill('600000')
}

test.describe('House Insurance Quote', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes/new?type=house')
  })

  test('renders house insurance form when type=house', async ({ page }) => {
    await expect(page.getByTestId('house-insurance-form')).toBeVisible()
    await expect(page.getByTestId('type-house')).toHaveClass(/border-blue-500/)
  })

  test('shows validation error for missing required fields', async ({ page }) => {
    await page.getByTestId('submit-quote').click()
    await expect(page.getByText('First name is required')).toBeVisible()
  })

  test('generates a house insurance quote with valid inputs', async ({ page }) => {
    await fillClientForm(page)
    await fillHouseForm(page)

    await page.getByTestId('submit-quote').click()
    await expect(page.getByTestId('quote-result')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('reference-number')).toContainText('SQ-')
    await expect(page.getByTestId('monthly-premium')).toBeVisible()
    await expect(page.getByTestId('annual-premium')).toBeVisible()
  })

  test('security system discount lowers premium', async ({ page }) => {
    const getPremium = async (hasSecurity: boolean) => {
      await page.goto('/quotes/new?type=house')
      await fillClientForm(page)
      await fillHouseForm(page)
      if (hasSecurity) await page.getByTestId('has-security').check()
      else await page.getByTestId('has-security').uncheck()
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('monthly-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const withSecurity = await getPremium(true)
    const withoutSecurity = await getPremium(false)
    expect(withoutSecurity).toBeGreaterThan(withSecurity)
  })

  test('pool surcharge increases premium', async ({ page }) => {
    const getPremium = async (hasPool: boolean) => {
      await page.goto('/quotes/new?type=house')
      await fillClientForm(page)
      await fillHouseForm(page)
      if (hasPool) await page.getByTestId('has-pool').check()
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('monthly-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const withPool = await getPremium(true)
    const withoutPool = await getPremium(false)
    expect(withPool).toBeGreaterThan(withoutPool)
  })

  test('higher coverage amount produces higher premium', async ({ page }) => {
    const getPremium = async (coverage: string) => {
      await page.goto('/quotes/new?type=house')
      await fillClientForm(page)
      await fillHouseForm(page)
      await page.getByTestId('desired-coverage').fill(coverage)
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('annual-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const lowCoverage = await getPremium('300000')
    const highCoverage = await getPremium('800000')
    expect(highCoverage).toBeGreaterThan(lowCoverage)
  })

  test('view full details link navigates to quote detail', async ({ page }) => {
    await fillClientForm(page)
    await fillHouseForm(page)
    await page.getByTestId('submit-quote').click()
    await page.getByTestId('quote-result').waitFor({ timeout: 10000 })

    await page.getByRole('link', { name: 'View Full Details' }).click()
    await expect(page.getByTestId('quote-detail')).toBeVisible()
    await expect(page.getByTestId('quote-ref')).toContainText('SQ-')
  })
})
