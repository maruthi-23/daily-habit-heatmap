import { Habit } from '@/types'
import { CheckCircle2, Circle, MoreVertical, Pencil, Trash2, Flame } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

interface Props {
  habit: Habit
  showActions?: boolean
  onToggle: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function HabitCard({ habit, showActions, onToggle, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    setToggling(true)
    await onToggle()
    setToggling(false)
  }

  return (
    <div
      className={clsx(
        'card relative flex flex-col gap-3 cursor-pointer select-none transition-all duration-200',
        habit.completedToday && 'opacity-90'
      )}
      style={{
        borderColor: habit.completedToday ? habit.color + '55' : undefined,
        background: habit.completedToday ? habit.color + '0a' : undefined,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon */}
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ background: habit.color + '22' }}
          >
            {habit.icon}
          </div>

          {/* Name & description */}
          <div className="min-w-0">
            <p
              className={clsx('font-medium text-sm leading-tight', habit.completedToday && 'line-through')}
              style={{ color: habit.completedToday ? 'var(--text-muted)' : 'var(--text)' }}
            >
              {habit.name}
            </p>
            {habit.description && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Actions menu */}
          {showActions && (
            <div className="relative">
              <button
                className="btn-ghost rounded-md p-1.5"
                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
              >
                <MoreVertical size={15} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-8 z-20 rounded-xl py-1 min-w-[140px] shadow-xl"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--text)' }}
                      onClick={() => { setMenuOpen(false); onEdit?.() }}
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: '#f87171' }}
                      onClick={() => { setMenuOpen(false); onDelete?.() }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Toggle button */}
          <button
            className="transition-transform active:scale-90"
            onClick={handleToggle}
            disabled={toggling}
            title={habit.completedToday ? 'Mark incomplete' : 'Mark complete'}
          >
            {habit.completedToday
              ? <CheckCircle2 size={24} style={{ color: habit.color || 'var(--green)' }} />
              : <Circle size={24} style={{ color: 'var(--text-muted)' }} />
            }
          </button>
        </div>
      </div>

      {/* Bottom row – streak & completions */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        {habit.currentStreak > 0 && (
          <span className="flex items-center gap-1">
            <Flame size={12} style={{ color: '#f97316' }} />
            <span style={{ color: '#f97316' }}>{habit.currentStreak}d</span>
          </span>
        )}
        <span>{habit.totalCompletions} completions</span>
        <span>Best: {habit.longestStreak}d</span>

        {/* Target indicator */}
        <span className="ml-auto">{habit.targetDaysPerWeek}×/wk</span>
      </div>
    </div>
  )
}
