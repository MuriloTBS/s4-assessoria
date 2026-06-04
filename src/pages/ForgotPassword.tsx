import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setStatus('loading')
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setStatus('sent')
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
          {status === 'sent' ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-lg font-semibold text-white mb-2">Email enviado</h2>
              <p className="text-[#8a9bb0] text-sm mb-6">
                Se esse email estiver cadastrado, você receberá um link para redefinir sua senha em breve. Verifique também o spam.
              </p>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                ← Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">Esqueceu a senha?</h2>
              <p className="text-[#8a9bb0] text-sm mb-6">Digite seu email e enviaremos um link para criar uma nova senha.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#e2e8f0]">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
                    className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                <button type="submit" disabled={status === 'loading'}
                  className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all">
                  {status === 'loading' ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>
              <p className="text-center text-sm text-[#8a9bb0] mt-4">
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">← Voltar para o login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
