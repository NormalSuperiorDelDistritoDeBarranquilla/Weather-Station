import {
  Activity,
  CircuitBoard,
  Cpu,
  MapPin,
  RadioTower,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

import type { MetricKey } from '../types/api'

export interface PublicFeatureCard {
  to: string
  title: string
  description: string
  eyebrow: string
  icon: LucideIcon
}

export interface PublicTechLayer {
  title: string
  description: string
  items: string[]
}

export interface PublicTelemetryStep {
  step: string
  title: string
  description: string
}

export const sitePhotos = {
  locationHero: '/fotos/la-playa-atardecer.jpeg',
  liveStatusHero: '/fotos/cienaga-panoramica.jpeg',
  homeTerritoryHero: '/fotos/playa-sombrillas.jpeg',
  locationMap: '/fotos/mapa-muelle-la-playa-pier.jpeg',
  technologyHero: '/fotos/ecosistema-m1kiu-render-2.jpeg',
  metricTemperature: '/fotos/la-playa-atardecer.jpeg',
  metricPressure: '/fotos/cienaga-panoramica.jpeg',
  metricAltitude: '/fotos/cienaga-caserio.jpeg',
  metricLuminosity: '/fotos/playa-sombrillas.jpeg',
  metricRain: '/fotos/cienaga-orilla-botes.jpeg',
  metricWind: '/fotos/la-playa-bote-comunidad.jpeg',
  loginMonitoring: '/fotos/cienaga-orilla-botes.jpeg',
  loginData: '/fotos/la-playa-bote-comunidad.jpeg',
  loginArchitecture: '/fotos/ecosistema-m1kiu-render-1.jpeg',
  galleryCapture: '/fotos/la-playa-atardecer.jpeg',
  galleryCommunity: '/fotos/la-playa-bote-comunidad.jpeg',
  galleryHabitat: '/fotos/la-playa-caserio-muelle.jpeg',
  galleryBeach: '/fotos/playa-sombrillas.jpeg',
} as const

export const publicLocation = {
  label: 'Barrio La Playa, Barranquilla, Atlántico, Colombia',
  neighborhood: 'Barrio La Playa',
  city: 'Barranquilla',
  region: 'Atlántico',
  country: 'Colombia',
  coordinates: '11.084 N / 74.841 O',
  context:
    'Nodo costero de monitoreo ambiental pensado para mostrar telemetría real con contexto geográfico, urbano y atmosférico.',
}

export const publicFeatureCards: PublicFeatureCard[] = [
  {
    to: '/estado-en-vivo',
    title: 'Estado en vivo',
    description: 'Vista pública de la estación, último paquete recibido y lectura instantánea por variable.',
    eyebrow: 'Panel abierto',
    icon: Activity,
  },
  {
    to: '/ubicacion',
    title: 'Ubicación',
    description: 'Contexto territorial de la captura, enfoque costero y referencia del punto de despliegue.',
    eyebrow: 'Origen de datos',
    icon: MapPin,
  },
  {
    to: '/tecnologias',
    title: 'Tecnologías',
    description: 'Arquitectura, flujo de datos, stack web y preparación para los sensores del ESP32 maestro.',
    eyebrow: 'Arquitectura',
    icon: CircuitBoard,
  },
]

export const publicMetricScenes: Record<
  MetricKey,
  {
    image: string
    eyebrow: string
    description: string
  }
> = {
  temperature: {
    image: sitePhotos.metricTemperature,
    eyebrow: 'Térmica costera',
    description: 'Luz cálida y cielo abierto sobre La Playa para contextualizar la temperatura ambiental del punto de captura.',
  },
  pressure: {
    image: sitePhotos.metricPressure,
    eyebrow: 'Presión atmosférica',
    description: 'Panorámica abierta de la ciénaga para leer estabilidad atmosférica, nubosidad y cambios de cielo en el entorno.',
  },
  altitude: {
    image: sitePhotos.metricAltitude,
    eyebrow: 'Referencia barométrica',
    description: 'La altitud se muestra como variable de contexto sobre el borde habitado y el espejo de agua de La Playa.',
  },
  luminosity: {
    image: sitePhotos.metricLuminosity,
    eyebrow: 'Escena lumínica',
    description: 'Escena de playa a pleno sol para representar la intensidad luminosa que el BH1750 registra en exterior.',
  },
  rain_analog: {
    image: sitePhotos.metricRain,
    eyebrow: 'Sensor de lluvia',
    description: 'Orilla, humedad y superficie expuesta como contexto visual para la lectura analógica del sensor de lluvia.',
  },
  wind_speed: {
    image: sitePhotos.metricWind,
    eyebrow: 'Dinámica del viento',
    description: 'Botes y lámina de agua expuesta como referencia visual para la velocidad del viento medida en el sitio.',
  },
}

export const publicTechnologies = [
  'React + TypeScript',
  'Tailwind CSS',
  'FastAPI',
  'SQLite + SQLAlchemy',
  'JWT HttpOnly',
  'Recharts',
  'ESP32 + Arduino IDE',
  'BMP280 + BH1750 + MH-RD + anemómetro',
]

export const publicTechnologyLayers: PublicTechLayer[] = [
  {
    title: 'Experiencia web',
    description: 'Interfaz pública e interna con visualización clara, paneles glassmorphism y transiciones suaves.',
    items: ['React', 'TypeScript', 'Tailwind CSS', 'React Router', 'Recharts'],
  },
  {
    title: 'API y persistencia',
    description: 'Backend preparado para recibir telemetría por REST y guardar históricos en una base local embebida.',
    items: ['FastAPI', 'SQLAlchemy 2', 'SQLite', 'Alembic', 'Pydantic v2'],
  },
  {
    title: 'Seguridad y acceso',
    description: 'Separación entre lectura pública, sesión administrativa y endpoints protegidos para sensores.',
    items: ['JWT en cookie HttpOnly', 'CORS controlado', 'Hash de contraseñas', 'API Key para sensores'],
  },
  {
    title: 'Capa hardware',
    description: 'Firmware alineado con el set maestro de sensores del ESP32 y preparado para crecer después.',
    items: ['ESP32', 'BMP280', 'BH1750', 'MH-RD', 'Anemómetro'],
  },
]

export const monitoredVariables = [
  'Temperatura ambiental',
  'Presión atmosférica',
  'Altitud barométrica',
  'Luminosidad',
  'Lluvia analógica',
  'Velocidad del viento',
  'Estado digital de lluvia',
]

export const scalingCapabilities = [
  'Contrato JSON versionable',
  'Canales ADC e I2C reutilizables',
  'Migraciones de base de datos',
  'Panel listo para nuevos módulos',
]

export const telemetryFlow: PublicTelemetryStep[] = [
  {
    step: '01',
    title: 'Captura en sitio',
    description: 'ESP32 lee BMP280, BH1750, MH-RD y anemómetro, luego arma un paquete JSON con esos sensores maestros.',
  },
  {
    step: '02',
    title: 'Envío por REST',
    description: 'El dispositivo publica los datos hacia FastAPI usando HTTP POST y un header X-API-Key.',
  },
  {
    step: '03',
    title: 'Persistencia local',
    description: 'El backend valida payload, normaliza el tiempo y guarda cada lectura en SQLite mediante SQLAlchemy.',
  },
  {
    step: '04',
    title: 'Visualización pública y privada',
    description: 'La home abierta y el panel administrativo consumen la misma telemetría real con polling cada 15 segundos.',
  },
]

export const publicLoginSlides = [
  {
    title: 'Lecturas maestras del ESP32 en tiempo real',
    subtitle: 'La plataforma ahora sigue exactamente el set de sensores que define el firmware de la estación.',
    image: sitePhotos.loginMonitoring,
    eyebrow: 'Telemetría maestra',
  },
  {
    title: 'Datos listos para decisión y analítica',
    subtitle:
      'Temperatura, presión, altitud, luminosidad, lluvia analógica, lluvia digital y viento entran al backend y alimentan la consola.',
    image: sitePhotos.loginData,
    eyebrow: 'Centro de monitoreo',
  },
  {
    title: 'Arquitectura preparada para crecer sin romper el núcleo',
    subtitle: 'La base mantiene el ESP32 como fuente maestra y deja espacio para sumar nuevos sensores después.',
    image: sitePhotos.loginArchitecture,
    eyebrow: 'Expansión modular',
  },
]

export const publicProofPoints = [
  {
    label: 'Origen visible',
    value: publicLocation.neighborhood,
    description: 'Los datos que ve el usuario quedan anclados al territorio donde se toma la muestra.',
    icon: MapPin,
  },
  {
    label: 'Panel de acceso',
    value: 'JWT HttpOnly',
    description: 'El panel interno se mantiene separado del visor público y protegido por autenticación.',
    icon: ShieldCheck,
  },
  {
    label: 'Firmware maestro',
    value: 'ESP32',
    description: 'El conjunto de sensores del firmware define directamente lo que se visualiza en la plataforma.',
    icon: RadioTower,
  },
  {
    label: 'Escalabilidad',
    value: 'Stack modular',
    description: 'Frontend, backend y firmware se organizan para agregar sensores sin desordenar la base actual.',
    icon: Cpu,
  },
]
