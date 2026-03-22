interface Props {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  accent?: string
}

export default function StatsCard({ icon, label, value, sub, accent = 'var(--accent)' }: Props) {
  return (
    <div className="card flex flex-col gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: accent + '22', color: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold font-mono leading-tight" style={{ color: 'var(--text)' }}>
          {value}
        </p>
        <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-xs mt-1" style={{ color: accent + 'cc' }}>{sub}</p>
      </div>
    </div>
  )
}
