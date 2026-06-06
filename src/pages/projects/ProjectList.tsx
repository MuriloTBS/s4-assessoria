import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { projectApi, clientApi } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatDate, formatCurrency, statusColor } from '@/lib/utils'
import type { Project, Client, ProjectStatus } from '@/types'

const STATUSES: ProjectStatus[] = ['Em andamento', 'Concluído', 'Pausado', 'Cancelado']
const PAGE_SIZE = 25

export default function ProjectList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('')
  const [clientFilter, setClientFilter] = useState<number | ''>('')
  const [page, setPage] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([projectApi.list(user!.id), clientApi.list(user!.id)])
      .then(([p, c]) => { setProjects(p); setClients(c) })
      .catch(() => setError('Não foi possível carregar os projetos. Verifique sua conexão.'))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    setPage(1)
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || p.status === statusFilter
      const matchClient = !clientFilter || p.client_id === Number(clientFilter)
      return matchSearch && matchStatus && matchClient
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, search, statusFilter, clientFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Excluir projeto "${name}"?`)) return
    await projectApi.delete(id)
    setProjects(p => p.filter(x => x.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projetos</h1>
          <p className="text-[#8a9bb0] text-sm mt-0.5">{filtered.length} projeto(s)</p>
        </div>
        <Button onClick={() => navigate('/projects/new')}><Plus size={16} /> Novo Projeto</Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9bb0]" />
            <input type="text" placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl pl-9 pr-3 py-2 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProjectStatus | '')}
            className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-blue-500">
            <option value="">Todos os status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value ? Number(e.target.value) : '')}
            className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-blue-500">
            <option value="">Todos os clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-[#8a9bb0]">Carregando...</div>
        ) : error ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-red-400 text-sm">{error}</p>
            <Button size="sm" variant="secondary" onClick={load}><RefreshCw size={14} /> Tentar novamente</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8a9bb0] text-sm mb-3">Nenhum projeto encontrado</p>
            <Button size="sm" onClick={() => navigate('/projects/new')}><Plus size={14} /> Criar projeto</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-[#8a9bb0] text-xs uppercase tracking-wide border-b border-[#2a3f5f]">
                    <th className="text-left px-5 py-3">Projeto</th><th className="text-left px-5 py-3">Cliente</th>
                    <th className="text-left px-5 py-3">Status</th><th className="text-left px-5 py-3">Prazo</th>
                    <th className="text-right px-5 py-3">Valor</th><th className="text-right px-5 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.id} className="border-b border-[#2a3f5f]/50 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-white font-medium">{p.name}</td>
                      <td className="px-5 py-4 text-[#8a9bb0]">{p.client_name ?? '—'}</td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span></td>
                      <td className="px-5 py-4 text-[#8a9bb0]">{p.deadline ? formatDate(p.deadline) : '—'}</td>
                      <td className="px-5 py-4 text-right text-[#8a9bb0]">{p.value ? formatCurrency(p.value) : '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/projects/${p.id}`)} className="p-1.5 rounded-lg text-[#8a9bb0] hover:text-blue-400 hover:bg-blue-400/10 transition-all"><Eye size={15} /></button>
                          <button onClick={() => navigate(`/projects/${p.id}/edit`)} className="p-1.5 rounded-lg text-[#8a9bb0] hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"><Pencil size={15} /></button>
                          <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded-lg text-[#8a9bb0] hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#2a3f5f]">
                <p className="text-[#8a9bb0] text-xs">Página {page} de {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 text-xs rounded-lg border border-[#2a3f5f] text-[#8a9bb0] hover:text-white hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Anterior
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1 text-xs rounded-lg border border-[#2a3f5f] text-[#8a9bb0] hover:text-white hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
