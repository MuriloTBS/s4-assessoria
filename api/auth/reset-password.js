import { createHmac, timingSafeEqual } from 'node:crypto'
import { hash as argon2Hash } from '@node-rs/argon2'

const ORDS = process.env.ORDS_BASE_URL
const RESET_SECRET = process.env.RESET_SECRET
const PEPPER = process.env.AUTH_PEPPER
const ONE_HOUR_MS = 60 * 60 * 1000

function verifyToken(email, timestamp, token) {
  const expected = createHmac('sha256', RESET_SECRET)
    .update(`${email}:${timestamp}`)
    .digest('base64url')
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, token, timestamp, password } = req.body
  if (!email || !token || !timestamp || !password) return res.status(400).json({ error: 'invalid' })
  if (password.length < 6 || password.length > 128) return res.status(400).json({ error: 'password_length' })

  // Check token age
  if (Date.now() - Number(timestamp) > ONE_HOUR_MS) return res.status(400).json({ error: 'token_expired' })

  // Verify HMAC
  if (!verifyToken(email.toLowerCase().trim(), timestamp, token)) return res.status(400).json({ error: 'invalid_token' })

  // Find user
  const q = encodeURIComponent(JSON.stringify({ email: email.toLowerCase().trim() }))
  const ordsRes = await fetch(`${ORDS}/s4_users/?q=${q}&limit=1`)
  const data = await ordsRes.json()
  if (!data.items?.length) return res.status(400).json({ error: 'invalid' })

  const user = data.items[0]

  // Hash new password with Argon2 + Pepper
  const newHash = await argon2Hash(password + PEPPER)

  // Update in ORDS
  const putRes = await fetch(`${ORDS}/s4_users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      name: user.name,
      password_hash: newHash,
      logo_url: user.logo_url ?? null,
      created_at: user.created_at,
    }),
  })

  if (!putRes.ok) return res.status(500).json({ error: 'server_error' })

  return res.status(200).json({ ok: true })
}
