import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Gauge, History, Home, Info, LineChart, Radio, WifiOff, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAlerts } from '../hooks/useAlerts'
import { sensorDataService } from '../services/sensorDataService'
import { formatDateTime } from '../utils/format'

const links = [
  { to: '/dashboard', label: 'Inicio', icon: Home },
  { to: '/overview', label: 'Dashboard', icon: Gauge },
  { to: '/charts', label: 'Graficas', icon: LineChart },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/project-about', label: 'Acerca', icon: Info },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const latestQuery = useQuery({
    queryKey: ['sidebar-station-latest'],
    queryFn: () => sensorDataService.getLatest(),
    refetchInterval: 15_000,
  })
  const alertsQuery = useAlerts()

  const latest = latestQuery.data
  const alertsCount = alertsQuery.data?.total_alerts ?? 0
  const hasConnection = Boolean(latest?.active)
  const statusTitle = latestQuery.isLoading
    ? 'Sincronizando estado'
    : hasConnection
      ? 'Estacion activa'
      : 'No hay conexion'
  const statusDescription = latestQuery.isLoading
    ? 'Consultando el estado operativo de la estacion y el ultimo paquete recibido.'
    : latest?.last_seen
      ? `Ultimo paquete ${formatDateTime(latest.last_seen)}. ${hasConnection ? 'La estacion sigue reportando.' : 'La ventana operativa expiro y se espera un nuevo envio desde Arduino o ESP32.'}`
      : 'Todavia no ha llegado ninguna lectura valida. El backend queda a la espera del primer POST del microcontrolador.'
  const StatusIcon = hasConnection ? Radio : WifiOff

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-white/10 bg-slate-950/85 p-5 backdrop-blur-xl transition duration-300 lg:w-80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="panel-soft flex h-full flex-col gap-8 p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="pill">M1K1U Control Grid</span>
              <h1 className="mt-4 font-display text-3xl text-white">M1K1U</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Centro de monitoreo ambiental para estaciones conectadas.
              </p>
            </div>
            <button
              type="button"
              className="rounded-2xl border border-white/10 p-2 text-slate-300 lg:hidden"
              onClick={onClose}
              aria-label="Cerrar menu lateral"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400/15 to-emerald-400/10 text-white shadow-neon'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>

          <div
            className={`mt-auto rounded-[1.75rem] border p-4 ${
              hasConnection ? 'border-cyan-300/15 bg-cyan-400/10' : 'border-rose-300/15 bg-rose-400/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/45 text-white">
                <StatusIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">Estado operativo</p>
                <p className="mt-1 font-display text-2xl text-white">{statusTitle}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{statusDescription}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-200">
                {latest?.station_id ?? 'Sin estacion'}
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-200">
                {latest?.active_label ?? 'Esperando telemetria'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs text-slate-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                {alertsCount} alertas
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
