import { ordsProxy } from '../_lib/ords-proxy.js'

export default function handler(req, res) {
  const ordsPath = req.url.replace(/^\/api\/projects/, '/s4_projects')
  return ordsProxy(req, ordsPath, res)
}
