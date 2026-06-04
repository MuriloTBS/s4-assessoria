import { When, Then } from 'playwright-bdd'
import { expect } from '@playwright/test'

When('preencho o formulário com nome {string}, email {string} e senha {string}', async ({ page }, name: string, email: string, password: string) => {
  await page.fill('input[placeholder="Seu nome"]', name)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
})

Then('vejo a mensagem {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false })).toBeVisible({ timeout: 8000 })
})
