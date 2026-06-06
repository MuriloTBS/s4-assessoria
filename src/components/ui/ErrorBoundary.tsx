import { Component, type ReactNode, type ErrorInfo } from 'react'
import * as Sentry from '@sentry/react'
import Button from './Button'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <p className="text-red-400 text-lg font-semibold mb-2">Algo deu errado</p>
            <p className="text-[#8a9bb0] text-sm mb-6">{this.state.error.message}</p>
            <Button onClick={() => window.location.reload()}>Recarregar página</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
