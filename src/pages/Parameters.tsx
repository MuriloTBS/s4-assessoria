import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { paramsApi } from '@/lib/storage'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function Parameters() {
  const { user } = useAuth()
  const initial = paramsApi.get(user!.id)
  const [form, setForm] = useState({ hourly_rate: initial.hourly_rate, default_margin: initial.default_margin, default_complexity: initial.default_complexity })
  const [saved, setSaved] = useState(false)

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    paramsApi.save({ ...initial, ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Parâmetros</h1>
        <p className="text-[#8a9bb0] text-sm mt-0.5">Configure os valores padrão da calculadora</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Valor/hora padrão (R$)"
            type="number" min="0" step="0.01"
            value={form.hourly_rate}
            onChange={e => set('hourly_rate', Number(e.target.value))}
          />
          <Input
            label="Margem mínima padrão (%)"
            type="number" min="0" max="100"
            value={form.default_margin}
            onChange={e => set('default_margin', Number(e.target.value))}
          />
          <Select
            label="Complexidade padrão"
            value={form.default_complexity}
            onChange={e => set('default_complexity', e.target.value)}
          >
            <option>Simples</option>
            <option>Médio</option>
            <option>Complexo</option>
            <option>Muito Complexo</option>
          </Select>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit">Salvar Parâmetros</Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-green-400 text-sm">
                <CheckCircle size={16} /> Salvo com sucesso!
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h3 className="text-white font-medium text-sm mb-2">Sobre os Parâmetros</h3>
        <p className="text-[#8a9bb0] text-sm">
          Esses valores são usados como ponto de partida na Calculadora de Precificação.
          Você pode ajustá-los a qualquer momento na calculadora sem alterar os padrões.
        </p>
      </Card>
    </div>
  )
}
