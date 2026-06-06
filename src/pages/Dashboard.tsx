import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { FolderKanban, CheckCircle, Users, Clock, Plus, Calculator, Printer, DollarSign, TrendingUp } from 'lucide-react'
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

  // Financeiro
  const totalRevenue = useMemo(() =>
    projects.filter(p => p.value).reduce((sum, p) => sum + (p.value ?? 0), 0),
    [projects]
  )
  const completedRevenue = useMemo(() =>
    projects.filter(p => p.status === 'Concluído' && p.value).reduce((sum, p) => sum + (p.value ?? 0), 0),
    [projects]
  )
  const revenueByClient = useMemo(() =>
    clients
      .map(c => ({
        name: c.name,
        value: projects.filter(p => p.client_id === c.id && p.value).reduce((sum, p) => sum + (p.value ?? 0), 0),
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    [clients, projects]
  )
  const revenueByMonth = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months[d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })] = 0
    }
    projects.filter(p => p.value).forEach(p => {
      const key = new Date(p.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (key in months) months[key] += p.value ?? 0
    })
    return Object.entries(months).map(([name, value]) => ({ name, value }))
  }, [projects])

  const iconColors = { blue: 'text-blue-400', green: 'text-green-400', yellow: 'text-yellow-400', orange: 'text-orange-400', emerald: 'text-emerald-400', purple: 'text-purple-400' }
  const statCards = [
    { label: 'Total de Projetos', value: projects.length,  icon: FolderKanban, color: 'blue'    as const },
    { label: 'Projetos Ativos',   value: activeProjects,   icon: CheckCircle,  color: 'green'   as const },
    { label: 'Total de Clientes', value: clients.length,   icon: Users,        color: 'yellow'  as const },
    { label: 'Próximos Prazos',   value: upcoming.length,  icon: Clock,        color: 'orange'  as const },
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

      {/* Cards de resumo */}
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

      {/* Cards financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card color="green" className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8a9bb0] text-xs font-medium uppercase tracking-wide">Receita Total (carteira)</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-[#8a9bb0] text-xs mt-1">{projects.filter(p => p.value).length} projeto(s) com valor</p>
            </div>
            <DollarSign size={20} className="text-green-400" />
          </div>
        </Card>
        <Card color="blue" className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#8a9bb0] text-xs font-medium uppercase tracking-wide">Receita Concluída</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(completedRevenue)}</p>
              <p className="text-[#8a9bb0] text-xs mt-1">{projects.filter(p => p.status === 'Concluído' && p.value).length} projeto(s) entregue(s)</p>
            </div>
            <TrendingUp size={20} className="text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Gráficos de projetos */}
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

      {/* Gráficos financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 md:col-span-2">
          <h3 className="text-white font-semibold mb-4">Receita por Mês (R$)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueByMonth} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8a9bb0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a9bb0', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip
                contentStyle={{ background: '#162032', border: '1px solid #2a3f5f', borderRadius: 12, color: '#e2e8f0' }}
                formatter={(v) => [formatCurrency(Number(v)), 'Receita']}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Top Clientes (R$)</h3>
          {revenueByClient.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-[#8a9bb0] text-sm">Sem dados</div>
          ) : (
            <div className="space-y-3 mt-2">
              {revenueByClient.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-[#8a9bb0] text-right shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{c.name}</p>
                    <p className="text-[#8a9bb0] text-xs">{formatCurrency(c.value)}</p>
                  </div>
                  <div
                    className="h-1.5 rounded-full shrink-0"
                    style={{
                      width: `${Math.round((c.value / revenueByClient[0].value) * 64)}px`,
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Status e prazos */}
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

      {/* Projetos recentes */}
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
