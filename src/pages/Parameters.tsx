import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { paramsApi } from '@/lib/api'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'
import type { Parameters } from '@/types'

export default function ParametersPage() {
  const { user } = useAuth()
  const [params, setParams] = useState<Parameters | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    paramsApi.get(user!.id).then(setParams)
  }, [user])

  function set(field: string, value: string | number) {
    setParams(p => p ? { ...p, [field]: value } : p)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!params) return
    setLoading(true)
    try {
      await paramsApi.save(params)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally { setLoading(false) }
  }

  if (!params) return <div className="p-6 text-[#8a9bb0]">Carregando...</div>

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Parâmetros</h1>
        <p className="text-[#8a9bb0] text-sm mt-0.5">Configure os valores padrão da calculadora</p>
      </div>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Valor/hora padrão (R$)" type="number" min="0" step="0.01" value={params.hourly_rate} onChange={e => set('hourly_rate', Number(e.target.value))} />
          <Input label="Margem mínima padrão (%)" type="number" min="0" max="100" value={params.default_margin} onChange={e => set('default_margin', Number(e.target.value))} />
          <Select label="Complexidade padrão" value={params.default_complexity} onChange={e => set('default_complexity', e.target.value)}>
            <option>Simples</option><option>Médio</option><option>Complexo</option><option>Muito Complexo</option>
          </Select>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Parâmetros'}</Button>
            {saved && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle size={16} /> Salvo!</span>}
          </div>
        </form>
      </Card>
      <Card className="p-5">
        <h3 className="text-white font-medium text-sm mb-2">Sobre os Parâmetros</h3>
        <p className="text-[#8a9bb0] text-sm">Esses valores são usados como ponto de partida na Calculadora. Você pode ajustá-los a qualquer momento.</p>
      </Card>
    </div>
  )
}
