import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!email.trim()) return 'Informe o email.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido.'
    if (password.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
    if (mode === 'register') {
      if (!name.trim()) return 'Informe seu nome.'
      if (name.trim().length < 2) return 'Nome muito curto.'
      if (password.length > 128) return 'Senha muito longa.'
    }
    return null
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const result = await login(email.trim().toLowerCase(), password)
        if (result === 'ok') navigate('/')
        else if (result === 'pending') setError('Conta aguardando aprovação do administrador.')
        else setError('Email ou senha incorretos.')
      } else {
        await register(name.trim(), email.trim().toLowerCase(), password)
        setError('✓ Conta criada! Aguarde aprovação do administrador para acessar.')
        setMode('login')
        setName('')
        setPassword('')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo-S4-00.jpeg" alt="S4" className="object-contain rounded-xl" style={{ height: '52px', width: '52px', mixBlendMode: 'screen' }} />
            <img src="/LogoS4-04.jpg" alt="S4 Assessoria | Gestão e Tecnologia" className="object-contain" style={{ height: '36px', width: 'auto', mixBlendMode: 'screen' }} />
          </div>
        </div>

        <div className="bg-[#162032] border border-[#2a3f5f] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#e2e8f0]">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required
                  className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
            </div>

            {error && (
              <p className={`text-sm rounded-xl px-3 py-2 ${error.startsWith('✓') ? 'text-green-400 bg-green-500/10 border border-green-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all mt-2">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8a9bb0] mt-4">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
              className="text-blue-400 hover:text-blue-300 font-medium">
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
