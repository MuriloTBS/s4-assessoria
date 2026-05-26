// Oracle ORDS REST API — proxied via Vercel to avoid CORS
const BASE = '/api'

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

// Auth
export const authApi = {
  async login(email: string, passwordHash: string) {
    return request<{ id: number; email: string; name: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password_hash: passwordHash }),
    })
  },
  async register(name: string, email: string, passwordHash: string) {
    return request<{ id: number; email: string; name: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password_hash: passwordHash }),
    })
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
    return request<OracleClient>('/clients/', { method: 'POST', body: JSON.stringify(data) }).then(mapClient)
  },
  async update(id: number, data: Partial<import('@/types').Client>) {
    return request<OracleClient>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapClient)
  },
  async delete(id: number) {
    // Check for projects first
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
      request<{ items: OracleStep[] }>(`/project_steps/?q={"project_id":${id}}&limit=200&orderby=position`),
    ])
    const clientRes = await request<OracleClient>(`/clients/${proj.client_id}`)
    return { ...mapProject(proj), client_name: clientRes.name, steps: stepsRes.items.map(mapStep) }
  },
  async create(data: Omit<import('@/types').Project, 'id' | 'created_at' | 'steps' | 'client_name'>) {
    return request<OracleProject>('/projects/', { method: 'POST', body: JSON.stringify(data) }).then(mapProject)
  },
  async update(id: number, data: Partial<import('@/types').Project>) {
    return request<OracleProject>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapProject)
  },
  async delete(id: number) {
    await request(`/projects/${id}`, { method: 'DELETE' })
  },
}

// Steps
export const stepApi = {
  async create(data: Omit<import('@/types').ProjectStep, 'id'>) {
    return request<OracleStep>('/project_steps/', { method: 'POST', body: JSON.stringify(data) }).then(mapStep)
  },
  async update(id: number, data: Partial<import('@/types').ProjectStep>) {
    return request<OracleStep>(`/project_steps/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapStep)
  },
  async delete(id: number) {
    await request(`/project_steps/${id}`, { method: 'DELETE' })
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
    if (data.id === 0) {
      return request<OracleParams>('/parameters/', { method: 'POST', body: JSON.stringify(data) }).then(mapParams)
    }
    return request<OracleParams>(`/parameters/${data.id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapParams)
  },
}

// Oracle response mappers (ORDS returns lowercase keys)
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
