// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Reset module between tests to clear the in-memory token cache
const importFresh = () => {
  vi.resetModules()
  return import('../../../api/_lib/ords-proxy.js')
}

describe('getOrdsToken', () => {
  beforeEach(() => {
    vi.stubEnv('ORDS_BASE_URL', 'https://host/ords/admin')
    vi.stubEnv('ORDS_CLIENT_ID', 'test-id')
    vi.stubEnv('ORDS_CLIENT_SECRET', 'test-secret')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('retorna token quando credenciais são válidas', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'abc123', expires_in: 3600 }), { status: 200 })
    )
    const { getOrdsToken } = await importFresh()
    expect(await getOrdsToken()).toBe('abc123')
  })

  it('deriva a URL do token a partir do ORDS_BASE_URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }), { status: 200 })
    )
    const { getOrdsToken } = await importFresh()
    await getOrdsToken()
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('https://host/ords/oauth/token')
  })

  it('retorna null quando credenciais são rejeitadas (401)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
    const { getOrdsToken } = await importFresh()
    expect(await getOrdsToken()).toBeNull()
  })

  it('retorna null quando ORDS_CLIENT_ID está vazio', async () => {
    vi.stubEnv('ORDS_CLIENT_ID', '')
    const { getOrdsToken } = await importFresh()
    expect(await getOrdsToken()).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('retorna null quando fetch lança exceção (timeout/rede)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))
    const { getOrdsToken } = await importFresh()
    expect(await getOrdsToken()).toBeNull()
  })

  it('usa cache e não refaz a chamada para token válido', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'cached', expires_in: 3600 }), { status: 200 })
    )
    const { getOrdsToken } = await importFresh()
    await getOrdsToken()
    await getOrdsToken()
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
