import { createHmac } from 'node:crypto'
import { Resend } from 'resend'

const ORDS = process.env.ORDS_BASE_URL
const RESET_SECRET = process.env.RESET_SECRET
const APP_URL = 'https://s4assessoria.com.br'

function generateToken(email, timestamp) {
  return createHmac('sha256', RESET_SECRET)
    .update(`${email}:${timestamp}`)
    .digest('base64url')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'invalid' })

  // Always return 200 — never reveal if email exists
  const q = encodeURIComponent(JSON.stringify({ email: email.toLowerCase().trim() }))
  const ordsRes = await fetch(`${ORDS}/s4_users/?q=${q}&limit=1`).catch(() => null)
  if (!ordsRes?.ok) return res.status(200).json({ ok: true })

  const data = await ordsRes.json()
  if (!data.items?.length) return res.status(200).json({ ok: true })

  const user = data.items[0]
  const timestamp = Date.now()
  const token = generateToken(email.toLowerCase().trim(), timestamp)
  const resetUrl = `${APP_URL}/reset-password?email=${encodeURIComponent(email)}&t=${timestamp}&token=${token}`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'S4 Assessoria <contato@s4assessoria.com.br>',
      to: email,
      subject: 'Redefinição de senha — S4 Assessoria',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0D1B2A;color:#e2e8f0;border-radius:12px">
          <div style="margin-bottom:24px">
            <span style="font-size:1.4rem;font-weight:900;color:#fff">S4 Assessoria</span>
            <span style="font-size:.65rem;display:block;color:#8a9bb0;letter-spacing:1px;text-transform:uppercase;margin-top:2px">Gestão e Tecnologia</span>
          </div>
          <h2 style="font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:12px">Olá, ${user.name}</h2>
          <p style="color:#8a9bb0;font-size:.9rem;line-height:1.6;margin-bottom:28px">
            Recebemos uma solicitação para redefinir a senha da sua conta.<br>
            Clique no botão abaixo para criar uma nova senha. O link é válido por <strong style="color:#e2e8f0">1 hora</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:700;font-size:.95rem;padding:14px 28px;border-radius:10px;text-decoration:none">
            Redefinir minha senha
          </a>
          <p style="color:#4a5568;font-size:.78rem;margin-top:28px;line-height:1.6">
            Se você não solicitou a redefinição, ignore este email. Sua senha permanece a mesma.<br>
            Este link expira em 1 hora.
          </p>
        </div>
      `,
    })
  } catch {
    // Log but don't expose error to client
  }

  return res.status(200).json({ ok: true })
}
