import { FileText, FolderKanban, Lightbulb, Sparkles } from 'lucide-react'

const placeholders = [
  {
    icon: Sparkles,
    title: 'Resumen del proyecto',
    body: 'Este espacio queda listo para que describas la vision general de M1K1U, su objetivo y el impacto que buscas.',
  },
  {
    icon: Lightbulb,
    title: 'Idea e iniciativa',
    body: 'Aqui puedes explicar el origen del proyecto, la necesidad que resuelve y el valor ambiental o tecnologico.',
  },
  {
    icon: FolderKanban,
    title: 'Estado actual y roadmap',
    body: 'Usa esta sección para documentar fases, módulos pendientes, mejoras futuras y nuevas variables de sensores.',
  },
  {
    icon: FileText,
    title: 'Notas del equipo',
    body: 'Bloque libre para agregar observaciones, decisiones de producto, responsables o cualquier texto editable.',
  },
]

export function ProjectAboutPage() {
  return (
    <>
      <section className="panel p-8">
        <span className="pill">Acerca del proyecto</span>
        <h1 className="mt-6 font-display text-4xl text-white">Espacio editable para documentar M1K1U</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Esta vista queda dentro del panel para que no te saque de la navegacion principal. Puedes usarla como
          seccion de presentacion, memoria del proyecto o documento vivo del sistema.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {placeholders.map((item) => {
          const Icon = item.icon

          return (
            <article key={item.title} className="panel-soft p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-6 font-display text-2xl text-white">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.body}</p>
              <div className="mt-6 min-h-40 rounded-[1.5rem] border border-dashed border-cyan-300/20 bg-white/5 p-5 text-sm text-slate-400">
                Edita este bloque con el contenido real del proyecto.
              </div>
            </article>
          )
        })}
      </section>
    </>
  )
}
