import type { Complexity } from '@/types'

export const COMPLEXITY_FACTOR: Record<Complexity, number> = {
  'Simples': 1.0,
  'Médio': 1.3,
  'Complexo': 1.7,
  'Muito Complexo': 2.2,
}

export interface PriceBreakdown {
  base: number
  withComp: number
  withExtras: number
  withMargin: number
}

export function calculatePrice(
  hourlyRate: number,
  hours: number,
  complexity: Complexity,
  extras: number,
  margin: number,
): PriceBreakdown {
  const base = hourlyRate * hours
  const withComp = base * COMPLEXITY_FACTOR[complexity]
  const withExtras = withComp + extras
  const withMargin = withExtras * (1 + margin / 100)
  return { base, withComp, withExtras, withMargin }
}
