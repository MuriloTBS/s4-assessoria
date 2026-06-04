export const config = { runtime: 'edge' }

const ORDS_BASE = 'https://g6602a8de4565f4-s4db.adb.sa-saopaulo-1.oraclecloudapps.com/ords/admin'

export default async function handler(request) {
  const { pathname, search } = new URL(request.url)
  const oracleUrl = ORDS_BASE + pathname.replace(/^\/api/, '') + search

  const init = {
    method: request.method,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  }
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'DELETE') {
    init.body = await request.text()
  }

  const res = await fetch(oracleUrl, init)
  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}
