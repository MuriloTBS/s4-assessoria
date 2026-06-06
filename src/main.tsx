import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/sentry'
import './index.css'
import './styles/print.css'
import App from './App'
import ErrorBoundary from './components/ui/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
