import { ordsProxy } from '../lib/ords-proxy.js'

export default function handler(req, res) {
  const ordsPath = req.url.replace(/^\/api\/users/, '/s4_users')
  return ordsProxy(req, ordsPath, res)
}
