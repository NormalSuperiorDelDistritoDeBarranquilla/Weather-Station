import { Camera, MapPin, Radar } from 'lucide-react'

const cards = [
  {
    icon: MapPin,
    title: 'Punto de captura',
    description: 'Barrio La Playa, Barranquilla, Atlantico, Colombia como origen visible de la estacion.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    icon: Radar,
    title: 'Sensores y modulos',
    description: 'Lenguaje visual para documentar hardware, calibracion y lectura ambiental en sitio.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    icon: Camera,
    title: 'Operacion continua',
    description: 'Escena pensada para comunicar monitoreo publico, tiempo real y trazabilidad del proyecto.',
    image:
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
  },
]

export function PhotoGalleryPlaceholder() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon

        return (
          <article
            key={card.title}
            className="immersive-photo-card group flex min-h-72 flex-col justify-between rounded-[1.85rem] border border-white/10 p-6"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.06) 0%, rgba(2,6,23,0.55) 45%, rgba(2,6,23,0.92) 100%), url(${card.image})`,
              animationDelay: `${index * 90}ms`,
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/35 text-cyan-200 backdrop-blur-xl">
              <Icon className="h-5 w-5" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-2xl text-white">{card.title}</h3>
              <p className="text-sm leading-6 text-slate-200/90">{card.description}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
