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

export const publicLocation = {
  label: 'Barrio La Playa, Barranquilla, Atlantico, Colombia',
  neighborhood: 'Barrio La Playa',
  city: 'Barranquilla',
  region: 'Atlantico',
  country: 'Colombia',
  coordinates: '11.084 N / 74.841 O',
  context:
    'Nodo costero de monitoreo ambiental pensado para mostrar telemetria real con contexto geografico, urbano y atmosferico.',
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
    title: 'Ubicacion',
    description: 'Contexto territorial de la captura, enfoque costero y referencia del punto de despliegue.',
    eyebrow: 'Origen de datos',
    icon: MapPin,
  },
  {
    to: '/tecnologias',
    title: 'Tecnologias',
    description: 'Arquitectura, flujo de datos, stack web y preparacion para los sensores del ESP32 maestro.',
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
    image:
      'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Termica costera',
    description: 'Lectura ambiental expuesta al comportamiento termico tropical del sector costero de Barranquilla.',
  },
  pressure: {
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Presion atmosferica',
    description: 'Referencia operativa para interpretar variaciones atmosfericas y estabilidad del sistema.',
  },
  altitude: {
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Referencia barometrica',
    description: 'Altitud barometrica presentada como variable de contexto y calibracion del punto de captura.',
  },
  luminosity: {
    image:
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Escena luminica',
    description: 'Luminosidad medida por BH1750 para seguir la intensidad del entorno y su comportamiento diario.',
  },
  rain_analog: {
    image:
      'https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Sensor de lluvia',
    description: 'Lectura analogica del MH-RD para observar humedad, secado o presencia de lluvia sobre la placa.',
  },
  wind_speed: {
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Dinamica del viento',
    description: 'Velocidad del viento calculada desde el anemometro para exponer la fuerza del entorno en tiempo real.',
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
  'BMP280 + BH1750 + MH-RD + anemometro',
]

export const publicTechnologyLayers: PublicTechLayer[] = [
  {
    title: 'Experiencia web',
    description: 'Interfaz publica e interna con visualizacion clara, paneles glassmorphism y transiciones suaves.',
    items: ['React', 'TypeScript', 'Tailwind CSS', 'React Router', 'Recharts'],
  },
  {
    title: 'API y persistencia',
    description: 'Backend preparado para recibir telemetria por REST y guardar historicos en una base local embebida.',
    items: ['FastAPI', 'SQLAlchemy 2', 'SQLite', 'Alembic', 'Pydantic v2'],
  },
  {
    title: 'Seguridad y acceso',
    description: 'Separacion entre lectura publica, sesion administrativa y endpoints protegidos para sensores.',
    items: ['JWT en cookie HttpOnly', 'CORS controlado', 'Hash de contrasenas', 'API Key para sensores'],
  },
  {
    title: 'Capa hardware',
    description: 'Firmware alineado con el set maestro de sensores del ESP32 y preparado para crecer despues.',
    items: ['ESP32', 'BMP280', 'BH1750', 'MH-RD', 'Anemometro'],
  },
]

export const monitoredVariables = [
  'Temperatura ambiental',
  'Presion atmosferica',
  'Altitud barometrica',
  'Luminosidad',
  'Lluvia analogica',
  'Velocidad del viento',
  'Estado digital de lluvia',
]

export const scalingCapabilities = [
  'Contrato JSON versionable',
  'Canales ADC e I2C reutilizables',
  'Migraciones de base de datos',
  'Panel listo para nuevos modulos',
]

export const telemetryFlow: PublicTelemetryStep[] = [
  {
    step: '01',
    title: 'Captura en sitio',
    description: 'ESP32 lee BMP280, BH1750, MH-RD y anemómetro, luego arma un paquete JSON con esos sensores maestros.',
  },
  {
    step: '02',
    title: 'Envio por REST',
    description: 'El dispositivo publica los datos hacia FastAPI usando HTTP POST y un header X-API-Key.',
  },
  {
    step: '03',
    title: 'Persistencia local',
    description: 'El backend valida payload, normaliza el tiempo y guarda cada lectura en SQLite mediante SQLAlchemy.',
  },
  {
    step: '04',
    title: 'Visualizacion publica y privada',
    description: 'La home abierta y el panel administrativo consumen la misma telemetria real con polling cada 15 segundos.',
  },
]

export const publicLoginSlides = [
  {
    title: 'Lecturas maestras del ESP32 en tiempo real',
    subtitle: 'La plataforma ahora sigue exactamente el set de sensores que define el firmware de la estación.',
    image:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Telemetria maestra',
  },
  {
    title: 'Datos listos para decision y analitica',
    subtitle:
      'Temperatura, presion, altitud, luminosidad, lluvia analogica, lluvia digital y viento entran al backend y alimentan la consola.',
    image:
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Centro de monitoreo',
  },
  {
    title: 'Arquitectura preparada para crecer sin romper el nucleo',
    subtitle: 'La base mantiene el ESP32 como fuente maestra y deja espacio para sumar nuevos sensores despues.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    eyebrow: 'Expansion modular',
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
    description: 'El panel interno se mantiene separado del visor publico y protegido por autenticacion.',
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
