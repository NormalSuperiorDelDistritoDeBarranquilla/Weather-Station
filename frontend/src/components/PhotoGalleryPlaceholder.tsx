import { Camera, MapPin, Radar } from 'lucide-react'

import { sitePhotos } from '../data/publicSite'

const cards = [
  {
    icon: MapPin,
    title: 'Punto de captura',
    description: 'La Playa aparece como lugar real, reconocible y ligado directamente al origen de la estación.',
    image: sitePhotos.galleryCapture,
  },
  {
    icon: Radar,
    title: 'Borde habitado',
    description: 'El entorno construido junto al agua refuerza que la telemetría pertenece a un contexto humano y costero.',
    image: sitePhotos.galleryHabitat,
  },
  {
    icon: Camera,
    title: 'Comunidad costera',
    description: 'La actividad local sobre el agua aporta cercanía, escala y vida al relato visual del proyecto.',
    image: sitePhotos.galleryCommunity,
  },
  {
    icon: Camera,
    title: 'Frente de playa',
    description: 'Una escena abierta y luminosa para mostrar el carácter costero del sitio donde opera M1K1U.',
    image: sitePhotos.galleryBeach,
  },
]

export function PhotoGalleryPlaceholder() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
