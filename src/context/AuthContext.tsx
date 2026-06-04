import { createContext, useContext, useState, type ReactNode } from 'react'
import { authApi, ADMIN_EMAIL } from '@/lib/api'
import { hashPassword } from '@/lib/hash'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<'ok' | 'invalid' | 'pending'>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

function getStoredUser(): User | null {
  try { return JSON.parse(sessionStorage.getItem('s4:user') || 'null') } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser())
  const isAdmin = user?.email === ADMIN_EMAIL

  async function login(email: string, password: string): Promise<'ok' | 'invalid' | 'pending'> {
    try {
      const hash = await hashPassword(password)
      const u = await authApi.login(email, hash)
      sessionStorage.setItem('s4:user', JSON.stringify(u))
      setUser(u)
      return 'ok'
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'PENDING') return 'pending'
      return 'invalid'
    }
  }

  async function register(name: string, email: string, password: string) {
    const hash = await hashPassword(password)
    await authApi.register(name, email, hash)
  }

  function logout() {
    sessionStorage.removeItem('s4:user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
