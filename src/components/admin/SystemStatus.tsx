import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Card from '@/components/ui/Card'

type ServiceStatus = { ok: boolean; latency: number | null; error?: string }
type Status = { ords: ServiceStatus; checkedAt: Date | null; checking: boolean }

const INTERNAL_KEY = import.meta.env.VITE_INTERNAL_API_KEY ?? ''
const REFRESH_MS = 5 * 60 * 1000

function StatusDot({ ok, checking }: { ok: boolean | null; checking: boolean }) {
  if (checking) return <RefreshCw size={14} className="text-[#8a9bb0] animate-spin" />
  if (ok === null) return <AlertCircle size={14} className="text-yellow-400" />
  return ok
    ? <CheckCircle size={14} className="text-green-400" />
    : <XCircle size={14} className="text-red-400" />
}

export default function SystemStatus() {
  const { user } = useAuth()
  const [status, setStatus] = useState<Status>({ ords: { ok: false, latency: null }, checkedAt: null, checking: false })

  const check = useCallback(async () => {
    setStatus(s => ({ ...s, checking: true }))
    const start = Date.now()
    try {
      const res = await fetch(`/api/projects/?q={"user_id":${user!.id}}&limit=1`, {
        headers: { 'x-s4-internal-key': INTERNAL_KEY },
      })
      const latency = Date.now() - start
      setStatus({ ords: { ok: res.ok, latency, error: res.ok ? undefined : `HTTP ${res.status}` }, checkedAt: new Date(), checking: false })
    } catch {
      setStatus({ ords: { ok: false, latency: null, error: 'Sem resposta' }, checkedAt: new Date(), checking: false })
    }
  }, [user])

  useEffect(() => {
    check()
    const id = setInterval(check, REFRESH_MS)
    return () => clearInterval(id)
  }, [check])

  const { ords, checkedAt, checking } = status
  const overallOk = ords.ok

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Status do Sistema</h2>
        <button
          onClick={check}
          disabled={checking}
          className="text-xs text-[#8a9bb0] hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw size={12} className={checking ? 'animate-spin' : ''} />
          Verificar
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-[#0D1B2A]">
        <StatusDot ok={overallOk} checking={checking} />
        <span className={`text-xs font-medium ${overallOk ? 'text-green-400' : checking ? 'text-[#8a9bb0]' : 'text-red-400'}`}>
          {checking ? 'Verificando...' : overallOk ? 'Todos os sistemas operacionais' : 'Degradado — verifique ORDS'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#2a3f5f]">
          <div className="flex items-center gap-2">
            <StatusDot ok={ords.ok} checking={checking} />
            <span className="text-xs text-[#e2e8f0]">Oracle ORDS (banco de dados)</span>
          </div>
          <div className="text-right">
            {ords.latency !== null && (
              <span className={`text-xs font-mono ${ords.latency < 500 ? 'text-green-400' : ords.latency < 1500 ? 'text-yellow-400' : 'text-red-400'}`}>
                {ords.latency}ms
              </span>
            )}
            {ords.error && <span className="text-xs text-red-400 ml-2">{ords.error}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#2a3f5f]">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-[#e2e8f0]">Vercel (API e frontend)</span>
          </div>
          <span className="text-xs text-green-400">Operacional</span>
        </div>
      </div>

      {checkedAt && (
        <p className="text-xs text-[#8a9bb0] mt-3 text-right">
          Última verificação: {checkedAt.toLocaleTimeString('pt-BR')} · atualiza a cada 5 min
        </p>
      )}
    </Card>
  )
}
