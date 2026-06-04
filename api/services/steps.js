import { ordsProxy } from '../lib/ords-proxy.js'

export default function handler(req, res) {
  const ordsPath = req.url.replace(/^\/api\/steps/, '/s4_project_steps')
  return ordsProxy(req, ordsPath, res)
}
