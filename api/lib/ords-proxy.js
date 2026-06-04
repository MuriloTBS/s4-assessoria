const ORDS = process.env.ORDS_BASE_URL

/**
 * Forward a Vercel request to Oracle ORDS.
 * @param {Request} req - incoming Vercel request
 * @param {string} ordsPath - ORDS path including query string (e.g. '/s4_projects/?q=...')
 * @param {Response} res - Vercel response object
 */
export async function ordsProxy(req, ordsPath, res) {
  const url = ORDS + ordsPath
  const init = {
    method: req.method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
