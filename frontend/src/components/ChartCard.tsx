import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

import { formatMetricValue } from '../utils/format'

interface ChartCardProps {
  title: string
  description: string
  unit: string
  stroke: string
  dataKey: string
  data: Array<Record<string, string | number | null>>
}

export function ChartCard({ title, description, unit, stroke, dataKey, data }: ChartCardProps) {
  const hasRealValues = data.some((item) => {
    const candidate = item[dataKey]
    return typeof candidate === 'number' && !Number.isNaN(candidate)
  })
  const formatTooltipValue = (value: number | string | ReadonlyArray<number | string> | undefined) =>
    formatMetricValue(typeof value === 'number' ? value : Number(value), unit)
  const formatTooltipLabel = (value: unknown) =>
    typeof value === 'string' ? new Date(value).toLocaleString('es-CO') : ''

  return (
    <article className="panel p-6">
      <div className="mb-6 space-y-2">
        <h3 className="font-display text-2xl text-white">{title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
      </div>

      <div className="h-80">
        {hasRealValues ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value: string) =>
                  new Intl.DateTimeFormat('es-CO', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(value))
                }
                minTickGap={28}
                stroke="rgba(203, 213, 225, 0.55)"
              />
              <YAxis
                stroke="rgba(203, 213, 225, 0.55)"
                tickFormatter={(value: number) => `${value}`}
                width={56}
              />
              <Tooltip formatter={formatTooltipValue} labelFormatter={formatTooltipLabel} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={stroke}
                strokeWidth={2.7}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/20 px-6 text-center text-sm leading-6 text-slate-400">
            Sin lecturas reales todavia para esta variable. La grafica aparecera cuando Arduino o ESP32 envie datos al backend.
          </div>
        )}
      </div>
    </article>
  )
}
