import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { DataTable } from '../components/DataTable'
import { sensorDataService } from '../services/sensorDataService'
import type { HistoryRange } from '../types/api'

const rangeOptions: Array<{ label: string; value: HistoryRange }> = [
  { label: '24 horas', value: '24h' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Todos', value: 'all' },
]

export function HistoryPage() {
  const [range, setRange] = useState<HistoryRange>('7d')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stationId, setStationId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    setPage(1)
  }, [range, search, stationId, startDate, endDate])

  const historyQuery = useQuery({
    queryKey: ['sensor-history', range, page, search, stationId, startDate, endDate],
    queryFn: () =>
      sensorDataService.getHistory({
        range,
        page,
        pageSize: 20,
        search: search || undefined,
        stationId: stationId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  })

  return (
    <>
      <section className="panel p-8">
        <span className="pill">Historial operativo</span>
        <h1 className="mt-6 font-display text-4xl text-white">Consulta detallada de registros</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Filtra por fecha, rango temporal y estacion para revisar unicamente lecturas reales persistidas desde la
          telemetria recibida.
        </p>
      </section>

      <section className="panel-soft p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2">
            <span className="text-sm text-slate-200">Rango</span>
            <select className="input-shell w-full" value={range} onChange={(event) => setRange(event.target.value as HistoryRange)}>
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-200">Buscar por estacion</span>
            <input
              className="input-shell w-full"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="M1K1U-001"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-200">Filtro exacto de estacion</span>
            <input
              className="input-shell w-full"
              value={stationId}
              onChange={(event) => setStationId(event.target.value)}
              placeholder="M1K1U-001"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-200">Fecha inicial</span>
            <input className="input-shell w-full" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-slate-200">Fecha final</span>
            <input className="input-shell w-full" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
        </div>
      </section>

      <DataTable
        data={historyQuery.data?.items ?? []}
        page={historyQuery.data?.page ?? 1}
        total={historyQuery.data?.total ?? 0}
        totalPages={historyQuery.data?.total_pages ?? 1}
        onPageChange={setPage}
      />
    </>
  )
}
