import { test, expect } from '@playwright/test'
import { fillClientForm } from './helpers'

async function fillHealthForm(page: import('@playwright/test').Page) {
  await page.getByTestId('plan-type').selectOption('PPO')
  await page.getByTestId('coverage-type').selectOption('individual')
  await page.getByTestId('client-age').fill('32')
  await page.getByTestId('smoking-status').selectOption('never')
  await page.getByTestId('bmi').fill('23.5')
  await page.getByTestId('desired-deductible').fill('1500')
  await page.getByTestId('prescription-count').fill('1')
}

test.describe('Health Insurance Quote', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotes/new?type=health')
  })

  test('renders health insurance form when type=health', async ({ page }) => {
    await expect(page.getByTestId('health-insurance-form')).toBeVisible()
    await expect(page.getByTestId('type-health')).toHaveClass(/border-blue-500/)
  })

  test('shows validation errors on empty submission', async ({ page }) => {
    await page.getByTestId('submit-quote').click()
    await expect(page.getByText('First name is required')).toBeVisible()
  })

  test('generates a health insurance quote successfully', async ({ page }) => {
    await fillClientForm(page)
    await fillHealthForm(page)

    await page.getByTestId('submit-quote').click()
    await expect(page.getByTestId('quote-result')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('reference-number')).toContainText('SQ-')
    await expect(page.getByTestId('monthly-premium')).toBeVisible()
  })

  test('PPO plan costs more than HDHP', async ({ page }) => {
    const getPremium = async (planType: string) => {
      await page.goto('/quotes/new?type=health')
      await fillClientForm(page)
      await page.getByTestId('plan-type').selectOption(planType)
      await page.getByTestId('coverage-type').selectOption('individual')
      await page.getByTestId('client-age').fill('35')
      await page.getByTestId('smoking-status').selectOption('never')
      await page.getByTestId('bmi').fill('22')
      await page.getByTestId('desired-deductible').fill('2000')
      await page.getByTestId('prescription-count').fill('0')
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('monthly-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const ppoPremium = await getPremium('PPO')
    const hdhpPremium = await getPremium('HDHP')
    expect(ppoPremium).toBeGreaterThan(hdhpPremium)
  })

  test('family coverage costs more than individual', async ({ page }) => {
    const getPremium = async (coverageType: string) => {
      await page.goto('/quotes/new?type=health')
      await fillClientForm(page)
      await page.getByTestId('plan-type').selectOption('PPO')
      await page.getByTestId('coverage-type').selectOption(coverageType)
      await page.getByTestId('client-age').fill('35')
      await page.getByTestId('smoking-status').selectOption('never')
      await page.getByTestId('bmi').fill('22')
      await page.getByTestId('desired-deductible').fill('1000')
      await page.getByTestId('prescription-count').fill('0')
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('monthly-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const individual = await getPremium('individual')
    const family = await getPremium('family')
    expect(family).toBeGreaterThan(individual)
  })

  test('smoking surcharge increases premium', async ({ page }) => {
    const getPremium = async (smokingStatus: string) => {
      await page.goto('/quotes/new?type=health')
      await fillClientForm(page)
      await fillHealthForm(page)
      await page.getByTestId('smoking-status').selectOption(smokingStatus)
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('monthly-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const nonSmoker = await getPremium('never')
    const smoker = await getPremium('current')
    expect(smoker).toBeGreaterThan(nonSmoker)
  })

  test('dental and vision add-ons increase premium', async ({ page }) => {
    const getPremium = async (addons: boolean) => {
      await page.goto('/quotes/new?type=health')
      await fillClientForm(page)
      await fillHealthForm(page)
      if (addons) {
        await page.getByTestId('needs-dental').check()
        await page.getByTestId('needs-vision').check()
      }
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('monthly-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const withoutAddons = await getPremium(false)
    const withAddons = await getPremium(true)
    expect(withAddons).toBeGreaterThan(withoutAddons)
  })

  test('pre-existing conditions can be selected', async ({ page }) => {
    await expect(page.getByTestId('pre-existing-conditions')).toBeVisible()
    await page.getByTestId('condition-diabetes').check()
    await page.getByTestId('condition-hypertension').check()
    await expect(page.getByTestId('condition-diabetes')).toBeChecked()
    await expect(page.getByTestId('condition-hypertension')).toBeChecked()
  })

  test('premium breakdown is shown in result', async ({ page }) => {
    await fillClientForm(page)
    await fillHealthForm(page)
    await page.getByTestId('needs-dental').check()
    await page.getByTestId('needs-vision').check()
    await page.getByTestId('submit-quote').click()
    await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
    const breakdown = page.getByTestId('premium-breakdown')
    await expect(breakdown).toBeVisible()
    await expect(breakdown.locator('div.flex')).not.toHaveCount(0)
  })
})
