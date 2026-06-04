import { ordsProxy } from '../lib/ords-proxy.js'

export default function handler(req, res) {
  const ordsPath = req.url.replace(/^\/api\/parameters/, '/s4_parameters')
  return ordsProxy(req, ordsPath, res)
}
