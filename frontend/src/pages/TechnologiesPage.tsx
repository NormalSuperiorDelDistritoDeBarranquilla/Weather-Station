import { ArrowRight, CircuitBoard, Database, LockKeyhole, RadioTower } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { PublicHeader } from '../components/PublicHeader'
import {
  monitoredVariables,
  publicTechnologies,
  publicTechnologyLayers,
  scalingCapabilities,
  telemetryFlow,
} from '../data/publicSite'

export function TechnologiesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-orb left-[-4rem] top-12 h-72 w-72 bg-cyan-400/15" />
      <div className="hero-orb right-[-6rem] top-20 h-80 w-80 bg-violet-500/10" />

      <PublicHeader subtitle="Arquitectura, stack y flujo de datos de la plataforma M1K1U" />

      <main className="page-enter mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <article className="panel hero-sheen relative overflow-hidden p-8 sm:p-10">
            <span className="pill">Arquitectura del producto</span>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-tight text-white sm:text-6xl">
              Una base tecnica pensada para crecer sin perder orden ni trazabilidad.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              M1K1U combina frontend, backend, autenticacion, persistencia local y firmware modular para crear una
              plataforma meteorologica lista para evolucionar hacia un producto mas robusto.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {publicTechnologies.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article
            className="immersive-photo-card min-h-[28rem] rounded-[2.2rem] border border-white/10 p-8"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(2,6,23,0.12) 0%, rgba(2,6,23,0.58) 45%, rgba(2,6,23,0.94) 100%), url(https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80)',
            }}
          >
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="pill border-white/15 bg-slate-950/35 text-cyan-100">Pipeline tecnico</span>
                <h2 className="mt-6 max-w-lg font-display text-4xl text-white">Desde el sensor hasta la interfaz, todo queda conectado en un solo proyecto.</h2>
                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200/90">
                  La arquitectura evita depender de motores externos y deja a SQLite como persistencia embebida central
                  para datos meteorologicos reales.
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-2xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-cyan-200">
                    <Database className="h-4 w-4" />
                    <span className="text-sm text-slate-200">Persistencia local con SQLite</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-200">
                    <LockKeyhole className="h-4 w-4" />
                    <span className="text-sm text-slate-200">JWT HttpOnly para acceso administrativo</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {publicTechnologyLayers.map((layer) => (
            <article key={layer.title} className="apple-float-card rounded-[1.9rem] p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100">
                <CircuitBoard className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-3xl text-white">{layer.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{layer.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-xs text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="panel p-8">
            <div className="flex items-center gap-3 text-cyan-200">
              <RadioTower className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Flujo de telemetria</span>
            </div>
            <div className="mt-6 grid gap-4">
              {telemetryFlow.map((step) => (
                <div key={step.step} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-sm font-semibold text-cyan-100">
                      {step.step}
                    </span>
                    <h3 className="font-display text-2xl text-white">{step.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{step.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-soft p-8">
            <div className="flex items-center gap-3 text-violet-200">
              <Database className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Sensores y escalabilidad</span>
            </div>

            <h3 className="mt-6 font-display text-3xl text-white">Variables actuales y capacidades listas para crecer sin tocar el contrato maestro.</h3>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {monitoredVariables.map((item) => (
                <div key={item} className="rounded-[1.45rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Capacidades de expansion</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {scalingCapabilities.map((item) => (
                  <span key={item} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section className="panel p-8 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="pill">Acceso administrativo</span>
              <h3 className="mt-4 font-display text-4xl text-white">Cuando necesites control completo, el panel interno sigue un paso mas adelante.</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                El sitio publico comunica el proyecto. El dashboard protegido concentra historicos, alertas, analitica
                y diagnostico individual por sensor.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/estado-en-vivo" className="button-secondary">
                Volver al visor publico
              </Link>
              <Link to="/login" className="button-primary">
                Ingresar al panel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
