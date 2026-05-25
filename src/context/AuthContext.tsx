import { createContext, useContext, useState, type ReactNode } from 'react'
import { authApi } from '@/lib/storage'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authApi.current())

  function login(email: string, password: string) {
    const u = authApi.login(email, password)
    if (u) { setUser(u); return true }
    return false
  }

  function register(name: string, email: string, password: string) {
    const u = authApi.register(name, email, password)
    setUser(u)
  }

  function logout() {
    authApi.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
