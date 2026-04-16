import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, ArrowRightLeft, ChartColumnBig, Orbit, Radar as RadarIcon } from 'lucide-react'

import { AlertsPanel } from '../components/AlertsPanel'
import { MetricCard } from '../components/MetricCard'
import { StatusBadge } from '../components/StatusBadge'
import { useAlerts } from '../hooks/useAlerts'
import { sensorDataService } from '../services/sensorDataService'
import type { MetricKey } from '../types/api'
import { formatDateTime, formatMetricValue, formatNumber, formatRelativeDelta } from '../utils/format'
import { metricUI } from '../utils/metricConfig'

const metricKeys = Object.keys(metricUI) as MetricKey[]
const statusColors = ['#22d3ee', '#34d399', '#f59e0b', '#a855f7']

function normalizeMetric(metricKey: MetricKey, value: number | null | undefined) {
  if (value === null || value === undefined) {
    return 0
  }

  if (metricKey === 'temperature') {
    return Math.max(0, Math.min(100, (value / 45) * 100))
  }

  if (metricKey === 'pressure') {
    return Math.max(0, Math.min(100, ((value - 980) / 70) * 100))
  }

  if (metricKey === 'altitude') {
    return Math.max(0, Math.min(100, (value / 100) * 100))
  }

  if (metricKey === 'luminosity') {
    return Math.max(0, Math.min(100, (value / 20000) * 100))
  }

  if (metricKey === 'rain_analog') {
    return Math.max(0, Math.min(100, 100 - (value / 4095) * 100))
  }

  if (metricKey === 'wind_speed') {
    return Math.max(0, Math.min(100, (value / 80) * 100))
  }

  return 0
}

