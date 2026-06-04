import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2'
import { createHash } from 'node:crypto'

const ORDS = process.env.ORDS_BASE_URL
const PEPPER = process.env.AUTH_PEPPER

function sha256Legacy(password) {
  return createHash('sha256').update(password + 's4assessoria_salt').digest('hex')
}

function isArgon2Hash(h) {
  return h && h.startsWith('$argon2')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'invalid' })

  try {
    const q = encodeURIComponent(JSON.stringify({ email: email.toLowerCase().trim() }))
    const ordsRes = await fetch(`${ORDS}/s4_users/?q=${q}&limit=1`)
    const data = await ordsRes.json()

    if (!data.items?.length) return res.status(401).json({ error: 'invalid' })

    const user = data.items[0]

    if (user.logo_url === 'PENDING') return res.status(403).json({ error: 'PENDING' })

    const storedHash = user.password_hash
    let valid = false

    if (isArgon2Hash(storedHash)) {
      valid = await argon2Verify(storedHash, password + PEPPER)
    } else {
      // Legacy SHA-256 — verify then migrate to Argon2
      valid = storedHash === sha256Legacy(password)
      if (valid) {
        const newHash = await argon2Hash(password + PEPPER)
        await fetch(`${ORDS}/s4_users/${user.id}`, {
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
      }
    }

    if (!valid) return res.status(401).json({ error: 'invalid' })

    return res.status(200).json({ id: user.id, email: user.email, name: user.name })
  } catch {
    return res.status(500).json({ error: 'server_error' })
  }
}
