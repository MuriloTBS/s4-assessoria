import { hash as argon2Hash } from '@node-rs/argon2'

const ORDS = process.env.ORDS_BASE_URL
const PEPPER = process.env.AUTH_PEPPER

function ts() { return new Date().toISOString() }
function slugify(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36) }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, email, password, orgName } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'invalid' })
  if (password.length < 6 || password.length > 128) return res.status(400).json({ error: 'password_length' })

  try {
    const passwordHash = await argon2Hash(password + PEPPER)

    // 1. Create organization if orgName provided (SaaS flow)
    let orgId = null
    if (orgName?.trim()) {
      const orgRes = await fetch(`${ORDS}/s4_organizations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName.trim(),
          slug: slugify(orgName.trim()),
          plan: 'free',
          status: 'active',
          created_at: ts(),
        }),
      })
      if (orgRes.ok) {
        const org = await orgRes.json()
        orgId = org.id
      }
    }

    // 2. Create user
    const userBody = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      logo_url: 'PENDING',
      created_at: ts(),
      updated_at: ts(),
    }
    if (orgId) userBody.org_id = orgId

    const ordsRes = await fetch(`${ORDS}/s4_users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userBody),
    })

    if (!ordsRes.ok) {
      const err = await ordsRes.json().catch(() => ({}))
      if (JSON.stringify(err).includes('unique') || JSON.stringify(err).includes('ORA-00001')) {
        return res.status(409).json({ error: 'email_taken' })
      }
      return res.status(500).json({ error: 'server_error' })
    }

    const user = await ordsRes.json()

    // 3. Set org owner_id
    if (orgId) {
      await fetch(`${ORDS}/s4_organizations/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim(), slug: slugify(orgName.trim()), plan: 'free', status: 'active', owner_id: user.id, created_at: ts() }),
      })
    }

    return res.status(201).json({ id: user.id, email: user.email, name: user.name, org_id: orgId })
  } catch {
    return res.status(500).json({ error: 'server_error' })
  }
}