export function DashboardPage() {
  const alertsQuery = useAlerts()
  const latestQuery = useQuery({
    queryKey: ['latest-sensor-data'],
    queryFn: () => sensorDataService.getLatest(),
    refetchInterval: 15_000,
  })

  const statsQuery = useQuery({
    queryKey: ['sensor-stats', '24h'],
    queryFn: () => sensorDataService.getStats({ range: '24h' }),
    refetchInterval: 15_000,
  })

  const trendQuery = useQuery({
    queryKey: ['sensor-history-dashboard', '24h'],
    queryFn: () => sensorDataService.getHistory({ range: '24h', page: 1, pageSize: 48 }),
    refetchInterval: 15_000,
  })

  const trendByMetric = useMemo(() => {
    const ascending = [...(trendQuery.data?.items ?? [])].reverse()

    return metricKeys.reduce(
      (collection, key) => {
        collection[key] = ascending.map((item) => ({
          timestamp: item.timestamp,
          value: item[key],
        }))
        return collection
      },
      {} as Record<MetricKey, Array<{ timestamp: string; value: number | null }>>,
    )
  }, [trendQuery.data?.items])

  const latest = latestQuery.data
  const stats = statsQuery.data
  const rainDigitalStatus = latest?.latest?.rain_digital ?? 'Sin dato'

  const comparisonData = useMemo(
    () =>
      metricKeys.map((metricKey) => ({
        name: metricUI[metricKey].label,
        actual: stats?.metrics[metricKey]?.current ?? 0,
        promedio: stats?.metrics[metricKey]?.avg ?? 0,
      })),
    [stats],
  )

  const radialData = useMemo(
    () =>
      metricKeys.map((metricKey) => ({
        name: metricUI[metricKey].label,
        metricKey,
        fill: metricUI[metricKey].chartStroke,
        score: normalizeMetric(metricKey, stats?.metrics[metricKey]?.current),
      })),
    [stats],
  )

  const radarData = useMemo(
    () =>
      metricKeys.map((metricKey) => ({
        metric: metricUI[metricKey].label,
        actual: normalizeMetric(metricKey, stats?.metrics[metricKey]?.current),
        promedio: normalizeMetric(metricKey, stats?.metrics[metricKey]?.avg),
      })),
    [stats],
  )

  const statusDistribution = useMemo(() => {
    const grouped = metricKeys.reduce<Record<string, number>>((accumulator, metricKey) => {
      const label = latest?.metric_states[metricKey]?.status_label ?? 'Sin datos'
      accumulator[label] = (accumulator[label] ?? 0) + 1
      return accumulator
    }, {})

    return Object.entries(grouped).map(([name, value], index) => ({
      name,
      value,
      color: statusColors[index % statusColors.length],
    }))
  }, [latest])

  const tooltipValueFormatter = (value: number | string | ReadonlyArray<number | string> | undefined) =>
    formatNumber(typeof value === 'number' ? value : Number(value), 1)
  const tooltipLabelFormatter = (value: unknown) => (typeof value === 'string' ? value : '')

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel relative overflow-hidden p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <span className="pill">Dashboard de datos</span>
            <h1 className="mt-6 font-display text-4xl text-white sm:text-5xl">
              Inicio analitico para lecturas, patrones y comparativas.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Esta pantalla es el corazon de datos del sistema: combina estado operativo, metricas recientes y varios
              tipos de graficas para interpretar la actividad de la estacion sin salir del panel principal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StatusBadge
                label={latest?.active_label ?? 'Sin conexion'}
                tone={latest?.active ? 'success' : 'danger'}
              />
              <StatusBadge label={`Estacion ${latest?.station_id ?? '--'}`} tone="info" />
              <StatusBadge label={`${stats?.total_records ?? 0} muestras en 24h`} tone="neutral" />
              <StatusBadge label={`Lluvia digital: ${rainDigitalStatus}`} tone={rainDigitalStatus === 'Lluvia' ? 'warning' : 'neutral'} />
            </div>
          </div>
        </article>

        <article className="panel-soft overflow-hidden p-6">
          <div className="mb-4 flex items-center gap-3 text-violet-200">
            <Orbit className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Visualizacion circular</span>
          </div>
          <div className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={radialData}
                innerRadius="38%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
                barSize={16}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="score" background cornerRadius={14} />
              </RadialBarChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/95 shadow-[0_18px_40px_rgba(2,6,23,0.48)]">
                <span className="text-[10px] uppercase tracking-[0.32em] text-slate-400">Score</span>
                <span className="mt-2 font-display text-3xl font-semibold leading-none text-white">
                  {formatNumber(
                    radialData.reduce((accumulator, item) => accumulator + item.score, 0) / Math.max(radialData.length, 1),
                    1,
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {radialData.map((item) => (
              <div key={item.metricKey} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: item.fill }}>
                    {formatNumber(item.score, 0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
        {metricKeys.map((metricKey) => (
          <MetricCard
            key={metricKey}
            metricKey={metricKey}
            state={latest?.metric_states[metricKey] ?? {
              key: metricKey,
              label: metricUI[metricKey].label,
              unit: metricUI[metricKey].unit,
              value: null,
              status: 'unknown',
              status_label: 'Sin datos',
              description: '',
            }}
            stats={stats?.metrics[metricKey]}
            trend={trendByMetric[metricKey] ?? []}
            stationActive={latest?.active ?? false}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <article className="panel p-6">
          <div className="flex items-center gap-3 text-cyan-200">
            <Activity className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Estado digital de lluvia</span>
          </div>
          <p className="mt-4 font-display text-4xl text-white">{rainDigitalStatus}</p>
          <p className="mt-3 text-sm text-slate-300">
            Este dato viene directamente del pin digital del sensor MH-RD y se muestra fuera de las graficas porque es un estado discreto, no una serie numerica.
          </p>
        </article>

        <article className="panel-soft p-6">
          <span className="pill">Set maestro del Arduino</span>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sensores sincronizados</p>
              <p className="mt-3 font-display text-3xl text-white">{metricKeys.length + 1}</p>
              <p className="mt-2 text-sm text-slate-300">Incluye la senal digital de lluvia como dato operativo visible.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Origen de contrato</p>
              <p className="mt-3 font-display text-3xl text-white">ESP32</p>
              <p className="mt-2 text-sm text-slate-300">La web ya no dibuja variables que no existan en el firmware maestro.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ultimo paquete</p>
              <p className="mt-3 font-display text-3xl text-white">{formatDateTime(latest?.last_seen)}</p>
              <p className="mt-2 text-sm text-slate-300">Cada sincronizacion refleja exactamente el set de datos del microcontrolador.</p>
            </div>
          </div>
        </article>
      </section>

      <AlertsPanel alerts={alertsQuery.data?.alerts ?? []} title="Alertas derivadas del monitoreo" />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="panel p-6">
          <div className="flex items-center gap-3 text-cyan-200">
            <ChartColumnBig className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Comparativa en barras</span>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            El dashboard compara la lectura actual frente al promedio del rango para detectar desviaciones con rapidez.
          </p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.10)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(203, 213, 225, 0.55)" />
                <YAxis stroke="rgba(203, 213, 225, 0.55)" />
                <Tooltip formatter={tooltipValueFormatter} labelFormatter={tooltipLabelFormatter} />
                <Bar dataKey="actual" name="Actual" radius={[10, 10, 0, 0]} fill="#22d3ee" />
                <Bar dataKey="promedio" name="Promedio" radius={[10, 10, 0, 0]} fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel-soft p-6">
          <span className="pill">Resumen ejecutivo</span>
          <h2 className="mt-5 font-display text-3xl text-white">Estado y desviacion</h2>
          <div className="mt-6 space-y-4">
            {metricKeys.map((metricKey) => {
              const metric = stats?.metrics[metricKey]
              return (
                <div key={metricKey} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{metricUI[metricKey].label}</h3>
                    <StatusBadge
                      label={
                        !(latest?.active ?? false)
                          ? 'Sin conexion'
                          : latest?.metric_states[metricKey]?.value == null
                            ? 'Sin dato'
                            : latest?.metric_states[metricKey]?.status_label ?? 'Sin datos'
                      }
                      tone={
                        !(latest?.active ?? false)
                          ? 'danger'
                          : latest?.metric_states[metricKey]?.value == null
                            ? 'warning'
                            : 'info'
                      }
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-300">
                    <span>Actual: {formatMetricValue(metric?.current, metricUI[metricKey].unit)}</span>
                    <span>{formatRelativeDelta(metric?.delta_from_average, metricUI[metricKey].unit)}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Promedio {formatMetricValue(metric?.avg, metricUI[metricKey].unit)} | Min{' '}
                    {formatMetricValue(metric?.min, metricUI[metricKey].unit)} | Max{' '}
                    {formatMetricValue(metric?.max, metricUI[metricKey].unit)}
                  </p>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="panel p-6">
          <div className="flex items-center gap-3 text-emerald-200">
            <RadarIcon className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Perfil radar</span>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Lectura radar normalizada para comparar el perfil ambiental actual contra el promedio del periodo.
          </p>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.16)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <Radar dataKey="promedio" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.22} />
                <Radar dataKey="actual" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.28} />
                <Tooltip formatter={tooltipValueFormatter} labelFormatter={tooltipLabelFormatter} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel-soft p-6">
          <div className="flex items-center gap-3 text-cyan-200">
            <ArrowRightLeft className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Distribucion de estados</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipValueFormatter} labelFormatter={tooltipLabelFormatter} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3 text-cyan-200">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-semibold text-white">Ultimo dato recibido</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{formatDateTime(latest?.last_seen)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Estado de estacion: {latest?.active ? 'activa y reportando' : 'sin reporte reciente'}.
                </p>
              </div>

              {statusDistribution.map((entry) => (
                <div key={entry.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-white">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{entry.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </>
  )
}
