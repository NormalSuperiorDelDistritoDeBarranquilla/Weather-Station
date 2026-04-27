import { Link } from 'react-router-dom'
import { ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'

import { metricUI } from '../utils/metricConfig'
import { formatMetricValue, formatRelativeDelta } from '../utils/format'
import type { MetricKey, MetricState, MetricStats } from '../types/api'
import { StatusBadge } from './StatusBadge'

interface MetricCardProps {
  metricKey: MetricKey
  state: MetricState
  stats?: MetricStats
  trend: Array<{ timestamp: string; value: number | null }>
  stationActive: boolean
}

function toneFromStatus(status: string): 'success' | 'warning' | 'danger' | 'neutral' | 'info' {
  if (status === 'good') return 'success'
  if (status === 'moderate' || status === 'normal') return 'info'
  if (status === 'poor' || status === 'high') return 'warning'
  if (status === 'low') return 'danger'
  return 'neutral'
}

export function MetricCard({ metricKey, state, stats, trend, stationActive }: MetricCardProps) {
  const config = metricUI[metricKey]
  const Icon = config.icon
  const hasValue = state.value !== null && state.value !== undefined
  const hasTrend = trend.some((point) => point.value !== null && point.value !== undefined)
  const displayValue = !stationActive ? 'No hay conexión' : hasValue ? formatMetricValue(state.value, config.unit) : 'Sin dato'
  const badgeLabel = !stationActive ? 'Sin conexión' : hasValue ? state.status_label : 'Falla de lectura'
  const badgeTone = !stationActive ? 'danger' : hasValue ? toneFromStatus(state.status) : 'warning'
  const supportText = !stationActive
    ? 'La estación no está reportando dentro de la ventana operativa.'
    : hasValue
      ? `Promedio: ${formatMetricValue(stats?.avg, config.unit)}`
      : 'El último paquete llegó sin este campo o la lectura del sensor falló.'
  const formatTooltipValue = (value: number | string | ReadonlyArray<number | string> | undefined) =>
    formatMetricValue(typeof value === 'number' ? value : Number(value), config.unit)
  const formatTooltipLabel = (value: unknown) =>
    typeof value === 'string' ? new Date(value).toLocaleString('es-CO') : ''

  return (
    <Link to={`/sensors/${metricKey}`} className="group block">
      <article
        className={`panel overflow-hidden bg-gradient-to-br ${config.accent} p-6 transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300/75">{config.label}</p>
            <h3 className={`mt-4 font-display text-4xl text-white ${!hasValue || !stationActive ? 'text-3xl' : 'metric-value'}`}>
              {displayValue}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge label={badgeLabel} tone={badgeTone} />
          <span className="text-sm text-slate-300">{supportText}</span>
        </div>

        <div className="mt-6 h-20">
          {hasTrend ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id={`${metricKey}-gradient`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.chartStroke} stopOpacity={0.75} />
                    <stop offset="95%" stopColor={config.chartStroke} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Tooltip formatter={formatTooltipValue} labelFormatter={formatTooltipLabel} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={config.chartStroke}
                  fill={`url(#${metricKey}-gradient)`}
                  strokeWidth={2.4}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-950/25 text-sm text-slate-400">
              Sin serie valida para este sensor
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <span>{stationActive ? 'Rango 24h' : 'Esperando nueva telemetria'}</span>
          <span>{stationActive && hasValue ? formatRelativeDelta(stats?.delta_from_average, config.unit) : 'Abrir diagnostico'}</span>
        </div>
      </article>
    </Link>
  )
}
