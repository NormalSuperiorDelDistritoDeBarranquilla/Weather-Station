import { Link } from 'react-router-dom'

interface FooterProps {
  compact?: boolean
}

export function Footer({ compact = false }: FooterProps) {
  const apiDocsUrl = `${window.location.protocol}//${window.location.hostname}:8000/docs`

  if (compact) {
    return (
      <footer className="rounded-[1.8rem] border border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) 2026 M1K1U. Panel interno del sistema.</p>
          <p>Creditos y autores: pendiente por completar.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Pie de pagina oficial</p>
          <h2 className="mt-4 font-display text-3xl text-white">M1K1U</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Plataforma de monitoreo climatico con persistencia local, telemetria abierta y una base visual lista para
            evolucionar hacia una solucion profesional.
          </p>
          <div className="mt-6 space-y-2 text-sm text-slate-400">
            <p>(c) 2026 M1K1U. Todos los derechos reservados.</p>
            <p>Creadores, autores y colaboradores: contenido pendiente por completar.</p>
            <p>Textos legales, licencias, atribuciones y contacto oficial: pendiente por completar.</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Navegacion publica</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/" className="hover:text-cyan-200">
              Inicio
            </Link>
            <Link to="/estado-en-vivo" className="hover:text-cyan-200">
              Estado en vivo
            </Link>
            <Link to="/ubicacion" className="hover:text-cyan-200">
              Ubicacion
            </Link>
            <Link to="/tecnologias" className="hover:text-cyan-200">
              Tecnologias
            </Link>
            <Link to="/login" className="hover:text-cyan-200">
              Ingresar al panel
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Proyecto</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-300">
            <Link to="/about" className="hover:text-cyan-200">
              Acerca del proyecto
            </Link>
            <a href={apiDocsUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-200">
              Documentacion API
            </a>
            <span className="text-slate-500">Politica de datos, creditos visuales y bloques legales: pendiente por completar.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
