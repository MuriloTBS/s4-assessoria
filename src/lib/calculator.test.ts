import { describe, it, expect } from 'vitest'
import { calculatePrice, COMPLEXITY_FACTOR } from './calculator'

describe('COMPLEXITY_FACTOR', () => {
  it('define os 4 níveis de complexidade', () => {
    expect(COMPLEXITY_FACTOR['Simples']).toBe(1.0)
    expect(COMPLEXITY_FACTOR['Médio']).toBe(1.3)
    expect(COMPLEXITY_FACTOR['Complexo']).toBe(1.7)
    expect(COMPLEXITY_FACTOR['Muito Complexo']).toBe(2.2)
  })
})

describe('calculatePrice', () => {
  it('calcula base = hourlyRate × hours', () => {
    const result = calculatePrice(100, 10, 'Simples', 0, 0)
    expect(result.base).toBe(1000)
  })

  it('aplica fator de complexidade Médio (×1.3)', () => {
    const result = calculatePrice(100, 10, 'Médio', 0, 0)
    expect(result.withComp).toBeCloseTo(1300)
  })

  it('aplica fator de complexidade Complexo (×1.7)', () => {
    const result = calculatePrice(100, 10, 'Complexo', 0, 0)
    expect(result.withComp).toBeCloseTo(1700)
  })

  it('soma extras após complexidade', () => {
    const result = calculatePrice(100, 10, 'Simples', 500, 0)
    expect(result.withExtras).toBe(1500)
  })

  it('aplica margem sobre o total com extras', () => {
    const result = calculatePrice(100, 10, 'Simples', 0, 20)
    expect(result.withMargin).toBeCloseTo(1200)
  })

  it('resultado completo com todos os parâmetros', () => {
    const result = calculatePrice(150, 8, 'Médio', 200, 25)
    expect(result.base).toBe(1200)
    expect(result.withComp).toBeCloseTo(1560)
    expect(result.withExtras).toBeCloseTo(1760)
    expect(result.withMargin).toBeCloseTo(2200)
  })

  it('retorna zero para zero horas', () => {
    const result = calculatePrice(100, 0, 'Médio', 0, 20)
    expect(result.base).toBe(0)
    expect(result.withMargin).toBe(0)
  })
})
