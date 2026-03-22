import { useEffect, useState } from 'react'
import { useHabitsStore } from '@/store/habitsStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FullHeatmap from '@/components/heatmap/FullHeatmap'

export default function HeatmapPage() {
  const { heatmap, dashboard, loading, fetchHeatmap, fetchDashboard } = useHabitsStore()
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => { fetchDashboard() }, [])
  useEffect(() => { fetchHeatmap(year) }, [year])

  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Activity Heatmap</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Your consistency visualized
          </p>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost rounded-lg p-2"
            onClick={() => setYear(y => y - 1)}
            disabled={year <= 2020}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono font-semibold text-sm min-w-[3rem] text-center" style={{ color: 'var(--text)' }}>
            {year}
          </span>
          <button
            className="btn-ghost rounded-lg p-2"
            onClick={() => setYear(y => y + 1)}
            disabled={year >= currentYear}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      {heatmap && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Days', value: heatmap.completedDays },
            { label: 'Completion Rate', value: `${Math.round(heatmap.completionRate * 100)}%` },
            { label: 'Current Streak', value: `${dashboard?.currentStreak ?? 0}d` },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-light)' }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full heatmap */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)' }} />
          </div>
        ) : (
          <FullHeatmap data={heatmap?.entries ?? []} year={year} />
        )}
      </div>

      {/* Per-habit breakdown */}
      {dashboard?.habits && dashboard.habits.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Habit Breakdown</h2>
          <div className="space-y-3">
            {dashboard.habits.map(habit => {
              const pct = habit.totalCompletions > 0
                ? Math.min(100, Math.round((habit.totalCompletions / 365) * 100))
                : 0
              return (
                <div key={habit.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{habit.icon}</span>
                      <span style={{ color: 'var(--text)' }}>{habit.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>🔥 {habit.currentStreak}d streak</span>
                      <span>{habit.totalCompletions} total</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: habit.color || 'var(--accent)' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
