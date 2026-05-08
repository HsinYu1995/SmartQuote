import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = path.resolve('tests/.auth/demo-broker.json')

setup('authenticate as demo broker', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })
  await page.goto('/login')
  await page.getByTestId('email-input').fill('alex.johnson@smartquote.com')
  await page.getByTestId('password-input').fill('demo1234')
  await page.getByTestId('login-submit').click()
  await page.waitForURL('/')
  await page.context().storageState({ path: authFile })
})
