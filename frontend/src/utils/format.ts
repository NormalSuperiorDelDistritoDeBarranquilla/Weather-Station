export function formatDateTime(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) {
    return 'Sin datos'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(new Date(value))
}

export function formatNumber(value?: number | null, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--'
  }

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatMetricValue(value?: number | null, unit?: string, fractionDigits = 1) {
  const formatted = formatNumber(value, fractionDigits)
  return formatted === '--' ? formatted : `${formatted}${unit ? ` ${unit}` : ''}`
}

export function formatRelativeDelta(value?: number | null, unit?: string) {
  if (value === null || value === undefined) {
    return 'Sin referencia'
  }

  const prefix = value > 0 ? '+' : ''
  return `${prefix}${formatNumber(value, 1)}${unit ? ` ${unit}` : ''}`
}
