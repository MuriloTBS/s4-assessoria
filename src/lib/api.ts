// Oracle ORDS REST API — proxied via Vercel to avoid CORS
const BASE = '/api'
const ts = () => new Date().toISOString()
const INTERNAL_KEY = import.meta.env.VITE_INTERNAL_API_KEY ?? ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-s4-internal-key': INTERNAL_KEY,
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

export const ADMIN_EMAIL = 'smnogueira@proton.me'

// Auth — via serverless functions (Argon2 + Pepper, server-side)
export const authApi = {
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'invalid')
    return { id: data.id, email: data.email, name: data.name }
  },
  async me(): Promise<{ id: number; email: string; name: string }> {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
    if (!res.ok) throw new Error('unauthenticated')
    return res.json()
  },
  async logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
  },
  async register(name: string, email: string, password: string, orgName?: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, orgName }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'server_error')
    return { id: data.id, email: data.email, name: data.name, org_id: data.org_id }
  },
}

// Admin
export const adminApi = {
  async listUsers() {
    const res = await request<{ items: OracleUser[] }>('/users/?limit=200')
    return res.items.map(u => ({ id: u.id, name: u.name, email: u.email, status: (u.account_status ?? (u.logo_url === 'PENDING' ? 'PENDING' : 'active')) === 'PENDING' ? 'pending' : 'active', created_at: u.created_at }))
  },
  async approveUser(id: number) {
    return request(`/users/${id}`, { method: 'PUT', body: JSON.stringify({ account_status: 'active', logo_url: null, updated_at: ts() }) })
  },
  async deleteUser(id: number) {
    return request(`/users/${id}`, { method: 'DELETE' })
  },
  async deleteAllUsers(exceptId: number) {
    const res = await request<{ items: OracleUser[] }>('/users/?limit=200')
    const others = res.items.filter(u => u.id !== exceptId)
    for (const u of others) await request(`/users/${u.id}`, { method: 'DELETE' })
  },
}

// Clients
export const clientApi = {
  async list(userId: number) {
    const res = await request<{ items: OracleClient[] }>(`/clients/?q={"user_id":${userId}}&limit=200`)
    return res.items.map(mapClient)
  },
  async get(id: number) {
    return request<OracleClient>(`/clients/${id}`).then(mapClient)
  },
  async create(data: Omit<import('@/types').Client, 'id' | 'created_at'>) {
    return request<OracleClient>('/clients/', { method: 'POST', body: JSON.stringify({ ...data, created_at: ts(), updated_at: ts() }) }).then(mapClient)
  },
  async update(id: number, data: Partial<import('@/types').Client>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, ...body } = data as any
    return request<OracleClient>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapClient)
  },
  async delete(id: number) {
    const projects = await request<{ items: { id: number }[] }>(`/projects/?q={"client_id":${id}}&limit=1`)
    if (projects.items.length > 0) return false
    await request(`/clients/${id}`, { method: 'DELETE' })
    return true
  },
}

// Projects
export const projectApi = {
  async list(userId: number) {
    const [projRes, clientRes] = await Promise.all([
      request<{ items: OracleProject[] }>(`/projects/?q={"user_id":${userId}}&limit=200&orderby=deadline`),
      request<{ items: OracleClient[] }>(`/clients/?q={"user_id":${userId}}&limit=200`),
    ])
    const clientMap = Object.fromEntries(clientRes.items.map(c => [c.id, c.name]))
    return projRes.items.map(p => ({ ...mapProject(p), client_name: clientMap[p.client_id] }))
  },
  async get(id: number) {
    const [proj, stepsRes] = await Promise.all([
      request<OracleProject>(`/projects/${id}`),
      request<{ items: OracleStep[] }>(`/steps/?q={"project_id":${id}}&limit=200&orderby=position`),
    ])
    const clientRes = await request<OracleClient>(`/clients/${proj.client_id}`)
    return { ...mapProject(proj), client_name: clientRes.name, steps: stepsRes.items.map(mapStep) }
  },
  async create(data: Omit<import('@/types').Project, 'id' | 'created_at' | 'steps' | 'client_name'>) {
    return request<OracleProject>('/projects/', { method: 'POST', body: JSON.stringify({ ...data, created_at: ts(), updated_at: ts() }) }).then(mapProject)
  },
  async update(id: number, data: Partial<import('@/types').Project>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, steps: _s, client_name: _cn, ...body } = data as any
    return request<OracleProject>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapProject)
  },
  async delete(id: number) {
    await request(`/projects/${id}`, { method: 'DELETE' })
  },
}

