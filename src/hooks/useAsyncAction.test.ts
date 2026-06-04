import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAsyncAction } from './useAsyncAction'

describe('useAsyncAction', () => {
  it('inicia com working=false e error=null', () => {
    const { result } = renderHook(() => useAsyncAction())
    expect(result.current.working).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('define working=true durante execução e false após', async () => {
    const { result } = renderHook(() => useAsyncAction())
    await act(async () => {
      await result.current.execute(() => Promise.resolve('ok'))
    })
    expect(result.current.working).toBe(false)
  })

  it('captura erro em error state', async () => {
    const { result } = renderHook(() => useAsyncAction())
    await act(async () => {
      await result.current.execute(() => Promise.reject(new Error('falha teste')))
    })
    expect(result.current.error).toBe('falha teste')
    expect(result.current.working).toBe(false)
  })

  it('retorna resultado da função executada', async () => {
    const { result } = renderHook(() => useAsyncAction())
    let value: string | undefined
    await act(async () => {
      value = await result.current.execute(() => Promise.resolve('resultado'))
    })
    expect(value).toBe('resultado')
  })
})
