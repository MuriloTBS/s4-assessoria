import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, ADMIN_EMAIL } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<'ok' | 'invalid' | 'pending' | 'too_many_attempts'>
  register: (name: string, email: string, password: string, orgName?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isAdmin = user?.email === ADMIN_EMAIL

  // Valida o cookie HttpOnly na montagem — restaura sessão sem expor token no JS
  useEffect(() => {
    authApi.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string): Promise<'ok' | 'invalid' | 'pending' | 'too_many_attempts'> {
    try {
      const u = await authApi.login(email, password)
      setUser(u)
      return 'ok'
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'PENDING') return 'pending'
        if (err.message === 'too_many_attempts') return 'too_many_attempts'
      }
      return 'invalid'
    }
  }

  async function register(name: string, email: string, password: string, orgName?: string) {
    await authApi.register(name, email, password, orgName)
  }

  async function logout() {
    await authApi.logout().catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
