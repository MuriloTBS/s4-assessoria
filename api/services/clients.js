import { ordsProxy } from '../lib/ords-proxy.js'

export default function handler(req, res) {
  const ordsPath = req.url.replace(/^\/api\/clients/, '/s4_clients')
  return ordsProxy(req, ordsPath, res)
}
