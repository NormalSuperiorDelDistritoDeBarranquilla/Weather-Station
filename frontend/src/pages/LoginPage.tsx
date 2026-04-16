import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, Clock3, LockKeyhole, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Footer } from '../components/Footer'
import { PublicHeader } from '../components/PublicHeader'
import { StatusBadge } from '../components/StatusBadge'
import { publicLocation, publicLoginSlides } from '../data/publicSite'
import { useAuth } from '../hooks/useAuth'
import { usePublicLanding } from '../hooks/usePublicLanding'
import { formatDateTime } from '../utils/format'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const publicLandingQuery = usePublicLanding()
  const publicLanding = publicLandingQuery.data
  const latest = publicLanding?.latest
  const publicLocationData = publicLanding?.location ?? publicLocation
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % publicLoginSlides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await login({ username, password })
      navigate(redirectTo, { replace: true })
    } catch {
      setError('No fue posible autenticar el acceso. Verifica usuario y contrasena.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-orb left-[-4rem] top-10 h-72 w-72 bg-cyan-400/20" />
      <div className="hero-orb right-[-6rem] top-24 h-80 w-80 bg-violet-500/16" />

      <PublicHeader
        subtitle="Acceso administrativo al centro de monitoreo M1K1U"
        ctaLabel="Ver estado en vivo"
        ctaTo="/estado-en-vivo"
      />

      <main className="page-enter mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <article className="relative min-h-[40rem] overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950/55 shadow-[0_32px_90px_rgba(2,6,23,0.58)] backdrop-blur-2xl">
            <div className="absolute inset-0">
              {publicLoginSlides.map((slide, index) => (
                <div
                  key={slide.title}
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-[1200ms] ease-out ${
                    index === currentSlide ? 'scale-100 opacity-100' : 'scale-[1.05] opacity-0'
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.14) 0%, rgba(2,6,23,0.58) 45%, rgba(2,6,23,0.95) 100%), url(${slide.image})`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex h-full flex-col justify-between p-8 sm:p-10">
              <div>
                <span className="pill border-white/15 bg-slate-950/35 text-cyan-100">
                  {publicLoginSlides[currentSlide]?.eyebrow}
                </span>

                <div className="mt-6 flex flex-wrap gap-3">
                  <StatusBadge label={latest?.active ? 'Transmision activa' : 'Sin conexion'} tone={latest?.active ? 'success' : 'danger'} />
                  <StatusBadge label={publicLocationData.neighborhood} tone="neutral" />
                  <StatusBadge label="Panel administrativo" tone="info" />
                </div>

                <h1 className="mt-7 max-w-3xl font-display text-5xl leading-tight text-white sm:text-6xl">
                  {publicLoginSlides[currentSlide]?.title}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200/90">
                  {publicLoginSlides[currentSlide]?.subtitle}
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/40 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-cyan-200">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.24em]">Origen</span>
                    </div>
                    <p className="mt-3 font-display text-2xl text-white">{publicLocationData.neighborhood}</p>
                    <p className="mt-2 text-sm text-slate-300">{publicLocationData.city}, {publicLocationData.region}</p>
                  </div>

                  <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/40 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-emerald-200">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.24em]">Ultima lectura</span>
                    </div>
                    <p className="mt-3 font-display text-2xl text-white">{formatDateTime(latest?.last_seen)}</p>
                    <p className="mt-2 text-sm text-slate-300">Dato operativo mas reciente procesado por el backend.</p>
                  </div>

                  <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/40 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-3 text-violet-200">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-[0.24em]">Acceso</span>
                    </div>
                    <p className="mt-3 font-display text-2xl text-white">JWT HttpOnly</p>
                    <p className="mt-2 text-sm text-slate-300">Sesion protegida para dashboard, alertas y analitica interna.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {publicLoginSlides.map((slide, index) => (
                      <button
                        key={slide.title}
                        type="button"
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === currentSlide ? 'w-9 bg-cyan-300' : 'w-2.5 bg-white/35 hover:bg-white/60'
                        }`}
                        aria-label={`Ir a la diapositiva ${index + 1}`}
                      />
                    ))}
                  </div>

                  <Link to="/estado-en-vivo" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                    Explorar estado en vivo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </article>

          <article className="panel relative overflow-hidden p-8 sm:p-10">
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/12 blur-3xl" />

            <div className="relative">
              <span className="pill">Sesion protegida</span>
              <h2 className="mt-6 font-display text-4xl text-white sm:text-5xl">Acceso al centro de control</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                Inicia sesion para entrar al dashboard privado, revisar historicos, alertas, diagnosticos y estado
                individual de cada sensor conectado a la estacion M1K1U.
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm text-slate-200">Usuario</span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="input-shell w-full pl-11"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-200">Contrasena</span>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      className="input-shell w-full pl-11"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="admin123"
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {error}
                    </div>
                  </div>
                ) : null}

                <button type="submit" className="button-primary w-full text-base" disabled={isSubmitting}>
                  {isSubmitting ? 'Autenticando...' : 'Ingresar al dashboard'}
                </button>
              </form>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Link to="/" className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white">
                  Volver a la portada publica
                </Link>
                <Link
                  to="/estado-en-vivo"
                  className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
                >
                  Revisar estado en vivo
                </Link>
              </div>
            </div>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  )
}
