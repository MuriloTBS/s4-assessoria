import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { loginSchema, registerSchema } from '@/lib/schemas'

type Mode = 'login' | 'register'

export function useLoginForm() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login')
    setMessage(null)
  }

  function validate(): string | null {
    const schema = mode === 'login' ? loginSchema : registerSchema
    const result = schema.safeParse({ name, email, password })
    if (!result.success) return result.error.issues[0].message
    return null
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const err = validate()
    if (err) { setMessage({ text: err, ok: false }); return }
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const result = await login(email.trim().toLowerCase(), password)
        if (result === 'ok') navigate('/')
        else if (result === 'pending') setMessage({ text: 'Conta aguardando aprovação do administrador.', ok: false })
        else setMessage({ text: 'Email ou senha incorretos.', ok: false })
      } else {
        await register(name.trim(), email.trim().toLowerCase(), password)
        setMessage({ text: '✓ Conta criada! Aguarde aprovação do administrador para acessar.', ok: true })
        setMode('login')
        setName('')
        setPassword('')
      }
    } catch {
      setMessage({ text: 'Erro de conexão. Tente novamente.', ok: false })
    } finally {
      setLoading(false)
    }
  }

  return { mode, name, email, password, message, loading, setName, setEmail, setPassword, switchMode, handleSubmit }
}
