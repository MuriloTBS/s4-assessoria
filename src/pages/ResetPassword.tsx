import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'

const MESSAGES: Record<string, string> = {
  token_expired: 'O link expirou. Solicite um novo link de redefinição.',
  invalid_token: 'Link inválido. Solicite um novo link de redefinição.',
  password_length: 'A senha deve ter entre 6 e 128 caracteres.',
  server_error: 'Erro ao salvar. Tente novamente.',
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const email = params.get('email') ?? ''
  const token = params.get('token') ?? ''
  const timestamp = params.get('t') ?? ''

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, timestamp, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(MESSAGES[data.error] ?? 'Erro inesperado.'); return }
    navigate('/login?reset=ok')
  }

  if (!email || !token || !timestamp) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
        <div className="bg-[#162032] border border-[#2a3f5f] rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="text-red-400 text-sm mb-4">Link inválido ou incompleto.</p>
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">Solicitar novo link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo-S4-00.jpeg" alt="S4" className="object-contain rounded-xl" style={{ height: '52px', width: '52px', mixBlendMode: 'screen' }} />
            <img src="/LogoS4-04.jpg" alt="S4 Assessoria" className="object-contain" style={{ height: '36px', width: 'auto', mixBlendMode: 'screen' }} />
          </div>
        </div>
        <div className="bg-[#162032] border border-[#2a3f5f] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Nova senha</h2>
          <p className="text-[#8a9bb0] text-sm mb-6">Digite e confirme sua nova senha para a conta <strong className="text-[#e2e8f0]">{email}</strong>.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Nova senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} maxLength={128} autoComplete="new-password"
                className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Confirmar senha</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" required minLength={6} maxLength={128} autoComplete="new-password"
                className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all">
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
