import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ChartSpline, Clock3, Database, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AlertsPanel } from '../components/AlertsPanel'
import { StatusBadge } from '../components/StatusBadge'
import { useAlerts } from '../hooks/useAlerts'
import { sensorDataService } from '../services/sensorDataService'
import { formatDateTime, formatMetricValue, formatNumber } from '../utils/format'
import { metricUI } from '../utils/metricConfig'

const metricKeys = Object.keys(metricUI) as Array<keyof typeof metricUI>

export function ConsoleHomePage() {
  const alertsQuery = useAlerts()
  const latestQuery = useQuery({
    queryKey: ['home-latest-sensor-data'],
    queryFn: () => sensorDataService.getLatest(),
    refetchInterval: 15_000,
  })

  const statsQuery = useQuery({
    queryKey: ['home-sensor-stats', '24h'],
    queryFn: () => sensorDataService.getStats({ range: '24h' }),
    refetchInterval: 15_000,
  })

  const latest = latestQuery.data
  const stats = statsQuery.data

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="panel relative overflow-hidden p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative">
            <span className="pill">Inicio operativo</span>
            <h1 className="mt-6 font-display text-4xl text-white sm:text-5xl">
              Bienvenido al centro de monitoreo de M1K1U.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Esta vista funciona como portada interna del sistema: te ubica, resume el estado de la estacion y te
              lleva rapido al dashboard analitico, graficas, registros historicos y diagnosticos por sensor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StatusBadge label={latest?.active_label ?? 'Sin conexion'} tone={latest?.active ? 'success' : 'danger'} />
              <StatusBadge label={`Estacion ${latest?.station_id ?? '--'}`} tone="info" />
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/overview" className="button-primary">
                Abrir dashboard de datos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/charts" className="button-secondary">
                Ver graficas historicas
              </Link>
            </div>
          </div>
        </article>

        <article className="panel-soft grid gap-4 p-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 text-cyan-200">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.24em]">Ultimo reporte</span>
            </div>
            <p className="mt-4 font-display text-3xl text-white">{formatDateTime(latest?.last_seen)}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 text-emerald-200">
              <Database className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.24em]">Registros 24h</span>
            </div>
            <p className="mt-4 font-display text-3xl text-white">{formatNumber(stats?.total_records, 0)}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 text-violet-200">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.24em]">Sesion</span>
            </div>
            <p className="mt-4 font-display text-3xl text-white">Protegida</p>
          </div>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
        {metricKeys.map((metricKey) => {
          const metric = metricUI[metricKey]
          const value = latest?.latest?.[metricKey]
          const isOnline = latest?.active ?? false
          const headline = !isOnline ? 'No hay conexion' : value == null ? 'Sin dato' : formatMetricValue(value, metric.unit)

          return (
            <Link
              key={metricKey}
              to={`/sensors/${metricKey}`}
              className="panel block p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
              <p className="mt-4 font-display text-4xl text-white">{headline}</p>
              <p className="mt-3 text-sm text-slate-300">
                {!isOnline
                  ? 'La estacion no esta reportando dentro de la ventana operativa.'
                  : value == null
                    ? 'El ultimo paquete llego sin esta lectura. Abre el diagnostico del sensor para revisarlo.'
                    : 'Lectura reciente disponible. Abre la vista individual para estudiar la serie y sus fallas.'}
              </p>
            </Link>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="panel-soft p-6">
          <div className="flex items-center gap-3 text-cyan-200">
            <ChartSpline className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Dashboard</span>
          </div>
          <h2 className="mt-5 font-display text-3xl text-white">Panel de datos</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Accede a una vista mas intensa en datos con barras, radar, comparativas y visualizaciones circulares.
          </p>
          <Link to="/overview" className="mt-6 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            Ir al dashboard detallado
          </Link>
        </article>

        <article className="panel-soft p-6">
          <div className="flex items-center gap-3 text-emerald-200">
            <Database className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Historial</span>
          </div>
          <h2 className="mt-5 font-display text-3xl text-white">Registros trazables</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Consulta lecturas individuales, filtra por rango y revisa la persistencia completa de la plataforma.
          </p>
          <Link to="/history" className="mt-6 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            Abrir historial
          </Link>
        </article>

        <article className="panel-soft p-6">
          <div className="flex items-center gap-3 text-violet-200">
            <ChartSpline className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.24em]">Graficas</span>
          </div>
          <h2 className="mt-5 font-display text-3xl text-white">Series historicas</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Observa la evolucion temporal de cada variable y cambia el rango de consulta en segundos.
          </p>
          <Link to="/charts" className="mt-6 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100">
            Abrir graficas
          </Link>
        </article>
      </section>

      <AlertsPanel alerts={alertsQuery.data?.alerts ?? []} compact title="Alertas del sistema" />
    </>
  )
}
