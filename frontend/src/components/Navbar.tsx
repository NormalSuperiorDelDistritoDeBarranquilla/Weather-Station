import { Bell, Menu, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useAlerts } from '../hooks/useAlerts'
import { formatDateTime } from '../utils/format'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth()
  const { data: alertsData } = useAlerts()
  const navigate = useNavigate()
  const [isAlertsOpen, setIsAlertsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const highestSeverity = alertsData?.highest_severity
  const alertTone =
    highestSeverity === 'critical'
      ? 'bell-important border-rose-400/40 bg-rose-400/15 text-rose-100'
      : highestSeverity === 'warning'
        ? 'bell-important border-orange-400/40 bg-orange-400/15 text-orange-100'
        : highestSeverity === 'advisory'
          ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
          : 'border-white/10 bg-white/5 text-slate-300'

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-white/10 p-2 text-slate-200 lg:hidden"
            onClick={onMenuClick}
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/65">Centro de monitoreo</p>
            <h2 className="font-display text-2xl text-white">M1K1U Mission Console</h2>
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            {user?.username ?? 'admin'}
          </div>
          <button
            type="button"
            className={`relative hidden rounded-2xl border p-2 sm:flex ${alertTone}`}
            onClick={() => setIsAlertsOpen((current) => !current)}
            aria-label="Abrir alertas"
          >
            <Bell className="h-4 w-4" />
            {alertsData?.total_alerts ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1 text-[11px] font-bold text-slate-950">
                {alertsData.total_alerts}
              </span>
            ) : null}
          </button>
          <button type="button" className="button-secondary !px-4 !py-2 text-sm" onClick={handleLogout}>
            Cerrar sesion
          </button>

          {isAlertsOpen ? (
            <div className="absolute right-20 top-16 z-30 hidden w-[28rem] rounded-[1.75rem] border border-white/10 bg-[#060c18] p-4 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:block">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Alertas actuales</p>
                  <h3 className="mt-2 font-display text-2xl text-white">
                    {alertsData?.total_alerts ? `${alertsData.total_alerts} activas` : 'Sin alertas'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300"
                  onClick={() => setIsAlertsOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-3">
                {alertsData?.alerts.length ? (
                  alertsData.alerts.slice(0, 3).map((alert) => (
                    <div key={alert.code} className="rounded-[1.5rem] border border-white/10 bg-[#151c2c] p-4">
                      <div className="flex items-start gap-3">
                        <TriangleAlert className="mt-0.5 h-4 w-4 text-cyan-200" />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-white">{alert.title}</p>
                          <p className="text-sm leading-6 text-slate-300">{alert.message}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(alert.triggered_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-emerald-400/20 bg-[#0d241d] p-4 text-sm text-emerald-100">
                    Sin alertas activas con los criterios actuales.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
