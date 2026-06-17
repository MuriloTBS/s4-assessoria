import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Pencil, Plus, Trash2, CheckSquare, Square, ExternalLink, Bell, Printer } from 'lucide-react'
import { projectApi, stepApi } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatDate, formatCurrency, statusColor } from '@/lib/utils'
import type { Project, ProjectStep } from '@/types'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStep, setNewStep] = useState('')
  const [editingStep, setEditingStep] = useState<{ id: number; title: string } | null>(null)

  const load = useCallback(() => {
    projectApi.get(Number(id)).then(p => { setProject(p ?? null); setLoading(false) })
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="p-6 text-[#8a9bb0]">Carregando...</div>
  if (!project) return (
    <div className="p-6">
      <p className="text-[#8a9bb0]">Projeto não encontrado.</p>
      <Button size="sm" className="mt-3" onClick={() => navigate('/projects')}>Voltar</Button>
    </div>
  )

  const steps = project.steps ?? []
  const done = steps.filter((s: ProjectStep) => s.completed).length
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0

  async function addStep() {
    if (!newStep.trim()) return
    await stepApi.create({ project_id: project!.id, title: newStep.trim(), completed: false, position: steps.length })
    setNewStep('')
    load()
  }

  async function toggleStep(s: ProjectStep) {
    await stepApi.update(s.id, { completed: !s.completed })
    load()
  }

  async function deleteStep(sid: number) {
    await stepApi.delete(sid)
    load()
  }

  async function saveEditStep() {
    if (!editingStep) return
    await stepApi.update(editingStep.id, { title: editingStep.title })
    setEditingStep(null)
    load()
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white break-words">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[#8a9bb0] text-sm">{project.client_name}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${statusColor(project.status)}`}>{project.status}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {project.deadline && (
            <a
              href={`https://wa.me/5521999579161?text=${encodeURIComponent(`Lembrete: projeto "${project.name}" vence em ${new Date(project.deadline + 'T00:00:00').toLocaleDateString('pt-BR')}`)}`}
              target="_blank" rel="noopener"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all"
            >
              <Bell size={12} /> WhatsApp
            </a>
          )}
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer size={14} /> PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${id}/edit`)}>
            <Pencil size={14} /> Editar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 sm:p-4">
          <p className="text-[#8a9bb0] text-xs uppercase tracking-wide mb-1">Valor</p>
          <p className="text-white font-semibold text-sm sm:text-base truncate">{project.value ? formatCurrency(project.value) : '—'}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-[#8a9bb0] text-xs uppercase tracking-wide mb-1">Prazo</p>
          <p className="text-white font-semibold text-sm sm:text-base">{project.deadline ? formatDate(project.deadline) : '—'}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-[#8a9bb0] text-xs uppercase tracking-wide mb-1">Progresso</p>
          <p className="text-white font-semibold text-sm sm:text-base">{pct}% <span className="text-[#8a9bb0] font-normal text-xs">({done}/{steps.length})</span></p>
        </Card>
      </div>

      {steps.length > 0 && (
        <div className="w-full bg-[#2a3f5f] rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      )}

      {/* Main grid — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Etapas do Projeto</h3>
          <div className="space-y-2 mb-4">
            {steps.length === 0 && <p className="text-[#8a9bb0] text-sm">Nenhuma etapa ainda</p>}
            {steps.map((s: ProjectStep) => (
              <div key={s.id} className="flex items-center gap-2 group">
                <button onClick={() => toggleStep(s)} className="shrink-0 text-[#8a9bb0] hover:text-blue-400 transition-colors">
                  {s.completed ? <CheckSquare size={16} className="text-green-400" /> : <Square size={16} />}
                </button>
                {editingStep?.id === s.id ? (
                  <input value={editingStep.title}
                    onChange={e => setEditingStep({ ...editingStep, title: e.target.value })}
                    onBlur={saveEditStep}
                    onKeyDown={e => e.key === 'Enter' && saveEditStep()}
                    autoFocus
                    className="flex-1 bg-[#0D1B2A] border border-blue-500 rounded-lg px-2 py-1 text-sm text-white focus:outline-none" />
                ) : (
                  <span
                    onDoubleClick={() => setEditingStep({ id: s.id, title: s.title })}
                    className={`flex-1 text-sm min-w-0 break-words ${s.completed ? 'line-through text-[#8a9bb0]' : 'text-[#e2e8f0]'}`}
                  >{s.title}</span>
                )}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setEditingStep({ id: s.id, title: s.title })} className="p-1 text-[#8a9bb0] hover:text-yellow-400"><Pencil size={12} /></button>
                  <button onClick={() => deleteStep(s.id)} className="p-1 text-[#8a9bb0] hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newStep}
              onChange={e => setNewStep(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addStep()}
              placeholder="Nova etapa... (Enter)"
              className="flex-1 min-w-0 bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all"
            />
            <Button size="sm" onClick={addStep}><Plus size={14} /></Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-white font-semibold mb-3">Observações</h3>
            <p className="text-[#8a9bb0] text-sm whitespace-pre-wrap break-words">{project.notes || 'Nenhuma observação.'}</p>
          </Card>
          <Card className="p-5">
            <h3 className="text-white font-semibold mb-3">Links Úteis</h3>
            {project.useful_links ? (
              <a href={project.useful_links} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors break-all">
                <ExternalLink size={14} className="shrink-0" />
                {project.useful_links}
              </a>
            ) : <p className="text-[#8a9bb0] text-sm">Nenhum link.</p>}
          </Card>
          <Card className="p-5">
            <h3 className="text-white font-semibold mb-3">Descrição</h3>
            <p className="text-[#8a9bb0] text-sm whitespace-pre-wrap break-words">{project.description || 'Sem descrição.'}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
