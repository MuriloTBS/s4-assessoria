import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, CheckCircle, Clock, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { users, loading, working, pending, active, approveUser, deleteUser, deleteAllUsers } = useAdminUsers(user!.id)

  useEffect(() => { if (!isAdmin) navigate('/') }, [isAdmin, navigate])

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Excluir a conta de "${name}"?`)) return
    await deleteUser(id)
  }

  async function handleDeleteAll() {
    if (!confirm('Excluir TODAS as contas exceto a sua? Esta ação não pode ser desfeita.')) return
    await deleteAllUsers()
  }

  if (loading) return <div className="p-6 text-[#8a9bb0]">Carregando...</div>

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={22} className="text-red-400" /> Painel Admin
          </h1>
          <p className="text-[#8a9bb0] text-sm mt-0.5">{users.length} conta(s) no total</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleDeleteAll} disabled={working}>
          <Trash2 size={14} /> Excluir todas as contas
        </Button>
      </div>

      {pending.length > 0 && (
        <Card className="p-5">
          <h3 className="text-yellow-400 font-semibold mb-4 flex items-center gap-2">
            <Clock size={16} /> Aguardando aprovação ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map(u => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[#2a3f5f] last:border-0">
                <div>
                  <p className="text-white font-medium text-sm">{u.name}</p>
                  <p className="text-[#8a9bb0] text-xs">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveUser(u.id)} disabled={working}>
                    <CheckCircle size={14} /> Aprovar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(u.id, u.name)} disabled={working}>
                    <Trash2 size={14} /> Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" /> Contas ativas ({active.length})
        </h3>
        {active.length === 0
          ? <p className="text-[#8a9bb0] text-sm">Nenhuma conta ativa além da sua.</p>
          : (
            <div className="space-y-1">
              {active.map(u => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[#2a3f5f] last:border-0">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {u.name}{u.id === user!.id && <span className="text-xs text-blue-400 ml-1">(você)</span>}
                    </p>
                    <p className="text-[#8a9bb0] text-xs">{u.email}</p>
                  </div>
                  {u.id !== user!.id && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(u.id, u.name)} disabled={working}>
                      <Trash2 size={14} /> Excluir
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </Card>
    </div>
  )
}
