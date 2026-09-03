import { StoreProvider, useStore } from './lib/store.jsx'
import { Spinner } from './components/ui.jsx'
import Onboarding from './views/Onboarding.jsx'
import Dashboard from './views/Dashboard.jsx'

function Root() {
  const { coupleId, loading } = useStore()

  if (loading) {
    return (
      <div className="bg-paper flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-3 animate-bounce text-6xl">💕</div>
          <Spinner label="正在打开你们的手账…" />
        </div>
      </div>
    )
  }

  if (!coupleId) return <Onboarding />

  return <Dashboard />
}

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  )
}
