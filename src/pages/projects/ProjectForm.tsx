import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { projectApi, clientApi } from '@/lib/storage'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Card from '@/components/ui/Card'
import type { ProjectStatus } from '@/types'

export default function ProjectForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const clients = clientApi.list(user!.id)

  const [form, setForm] = useState({
    name: '',
    client_id: clients[0]?.id ?? 0,
    description: '',
    value: '',
    deadline: '',
    status: 'Em andamento' as ProjectStatus,
    useful_links: '',
    notes: '',
  })

  useEffect(() => {
    if (isEdit) {
      const p = projectApi.get(Number(id))
      if (p) setForm({
        name: p.name,
        client_id: p.client_id,
        description: p.description ?? '',
        value: p.value?.toString() ?? '',
        deadline: p.deadline ?? '',
        status: p.status,
        useful_links: p.useful_links ?? '',
        notes: p.notes ?? '',
      })
    }
  }, [id, isEdit])

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const data = {
      user_id: user!.id,
      client_id: Number(form.client_id),
      name: form.name,
      description: form.description || undefined,
      value: form.value ? Number(form.value) : undefined,
      deadline: form.deadline || undefined,
      status: form.status,
      useful_links: form.useful_links || undefined,
      notes: form.notes || undefined,
    }
    if (isEdit) {
      projectApi.update(Number(id), data)
    } else {
      projectApi.create(data)
    }
    navigate('/projects')
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Projeto' : 'Novo Projeto'}</h1>
        <p className="text-[#8a9bb0] text-sm mt-0.5">Preencha os dados do projeto</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome do projeto *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Site institucional" required />

          <Select label="Cliente *" value={form.client_id} onChange={e => set('client_id', Number(e.target.value))} required>
            {clients.length === 0
              ? <option value="">Nenhum cliente cadastrado</option>
              : clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
            }
          </Select>

          <Textarea label="Descrição" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva o projeto..." />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor (R$)" type="number" min="0" step="0.01" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0,00" />
            <Input label="Prazo" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>

          <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
            <option>Em andamento</option>
            <option>Concluído</option>
            <option>Pausado</option>
            <option>Cancelado</option>
          </Select>

          <Input label="Links úteis" value={form.useful_links} onChange={e => set('useful_links', e.target.value)} placeholder="https://figma.com/..." />
          <Textarea label="Observações" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas internas..." />

          <div className="flex gap-3 pt-2">
            <Button type="submit">{isEdit ? 'Salvar alterações' : 'Criar projeto'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
