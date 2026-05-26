import { createContext, useContext, useState, type ReactNode } from 'react'
import { authApi } from '@/lib/api'
import { hashPassword } from '@/lib/hash'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

function getStoredUser(): User | null {
  try { return JSON.parse(sessionStorage.getItem('s4:user') || 'null') } catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser())

  async function login(email: string, password: string) {
    try {
      const hash = await hashPassword(password)
      const u = await authApi.login(email, hash)
      sessionStorage.setItem('s4:user', JSON.stringify(u))
      setUser(u)
      return true
    } catch {
      return false
    }
  }

  async function register(name: string, email: string, password: string) {
    const hash = await hashPassword(password)
    const u = await authApi.register(name, email, hash)
    sessionStorage.setItem('s4:user', JSON.stringify(u))
    setUser(u)
  }

  function logout() {
    sessionStorage.removeItem('s4:user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
