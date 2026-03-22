import { HeatmapEntry } from '@/types'
import { useMemo, useState } from 'react'
import { format, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns'

interface Props {
  data: HeatmapEntry[]
  year: number
}

export default function FullHeatmap({ data, year }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const { weeks, byDate, monthLabels } = useMemo(() => {
    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 0, 1))

    // Start from Sunday of the first week
    const startSun = new Date(yearStart)
    startSun.setDate(startSun.getDate() - startSun.getDay())

    const byDate: Record<string, { intensity: number; count: number; total: number }> = {}
    data.forEach(e => { byDate[e.date] = { intensity: e.intensity, count: e.count, total: e.total } })

    const allDays = eachDayOfInterval({ start: startSun, end: yearEnd })
    const weeks: (Date | null)[][] = []
    let week: (Date | null)[] = []

    allDays.forEach((day, i) => {
      if (i % 7 === 0 && week.length) { weeks.push(week); week = [] }
      week.push(day)
    })
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week) }

    // Month label positions
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const firstValid = week.find(d => d !== null)
      if (firstValid) {
        const m = firstValid.getMonth()
        if (m !== lastMonth) {
          monthLabels.push({ label: format(firstValid, 'MMM'), col: wi })
          lastMonth = m
        }
      }
    })

    return { weeks, byDate, monthLabels }
  }, [data, year])

  const getColor = (intensity: number) => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    if (intensity === 0) return 'var(--border)'
    if (isDark) {
      if (intensity <= 0.25) return '#14532d'
      if (intensity <= 0.5)  return '#166534'
      if (intensity <= 0.75) return '#16a34a'
      return '#22c55e'
    } else {
      if (intensity <= 0.25) return '#bbf7d0'
      if (intensity <= 0.5)  return '#4ade80'
      if (intensity <= 0.75) return '#16a34a'
      return '#15803d'
    }
  }

  const CELL = 14
  const GAP = 3
  const CELL_STEP = CELL + GAP
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex mb-2 ml-9" style={{ gap: 0 }}>
        {monthLabels.map(({ label, col }, i) => {
          const nextCol = monthLabels[i + 1]?.col ?? weeks.length
          const width = (nextCol - col) * CELL_STEP
          return (
            <div
              key={i}
              className="text-xs flex-shrink-0 overflow-hidden"
              style={{ width, color: 'var(--text-muted)', minWidth: 0 }}
            >
              {label}
            </div>
          )
        })}
      </div>

      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col mr-2 flex-shrink-0" style={{ gap: GAP }}>
          {dayLabels.map((d, i) => (
            <div
              key={i}
              className="text-[10px] leading-none text-right flex-shrink-0"
              style={{ height: CELL, lineHeight: `${CELL}px`, color: 'var(--text-muted)', minWidth: '28px' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex overflow-x-auto" style={{ gap: GAP }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col flex-shrink-0" style={{ gap: GAP }}>
              {week.map((day, di) => {
                if (!day) return <div key={di} style={{ width: CELL, height: CELL }} />

                const dateStr = format(day, 'yyyy-MM-dd')
                const entry = byDate[dateStr]
                const intensity = entry?.intensity ?? 0
                const isFuture = day > new Date()
                const isCurrentYear = day.getFullYear() === year

                return (
                  <div
                    key={di}
                    className="heat-cell rounded-sm cursor-pointer"
                    style={{
                      width: CELL,
                      height: CELL,
                      background: (!isCurrentYear || isFuture) ? 'transparent' : getColor(intensity),
                      borderRadius: 3,
                    }}
                    onMouseEnter={e => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect()
                      const label = entry
                        ? `${dateStr}: ${entry.count}/${entry.total} habits`
                        : `${dateStr}: 0 habits`
                      setTooltip({ text: label, x: rect.left + rect.width / 2, y: rect.top - 8 })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <div key={v} style={{ width: CELL, height: CELL, background: getColor(v), borderRadius: 3 }} />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-lg text-xs pointer-events-none shadow-lg -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
