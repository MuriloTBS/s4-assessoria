import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string) {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    'Em andamento': 'text-blue-400 bg-blue-400/10',
    'Concluído':    'text-green-400 bg-green-400/10',
    'Pausado':      'text-yellow-400 bg-yellow-400/10',
    'Cancelado':    'text-red-400 bg-red-400/10',
  }
  return map[status] ?? 'text-slate-400 bg-slate-400/10'
}

export function isOverdue(deadline?: string) {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}
