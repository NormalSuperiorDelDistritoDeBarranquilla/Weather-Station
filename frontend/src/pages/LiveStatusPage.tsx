import { ArrowRight, Clock3, RadioTower, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { PublicHeader } from '../components/PublicHeader'
import { StatusBadge } from '../components/StatusBadge'
import { publicLocation } from '../data/publicSite'
import { usePublicLanding } from '../hooks/usePublicLanding'
import type { MetricKey } from '../types/api'
import { formatDateTime, formatMetricValue } from '../utils/format'
import { metricUI } from '../utils/metricConfig'

const metricKeys = Object.keys(metricUI) as MetricKey[]

export function LiveStatusPage() {
  const publicLandingQuery = usePublicLanding()
  const publicLanding = publicLandingQuery.data
  const latest = publicLanding?.latest
  const stats = publicLanding?.stats_24h
  const location = publicLanding?.location ?? publicLocation
  const isStationOnline = latest?.active ?? false
  const rainDigitalStatus = latest?.latest?.rain_digital ?? 'Sin dato'

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-orb left-[-4rem] top-12 h-72 w-72 bg-cyan-400/15" />
      <div className="hero-orb right-[-6rem] top-28 h-80 w-80 bg-emerald-400/10" />

      <PublicHeader subtitle="Visor publico en tiempo real de la estacion meteorologica" />

      <main className="page-enter mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <article className="panel hero-sheen relative overflow-hidden p-8 sm:p-10">
            <span className="pill">Estado de la estacion</span>
            <div className="mt-6 flex flex-wrap gap-3">
              <StatusBadge label={isStationOnline ? 'Transmisión activa' : 'Sin conexión'} tone={isStationOnline ? 'success' : 'danger'} />
              <StatusBadge label={latest?.station_id ?? 'Sin estacion'} tone="neutral" />
              <StatusBadge label="Actualizacion cada 15 segundos" tone="info" />
            </div>

            <h1 className="mt-7 max-w-4xl font-display text-5xl leading-tight text-white sm:text-6xl">
              Estado publico, lectura actual y trazabilidad inmediata de la estacion.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Este apartado concentra la lectura visible del sistema: último paquete recibido, disponibilidad de cada
              sensor y actividad operativa general sin necesidad de iniciar sesion.
            </p>

            <div className="mt-8">
              <div className="apple-float-card rounded-[1.8rem] p-5 max-w-xs">
                <div className="flex items-center gap-3 text-emerald-200">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.24em]">Último paquete</span>
                </div>
                <p className="mt-4 font-display text-3xl text-white">{formatDateTime(latest?.last_seen)}</p>
                <p className="mt-3 text-sm text-slate-300">Fecha y hora real de la última transmisión procesada.</p>
              </div>
            </div>
          </article>

          <article
            className="immersive-photo-card min-h-[28rem] rounded-[2.2rem] border border-white/10 p-8"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(2,6,23,0.12) 0%, rgba(2,6,23,0.58) 45%, rgba(2,6,23,0.94) 100%), url(https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1600&q=80)',
            }}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="pill border-white/15 bg-slate-950/35 text-cyan-100">Lectura abierta</span>
                <h2 className="mt-6 max-w-lg font-display text-4xl text-white">Panel pensado para revisar la estacion incluso antes del login.</h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200/90">
                  Si la estación aún no transmite, el visor lo muestra tal cual. Si llega telemetría parcial, cada
                  variable queda marcada como disponible o sin dato.
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-2xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Origen</p>
                    <p className="mt-2 font-display text-2xl text-white">{location.neighborhood}</p>
                    <p className="mt-2 text-sm text-slate-300">{location.city}, {location.region}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Acceso completo</p>
                    <Link to="/login" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                      Ingresar al dashboard protegido
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {metricKeys.map((metricKey) => {
            const config = metricUI[metricKey]
            const state = latest?.metric_states[metricKey]
            const hasValue = state?.value !== null && state?.value !== undefined
            const statusTone = !isStationOnline ? 'danger' : hasValue ? 'info' : 'warning'

            return (
              <article key={metricKey} className={`panel overflow-hidden bg-gradient-to-br ${config.accent} p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-300/75">{config.label}</p>
                    <h3 className="mt-4 font-display text-4xl text-white">
                      {!isStationOnline
                        ? 'Sin conexión'
                        : hasValue
                          ? formatMetricValue(state?.value, config.unit)
                          : 'Sin dato'}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-white">
                    <config.icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <StatusBadge
                    label={!isStationOnline ? 'Sin conexión' : hasValue ? state?.status_label ?? 'Disponible' : 'Sin dato'}
                    tone={statusTone}
                  />
                  <span className="text-sm text-slate-300">
                    Promedio 24h {formatMetricValue(stats?.metrics[metricKey]?.avg, config.unit)}
                  </span>
                </div>

                <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-slate-950/30 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Min</p>
                      <p className="mt-2 text-white">{formatMetricValue(stats?.metrics[metricKey]?.min, config.unit)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Max</p>
                      <p className="mt-2 text-white">{formatMetricValue(stats?.metrics[metricKey]?.max, config.unit)}</p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article className="panel p-8">
            <div className="flex items-center gap-3 text-cyan-200">
              <RadioTower className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Disponibilidad por paquete</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {metricKeys.map((metricKey) => {
                const state = latest?.metric_states[metricKey]
                const hasValue = state?.value !== null && state?.value !== undefined

                return (
                  <div key={metricKey} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">{metricUI[metricKey].label}</span>
                      <StatusBadge label={hasValue ? 'Campo recibido' : 'Sin dato'} tone={hasValue ? 'success' : 'warning'} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {hasValue
                        ? 'La variable llegó en el último paquete procesado por el backend.'
                        : 'El último paquete no trajo este campo o aún no existe una lectura válida.'}
                    </p>
                  </div>
                )
              })}
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">Lluvia digital</span>
                  <StatusBadge label={rainDigitalStatus} tone={rainDigitalStatus === 'Lluvia' ? 'warning' : 'info'} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Este estado llega desde el canal digital del sensor MH-RD y complementa la lectura analogica.
                </p>
              </div>
            </div>
          </article>

          <article className="panel-soft p-8">
            <div className="flex items-center gap-3 text-violet-200">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Que puede hacer el usuario</span>
            </div>
            <h3 className="mt-6 font-display text-3xl text-white">El visor publico deja entrar a cualquiera, pero el control fino sigue protegido.</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Esta página muestra estado real, última transmisión y disponibilidad por variable. El dashboard interno
              conserva el analisis historico detallado, alertas y diagnostico individual de sensores.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/login" className="button-primary">
                Entrar al panel
              </Link>
              <Link to="/tecnologias" className="button-secondary">
                Ver arquitectura
              </Link>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  )
}