// Steps
export const stepApi = {
  async create(data: Omit<import('@/types').ProjectStep, 'id'>) {
    const { completed, ...rest } = data
    return request<OracleStep>('/steps/', {
      method: 'POST',
      body: JSON.stringify({ ...rest, completed: completed ? 1 : 0, created_at: ts(), updated_at: ts() }),
    }).then(mapStep)
  },
  async update(id: number, data: Partial<import('@/types').ProjectStep>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...body } = data as any
    if (typeof body.completed === 'boolean') body.completed = body.completed ? 1 : 0
    return request<OracleStep>(`/steps/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapStep)
  },
  async delete(id: number) {
    await request(`/steps/${id}`, { method: 'DELETE' })
  },
}

// Parameters
export const paramsApi = {
  async get(userId: number): Promise<import('@/types').Parameters> {
    const res = await request<{ items: OracleParams[] }>(`/parameters/?q={"user_id":${userId}}&limit=1`)
    if (res.items.length === 0) return { id: 0, user_id: userId, hourly_rate: 100, default_margin: 20, default_complexity: 'Médio' }
    return mapParams(res.items[0])
  },
  async save(data: import('@/types').Parameters): Promise<import('@/types').Parameters> {
    const { id, ...body } = data
    if (id === 0) {
      return request<OracleParams>('/parameters/', { method: 'POST', body: JSON.stringify({ ...body, created_at: ts(), updated_at: ts() }) }).then(mapParams)
    }
    return request<OracleParams>(`/parameters/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapParams)
  },
}

// Oracle ORDS types (AutoREST returns lowercase column names)
interface OracleUser { id: number; email: string; name: string; password_hash: string; logo_url?: string; account_status?: string; created_at: string }
interface OracleClient { id: number; user_id: number; name: string; email?: string; phone?: string; company?: string; notes?: string; created_at: string }
interface OracleProject { id: number; user_id: number; client_id: number; name: string; description?: string; status: string; value?: number; deadline?: string; useful_links?: string; notes?: string; created_at: string }
interface OracleStep { id: number; project_id: number; title: string; completed: number; position: number }
interface OracleParams { id: number; user_id: number; hourly_rate: number; default_margin: number; default_complexity: string }

function mapClient(c: OracleClient): import('@/types').Client {
  return { id: c.id, user_id: c.user_id, name: c.name, email: c.email, phone: c.phone, company: c.company, notes: c.notes, created_at: c.created_at }
}
function mapProject(p: OracleProject): import('@/types').Project {
  return { id: p.id, user_id: p.user_id, client_id: p.client_id, name: p.name, description: p.description, status: p.status as import('@/types').ProjectStatus, value: p.value, deadline: p.deadline?.split('T')[0], useful_links: p.useful_links, notes: p.notes, created_at: p.created_at }
}
function mapStep(s: OracleStep): import('@/types').ProjectStep {
  return { id: s.id, project_id: s.project_id, title: s.title, completed: s.completed === 1, position: s.position }
}
function mapParams(p: OracleParams): import('@/types').Parameters {
  return { id: p.id, user_id: p.user_id, hourly_rate: p.hourly_rate, default_margin: p.default_margin, default_complexity: p.default_complexity as import('@/types').Parameters['default_complexity'] }
}
