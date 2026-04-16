import { Navigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export function AuthRedirectRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="panel px-6 py-4 text-sm text-slate-200">Cargando acceso seguro...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
