import { ArrowRight, RadioTower } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

const publicLinks = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/estado-en-vivo', label: 'Estado en vivo' },
  { to: '/ubicacion', label: 'Ubicacion' },
  { to: '/tecnologias', label: 'Tecnologias' },
]

interface PublicHeaderProps {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaTo?: string
}

export function PublicHeader({
  title = 'M1K1U',
  subtitle = 'Centro costero de monitoreo meteorologico',
  ctaLabel = 'Ingresar al panel',
  ctaTo = '/login',
}: PublicHeaderProps) {
  return (
    <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <header className="public-header-shell mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 px-5 py-4 backdrop-blur-2xl sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/20 to-sky-400/10 text-cyan-100 shadow-[0_12px_30px_rgba(34,211,238,0.18)]">
              <RadioTower className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Plataforma IoT meteorologica</p>
              <h1 className="truncate font-display text-3xl text-white sm:text-[2.2rem]">{title}</h1>
              <p className="truncate text-sm text-slate-300 sm:text-[0.95rem]">{subtitle}</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-2">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold tracking-[0.08em] transition ${
                    isActive
                      ? 'bg-white/14 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                      : 'text-slate-100/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <Link to={ctaTo} className="public-login-cta inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-slate-950">
            {ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </header>
    </div>
  )
}
