// Oracle ORDS REST API — proxied via Vercel to avoid CORS
const BASE = '/api'
const ts = () => new Date().toISOString()

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// Auth — via AutoREST on s4_users (no custom module needed)
export const authApi = {
  async login(email: string, passwordHash: string) {
    const q = encodeURIComponent(JSON.stringify({ email, password_hash: passwordHash }))
    const res = await request<{ items: OracleUser[] }>(`/s4_users/?q=${q}&limit=1`)
    if (!res.items?.length) throw new Error('Credenciais inválidas')
    const u = res.items[0]
    return { id: u.id, email: u.email, name: u.name }
  },
  async register(name: string, email: string, passwordHash: string) {
    const u = await request<OracleUser>('/s4_users/', {
      method: 'POST',
      body: JSON.stringify({ name, email, password_hash: passwordHash, created_at: ts(), updated_at: ts() }),
    })
    return { id: u.id, email: u.email, name: u.name }
  },
}

// Clients
export const clientApi = {
  async list(userId: number) {
    const res = await request<{ items: OracleClient[] }>(`/s4_clients/?q={"user_id":${userId}}&limit=200`)
    return res.items.map(mapClient)
  },
  async get(id: number) {
    return request<OracleClient>(`/s4_clients/${id}`).then(mapClient)
  },
  async create(data: Omit<import('@/types').Client, 'id' | 'created_at'>) {
    return request<OracleClient>('/s4_clients/', { method: 'POST', body: JSON.stringify({ ...data, created_at: ts(), updated_at: ts() }) }).then(mapClient)
  },
  async update(id: number, data: Partial<import('@/types').Client>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, ...body } = data as any
    return request<OracleClient>(`/s4_clients/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapClient)
  },
  async delete(id: number) {
    const projects = await request<{ items: { id: number }[] }>(`/s4_projects/?q={"client_id":${id}}&limit=1`)
    if (projects.items.length > 0) return false
    await request(`/s4_clients/${id}`, { method: 'DELETE' })
    return true
  },
}

// Projects
export const projectApi = {
  async list(userId: number) {
    const [projRes, clientRes] = await Promise.all([
      request<{ items: OracleProject[] }>(`/s4_projects/?q={"user_id":${userId}}&limit=200&orderby=deadline`),
      request<{ items: OracleClient[] }>(`/s4_clients/?q={"user_id":${userId}}&limit=200`),
    ])
    const clientMap = Object.fromEntries(clientRes.items.map(c => [c.id, c.name]))
    return projRes.items.map(p => ({ ...mapProject(p), client_name: clientMap[p.client_id] }))
  },
  async get(id: number) {
    const [proj, stepsRes] = await Promise.all([
      request<OracleProject>(`/s4_projects/${id}`),
      request<{ items: OracleStep[] }>(`/s4_project_steps/?q={"project_id":${id}}&limit=200&orderby=position`),
    ])
    const clientRes = await request<OracleClient>(`/s4_clients/${proj.client_id}`)
    return { ...mapProject(proj), client_name: clientRes.name, steps: stepsRes.items.map(mapStep) }
  },
  async create(data: Omit<import('@/types').Project, 'id' | 'created_at' | 'steps' | 'client_name'>) {
    return request<OracleProject>('/s4_projects/', { method: 'POST', body: JSON.stringify({ ...data, created_at: ts(), updated_at: ts() }) }).then(mapProject)
  },
  async update(id: number, data: Partial<import('@/types').Project>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _ca, steps: _s, client_name: _cn, ...body } = data as any
    return request<OracleProject>(`/s4_projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapProject)
  },
  async delete(id: number) {
    await request(`/s4_projects/${id}`, { method: 'DELETE' })
  },
}

// Steps
export const stepApi = {
  async create(data: Omit<import('@/types').ProjectStep, 'id'>) {
    const { completed, ...rest } = data
    return request<OracleStep>('/s4_project_steps/', {
      method: 'POST',
      body: JSON.stringify({ ...rest, completed: completed ? 1 : 0, created_at: ts(), updated_at: ts() }),
    }).then(mapStep)
  },
  async update(id: number, data: Partial<import('@/types').ProjectStep>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...body } = data as any
    if (typeof body.completed === 'boolean') body.completed = body.completed ? 1 : 0
    return request<OracleStep>(`/s4_project_steps/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapStep)
  },
  async delete(id: number) {
    await request(`/s4_project_steps/${id}`, { method: 'DELETE' })
  },
}

// Parameters
export const paramsApi = {
  async get(userId: number): Promise<import('@/types').Parameters> {
    const res = await request<{ items: OracleParams[] }>(`/s4_parameters/?q={"user_id":${userId}}&limit=1`)
    if (res.items.length === 0) return { id: 0, user_id: userId, hourly_rate: 100, default_margin: 20, default_complexity: 'Médio' }
    return mapParams(res.items[0])
  },
  async save(data: import('@/types').Parameters): Promise<import('@/types').Parameters> {
    const { id, ...body } = data
    if (id === 0) {
      return request<OracleParams>('/s4_parameters/', { method: 'POST', body: JSON.stringify({ ...body, created_at: ts(), updated_at: ts() }) }).then(mapParams)
    }
    return request<OracleParams>(`/s4_parameters/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then(mapParams)
  },
}

// Oracle ORDS types (AutoREST returns lowercase column names)
interface OracleUser { id: number; email: string; name: string; password_hash: string; created_at: string }
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
