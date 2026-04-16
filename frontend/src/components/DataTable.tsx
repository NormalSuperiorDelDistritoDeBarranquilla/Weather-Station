import { Search } from 'lucide-react'

import type { SensorDataRecord } from '../types/api'
import { formatDateTime, formatMetricValue } from '../utils/format'

interface DataTableProps {
  data: SensorDataRecord[]
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export function DataTable({ data, page, totalPages, total, onPageChange }: DataTableProps) {
  const renderValue = (value: number | null, unit: string) => (value == null ? 'Sin dato' : formatMetricValue(value, unit))
  const renderText = (value: string | null) => (value == null || value.trim() === '' ? 'Sin dato' : value)

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-2xl text-white">Registros individuales</h3>
          <p className="text-sm text-slate-300">Cada lectura enviada por la estacion queda almacenada localmente.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          <Search className="h-4 w-4 text-cyan-200" />
          {total} registros
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-6 py-4 font-medium">Fecha y hora</th>
              <th className="px-6 py-4 font-medium">Estacion</th>
              <th className="px-6 py-4 font-medium">Temperatura</th>
              <th className="px-6 py-4 font-medium">Presion</th>
              <th className="px-6 py-4 font-medium">Altitud</th>
              <th className="px-6 py-4 font-medium">Luminosidad</th>
              <th className="px-6 py-4 font-medium">Lluvia analogica</th>
              <th className="px-6 py-4 font-medium">Lluvia digital</th>
              <th className="px-6 py-4 font-medium">Viento</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((row) => (
                <tr key={row.id} className="border-t border-white/5 text-slate-200">
                  <td className="whitespace-nowrap px-6 py-4">{formatDateTime(row.timestamp)}</td>
                  <td className="px-6 py-4">{row.station_id}</td>
                  <td className="px-6 py-4">{renderValue(row.temperature, '°C')}</td>
                  <td className="px-6 py-4">{renderValue(row.pressure, 'hPa')}</td>
                  <td className="px-6 py-4">{renderValue(row.altitude, 'm')}</td>
                  <td className="px-6 py-4">{renderValue(row.luminosity, 'lux')}</td>
                  <td className="px-6 py-4">{renderValue(row.rain_analog, 'raw')}</td>
                  <td className="px-6 py-4">{renderText(row.rain_digital)}</td>
                  <td className="px-6 py-4">{renderValue(row.wind_speed, 'km/h')}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-white/5 text-slate-300">
                <td colSpan={9} className="px-6 py-10 text-center">
                  No hay registros reales todavia. El historial se llenara cuando la estacion envie telemetria valida.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-300">
          Pagina {page} de {totalPages}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="button-secondary !px-4 !py-2 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </button>
          <button
            type="button"
            className="button-secondary !px-4 !py-2 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}
