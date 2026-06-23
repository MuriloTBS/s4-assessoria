// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@node-rs/argon2', () => ({
  verify: vi.fn(),
  hash: vi.fn().mockResolvedValue('$argon2id$new-hash'),
}))

vi.mock('@vercel/kv', () => ({
  kv: { incr: vi.fn().mockResolvedValue(1), expire: vi.fn() },
}))

vi.mock('../../../api/_lib/ords-proxy.js', () => ({
  getOrdsToken: vi.fn().mockResolvedValue(null),
}))

const ORDS = 'https://host/ords/admin'

function makeRes() {
  const res: Record<string, ReturnType<typeof vi.fn>> = {}
  res['status'] = vi.fn().mockReturnValue(res)
  res['json']   = vi.fn().mockReturnValue(res)
  res['setHeader'] = vi.fn().mockReturnValue(res)
  res['send']   = vi.fn().mockReturnValue(res)
  return res
}

function makeReq(body = {}, method = 'POST') {
  return {
    method,
    body: { email: 'user@test.com', password: 'senha123', ...body },
    headers: { 'x-forwarded-for': '127.0.0.1' },
  }
}

function ordsUser(overrides = {}) {
  return {
    id: 1,
    email: 'user@test.com',
    name: 'Test User',
    password_hash: '$argon2id$test',
    account_status: 'active',
    logo_url: null,
    created_at: '2024-01-01',
    ...overrides,
  }
}

describe('POST /api/auth/login', () => {
  let handler: (req: unknown, res: unknown) => Promise<unknown>
  let verifyMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv('ORDS_BASE_URL', ORDS)
    vi.stubEnv('AUTH_PEPPER', 'test-pepper')
    vi.stubEnv('SESSION_SECRET', 'test-secret')
    vi.stubGlobal('fetch', vi.fn())

    vi.mock('@node-rs/argon2', () => ({
      verify: vi.fn(),
      hash: vi.fn().mockResolvedValue('$argon2id$new-hash'),
    }))
    vi.mock('@vercel/kv', () => ({
      kv: { incr: vi.fn().mockResolvedValue(1), expire: vi.fn() },
    }))
    vi.mock('../../../api/_lib/ords-proxy.js', () => ({
      getOrdsToken: vi.fn().mockResolvedValue(null),
    }))

    const mod = await import('../../../api/auth/login.js')
    handler = mod.default

    const argon = await import('@node-rs/argon2')
    verifyMock = vi.mocked(argon.verify)
  })

  it('retorna 405 para métodos não-POST', async () => {
    const res = makeRes()
    await handler(makeReq({}, 'GET'), res)
    expect(res['status']).toHaveBeenCalledWith(405)
  })

  it('retorna 400 quando email ou senha ausentes', async () => {
    const res = makeRes()
    await handler(makeReq({ email: '' }), res)
    expect(res['status']).toHaveBeenCalledWith(400)
  })

  it('retorna 401 quando usuário não existe no ORDS', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [] }), { status: 200 })
    )
    const res = makeRes()
    await handler(makeReq(), res)
    expect(res['status']).toHaveBeenCalledWith(401)
    expect(res['json']).toHaveBeenCalledWith({ error: 'invalid' })
  })

  it('retorna 403 quando conta está PENDENTE', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [ordsUser({ account_status: 'PENDING' })] }), { status: 200 })
    )
    const res = makeRes()
    await handler(makeReq(), res)
    expect(res['status']).toHaveBeenCalledWith(403)
    expect(res['json']).toHaveBeenCalledWith({ error: 'PENDING' })
  })

  it('retorna 401 quando a senha está incorreta', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [ordsUser()] }), { status: 200 })
    )
    verifyMock.mockResolvedValueOnce(false)
    const res = makeRes()
    await handler(makeReq(), res)
    expect(res['status']).toHaveBeenCalledWith(401)
  })

  it('retorna 200 com dados do usuário em login bem-sucedido', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [ordsUser()] }), { status: 200 })
    )
    verifyMock.mockResolvedValueOnce(true)
    const res = makeRes()
    await handler(makeReq(), res)
    expect(res['status']).toHaveBeenCalledWith(200)
    expect(res['json']).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, email: 'user@test.com' })
    )
  })

  it('define cookie de sessão HttpOnly no login bem-sucedido', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [ordsUser()] }), { status: 200 })
    )
    verifyMock.mockResolvedValueOnce(true)
    const res = makeRes()
    await handler(makeReq(), res)
    const [header, value] = res['setHeader'].mock.calls[0]
    expect(header).toBe('Set-Cookie')
    expect(value).toContain('HttpOnly')
    expect(value).toContain('Secure')
    expect(value).toContain('SameSite=Strict')
  })
})
