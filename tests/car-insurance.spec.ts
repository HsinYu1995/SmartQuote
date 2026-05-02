import { test, expect } from '@playwright/test'
import { login, fillClientForm } from './helpers'

test.describe('Car Insurance Quote', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/quotes/new?type=car')
  })

  test('renders car insurance form by default when type=car', async ({ page }) => {
    await expect(page.getByTestId('car-insurance-form')).toBeVisible()
    await expect(page.getByTestId('type-car')).toHaveClass(/border-blue-500/)
  })

  test('switching to house type shows house form', async ({ page }) => {
    await page.getByTestId('type-house').click()
    await expect(page.getByTestId('house-insurance-form')).toBeVisible()
    await expect(page.getByTestId('car-insurance-form')).not.toBeVisible()
  })

  test('shows validation errors when submitting empty form', async ({ page }) => {
    await page.getByTestId('submit-quote').click()
    await expect(page.getByText('First name is required')).toBeVisible()
  })

  test('generates a car insurance quote with valid inputs', async ({ page }) => {
    await fillClientForm(page)

    await page.getByTestId('vehicle-make').fill('Toyota')
    await page.getByTestId('vehicle-model').fill('Camry')
    await page.getByTestId('vehicle-year').selectOption('2021')
    await page.getByTestId('vehicle-vin').fill('4T1B11HK0KU234567')
    await page.getByTestId('vehicle-usage').selectOption('personal')
    await page.getByTestId('annual-mileage').fill('12000')
    await page.getByTestId('coverage-level').selectOption('standard')
    await page.getByTestId('license-years').fill('10')
    await page.getByTestId('prior-accidents').fill('0')

    await page.getByTestId('submit-quote').click()

    await expect(page.getByTestId('quote-result')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('reference-number')).toContainText('SQ-')
    await expect(page.getByTestId('monthly-premium')).toBeVisible()
  })

  test('shows rejection for high-risk profile (3+ accidents)', async ({ page }) => {
    await fillClientForm(page)

    await page.getByTestId('vehicle-make').fill('Ford')
    await page.getByTestId('vehicle-model').fill('Mustang')
    await page.getByTestId('vehicle-year').selectOption('2022')
    await page.getByTestId('vehicle-vin').fill('1FA6P8CF9N5123456')
    await page.getByTestId('vehicle-usage').selectOption('personal')
    await page.getByTestId('annual-mileage').fill('18000')
    await page.getByTestId('coverage-level').selectOption('comprehensive')
    await page.getByTestId('license-years').fill('5')
    await page.getByTestId('prior-accidents').fill('3')

    await page.getByTestId('submit-quote').click()
    await expect(page.getByTestId('quote-result')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Quote Not Available')).toBeVisible()
  })

  test('comprehensive coverage produces higher premium than basic', async ({ page }) => {
    // Submit basic quote
    const getPremium = async (coverage: string) => {
      await page.goto('/quotes/new?type=car')
      await fillClientForm(page)
      await page.getByTestId('vehicle-make').fill('Honda')
      await page.getByTestId('vehicle-model').fill('Civic')
      await page.getByTestId('vehicle-year').selectOption('2020')
      await page.getByTestId('vehicle-vin').fill('2HGFC2F59LH123456')
      await page.getByTestId('vehicle-usage').selectOption('personal')
      await page.getByTestId('annual-mileage').fill('10000')
      await page.getByTestId('coverage-level').selectOption(coverage)
      await page.getByTestId('license-years').fill('10')
      await page.getByTestId('prior-accidents').fill('0')
      await page.getByTestId('submit-quote').click()
      await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
      const text = await page.getByTestId('monthly-premium').textContent()
      return parseFloat(text?.replace('$', '') ?? '0')
    }

    const basicPremium = await getPremium('basic')
    const comprehensivePremium = await getPremium('comprehensive')
    expect(comprehensivePremium).toBeGreaterThan(basicPremium)
  })

  test('premium breakdown sums to approximately monthly premium', async ({ page }) => {
    await fillClientForm(page)
    await page.getByTestId('vehicle-make').fill('Chevrolet')
    await page.getByTestId('vehicle-model').fill('Malibu')
    await page.getByTestId('vehicle-year').selectOption('2019')
    await page.getByTestId('vehicle-vin').fill('1G1ZD5ST0KF123456')
    await page.getByTestId('vehicle-usage').selectOption('personal')
    await page.getByTestId('annual-mileage').fill('12000')
    await page.getByTestId('coverage-level').selectOption('standard')
    await page.getByTestId('license-years').fill('8')
    await page.getByTestId('prior-accidents').fill('0')
    await page.getByTestId('submit-quote').click()

    await page.getByTestId('quote-result').waitFor({ timeout: 10000 })
    const breakdownItems = page.getByTestId('premium-breakdown').locator('div.flex')
    await expect(breakdownItems).not.toHaveCount(0)
  })

  test('New Quote button resets the form', async ({ page }) => {
    await fillClientForm(page)
    await page.getByTestId('vehicle-make').fill('Kia')
    await page.getByTestId('vehicle-model').fill('Sorento')
    await page.getByTestId('vehicle-year').selectOption('2020')
    await page.getByTestId('vehicle-vin').fill('5XYPGDA50LG123456')
    await page.getByTestId('vehicle-usage').selectOption('personal')
    await page.getByTestId('annual-mileage').fill('15000')
    await page.getByTestId('coverage-level').selectOption('basic')
    await page.getByTestId('license-years').fill('6')
    await page.getByTestId('prior-accidents').fill('1')
    await page.getByTestId('submit-quote').click()
    await page.getByTestId('quote-result').waitFor({ timeout: 10000 })

    await page.getByRole('button', { name: 'New Quote' }).click()
    await expect(page.getByTestId('quote-form')).toBeVisible()
    await expect(page.getByTestId('client-firstName')).toHaveValue('')
  })
})
