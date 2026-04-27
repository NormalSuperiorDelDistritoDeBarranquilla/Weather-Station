import { AlertTriangle, BellRing, ShieldAlert } from 'lucide-react'

import type { AlertSeverity, SensorAlert } from '../types/api'
import { formatDateTime, formatNumber } from '../utils/format'

interface AlertsPanelProps {
  alerts: SensorAlert[]
  compact?: boolean
  title?: string
}

const severityStyles: Record<AlertSeverity, string> = {
  advisory: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  warning: 'border-orange-400/30 bg-orange-400/10 text-orange-100',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-100',
}

const severityLabels: Record<AlertSeverity, string> = {
  advisory: 'Advisory',
  warning: 'Warning',
  critical: 'Critical',
}

export function AlertsPanel({ alerts, compact = false, title = 'Alertas activas' }: AlertsPanelProps) {
  const visibleAlerts = compact ? alerts.slice(0, 3) : alerts

  return (
    <section className="apple-surface overflow-hidden rounded-3xl border">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#060c18] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-cyan-200">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-2xl text-white">{title}</h3>
            <p className="text-sm text-slate-300">
              {alerts.length > 0
                ? `${alerts.length} regla(s) activas segun los criterios del motor de alertas.`
                : 'No hay alertas activas con los criterios actuales.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-[#0b1120] p-6">
        {visibleAlerts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-[#0d241d] p-5 text-sm text-emerald-100">
            Todo estable por ahora. La estación no reporta condiciones fuera de los umbrales definidos.
          </div>
        ) : null}

        {visibleAlerts.map((alert) => (
          <article key={alert.code} className="rounded-[1.5rem] border border-white/10 bg-[#151c2c] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles[alert.severity]}`}>
                    {severityLabels[alert.severity]}
                  </span>
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{alert.sensor}</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{alert.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{alert.message}</p>
                </div>
              </div>

              <div className="flex min-w-56 flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-[#0a1020] p-4 text-sm">
                <div className="flex items-center gap-2 text-cyan-200">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="font-semibold text-white">
                    {alert.current_value !== null ? `${formatNumber(alert.current_value, 1)} ${alert.unit ?? ''}`.trim() : 'Sin valor'}
                  </span>
                </div>
                <p className="text-slate-300">Umbral: {alert.threshold}</p>
                <p className="text-slate-400">Detectado: {formatDateTime(alert.triggered_at)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-[#0b1a26] p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-cyan-200" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">Accion sugerida</p>
                  <p className="text-sm leading-6 text-slate-300">{alert.recommendation}</p>
                  {!compact ? (
                    <p className="text-xs text-slate-400">
                      Criterio: {alert.source}{' '}
                      {alert.source_url ? (
                        <a href={alert.source_url} target="_blank" rel="noreferrer" className="text-cyan-200 hover:text-cyan-100">
                          ver fuente
                        </a>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
