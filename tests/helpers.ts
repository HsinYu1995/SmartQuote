import type { Page } from '@playwright/test'

export async function login(page: Page, email = 'broker@demo.com', password = 'password123') {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(email)
  await page.getByTestId('password-input').fill(password)
  await page.getByTestId('login-submit').click()
  await page.waitForURL('/')
}

export async function fillClientForm(page: Page) {
  await page.getByTestId('client-firstName').fill('John')
  await page.getByTestId('client-lastName').fill('Doe')
  await page.getByTestId('client-dob').fill('1990-06-15')
  await page.getByTestId('client-email').fill('john.doe@example.com')
  await page.getByTestId('client-phone').fill('5551234567')
  await page.getByTestId('client-address').fill('123 Test Street')
  await page.getByTestId('client-city').fill('Austin')
  await page.getByTestId('client-state').selectOption('TX')
  await page.getByTestId('client-zip').fill('78701')
}
