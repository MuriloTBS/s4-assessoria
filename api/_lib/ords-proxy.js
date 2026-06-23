import { createHmac } from 'node:crypto'

const ORDS = process.env.ORDS_BASE_URL
const CLIENT_ID = process.env.ORDS_CLIENT_ID
const CLIENT_SECRET = process.env.ORDS_CLIENT_SECRET
const INTERNAL_KEY = process.env.INTERNAL_API_KEY
const SESSION_SECRET = process.env.SESSION_SECRET

const TOKEN_URL = ORDS ? ORDS.replace(/\/ords\/[^/]+.*$/, '/ords/oauth/token') : null

let _token = null
let _tokenExpiry = 0

export async function getOrdsToken() {
  if (_token && Date.now() < _tokenExpiry) return _token
  if (!TOKEN_URL || !CLIENT_ID || !CLIENT_SECRET) return null

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) return null
    const data = await res.json()
    _token = data.access_token
    _tokenExpiry = Date.now() + Math.max(0, (data.expires_in - 60) * 1000)
    return _token
  } catch {
    return null
  }
}

// Validates a user session cookie — same logic as api/auth/me.js
function verifySessionCookie(cookieHeader) {
  if (!cookieHeader || !SESSION_SECRET) return false
  const match = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('s4_session='))
  if (!match) return false
  const [payload, sig] = match.slice('s4_session='.length).split('.')
  if (!payload || !sig) return false
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  if (sig !== expected) return false
  try {
    const { iat } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return Date.now() - iat < 86400 * 1000
  } catch {
    return false
  }
}

// Accepts:
// - Valid s4_session cookie   → user requests from the browser (no key in bundle)
// - x-s4-internal-key header → service calls (health check, cron) — server-side only
export function validateRequest(req) {
  const serviceKey = req.headers['x-s4-internal-key']
  if (serviceKey && serviceKey === INTERNAL_KEY) return true
  return verifySessionCookie(req.headers.cookie)
}

// Keep old name as alias so existing service files don't need changes
export { validateRequest as validateInternalRequest }

export async function ordsProxy(req, ordsPath, res) {
  if (!validateRequest(req)) {
    return res.status(403).json({ error: 'forbidden' })
  }

  const token = await getOrdsToken()
  const url = ORDS + ordsPath
  const sendBody = req.method !== 'GET' && req.method !== 'HEAD'
  const init = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
  if (sendBody) {
    // ORDS exige body JSON em DELETE também (comportamento não-padrão do AutoREST)
    init.body = JSON.stringify(req.body ?? {})
  }

  try {
    const ordsRes = await fetch(url, init)
    const text = await ordsRes.text()
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(ordsRes.status).send(text)
  } catch {
    return res.status(502).json({ error: 'upstream_error' })
  }
}
