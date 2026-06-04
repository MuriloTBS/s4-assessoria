import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, statusColor, isOverdue } from './utils'

describe('formatCurrency', () => {
  it('formata valores em BRL', () => {
    expect(formatCurrency(1234.56)).toContain('1.234,56')
  })
  it('formata zero', () => {
    expect(formatCurrency(0)).toContain('0')
  })
})

describe('formatDate', () => {
  it('formata data ISO para dd/mm/aaaa', () => {
    expect(formatDate('2025-12-31')).toBe('31/12/2025')
  })
  it('retorna traço para string vazia', () => {
    expect(formatDate('')).toBe('—')
  })
  it('retorna traço para undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })
})

describe('statusColor', () => {
  it('retorna classe blue para Em andamento', () => {
    expect(statusColor('Em andamento')).toContain('blue')
  })
  it('retorna classe green para Concluído', () => {
    expect(statusColor('Concluído')).toContain('green')
  })
  it('retorna classe yellow para Pausado', () => {
    expect(statusColor('Pausado')).toContain('yellow')
  })
  it('retorna classe red para Cancelado', () => {
    expect(statusColor('Cancelado')).toContain('red')
  })
})

describe('isOverdue', () => {
  it('retorna true para data no passado', () => {
    expect(isOverdue('2020-01-01')).toBe(true)
  })
  it('retorna false para data no futuro', () => {
    expect(isOverdue('2099-01-01')).toBe(false)
  })
  it('retorna false para undefined', () => {
    expect(isOverdue(undefined)).toBe(false)
  })
})
