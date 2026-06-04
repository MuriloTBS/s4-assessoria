import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api'
import { useAsyncAction } from './useAsyncAction'

export type AdminUser = { id: number; name: string; email: string; status: string; created_at: string }

export function useAdminUsers(currentUserId: number) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const { working, execute } = useAsyncAction()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const data = await adminApi.listUsers()
    setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function approveUser(id: number) {
    await execute(async () => {
      await adminApi.approveUser(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u))
    })
  }

  async function deleteUser(id: number) {
    await execute(async () => {
      await adminApi.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    })
  }

  async function deleteAllUsers() {
    await execute(async () => {
      await adminApi.deleteAllUsers(currentUserId)
      setUsers(prev => prev.filter(u => u.id === currentUserId))
    })
  }

  return {
    users,
    loading,
    working,
    pending: users.filter(u => u.status === 'pending'),
    active:  users.filter(u => u.status === 'active'),
    approveUser,
    deleteUser,
    deleteAllUsers,
  }
}
