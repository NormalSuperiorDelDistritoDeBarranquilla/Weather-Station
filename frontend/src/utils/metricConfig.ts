import {
  Activity,
  CloudRain,
  Gauge,
  Ruler,
  SunMedium,
  ThermometerSun,
  Wind,
  type LucideIcon,
} from 'lucide-react'

import type { MetricKey } from '../types/api'

interface MetricUIConfig {
  key: MetricKey
  label: string
  unit: string
  accent: string
  chartStroke: string
  icon: LucideIcon
}

export const metricUI: Record<MetricKey, MetricUIConfig> = {
  temperature: {
    key: 'temperature',
    label: 'Temperatura',
    unit: '°C',
    accent: 'from-amber-300/20 to-rose-400/10',
    chartStroke: '#f59e0b',
    icon: ThermometerSun,
  },
  pressure: {
    key: 'pressure',
    label: 'Presion',
    unit: 'hPa',
    accent: 'from-violet-300/20 to-fuchsia-500/10',
    chartStroke: '#a855f7',
    icon: Gauge,
  },
  altitude: {
    key: 'altitude',
    label: 'Altitud',
    unit: 'm',
    accent: 'from-slate-300/20 to-sky-500/10',
    chartStroke: '#cbd5e1',
    icon: Ruler,
  },
  luminosity: {
    key: 'luminosity',
    label: 'Luminosidad',
    unit: 'lux',
    accent: 'from-yellow-200/20 to-amber-500/10',
    chartStroke: '#facc15',
    icon: SunMedium,
  },
  rain_analog: {
    key: 'rain_analog',
    label: 'Lluvia analogica',
    unit: 'raw',
    accent: 'from-sky-300/20 to-cyan-500/10',
    chartStroke: '#22d3ee',
    icon: CloudRain,
  },
  wind_speed: {
    key: 'wind_speed',
    label: 'Velocidad del viento',
    unit: 'km/h',
    accent: 'from-emerald-300/20 to-teal-500/10',
    chartStroke: '#34d399',
    icon: Wind,
  },
}

export const dashboardHighlights = [
  {
    icon: Activity,
    label: 'Monitoreo continuo',
    description: 'Polling cada 15 segundos con persistencia local en SQLite.',
  },
  {
    icon: Gauge,
    label: 'Telemetria maestra',
    description: 'La interfaz toma como referencia directa el set de sensores del Arduino maestro.',
  },
]
