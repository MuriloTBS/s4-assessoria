import type { ProjectStatus, Complexity } from '@/types'

export const ADMIN_EMAIL = 'smnogueira@proton.me'

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'Em andamento': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'Concluído':    'bg-green-500/20 text-green-400 border border-green-500/30',
  'Pausado':      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'Cancelado':    'bg-red-500/20 text-red-400 border border-red-500/30',
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  'Em andamento', 'Concluído', 'Pausado', 'Cancelado',
]

export const COMPLEXITY_FACTORS: Record<Complexity, number> = {
  'Simples':        1.0,
  'Médio':          1.3,
  'Complexo':       1.7,
  'Muito Complexo': 2.2,
}

export const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
