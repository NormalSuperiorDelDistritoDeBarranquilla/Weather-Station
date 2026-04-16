import { Compass, MapPin, Radar, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { PublicHeader } from '../components/PublicHeader'
import { StatusBadge } from '../components/StatusBadge'
import { publicLocation } from '../data/publicSite'
import { usePublicLanding } from '../hooks/usePublicLanding'
import { formatDateTime } from '../utils/format'

const locationFacts = [
  {
    title: 'Contexto costero',
    description: 'La Playa ofrece un entorno con influencia marina, luminosidad intensa y dinamica atmosferica propia del Caribe colombiano.',
    icon: Waves,
  },
  {
    title: 'Referencia urbana',
    description: 'El sistema se presenta como una estacion real en un barrio identificable, no como un dashboard abstracto.',
    icon: MapPin,
  },
  {
    title: 'Lectura con contexto',
    description: 'Ubicar el punto de captura ayuda a interpretar mejor temperatura, presion, luminosidad, lluvia y viento.',
    icon: Radar,
  },
]

export function LocationPage() {
  const publicLandingQuery = usePublicLanding()
  const publicLanding = publicLandingQuery.data
  const latest = publicLanding?.latest
  const location = publicLanding?.location ?? publicLocation

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-orb left-[-4rem] top-14 h-80 w-80 bg-cyan-400/14" />
      <div className="hero-orb right-[-5rem] top-32 h-96 w-96 bg-sky-400/10" />

      <PublicHeader subtitle="Contexto territorial del punto de captura y lectura atmosferica" />

      <main className="page-enter mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
          <article
            className="immersive-photo-card min-h-[34rem] rounded-[2.3rem] border border-white/10 p-8 sm:p-10"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.66) 55%, rgba(2,6,23,0.95) 100%), url(https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80)',
            }}
          >
            <div className="max-w-3xl">
              <span className="pill border-white/15 bg-slate-950/35 text-cyan-100">Origen del monitoreo</span>
              <h1 className="mt-6 font-display text-5xl leading-tight text-white sm:text-6xl">
                Barrio La Playa como referencia publica de la estacion M1K1U.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/90">
                La plataforma comunica desde donde provienen los datos para que la lectura tenga valor contextual,
                geografico y ambiental. El usuario entiende rapidamente que la telemetria pertenece a un punto real.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <StatusBadge label={location.city} tone="info" />
                <StatusBadge label={location.region} tone="neutral" />
                <StatusBadge label={latest?.active ? 'Estacion activa' : 'Sin conexion'} tone={latest?.active ? 'success' : 'danger'} />
              </div>
            </div>
          </article>

          <article className="panel p-8 sm:p-10">
            <span className="pill">Referencia territorial</span>
            <h2 className="mt-6 font-display text-4xl text-white">{location.label}</h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">{publicLocation.context}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 text-cyan-200">
                  <Compass className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.24em]">Coordenada referencial</span>
                </div>
                <p className="mt-4 font-display text-3xl text-white">{publicLocation.coordinates}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Valor referencial para presentar el punto de despliegue de manera clara en la capa publica.
                </p>
              </div>

              <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3 text-emerald-200">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.24em]">Ultima transmision</span>
                </div>
                <p className="mt-4 font-display text-3xl text-white">{formatDateTime(latest?.last_seen)}</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  La pagina territorial sigue enlazada al comportamiento vivo de la estacion.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/estado-en-vivo" className="button-primary">
                Ver panel publico
              </Link>
              <Link to="/login" className="button-secondary">
                Ingresar al panel
              </Link>
            </div>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {locationFacts.map((fact) => {
            const Icon = fact.icon

            return (
              <article key={fact.title} className="apple-float-card rounded-[1.9rem] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-3xl text-white">{fact.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{fact.description}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="panel p-8">
            <div className="flex items-center gap-3 text-cyan-200">
              <MapPin className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Por que mostrar la ubicacion</span>
            </div>
            <h3 className="mt-6 font-display text-3xl text-white">Una estacion visible inspira mas confianza que una telemetria sin territorio.</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Esta pagina existe para que jurados, visitantes o usuarios entiendan que la plataforma no es solo una
              interfaz bonita: responde a un punto geografico concreto y a un comportamiento ambiental real.
            </p>
          </article>

          <article className="panel-soft p-8">
            <div className="flex items-center gap-3 text-violet-200">
              <Radar className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.24em]">Lectura contextual</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ciudad</p>
                <p className="mt-3 font-display text-3xl text-white">{location.city}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Region</p>
                <p className="mt-3 font-display text-3xl text-white">{location.region}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pais</p>
                <p className="mt-3 font-display text-3xl text-white">{location.country}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Barrio</p>
                <p className="mt-3 font-display text-3xl text-white">{location.neighborhood}</p>
              </div>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  )
}
