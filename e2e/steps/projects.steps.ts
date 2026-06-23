import { createBdd } from 'playwright-bdd'
const { When, Then } = createBdd()
import { expect } from '@playwright/test'

When('acesso a página de projetos', async ({ page }) => {
  await page.goto('/projects')
})

When('acesso a página do admin', async ({ page }) => {
  await page.goto('/admin')
})

Then('vejo o botão {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('button', { name: text })).toBeVisible()
})

Then('vejo o formulário de criação de projeto', async ({ page }) => {
  await expect(page.getByText('Novo Projeto', { exact: false })).toBeVisible()
})

Then('vejo o título {string}', async ({ page }, title: string) => {
  await expect(page.getByText(title, { exact: false })).toBeVisible()
})
