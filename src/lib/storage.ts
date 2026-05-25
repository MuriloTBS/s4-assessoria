// Oracle-ready API layer — currently uses localStorage as mock
// Replace api() calls with real Oracle REST API endpoints when backend is ready

import type { Client, Project, ProjectStep, Parameters, User } from '@/types'

const KEY = {
  user: 's4:user',
  clients: 's4:clients',
  projects: 's4:projects',
  steps: 's4:steps',
  params: 's4:parameters',
}

function get<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}
function nextId<T extends { id: number }>(items: T[]) {
  return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1
}

// Auth
export const authApi = {
  login(email: string, password: string): User | null {
    const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('s4:users') || '[]')
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) return null
    const { password: _, ...rest } = user
    localStorage.setItem(KEY.user, JSON.stringify(rest))
    return rest
  },
  register(name: string, email: string, password: string): User {
    const users: (User & { password: string })[] = JSON.parse(localStorage.getItem('s4:users') || '[]')
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1
    const user = { id, name, email, password }
    users.push(user)
    localStorage.setItem('s4:users', JSON.stringify(users))
    const { password: _, ...rest } = user
    localStorage.setItem(KEY.user, JSON.stringify(rest))
    return rest
  },
  current(): User | null {
    try { return JSON.parse(localStorage.getItem(KEY.user) || 'null') } catch { return null }
  },
  logout() { localStorage.removeItem(KEY.user) },
}

// Clients
export const clientApi = {
  list(userId: number): Client[] {
    return get<Client>(KEY.clients).filter(c => c.user_id === userId)
  },
  get(id: number): Client | undefined {
    return get<Client>(KEY.clients).find(c => c.id === id)
  },
  create(data: Omit<Client, 'id' | 'created_at'>): Client {
    const all = get<Client>(KEY.clients)
    const item: Client = { ...data, id: nextId(all), created_at: new Date().toISOString() }
    set(KEY.clients, [...all, item])
    return item
  },
  update(id: number, data: Partial<Client>): Client {
    const all = get<Client>(KEY.clients)
    const updated = all.map(c => c.id === id ? { ...c, ...data } : c)
    set(KEY.clients, updated)
    return updated.find(c => c.id === id)!
  },
  delete(id: number): boolean {
    const projects = get<Project>(KEY.projects)
    if (projects.some(p => p.client_id === id)) return false
    set(KEY.clients, get<Client>(KEY.clients).filter(c => c.id !== id))
    return true
  },
}

// Projects
export const projectApi = {
  list(userId: number): Project[] {
    const clients = get<Client>(KEY.clients)
    return get<Project>(KEY.projects)
      .filter(p => p.user_id === userId)
      .map(p => ({ ...p, client_name: clients.find(c => c.id === p.client_id)?.name }))
      .sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return a.deadline.localeCompare(b.deadline)
      })
  },
  get(id: number): Project | undefined {
    const clients = get<Client>(KEY.clients)
    const steps = get<ProjectStep>(KEY.steps)
    const p = get<Project>(KEY.projects).find(p => p.id === id)
    if (!p) return undefined
    return {
      ...p,
      client_name: clients.find(c => c.id === p.client_id)?.name,
      steps: steps.filter(s => s.project_id === id).sort((a, b) => a.position - b.position),
    }
  },
  create(data: Omit<Project, 'id' | 'created_at' | 'steps' | 'client_name'>): Project {
    const all = get<Project>(KEY.projects)
    const item: Project = { ...data, id: nextId(all), created_at: new Date().toISOString() }
    set(KEY.projects, [...all, item])
    return item
  },
  update(id: number, data: Partial<Project>): Project {
    const all = get<Project>(KEY.projects)
    const updated = all.map(p => p.id === id ? { ...p, ...data } : p)
    set(KEY.projects, updated)
    return updated.find(p => p.id === id)!
  },
  delete(id: number) {
    set(KEY.projects, get<Project>(KEY.projects).filter(p => p.id !== id))
    set(KEY.steps, get<ProjectStep>(KEY.steps).filter(s => s.project_id !== id))
  },
}

// Project Steps
export const stepApi = {
  create(data: Omit<ProjectStep, 'id'>): ProjectStep {
    const all = get<ProjectStep>(KEY.steps)
    const item: ProjectStep = { ...data, id: nextId(all) }
    set(KEY.steps, [...all, item])
    return item
  },
  update(id: number, data: Partial<ProjectStep>): ProjectStep {
    const all = get<ProjectStep>(KEY.steps)
    const updated = all.map(s => s.id === id ? { ...s, ...data } : s)
    set(KEY.steps, updated)
    return updated.find(s => s.id === id)!
  },
  delete(id: number) {
    set(KEY.steps, get<ProjectStep>(KEY.steps).filter(s => s.id !== id))
  },
}

// Parameters
export const paramsApi = {
  get(userId: number): Parameters {
    const all = get<Parameters>(KEY.params)
    return all.find(p => p.user_id === userId) ?? {
      id: 0, user_id: userId, hourly_rate: 100, default_margin: 20, default_complexity: 'Médio',
    }
  },
  save(data: Parameters): Parameters {
    const all = get<Parameters>(KEY.params)
    const exists = all.find(p => p.user_id === data.user_id)
    if (exists) {
      const updated = all.map(p => p.user_id === data.user_id ? data : p)
      set(KEY.params, updated)
    } else {
      set(KEY.params, [...all, { ...data, id: nextId(all) }])
    }
    return data
  },
}
