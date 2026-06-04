import { useState, useEffect } from 'react'
import { projectApi, clientApi } from '@/lib/api'
import type { Project, Client } from '@/types'

export function useDashboardData(userId: number) {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      projectApi.list(userId),
      clientApi.list(userId),
    ]).then(([p, c]) => {
      setProjects(p)
      setClients(c)
      setLoading(false)
    })
  }, [userId])

  return { projects, clients, loading }
}
