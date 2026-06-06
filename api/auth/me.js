import { createHmac } from 'node:crypto'

const SESSION_SECRET = process.env.SESSION_SECRET

function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) return null
  const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('s4_session='))
  return match ? match.slice('s4_session='.length) : null
}

function verifySessionToken(token) {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    const expected = createHmac('sha256', SESSION_SECRET ?? 'dev-secret').update(payload).digest('base64url')
    if (sig !== expected) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    // Expira em 24h
    if (Date.now() - data.iat > 86400 * 1000) return null
    return data
  } catch {
    return null
  }
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const token = parseSessionCookie(req.headers.cookie)
  if (!token) return res.status(401).json({ error: 'unauthenticated' })

  const session = verifySessionToken(token)
  if (!session) return res.status(401).json({ error: 'invalid_session' })

  return res.status(200).json({ id: session.id, email: session.email, name: session.name })
}
