import { useLoginForm } from '@/hooks/useLoginForm'

export default function Login() {
  const { mode, name, email, password, message, loading, setName, setEmail, setPassword, switchMode, handleSubmit } = useLoginForm()

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
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} maxLength={128}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="bg-[#0D1B2A] border border-[#2a3f5f] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#8a9bb0] focus:outline-none focus:border-blue-500 transition-all" />
            </div>

            {message && (
              <p className={`text-sm rounded-xl px-3 py-2 ${message.ok
                ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>
                {message.text}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all mt-2">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8a9bb0] mt-4">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button onClick={switchMode} className="text-blue-400 hover:text-blue-300 font-medium">
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
