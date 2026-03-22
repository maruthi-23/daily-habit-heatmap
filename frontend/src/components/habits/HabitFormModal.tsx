import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useHabitsStore } from '@/store/habitsStore'
import { Habit } from '@/types'
import toast from 'react-hot-toast'

const ICONS = ['🎯', '💪', '📚', '🏃', '🧘', '💻', '🎵', '🍎', '💧', '😴', '✍️', '🌿', '🧠', '🏋️', '🚴', '🎨']
const COLORS = ['#22c55e', '#7c5cfc', '#3b82f6', '#f97316', '#ec4899', '#14b8a6', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4']

interface Props {
  habit: Habit | null
  onClose: () => void
}

export default function HabitFormModal({ habit, onClose }: Props) {
  const { createHabit, updateHabit } = useHabitsStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '🎯',
    color: '#22c55e',
    targetDaysPerWeek: 7,
  })

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name,
        description: habit.description || '',
        icon: habit.icon,
        color: habit.color,
        targetDaysPerWeek: habit.targetDaysPerWeek,
      })
    }
  }, [habit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setLoading(true)
    try {
      if (habit) {
        await updateHabit(habit.id, form)
        toast.success('Habit updated!')
      } else {
        await createHabit(form)
        toast.success('Habit created! 🎯')
      }
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            {habit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button className="btn-ghost rounded-lg p-1.5" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: form.color + '15', border: `1px solid ${form.color}30` }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ background: form.color + '25' }}
            >
              {form.icon}
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                {form.name || 'Habit name'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {form.targetDaysPerWeek}×/week
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="label">Habit Name *</label>
            <input
              className="input"
              placeholder="e.g. Morning run, Read 30 min…"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required maxLength={100}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional details…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              maxLength={300}
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className="h-9 w-9 rounded-lg text-lg transition-all"
                  style={{
                    background: form.icon === icon ? 'var(--accent)' : 'var(--surface-2)',
                    border: `1px solid ${form.icon === icon ? 'var(--accent)' : 'var(--border)'}`,
                    transform: form.icon === icon ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className="h-7 w-7 rounded-full transition-all"
                  style={{
                    background: color,
                    ring: form.color === color ? `3px solid ${color}` : 'none',
                    transform: form.color === color ? 'scale(1.25)' : 'scale(1)',
                    outline: form.color === color ? `2px solid ${color}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Target days */}
          <div>
            <label className="label">
              Target: {form.targetDaysPerWeek}×/week
            </label>
            <input
              type="range"
              min={1} max={7}
              value={form.targetDaysPerWeek}
              onChange={e => setForm(f => ({ ...f, targetDaysPerWeek: +e.target.value }))}
              className="w-full accent-purple-500"
              style={{ accentColor: 'var(--accent)' }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>1×</span><span>7×</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || !form.name.trim()}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving…' : (habit ? 'Save Changes' : 'Create Habit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
