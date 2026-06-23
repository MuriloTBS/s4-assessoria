const ORDS = process.env.ORDS_BASE_URL
const CLIENT_ID = process.env.ORDS_CLIENT_ID
const CLIENT_SECRET = process.env.ORDS_CLIENT_SECRET
const INTERNAL_KEY = process.env.INTERNAL_API_KEY

// Derives https://host/ords/oauth/token from https://host/ords/schema
const TOKEN_URL = ORDS ? ORDS.replace(/\/ords\/[^/]+.*$/, '/ords/oauth/token') : null

// In-memory token cache (lives for the duration of a warm serverless instance)
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
    // Expire 60s early to avoid edge-case clock skew rejections
    _tokenExpiry = Date.now() + Math.max(0, (data.expires_in - 60) * 1000)
    return _token
  } catch {
    return null
  }
}

export function validateInternalRequest(req) {
  const key = req.headers['x-s4-internal-key']
  return key && key === INTERNAL_KEY
}

export async function ordsProxy(req, ordsPath, res) {
  if (!validateInternalRequest(req)) {
    return res.status(403).json({ error: 'forbidden' })
  }

  const token = await getOrdsToken()
  const url = ORDS + ordsPath
  const init = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
    init.body = JSON.stringify(req.body)
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
