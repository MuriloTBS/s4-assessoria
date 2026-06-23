import { createBdd } from 'playwright-bdd'
const { When } = createBdd()

When('preencho o formulário com nome {string}, email {string} e senha {string}', async ({ page }, name: string, email: string, password: string) => {
  const uniqueEmail = email.replace('@', `+${Date.now()}@`)
  await page.fill('input[placeholder="Seu nome"]', name)
  await page.fill('input[type="email"]', uniqueEmail)
  await page.fill('input[type="password"]', password)
  await page.getByRole('checkbox').check()
})
