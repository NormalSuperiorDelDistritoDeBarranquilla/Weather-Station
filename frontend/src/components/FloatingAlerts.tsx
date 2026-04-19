import { X, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useAlerts } from '../hooks/useAlerts'
import type { SensorAlert } from '../types/api'
import { formatDateTime, formatNumber } from '../utils/format'

type ToastAlert = SensorAlert & { toastKey: string }

const severityStyle = {
  advisory: 'border-amber-400/30 bg-[#1a1608] text-amber-50',
  warning: 'border-orange-400/30 bg-[#1a1010] text-orange-50',
  critical: 'border-rose-400/30 bg-[#1a0c12] text-rose-50',
}

export function FloatingAlerts() {
  const { data } = useAlerts()
  const [visibleAlerts, setVisibleAlerts] = useState<ToastAlert[]>([])
  const [dismissedKeys, setDismissedKeys] = useState<string[]>([])
  const timersRef = useRef<Record<string, number>>({})

  const importantAlerts = useMemo<ToastAlert[]>(
    () =>
      (data?.alerts ?? [])
        .filter((alert) => alert.severity === 'critical')
        .map((alert) => ({
          ...alert,
          toastKey: alert.code,
        })),
    [data?.alerts],
  )

  const dismissAlert = (toastKey: string) => {
    const timerId = timersRef.current[toastKey]
    if (timerId) {
      window.clearTimeout(timerId)
      delete timersRef.current[toastKey]
    }

    setVisibleAlerts((current) => current.filter((item) => item.toastKey !== toastKey))
    setDismissedKeys((current) => (current.includes(toastKey) ? current : [...current, toastKey]))
  }

  useEffect(() => {
    setVisibleAlerts((current) => {
      const next = [...current]

      for (const alert of importantAlerts) {
        if (dismissedKeys.includes(alert.toastKey)) {
          continue
        }

        if (!next.some((item) => item.toastKey === alert.toastKey)) {
          next.unshift(alert)
        }
      }

      return next.slice(0, 3)
    })
  }, [dismissedKeys, importantAlerts])

  useEffect(() => {
    for (const alert of visibleAlerts) {
      if (timersRef.current[alert.toastKey]) {
        continue
      }

      timersRef.current[alert.toastKey] = window.setTimeout(() => {
        dismissAlert(alert.toastKey)
      }, alert.severity === 'critical' ? 12000 : 9000)
    }

    return () => {
      for (const timerId of Object.values(timersRef.current)) {
        window.clearTimeout(timerId)
      }
      timersRef.current = {}
    }
  }, [visibleAlerts])

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-50 flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3 lg:right-8">
      {visibleAlerts.map((alert) => (
        <article
          key={alert.toastKey}
          className={`alert-toast pointer-events-auto rounded-[1.6rem] border p-4 backdrop-blur-2xl ${severityStyle[alert.severity]}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">{alert.severity}</p>
                <h4 className="text-base font-semibold text-white">{alert.title}</h4>
                <p className="text-sm leading-6 text-white/80">{alert.message}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/55">
                  <span>{formatDateTime(alert.triggered_at)}</span>
                  {alert.current_value !== null ? (
                    <span>{`${formatNumber(alert.current_value, 1)} ${alert.unit ?? ''}`.trim()}</span>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              onClick={() => dismissAlert(alert.toastKey)}
              aria-label="Cerrar alerta flotante"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
