import { useState, useCallback } from 'react'

interface AsyncActionState {
  working: boolean
  error: string | null
}

export function useAsyncAction() {
  const [state, setState] = useState<AsyncActionState>({ working: false, error: null })

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    setState({ working: true, error: null })
    try {
      const result = await fn()
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado.'
      setState(s => ({ ...s, error: message }))
      return undefined
    } finally {
      setState(s => ({ ...s, working: false }))
    }
  }, [])

  return { ...state, execute }
}
