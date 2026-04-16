import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { ChartCard } from '../components/ChartCard'
import { sensorDataService } from '../services/sensorDataService'
import type { HistoryRange, MetricKey } from '../types/api'
import { metricUI } from '../utils/metricConfig'
import { formatDateTime } from '../utils/format'

const ranges: HistoryRange[] = ['24h', '7d', '30d', 'all']
const rangeLabels: Record<HistoryRange, string> = {
  '24h': 'Ultimas 24 horas',
  '7d': 'Ultimos 7 dias',
  '30d': 'Ultimos 30 dias',
  all: 'Todos los datos',
}

const metricKeys = Object.keys(metricUI) as MetricKey[]

export function ChartsPage() {
  const [range, setRange] = useState<HistoryRange>('7d')

  const historyQuery = useQuery({
    queryKey: ['sensor-chart-history', range],
    queryFn: () => sensorDataService.getHistory({ range, page: 1, pageSize: 500 }),
  })

  const data = useMemo(() => [...(historyQuery.data?.items ?? [])].reverse(), [historyQuery.data?.items])
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        timestamp: item.timestamp,
        temperature: item.temperature,
        pressure: item.pressure,
        altitude: item.altitude,
        luminosity: item.luminosity,
        rain_analog: item.rain_analog,
        wind_speed: item.wind_speed,
      })),
    [data],
  )
  const hasRecords = data.length > 0

  return (
    <>
      <section className="panel p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span className="pill">Analitica historica</span>
            <h1 className="mt-6 font-display text-4xl text-white">Graficas de comportamiento temporal</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Revisa la evolucion de cada variable, compara periodos y detecta cambios de tendencia o calidad de
              captura en el tiempo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {ranges.map((option) => (
              <button
                key={option}
                type="button"
                className={range === option ? 'button-primary !px-4 !py-2' : 'button-secondary !px-4 !py-2'}
                onClick={() => setRange(option)}
              >
                {rangeLabels[option]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-soft p-5 text-sm text-slate-300">
        {hasRecords ? (
          <>
            Ultima lectura dentro del rango:{' '}
            <span className="font-semibold text-white">{formatDateTime(data.at(-1)?.timestamp)}</span>
          </>
        ) : (
          <>
            Sin telemetria real en este rango.{' '}
            <span className="font-semibold text-white">Las graficas se activaran cuando llegue el primer paquete valido.</span>
          </>
        )}
      </section>

      <section className="grid gap-6">
        {metricKeys.map((metricKey) => (
          <ChartCard
            key={metricKey}
            title={metricUI[metricKey].label}
            description={`Serie historica de ${metricUI[metricKey].label.toLowerCase()} para el rango ${rangeLabels[range].toLowerCase()}.`}
            unit={metricUI[metricKey].unit}
            stroke={metricUI[metricKey].chartStroke}
            dataKey={metricKey}
            data={chartData}
          />
        ))}
      </section>
    </>
  )
}
