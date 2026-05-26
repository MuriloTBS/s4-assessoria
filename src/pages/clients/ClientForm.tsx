import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { clientApi } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Card from '@/components/ui/Card'

export default function ClientForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })

  useEffect(() => {
    if (isEdit) clientApi.get(Number(id)).then(c => {
      if (c) setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', company: c.company ?? '', notes: c.notes ?? '' })
    })
  }, [id, isEdit])

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { user_id: user!.id, name: form.name, email: form.email || undefined, phone: form.phone || undefined, company: form.company || undefined, notes: form.notes || undefined }
      if (isEdit) await clientApi.update(Number(id), data)
      else await clientApi.create(data)
      navigate('/clients')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h1>
        <p className="text-[#8a9bb0] text-sm mt-0.5">Preencha os dados do cliente</p>
      </div>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do cliente" required />
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Telefone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 99999-9999" />
            <Input label="Empresa" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nome da empresa" />
          </div>
          <Textarea label="Observações" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas sobre o cliente..." />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar cliente'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/clients')}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
