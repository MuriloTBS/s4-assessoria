import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { FolderKanban, CheckCircle, Users, Clock, Plus, Calculator, Printer } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useDashboardData } from '@/hooks/useDashboardData'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate, formatCurrency, statusColor } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { projects, clients, loading } = useDashboardData(user!.id)

  const activeProjects = projects.filter(p => p.status === 'Em andamento').length
  const upcoming = projects.filter(p => p.deadline && new Date(p.deadline) >= new Date()).slice(0, 3)
  const recent = projects.slice(0, 5)

  const byStatus = [
    { name: 'Em andamento', value: projects.filter(p => p.status === 'Em andamento').length },
    { name: 'Concluído',    value: projects.filter(p => p.status === 'Concluído').length },
    { name: 'Pausado',      value: projects.filter(p => p.status === 'Pausado').length },
    { name: 'Cancelado',    value: projects.filter(p => p.status === 'Cancelado').length },
  ]

  const byClient = clients.slice(0, 5).map(c => ({
    name: c.name, value: projects.filter(p => p.client_id === c.id).length,
  })).filter(c => c.value > 0)

  const byMonth = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
    }
    projects.forEach(p => {
      const key = new Date(p.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in months) months[key]++
    })
    return Object.entries(months).map(([name, value]) => ({ name, value }))
  }, [projects])

  const iconColors = { blue: 'text-blue-400', green: 'text-green-400', yellow: 'text-yellow-400', orange: 'text-orange-400' }
  const statCards = [
    { label: 'Total de Projetos', value: projects.length, icon: FolderKanban, color: 'blue'   as const },
    { label: 'Projetos Ativos',   value: activeProjects,  icon: CheckCircle,  color: 'green'  as const },
    { label: 'Total de Clientes', value: clients.length,  icon: Users,        color: 'yellow' as const },
    { label: 'Próximos Prazos',   value: upcoming.length, icon: Clock,        color: 'orange' as const },
  ]

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <p className="text-[#8a9bb0]">Carregando...</p>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-[#8a9bb0] text-sm mt-0.5">Olá, {user?.name} — visão geral dos seus projetos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => navigate('/projects/new')}><Plus size={14} /> <span className="hidden sm:inline">Novo </span>Projeto</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/clients/new')}><Plus size={14} /> <span className="hidden sm:inline">Novo </span>Cliente</Button>
          <Button size="sm" onClick={() => navigate('/calculator')}><Calculator size={14} /> <span className="hidden sm:inline">Calculadora</span></Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer size={14} /> <span className="hidden sm:inline">PDF</span></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} color={color} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#8a9bb0] text-xs font-medium uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
              </div>
              <Icon size={20} className={iconColors[color]} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 md:col-span-2">
          <h3 className="text-white font-semibold mb-4">Projetos por Mês</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
              <XAxis dataKey="name" tick={{ fill: '#8a9bb0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a9bb0', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#162032', border: '1px solid #2a3f5f', borderRadius: 12, color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Por Cliente</h3>
          {byClient.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byClient} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                  {byClient.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#162032', border: '1px solid #2a3f5f', borderRadius: 12, color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[180px] text-[#8a9bb0] text-sm">Sem dados</div>}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 md:col-span-2">
          <h3 className="text-white font-semibold mb-4">Projetos por Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byStatus} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8a9bb0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a9bb0', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#162032', border: '1px solid #2a3f5f', borderRadius: 12, color: '#e2e8f0' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {byStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Próximos Prazos</h3>
          {upcoming.length === 0 ? <p className="text-[#8a9bb0] text-sm">Nenhum prazo próximo</p> : (
            <div className="space-y-3">
              {upcoming.map(p => (
                <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <p className="text-white text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[#8a9bb0] text-xs">{p.client_name} · {formatDate(p.deadline!)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Projetos Recentes</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>Ver todos</Button>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#8a9bb0] text-sm mb-3">Nenhum projeto ainda</p>
            <Button size="sm" onClick={() => navigate('/projects/new')}><Plus size={14} /> Criar primeiro projeto</Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="text-[#8a9bb0] text-xs uppercase tracking-wide border-b border-[#2a3f5f]">
                <th className="text-left pb-2">Projeto</th><th className="text-left pb-2">Cliente</th>
                <th className="text-left pb-2">Status</th><th className="text-left pb-2">Prazo</th>
                <th className="text-right pb-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="border-b border-[#2a3f5f]/50 last:border-0 hover:bg-white/5 cursor-pointer transition-colors">
                  <td className="py-3 text-white font-medium">{p.name}</td>
                  <td className="py-3 text-[#8a9bb0]">{p.client_name ?? '—'}</td>
                  <td className="py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span></td>
                  <td className="py-3 text-[#8a9bb0]">{p.deadline ? formatDate(p.deadline) : '—'}</td>
                  <td className="py-3 text-right text-[#8a9bb0]">{p.value ? formatCurrency(p.value) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  )
}
