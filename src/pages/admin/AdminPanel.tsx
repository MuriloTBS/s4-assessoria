import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, CheckCircle, Clock, ShieldAlert, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAdminUsers } from '@/hooks/useAdminUsers'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SystemStatus from '@/components/admin/SystemStatus'

function DeleteAllModal({ onConfirm, onCancel, working }: {
  onConfirm: () => void
  onCancel: () => void
  working: boolean
}) {
  const [text, setText] = useState('')
  const confirmed = text === 'CONFIRMAR'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#162032] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={22} className="text-red-400 shrink-0" />
          <h2 className="text-white font-bold text-lg">Ação irreversível</h2>
        </div>
        <p className="text-[#8a9bb0] text-sm mb-5 leading-relaxed">
          Isso irá excluir <strong className="text-white">todas as contas</strong> exceto a sua.
          Os dados não poderão ser recuperados.
        </p>
        <p className="text-[#8a9bb0] text-xs mb-2">Digite <strong className="text-red-400">CONFIRMAR</strong> para continuar:</p>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="CONFIRMAR"
          className="w-full bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2 text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-red-500 transition-all mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={working}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={!confirmed || working}>
            {working ? 'Excluindo...' : 'Excluir tudo'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const { users, loading, working, pending, active, approveUser, deleteUser, deleteAllUsers } = useAdminUsers(user!.id)
  const [showDeleteAll, setShowDeleteAll] = useState(false)

  useEffect(() => { if (!isAdmin) navigate('/') }, [isAdmin, navigate])

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Excluir a conta de "${name}"?`)) return
    await deleteUser(id)
  }

  async function handleDeleteAll() {
    await deleteAllUsers()
    setShowDeleteAll(false)
  }

  if (loading) return <div className="p-6 text-[#8a9bb0]">Carregando...</div>

  return (
    <>
      {showDeleteAll && (
        <DeleteAllModal
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteAll(false)}
          working={working}
        />
      )}

      <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
        <SystemStatus />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert size={22} className="text-red-400" /> Painel Admin
            </h1>
            <p className="text-[#8a9bb0] text-sm mt-0.5">{users.length} conta(s) no total</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteAll(true)} disabled={working}>
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
    </>
  )
}
