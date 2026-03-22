import { HeatmapEntry } from '@/types'
import { useMemo } from 'react'
import { format, eachDayOfInterval } from 'date-fns'

interface Props {
  data: HeatmapEntry[]
}

// Show last 26 weeks (like GitHub)
export default function MiniHeatmap({ data }: Props) {
  const today = new Date()

  const weeks = useMemo(() => {
    const start = new Date(today)
    start.setDate(start.getDate() - 181)
    const startSun = new Date(start)
    startSun.setDate(startSun.getDate() - startSun.getDay())

    const byDate: Record<string, number> = {}
    data.forEach(e => { byDate[e.date] = e.intensity })

    const allDays = eachDayOfInterval({ start: startSun, end: today })
    const weeks: (Date | null)[][] = []
    let week: (Date | null)[] = []

    allDays.forEach((day, i) => {
      if (i % 7 === 0 && week.length) { weeks.push(week); week = [] }
      week.push(day)
    })
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week) }

    return { weeks, byDate }
  }, [data, today.toDateString()])

  const getColor = (intensity: number) => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    if (intensity === 0) return 'var(--border)'
    if (isDark) {
      if (intensity <= 0.25) return '#166534'
      if (intensity <= 0.5)  return '#16a34a'
      if (intensity <= 0.75) return '#22c55e'
      return '#4ade80'
    } else {
      if (intensity <= 0.25) return '#bbf7d0'
      if (intensity <= 0.5)  return '#4ade80'
      if (intensity <= 0.75) return '#16a34a'
      return '#15803d'
    }
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
          {dayLabels.map((d, i) => (
            <div key={i} className="h-[11px] w-3 text-[8px] leading-[11px] text-right"
              style={{ color: i % 2 === 1 ? 'var(--text-muted)' : 'transparent' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Cells */}
        {weeks.weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 flex-shrink-0">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="h-[11px] w-[11px]" />
              const dateStr = format(day, 'yyyy-MM-dd')
              const intensity = weeks.byDate[dateStr] ?? 0
              const isFuture = day > new Date()
              return (
                <div
                  key={di}
                  className="heat-cell h-[11px] w-[11px]"
                  style={{ background: isFuture ? 'transparent' : getColor(intensity) }}
                  title={`${dateStr}: ${Math.round(intensity * 100)}%`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <div key={v} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: getColor(v) }} />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  )
}
