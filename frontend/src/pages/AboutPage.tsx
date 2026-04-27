import { Cpu, DatabaseZap, Lock, Network, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Footer } from '../components/Footer'

const sections = [
  {
    icon: Cpu,
    title: 'Frontend y experiencia',
    content:
      'React + TypeScript y Tailwind construyen una interfaz premium de centro de monitoreo, con rutas protegidas, dashboards, tablas y graficas historicas.',
  },
  {
    icon: DatabaseZap,
    title: 'Persistencia local',
    content:
      'FastAPI usa SQLAlchemy con SQLite embebido para mantener el proyecto autocontenido, portable y listo para crecer sin depender de motores externos.',
  },
  {
    icon: Lock,
    title: 'Seguridad basica real',
    content:
      'El acceso administrativo utiliza JWT en cookie HttpOnly, contrasenas hasheadas y validacion de payloads. La ingestion de sensores se protege con API Key.',
  },
  {
    icon: Network,
    title: 'Integracion con sensores',
    content:
      'Arduino, ESP32 o un microcontrolador puente pueden enviar datos via HTTP POST al endpoint REST definido para recibir telemetria climatica.',
  },
]

export function AboutPage() {
  const expansionLayers = [
    'Firmware modular por sensor',
    'Migraciones de esquema versionadas',
    'Nuevas reglas de alertas',
    'Widgets y diagnosticos adicionales',
  ]

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="panel p-8 sm:p-10">
        <span className="pill">Acerca del proyecto</span>
        <h1 className="mt-6 font-display text-5xl text-white">Arquitectura funcional y escalable para M1K1U</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          Esta base está pensada como producto real: separación limpia por capas, persistencia local robusta, UI
          moderna y contratos preparados para sumar nuevas variables ambientales sin rehacer la plataforma.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/login" className="button-primary">
            Ir al login
          </Link>
          <Link to="/" className="button-secondary">
            Volver al inicio
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <article key={section.title} className="panel-soft p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-display text-3xl text-white">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{section.content}</p>
            </article>
          )
        })}
      </section>

      <section className="panel p-8">
        <div className="flex items-center gap-3 text-cyan-200">
          <Waves className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.24em]">Capas listas para extender</span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {expansionLayers.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
