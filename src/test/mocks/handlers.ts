import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'pending@test.com') return HttpResponse.json({ error: 'PENDING' }, { status: 403 })
    if (body.email === 'test@test.com' && body.password === 'senha123') {
      return HttpResponse.json({ id: 1, email: 'test@test.com', name: 'Test User' })
    }
    return HttpResponse.json({ error: 'invalid' }, { status: 401 })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string }
    if (body.email === 'existing@test.com') return HttpResponse.json({ error: 'email_taken' }, { status: 409 })
    return HttpResponse.json({ id: 2, email: body.email, name: body.name }, { status: 201 })
  }),

  http.get('/api/projects/', () => HttpResponse.json({ items: [], hasMore: false, count: 0 })),
  http.get('/api/clients/', () => HttpResponse.json({ items: [], hasMore: false, count: 0 })),
  http.get('/api/users/', () => HttpResponse.json({ items: [], hasMore: false, count: 0 })),
  http.get('/api/parameters/', () => HttpResponse.json({ items: [], hasMore: false, count: 0 })),
]
