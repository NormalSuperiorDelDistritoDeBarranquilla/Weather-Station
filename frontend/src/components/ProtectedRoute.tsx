import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="panel flex items-center gap-3 px-6 py-4 text-sm text-cyan-100">
          <span className="h-2 w-2 animate-ping rounded-full bg-cyan-300" />
          Verificando credenciales seguras...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
