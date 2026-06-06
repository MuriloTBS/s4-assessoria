import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { clientApi } from '@/lib/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { Client } from '@/types'

const PAGE_SIZE = 25

export default function ClientList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    clientApi.list(user!.id)
      .then(c => setClients(c))
      .catch(() => setError('Não foi possível carregar os clientes. Verifique sua conexão.'))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    setPage(1)
    return clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Excluir cliente "${name}"?`)) return
    const ok = await clientApi.delete(id)
    if (!ok) alert('Este cliente possui projetos vinculados e não pode ser excluído.')
    else setClients(c => c.filter(x => x.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-[#8a9bb0] text-sm mt-0.5">{filtered.length} cliente(s)</p>
        </div>
        <Button onClick={() => navigate('/clients/new')}><Plus size={16} /> Novo Cliente</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9bb0]" />
          <input type="text" placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl pl-9 pr-3 py-2 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
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
            <p className="text-[#8a9bb0] text-sm mb-3">Nenhum cliente encontrado</p>
            <Button size="sm" onClick={() => navigate('/clients/new')}><Plus size={14} /> Adicionar cliente</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="text-[#8a9bb0] text-xs uppercase tracking-wide border-b border-[#2a3f5f]">
                    <th className="text-left px-5 py-3">Nome</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Telefone</th>
                    <th className="text-left px-5 py-3">Empresa</th>
                    <th className="text-right px-5 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(c => (
                    <tr key={c.id} className="border-b border-[#2a3f5f]/50 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-white font-medium">{c.name}</td>
                      <td className="px-5 py-4 text-[#8a9bb0]">{c.email || '—'}</td>
                      <td className="px-5 py-4 text-[#8a9bb0]">{c.phone || '—'}</td>
                      <td className="px-5 py-4 text-[#8a9bb0]">{c.company || '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/clients/${c.id}/edit`)} className="p-1.5 rounded-lg text-[#8a9bb0] hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"><Pencil size={15} /></button>
                          <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded-lg text-[#8a9bb0] hover:text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={15} /></button>
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
