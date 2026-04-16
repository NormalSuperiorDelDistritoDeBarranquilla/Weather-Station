interface StatusBadgeProps {
  label: string
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info'
}

const toneMap = {
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  danger: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  neutral: 'border-white/10 bg-white/5 text-slate-200',
  info: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>
      {label}
    </span>
  )
}
