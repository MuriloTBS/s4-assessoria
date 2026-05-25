export interface User {
  id: number
  email: string
  name: string
  logo_url?: string
}

export interface Client {
  id: number
  user_id: number
  name: string
  email?: string
  phone?: string
  company?: string
  notes?: string
  created_at: string
}

export type ProjectStatus = 'Em andamento' | 'Concluído' | 'Pausado' | 'Cancelado'

export interface Project {
  id: number
  user_id: number
  client_id: number
  client_name?: string
  name: string
  description?: string
  status: ProjectStatus
  value?: number
  deadline?: string
  useful_links?: string
  notes?: string
  created_at: string
  steps?: ProjectStep[]
}

export interface ProjectStep {
  id: number
  project_id: number
  title: string
  completed: boolean
  position: number
}

export interface Parameters {
  id: number
  user_id: number
  hourly_rate: number
  default_margin: number
  default_complexity: 'Simples' | 'Médio' | 'Complexo' | 'Muito Complexo'
}

export type Complexity = 'Simples' | 'Médio' | 'Complexo' | 'Muito Complexo'
