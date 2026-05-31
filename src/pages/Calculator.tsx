import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { paramsApi } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { formatCurrency } from '@/lib/utils'
import type { Complexity } from '@/types'

const COMPLEXITY_FACTOR: Record<Complexity, number> = {
  'Simples': 1.0, 'Médio': 1.3, 'Complexo': 1.7, 'Muito Complexo': 2.2,
}

export default function Calculator() {
  const { user } = useAuth()
  const [hourlyRate, setHourlyRate] = useState(100)
  const [hours, setHours] = useState(10)
  const [complexity, setComplexity] = useState<Complexity>('Médio')
  const [extras, setExtras] = useState(0)
  const [margin, setMargin] = useState(20)

  useEffect(() => {
    paramsApi.get(user!.id).then(p => {
      setHourlyRate(p.hourly_rate)
      setMargin(p.default_margin)
      setComplexity(p.default_complexity)
    })
  }, [user])

  const result = useMemo(() => {
    const base = hourlyRate * hours
    const withComp = base * COMPLEXITY_FACTOR[complexity]
    const withExtras = withComp + extras
    const withMargin = withExtras * (1 + margin / 100)
    return { base, withComp, withExtras, withMargin }
  }, [hourlyRate, hours, complexity, extras, margin])

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Calculadora de Precificação</h1>
        <p className="text-[#8a9bb0] text-sm mt-0.5">Calcule o preço ideal para seu projeto</p>
      </div>

      {/* Preço sugerido — visível no topo em mobile */}
      <Card color="blue" className="p-5 sm:hidden">
        <p className="text-blue-400 text-xs uppercase tracking-wide font-medium mb-1">Preço Sugerido</p>
        <p className="text-2xl font-bold text-white break-all">{formatCurrency(result.withMargin)}</p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 space-y-4">
          <h3 className="text-white font-semibold">Parâmetros</h3>
          <Input label="Valor/hora (R$)" type="number" min="0" step="0.01" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} />
          <Input label="Horas estimadas" type="number" min="0" value={hours} onChange={e => setHours(Number(e.target.value))} />
          <Select label="Complexidade" value={complexity} onChange={e => setComplexity(e.target.value as Complexity)}>
            <option>Simples</option><option>Médio</option><option>Complexo</option><option>Muito Complexo</option>
          </Select>
          <Input label="Custos extras (R$)" type="number" min="0" step="0.01" value={extras} onChange={e => setExtras(Number(e.target.value))} />
          <Input label="Margem mínima (%)" type="number" min="0" max="100" value={margin} onChange={e => setMargin(Number(e.target.value))} />
        </Card>

        <div className="space-y-3">
          {/* Preço sugerido — oculto em mobile (aparece acima) */}
          <Card color="blue" className="p-5 hidden sm:block">
            <p className="text-blue-400 text-xs uppercase tracking-wide font-medium mb-1">Preço Sugerido</p>
            <p className="text-3xl font-bold text-white break-all">{formatCurrency(result.withMargin)}</p>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-white font-medium text-sm">Detalhamento</h4>
            {[
              { label: `Base (${hours}h × ${formatCurrency(hourlyRate)})`, value: result.base },
              { label: `Com complexidade (×${COMPLEXITY_FACTOR[complexity]})`, value: result.withComp },
              { label: `+ Custos extras`, value: result.withExtras },
              { label: `+ Margem (${margin}%)`, value: result.withMargin },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 text-sm">
                <span className="text-[#8a9bb0] text-xs sm:text-sm">{label}</span>
                <span className="text-[#e2e8f0] font-medium shrink-0">{formatCurrency(value)}</span>
              </div>
            ))}
          </Card>

          <Card color="green" className="p-4">
            <p className="text-green-400 text-xs font-medium">
              Fator: <strong className="text-white">×{COMPLEXITY_FACTOR[complexity]}</strong>
              <span className="text-green-400/70"> ({complexity})</span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
