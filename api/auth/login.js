import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2'
import { createHash } from 'node:crypto'

const ORDS = process.env.ORDS_BASE_URL
const PEPPER = process.env.AUTH_PEPPER

// In-memory rate limiter: max 10 attempts per IP per 15 minutes
// Note: per-instance in serverless — provides basic protection, not a substitute for Redis-based limiting
const attempts = new Map()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function isRateLimited(ip) {
  const now = Date.now()
  const record = attempts.get(ip) ?? { count: 0, windowStart: now }
  if (now - record.windowStart > WINDOW_MS) {
    record.count = 0
    record.windowStart = now
  }
  record.count++
  attempts.set(ip, record)
  return record.count > MAX_ATTEMPTS
}

function sha256Legacy(password) {
  return createHash('sha256').update(password + 's4assessoria_salt').digest('hex')
}

function isArgon2Hash(h) {
  return h && h.startsWith('$argon2')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'too_many_attempts' })
  }

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
