import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChartNoAxesColumn,
  Cpu,
  Route,
  ShieldAlert,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link, Navigate, useParams } from 'react-router-dom'

import { StatusBadge } from '../components/StatusBadge'
import { sensorDataService } from '../services/sensorDataService'
import type { HistoryRange, MetricKey, SensorIssueSeverity } from '../types/api'
import { formatDateTime, formatMetricValue, formatNumber } from '../utils/format'
import { metricUI } from '../utils/metricConfig'

const metricKeys = Object.keys(metricUI) as MetricKey[]
const ranges: HistoryRange[] = ['24h', '7d', '30d', 'all']
const rangeLabels: Record<HistoryRange, string> = {
  '24h': '24h',
  '7d': '7 dias',
  '30d': '30 dias',
  all: 'Todo',
}

function issueTone(severity: SensorIssueSeverity): 'info' | 'warning' | 'danger' {
  if (severity === 'critical') return 'danger'
  if (severity === 'warning') return 'warning'
  return 'info'
}

export function SensorDetailPage() {
  const { metricKey } = useParams<{ metricKey: MetricKey }>()
  const [range, setRange] = useState<HistoryRange>('24h')

  if (!metricKey || !metricKeys.includes(metricKey)) {
    return <Navigate to="/overview" replace />
  }

  const metric = metricUI[metricKey]
  const detailQuery = useQuery({
    queryKey: ['sensor-detail', metricKey, range],
    queryFn: () => sensorDataService.getSensorDetail(metricKey, { range }),
    refetchInterval: 15_000,
  })

  const detail = detailQuery.data
  const continuity = detail?.recent_packets.slice().reverse() ?? []
  const integrityData = detail
    ? [
        { label: 'Validos', value: detail.valid_samples },
        { label: 'Faltantes', value: detail.missing_samples },
      ]
    : []

  const tooltipFormatter = (value: number | string | readonly (number | string)[] | undefined) =>
    value == null || Number.isNaN(Number(value)) ? 'Sin dato' : formatMetricValue(Number(value), metric.unit)
  const tooltipLabelFormatter = (value: unknown) => (typeof value === 'string' ? formatDateTime(value) : '')

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className={`panel relative overflow-hidden bg-gradient-to-br ${metric.accent} p-8`}>
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <Link to="/overview" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Volver al dashboard
            </Link>
            <span className="mt-6 inline-flex rounded-full border border-white/10 bg-slate-950/30 px-4 py-1 text-xs uppercase tracking-[0.28em] text-cyan-100">
              Sensor individual
            </span>
            <h1 className="mt-6 font-display text-4xl text-white sm:text-5xl">{detail?.label ?? metric.label}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{detail?.description ?? 'Cargando diagnostico del sensor.'}</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">{detail?.narrative ?? 'Sincronizando diagnostico operativo...'}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <StatusBadge
                label={detail?.connection_label ?? 'Sincronizando'}
                tone={detail?.connection_state === 'online' ? 'success' : 'danger'}
              />
              <StatusBadge
                label={detail?.current_packet_has_value ? detail.latest_status_label : 'Sin dato'}
                tone={detail?.current_packet_has_value ? 'info' : 'warning'}
              />
              <StatusBadge label={`Estacion ${detail?.station_id ?? '--'}`} tone="neutral" />
            </div>
          </div>
        </article>

        <article className="panel-soft p-6">
          <div className="flex flex-wrap gap-3">
            {ranges.map((option) => (
              <button
                key={option}
                type="button"
                className={range === option ? 'button-primary !px-4 !py-2' : 'button-secondary !px-4 !py-2'}
                onClick={() => setRange(option)}
              >
                {rangeLabels[option]}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-cyan-200">
                <Activity className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.24em]">Ultimo paquete</span>
              </div>
              <p className="mt-4 font-display text-3xl text-white">{formatDateTime(detail?.last_packet_at)}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-emerald-200">
                <Cpu className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.24em]">Ultima lectura valida</span>
              </div>
              <p className="mt-4 font-display text-3xl text-white">{formatDateTime(detail?.last_valid_at)}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-6">
          <div className="flex items-center gap-3 text-cyan-200">
            <Activity className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Lectura actual</span>
          </div>
          <p className="mt-4 font-display text-4xl text-white">
            {detail?.station_active
              ? detail?.latest_value == null
                ? 'Sin dato'
                : formatMetricValue(detail.latest_value, metric.unit)
              : 'No hay conexion'}
          </p>
          <p className="mt-3 text-sm text-slate-300">
            {detail?.station_active
              ? detail?.current_packet_has_value
                ? 'Valor recibido correctamente en el ultimo paquete.'
                : 'El ultimo paquete llego sin este campo.'
              : 'La estacion esta fuera de la ventana operativa.'}
          </p>
        </article>

        <article className="panel p-6">
          <div className="flex items-center gap-3 text-emerald-200">
            <Route className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Integridad del flujo</span>
          </div>
          <p className="mt-4 font-display text-4xl text-white">{formatNumber((detail?.completeness_ratio ?? 0) * 100, 1)}%</p>
          <p className="mt-3 text-sm text-slate-300">
            {detail?.valid_samples ?? 0} validos de {detail?.samples_in_range ?? 0} paquetes en el rango.
          </p>
        </article>

        <article className="panel p-6">
          <div className="flex items-center gap-3 text-violet-200">
            <ChartNoAxesColumn className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Ventana analizada</span>
          </div>
          <p className="mt-4 font-display text-4xl text-white">{rangeLabels[range]}</p>
          <p className="mt-3 text-sm text-slate-300">
            Min {formatMetricValue(detail?.min_value, metric.unit)} | Max {formatMetricValue(detail?.max_value, metric.unit)}
          </p>
        </article>

        <article className="panel p-6">
          <div className="flex items-center gap-3 text-amber-200">
            <ShieldAlert className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Fallas detectadas</span>
          </div>
          <p className="mt-4 font-display text-4xl text-white">{detail?.issues.length ?? 0}</p>
          <p className="mt-3 text-sm text-slate-300">
            {detail?.flatline_detected
              ? `Flatline activo en ${detail.flatline_length} paquetes consecutivos.`
              : `${detail?.missing_samples ?? 0} paquetes sin lectura para este sensor.`}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel p-6">
          <div className="flex items-center gap-3 text-cyan-200">
            <Activity className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Serie temporal del sensor</span>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            La gráfica deja huecos cuando el paquete llega sin esta métrica. Así puedes diferenciar una caída de
            conexion general de una falla puntual del sensor.
          </p>
          <div className="mt-6 h-[22rem]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={detail?.series ?? []}>
                <defs>
                  <linearGradient id={`${metricKey}-detail-gradient`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.chartStroke} stopOpacity={0.75} />
                    <stop offset="95%" stopColor={metric.chartStroke} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.10)" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} stroke="rgba(203, 213, 225, 0.55)" />
                <YAxis stroke="rgba(203, 213, 225, 0.55)" />
                <Tooltip formatter={tooltipFormatter} labelFormatter={tooltipLabelFormatter} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={metric.chartStroke}
                  fill={`url(#${metricKey}-detail-gradient)`}
                  strokeWidth={2.6}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel-soft p-6">
          <div className="flex items-center gap-3 text-violet-200">
            <ChartNoAxesColumn className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Calidad de llegada</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Este bloque resume cuantas muestras llegaron bien y cuantas entraron incompletas para este sensor.
          </p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={integrityData}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.10)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(203, 213, 225, 0.55)" />
                <YAxis stroke="rgba(203, 213, 225, 0.55)" />
                <Tooltip formatter={(value) => formatNumber(Number(value), 0)} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={metric.chartStroke} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Promedio del rango</p>
            <p className="mt-3 font-display text-3xl text-white">{formatMetricValue(detail?.avg_value, metric.unit)}</p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="panel p-6">
          <div className="flex items-center gap-3 text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Diagnostico operativo</span>
          </div>
          <div className="mt-6 space-y-4">
            {(detail?.issues.length ?? 0) > 0 ? (
              detail?.issues.map((issue) => (
                <div key={issue.code} className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-white">{issue.title}</h3>
                    <StatusBadge label={issue.severity} tone={issueTone(issue.severity)} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{issue.message}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Detectado: {formatDateTime(issue.detected_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-400/10 p-5">
                <h3 className="font-semibold text-white">Sin fallas relevantes</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  El flujo de este sensor se mantiene estable dentro del rango consultado.
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="panel-soft p-6">
          <div className="flex items-center gap-3 text-cyan-200">
            <Route className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Continuidad del canal</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Cada bloque representa un paquete reciente. Verde significa dato presente; rojo, paquete recibido sin este
            sensor.
          </p>
          <div className="mt-6 grid grid-cols-6 gap-2 sm:grid-cols-12">
            {continuity.map((packet) => (
              <div
                key={packet.timestamp}
                className={`h-9 rounded-xl border ${
                  packet.has_value
                    ? 'border-emerald-300/30 bg-emerald-400/25'
                    : 'border-rose-300/30 bg-rose-400/25'
                }`}
                title={`${formatDateTime(packet.timestamp)} | ${packet.has_value ? 'Dato presente' : 'Dato faltante'}`}
              />
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {detail?.recent_packets.map((packet) => (
              <div key={packet.timestamp} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatDateTime(packet.timestamp)}</p>
                    <p className="mt-1 text-sm text-slate-400">Hace {formatNumber(packet.age_minutes, 1)} min</p>
                  </div>
                  <StatusBadge label={packet.has_value ? 'Recibido' : 'Faltante'} tone={packet.has_value ? 'success' : 'danger'} />
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  {packet.has_value ? formatMetricValue(packet.value, metric.unit) : 'El paquete llego sin valor para este sensor.'}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
