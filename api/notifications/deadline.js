import { Resend } from 'resend'

const ORDS = process.env.ORDS_BASE_URL

function daysUntil(deadline) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - now) / (1000 * 60 * 60 * 24))
}

export default async function handler(req, res) {
  // Can be called via cron (GET) or manually for one project (POST with projectId)
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Fetch all active projects with deadlines
    const projRes = await fetch(`${ORDS}/s4_projects/?q={"status":"Em andamento"}&limit=200`)
    const projData = await projRes.json()
    const projects = projData.items ?? []

    const alerts = projects.filter(p => {
      if (!p.deadline) return false
      const days = daysUntil(p.deadline)
      return days >= 0 && days <= 3
    })

    if (alerts.length === 0) return res.status(200).json({ sent: 0 })

    // Get unique user emails
    const userIds = [...new Set(alerts.map(p => p.user_id))]
    const users = {}
    for (const uid of userIds) {
      const uRes = await fetch(`${ORDS}/s4_users/${uid}`)
      if (uRes.ok) {
        const u = await uRes.json()
        users[uid] = u
      }
    }

    let sent = 0
    for (const project of alerts) {
      const user = users[project.user_id]
      if (!user?.email) continue

      const days = daysUntil(project.deadline)
      const urgency = days === 0 ? '🔴 HOJE' : days === 1 ? '🟡 Amanhã' : `🟢 Em ${days} dias`

      await resend.emails.send({
        from: 'S4 Assessoria <contato@s4assessoria.com.br>',
        to: user.email,
        subject: `${urgency} — Prazo: ${project.name}`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0D1B2A;color:#e2e8f0;border-radius:12px">
            <div style="font-size:1.4rem;font-weight:900;color:#fff;margin-bottom:4px">S4 Assessoria</div>
            <div style="font-size:.65rem;color:#8a9bb0;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px">Lembrete de prazo</div>
            <p style="color:#8a9bb0;font-size:.9rem;line-height:1.6;margin-bottom:8px">Olá, <strong style="color:#e2e8f0">${user.name}</strong></p>
            <div style="background:#162032;border:1px solid #2a3f5f;border-radius:10px;padding:20px;margin-bottom:20px">
              <div style="font-size:1.5rem;margin-bottom:8px">${urgency}</div>
              <div style="font-size:1rem;font-weight:700;color:#fff;margin-bottom:4px">${project.name}</div>
              <div style="font-size:.85rem;color:#8a9bb0">Prazo: ${new Date(project.deadline).toLocaleDateString('pt-BR')}</div>
              ${project.value ? `<div style="font-size:.85rem;color:#8a9bb0;margin-top:4px">Valor: R$ ${Number(project.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>` : ''}
            </div>
            <a href="https://s4assessoria.com.br/projects/${project.id}" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:700;font-size:.9rem;padding:12px 24px;border-radius:8px;text-decoration:none">
              Ver projeto →
            </a>
          </div>
        `,
      })
      sent++
    }

    return res.status(200).json({ sent, total: alerts.length })
  } catch (err) {
    return res.status(500).json({ error: 'server_error', detail: err?.message })
  }
}
