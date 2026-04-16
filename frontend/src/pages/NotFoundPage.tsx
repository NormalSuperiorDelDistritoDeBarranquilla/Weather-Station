import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-xl p-10 text-center">
        <span className="pill">404</span>
        <h1 className="mt-6 font-display text-5xl text-white">Ruta no encontrada</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          La vista solicitada no existe dentro del centro de monitoreo M1K1U.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="button-primary">
            Ir al inicio
          </Link>
          <Link to="/dashboard" className="button-secondary">
            Abrir dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
