import { createBdd } from 'playwright-bdd'
const { Given, When, Then } = createBdd()
import { expect } from '@playwright/test'

Given('estou na página de login', async ({ page }) => {
  await page.goto('/login')
})

Given('estou autenticado no sistema', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'smnogueira@proton.me')
  await page.fill('input[type="password"]', 'Sm711669!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

Given('estou autenticado como administrador', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'smnogueira@proton.me')
  await page.fill('input[type="password"]', 'Sm711669!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
})

When('preencho o email {string} e senha {string}', async ({ page }, email: string, password: string) => {
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
})

When('clico em Entrar', async ({ page }) => {
  await page.click('button[type="submit"]')
})

When('clico em {string}', async ({ page }, text: string) => {
  await page.getByText(text).first().click()
})

Then('vejo a mensagem {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false })).toBeVisible({ timeout: 5000 })
})

Then('vejo o campo {string}', async ({ page }, label: string) => {
  await expect(page.getByText(label, { exact: false })).toBeVisible()
})
