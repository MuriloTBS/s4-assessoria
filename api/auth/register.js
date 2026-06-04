import { hash as argon2Hash } from '@node-rs/argon2'

const ORDS = process.env.ORDS_BASE_URL
const PEPPER = process.env.AUTH_PEPPER

function ts() { return new Date().toISOString() }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'invalid' })
  if (password.length < 6 || password.length > 128) return res.status(400).json({ error: 'password_length' })

  try {
    const passwordHash = await argon2Hash(password + PEPPER)

    const ordsRes = await fetch(`${ORDS}/s4_users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        logo_url: 'PENDING',
        created_at: ts(),
        updated_at: ts(),
      }),
    })

    if (!ordsRes.ok) {
      const err = await ordsRes.json().catch(() => ({}))
      if (JSON.stringify(err).includes('unique') || JSON.stringify(err).includes('ORA-00001')) {
        return res.status(409).json({ error: 'email_taken' })
      }
      return res.status(500).json({ error: 'server_error' })
    }

    const user = await ordsRes.json()
    return res.status(201).json({ id: user.id, email: user.email, name: user.name })
  } catch {
    return res.status(500).json({ error: 'server_error' })
  }
}
