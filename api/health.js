export const config = { runtime: 'edge' }

export default async function handler(req) {
  const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? ''
  const host = req.headers.get('host') ?? 's4assessoria.com.br'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${proto}://${host}`

  const start = Date.now()
  try {
    const res = await fetch(`${baseUrl}/api/projects/?limit=1`, {
      headers: { 'x-s4-internal-key': INTERNAL_KEY },
    })
    const latency = Date.now() - start

    if (!res.ok) {
      return new Response(
        JSON.stringify({ ok: false, latency, status: res.status, source: 'api' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    const ordsOk = Array.isArray(data.items)

    return new Response(
      JSON.stringify({ ok: ordsOk, latency, ords: ordsOk ? 'up' : 'degraded' }),
      { status: ordsOk ? 200 : 503, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, latency: Date.now() - start, error: err.message }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
