import { useEffect } from 'react'
import { useHabitsStore } from '@/store/habitsStore'
import { useAuthStore } from '@/store/authStore'
import { Flame, Trophy, TrendingUp, CheckCircle2, Target, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import HabitCard from '@/components/habits/HabitCard'
import StatsCard from '@/components/ui/StatsCard'
import MiniHeatmap from '@/components/heatmap/MiniHeatmap'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { dashboard, heatmap, loading, fetchDashboard, fetchHeatmap, toggleHabit } = useHabitsStore()

  useEffect(() => {
    fetchDashboard()
    fetchHeatmap(new Date().getFullYear())
  }, [])

  const handleToggle = async (id: string, completedToday: boolean) => {
    try {
      await toggleHabit(id, completedToday)
      toast.success(completedToday ? 'Habit unmarked' : '🔥 Habit completed!')
    } catch {
      toast.error('Failed to update habit')
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const todayPct = dashboard
    ? dashboard.todayTotal > 0
      ? Math.round((dashboard.todayCompleted / dashboard.todayTotal) * 100)
      : 0
    : 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <Link to="/habits" className="btn-primary flex-shrink-0">
          <Plus size={16} /> New Habit
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard
          icon={<CheckCircle2 size={18} />}
          label="Today"
          value={loading ? '—' : `${dashboard?.todayCompleted ?? 0}/${dashboard?.todayTotal ?? 0}`}
          sub={`${todayPct}% done`}
          accent="#22c55e"
        />
        <StatsCard
          icon={<Flame size={18} />}
          label="Best Streak"
          value={loading ? '—' : `${dashboard?.currentStreak ?? 0}d`}
          sub="current"
          accent="#f97316"
        />
        <StatsCard
          icon={<Trophy size={18} />}
          label="Longest"
          value={loading ? '—' : `${dashboard?.longestStreak ?? 0}d`}
          sub="all time"
          accent="#eab308"
        />
        <StatsCard
          icon={<TrendingUp size={18} />}
          label="Weekly"
          value={loading ? '—' : `${Math.round(dashboard?.weeklyCompletionRate ?? 0)}%`}
          sub="completion"
          accent="var(--accent)"
        />
      </div>

      {/* Today progress bar */}
      {dashboard && dashboard.todayTotal > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Today's Progress
            </span>
            <span className="font-mono text-sm" style={{ color: 'var(--accent-light)' }}>
              {dashboard.todayCompleted}/{dashboard.todayTotal}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${todayPct}%`,
                background: todayPct === 100
                  ? 'var(--green)'
                  : 'linear-gradient(90deg, var(--accent), var(--accent-light))'
              }}
            />
          </div>
          {todayPct === 100 && (
            <p className="mt-2 text-xs font-medium" style={{ color: 'var(--green)' }}>
              🎉 All habits done for today!
            </p>
          )}
        </div>
      )}

      {/* Mini heatmap */}
      {heatmap && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Activity — {new Date().getFullYear()}
            </h2>
            <Link to="/heatmap" className="text-xs hover:underline" style={{ color: 'var(--accent-light)' }}>
              Full view →
            </Link>
          </div>
          <MiniHeatmap data={heatmap.entries} />
          <div className="mt-3 flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{heatmap.completedDays} active days</span>
            <span>{Math.round(heatmap.completionRate * 100)}% of year</span>
          </div>
        </div>
      )}

      {/* Habits list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Today's Habits</h2>
          <Link to="/habits" className="text-xs hover:underline" style={{ color: 'var(--accent-light)' }}>
            Manage →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse" style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : dashboard?.habits.length === 0 ? (
          <div className="card flex flex-col items-center py-12 text-center">
            <Target size={36} className="mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>No habits yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Create your first habit to start tracking</p>
            <Link to="/habits" className="btn-primary">
              <Plus size={15} /> Add Habit
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard?.habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={() => handleToggle(habit.id, habit.completedToday)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
