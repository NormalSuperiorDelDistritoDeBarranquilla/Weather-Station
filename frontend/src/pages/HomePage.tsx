import { useState } from 'react'
import { ArrowRight, Clock3, Database, Globe2, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { PhotoGalleryPlaceholder } from '../components/PhotoGalleryPlaceholder'
import { PublicHeader } from '../components/PublicHeader'
import { StatusBadge } from '../components/StatusBadge'
import {
  monitoredVariables,
  publicFeatureCards,
  publicLocation,
  publicMetricScenes,
  publicProofPoints,
  publicTechnologies,
} from '../data/publicSite'
import { usePublicLanding } from '../hooks/usePublicLanding'
import type { MetricKey } from '../types/api'
import { formatDateTime, formatMetricValue, formatNumber } from '../utils/format'
import { metricUI } from '../utils/metricConfig'

const metricKeys = Object.keys(metricUI) as MetricKey[]

export function HomePage() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('temperature')
  const publicLandingQuery = usePublicLanding()
  const publicLanding = publicLandingQuery.data
  const latest = publicLanding?.latest
  const stats = publicLanding?.stats_24h
  const location = publicLanding?.location ?? publicLocation

  const selectedState = latest?.metric_states[selectedMetric]
  const selectedMetricConfig = metricUI[selectedMetric]
  const selectedScene = publicMetricScenes[selectedMetric]
  const isStationOnline = latest?.active ?? false
  const rainDigitalStatus = latest?.latest?.rain_digital ?? 'Sin dato'
  const hasSelectedValue = selectedState?.value !== null && selectedState?.value !== undefined
  const selectedValueText = !isStationOnline
    ? 'Sin conexión'
    : hasSelectedValue
      ? formatMetricValue(selectedState?.value, selectedMetricConfig.unit)
      : 'Sin dato'
  const selectedBadgeTone = !isStationOnline ? 'danger' : hasSelectedValue ? 'info' : 'warning'
  const selectedBadgeLabel = !isStationOnline
    ? 'Esperando telemetria'
    : hasSelectedValue
      ? selectedState?.status_label ?? 'Disponible'
      : 'Lectura incompleta'

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-orb left-[-6rem] top-10 h-72 w-72 bg-cyan-400/20" />
      <div className="hero-orb right-[-5rem] top-24 h-80 w-80 bg-violet-500/12" />
      <div className="hero-orb left-[18%] top-[34rem] h-80 w-80 bg-emerald-400/10" />

      <PublicHeader subtitle="Centro de monitoreo ambiental costero para estaciones conectadas" />

      <main className="page-enter mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr]">
          <article className="panel hero-sheen relative overflow-hidden p-8 sm:p-10">
            <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-cyan-400/10 to-transparent" />
            <div className="relative">
              <span className="pill">Portada publica de la estacion</span>
              <div className="mt-6 flex flex-wrap gap-3">
                <StatusBadge label={isStationOnline ? 'Transmision activa' : 'Sin conexión'} tone={isStationOnline ? 'success' : 'danger'} />
                <StatusBadge label="Panel abierto sin login" tone="info" />
                <StatusBadge label={location.neighborhood} tone="neutral" />
              </div>

              <h1 className="mt-7 max-w-4xl font-display text-5xl leading-tight text-white sm:text-6xl">
                Telemetria climatica visible desde Barrio La Playa, Barranquilla.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                M1K1U muestra en una sola capa publica el origen de los datos, el estado actual de la estacion y una
                experiencia visual preparada para comunicar monitoreo ambiental serio, moderno y listo para crecer.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="apple-float-card rounded-[1.8rem] p-5">
                  <div className="flex items-center gap-3 text-cyan-200">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.24em]">Ubicacion operativa</span>
                  </div>
                  <p className="mt-4 font-display text-2xl text-white">{location.label}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Punto visible de captura para una lectura urbana-costera con contexto geografico claro.
                  </p>
                </div>

                <div className="apple-float-card rounded-[1.8rem] p-5">
                  <div className="flex items-center gap-3 text-emerald-200">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.24em]">Ultimo paquete</span>
                  </div>
                  <p className="mt-4 font-display text-2xl text-white">{formatDateTime(latest?.last_seen)}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {isStationOnline
                      ? 'La estacion sigue dentro de la ventana operativa definida para la telemetria.'
                      : 'No hay paquete reciente todavía. La portada se actualizará apenas llegue una nueva transmisión.'}
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/estado-en-vivo" className="button-primary">
                  Ver estado en vivo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/login" className="button-secondary">
                  Ingresar al panel administrativo
                </Link>
              </div>
            </div>
          </article>

          <article
            className="immersive-photo-card min-h-[36rem] overflow-hidden rounded-[2.2rem] border border-cyan-300/15 p-6 shadow-[0_32px_90px_rgba(2,6,23,0.54)]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.10) 0%, rgba(3,7,18,0.56) 45%, rgba(3,7,18,0.92) 100%), url(${selectedScene.image})`,
            }}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-sm">
                  <span className="pill border-white/15 bg-slate-950/30 text-cyan-100">{selectedScene.eyebrow}</span>
                  <h2 className="mt-6 font-display text-4xl text-white">{selectedMetricConfig.label}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-200/85">{selectedScene.description}</p>
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/40 px-4 py-3 text-right backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300">Lectura publica</p>
                  <p className="mt-3 font-display text-3xl text-white">{selectedValueText}</p>
                </div>
              </div>

              <div className="rounded-[1.85rem] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge label={selectedBadgeLabel} tone={selectedBadgeTone} />
                  <StatusBadge label={latest?.station_id ?? 'Sin estacion'} tone="neutral" />
                  <StatusBadge label={`${stats?.total_records ?? 0} registros reales en 24h`} tone="neutral" />
                  <StatusBadge label={`Lluvia digital: ${rainDigitalStatus}`} tone={rainDigitalStatus === 'Lluvia' ? 'warning' : 'neutral'} />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {metricKeys.map((metricKey) => {
                    const metric = metricUI[metricKey]
                    const state = latest?.metric_states[metricKey]
                    const metricHasValue = state?.value !== null && state?.value !== undefined
                    const value = !isStationOnline
                      ? 'Sin conexión'
                      : metricHasValue
                        ? formatMetricValue(state?.value, metric.unit)
                        : 'Sin dato'

                    return (
                      <button
                        key={metricKey}
                        type="button"
                        onClick={() => setSelectedMetric(metricKey)}
                        className={`metric-selector-card rounded-[1.4rem] border px-4 py-4 text-left transition ${
                          selectedMetric === metricKey
                            ? 'border-cyan-300/40 bg-white/12 text-white shadow-[0_0_0_1px_rgba(103,232,249,0.18)]'
                            : 'border-white/10 bg-white/5 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs uppercase tracking-[0.22em] text-slate-300">{metric.label}</span>
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: metric.chartStroke }} />
                        </div>
                        <p className="mt-3 font-display text-2xl text-white">{value}</p>
                        <p className="mt-2 text-sm text-slate-300">
                          {metricHasValue && isStationOnline
                            ? `${state?.status_label ?? 'Disponible'} | Promedio 24h ${formatMetricValue(stats?.metrics[metricKey]?.avg, metric.unit)}`
                            : 'Sin lectura válida todavía para esta variable.'}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {publicFeatureCards.map((card) => {
            const Icon = card.icon

            return (
              <Link key={card.to} to={card.to} className="group">
                <article className="apple-float-card rounded-[2rem] p-6 transition duration-500 group-hover:-translate-y-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-6 text-xs uppercase tracking-[0.24em] text-cyan-200/70">{card.eyebrow}</p>
                  <h3 className="mt-4 font-display text-3xl text-white">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{card.description}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                    Abrir apartado
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </article>
              </Link>
            )
          })}
        </section>

        <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
          {publicProofPoints.map((point) => {
            const Icon = point.icon

            return (
              <article key={point.label} className="apple-float-card rounded-[1.8rem] p-6">
                <div className="flex items-center gap-3 text-cyan-200">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.24em]">{point.label}</span>
                </div>
                <p className="mt-4 font-display text-4xl text-white">{point.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">{point.description}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="panel p-8">
            <div className="flex items-center gap-3 text-violet-200">
              <Database className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Tecnologias principales</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {publicTechnologies.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="panel-soft p-8">
            <div className="flex items-center gap-3 text-cyan-200">
              <Globe2 className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Variables monitoreadas</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {monitoredVariables.map((variable) => (
                <div key={variable} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {variable}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="space-y-6">
          <div>
            <span className="pill">Galeria del despliegue</span>
            <h3 className="mt-4 font-display text-3xl text-white">Fondos, territorio y atmosfera para comunicar el proyecto</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              La capa publica ya funciona como vitrina visual del proyecto: se entiende donde opera la estacion, que
              variables monitorea y por qué la plataforma se presenta como una solución tecnológica seria.
            </p>
          </div>
          <PhotoGalleryPlaceholder />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article
            className="immersive-photo-card min-h-[22rem] rounded-[2rem] border border-white/10 p-8"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.72) 55%, rgba(2,6,23,0.95) 100%), url(https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80)',
            }}
          >
            <div className="max-w-xl">
              <span className="pill border-white/15 bg-slate-950/35 text-cyan-100">Contexto territorial</span>
              <h3 className="mt-6 font-display text-4xl text-white">La portada publica ya deja claro desde donde nace la telemetria.</h3>
              <p className="mt-5 text-sm leading-7 text-slate-200/90">
                {location.label} se presenta como referencia abierta del sistema. Esa decision evita una home abstracta
                y conecta el visor publico con una estacion real ubicada en un entorno urbano y costero.
              </p>
            </div>
          </article>

          <article className="panel p-8">
            <div className="flex items-center gap-3 text-emerald-200">
              <Database className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Estado del dataset publico</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Registros 24h</p>
                <p className="mt-3 font-display text-3xl text-white">{formatNumber(stats?.total_records, 0)}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Estado</p>
                <p className="mt-3 font-display text-3xl text-white">{latest?.active_label ?? 'Sin conexión'}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Estacion</p>
                <p className="mt-3 font-display text-3xl text-white">{latest?.station_id ?? '---'}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Lluvia digital</p>
                <p className="mt-3 font-display text-3xl text-white">{rainDigitalStatus}</p>
              </div>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  )
}
