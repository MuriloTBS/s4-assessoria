import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2'
import { createHash } from 'node:crypto'
import { createHmac } from 'node:crypto'

const ORDS = process.env.ORDS_BASE_URL
const PEPPER = process.env.AUTH_PEPPER
const SESSION_SECRET = process.env.SESSION_SECRET
const WINDOW_SECS = 15 * 60
const MAX_ATTEMPTS = 10

// Rate limiting com Vercel KV (com fallback em memória para desenvolvimento)
const memFallback = new Map()

async function isRateLimited(ip) {
  const key = `rl:login:${ip}`
  try {
    const { kv } = await import('@vercel/kv')
    const count = await kv.incr(key)
    if (count === 1) await kv.expire(key, WINDOW_SECS)
    return count > MAX_ATTEMPTS
  } catch {
    // KV não configurado — fallback em memória (por instância serverless)
    const now = Date.now()
    const rec = memFallback.get(ip) ?? { count: 0, windowStart: now }
    if (now - rec.windowStart > WINDOW_SECS * 1000) { rec.count = 0; rec.windowStart = now }
    rec.count++
    memFallback.set(ip, rec)
    return rec.count > MAX_ATTEMPTS
  }
}

function sha256Legacy(password) {
  return createHash('sha256').update(password + 's4assessoria_salt').digest('hex')
}

function isArgon2Hash(h) {
  return h && h.startsWith('$argon2')
}

function createSessionToken(id, email, name) {
  const payload = Buffer.from(JSON.stringify({ id, email, name, iat: Date.now() })).toString('base64url')
  const sig = createHmac('sha256', SESSION_SECRET ?? 'dev-secret').update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? 'unknown'
  if (await isRateLimited(ip)) {
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

    const isPending = (user.account_status ?? (user.logo_url === 'PENDING' ? 'PENDING' : 'active')) === 'PENDING'
    if (isPending) return res.status(403).json({ error: 'PENDING' })

    const storedHash = user.password_hash
    let valid = false

    if (isArgon2Hash(storedHash)) {
      valid = await argon2Verify(storedHash, password + PEPPER)
    } else {
      // Legacy SHA-256 — verifica e migra para Argon2
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

    const token = createSessionToken(user.id, user.email, user.name)
    const cookieOptions = [
      `s4_session=${token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      'Max-Age=86400',
      'Path=/',
    ].join('; ')

    res.setHeader('Set-Cookie', cookieOptions)
    return res.status(200).json({ id: user.id, email: user.email, name: user.name })
  } catch {
    return res.status(500).json({ error: 'server_error' })
  }
}
