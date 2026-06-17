export const config = { runtime: 'edge' }

const ORDS_BASE = process.env.ORDS_BASE_URL || 'https://g6602a8de4565f4-s4db.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin'
const INTERNAL_KEY = process.env.INTERNAL_API_KEY

const PATH_MAP = [
  ['/clients',    '/s4_clients'],
  ['/projects',   '/s4_projects'],
  ['/users',      '/s4_users'],
  ['/parameters', '/s4_parameters'],
  ['/steps',      '/s4_project_steps'],
]

export default async function handler(request) {
  const key = request.headers.get('x-s4-internal-key')
  if (INTERNAL_KEY && key !== INTERNAL_KEY) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { pathname, search } = new URL(request.url)
  let apiPath = pathname.replace(/^\/api/, '')

  for (const [from, to] of PATH_MAP) {
    if (apiPath === from || apiPath.startsWith(from + '/') || apiPath.startsWith(from + '?')) {
      apiPath = to + apiPath.slice(from.length)
      break
    }
  }

  const init = {
    method: request.method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'DELETE') {
    init.body = await request.text()
  }

  const res = await fetch(ORDS_BASE + apiPath + search, init)
  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
