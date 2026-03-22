import { useEffect, useState } from 'react'
import { useHabitsStore } from '@/store/habitsStore'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import HabitCard from '@/components/habits/HabitCard'
import HabitFormModal from '@/components/habits/HabitFormModal'
import { Habit } from '@/types'

export default function HabitsPage() {
  const { habits, loading, fetchDashboard, toggleHabit, deleteHabit } = useHabitsStore()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  useEffect(() => { fetchDashboard() }, [])

  const filtered = habits.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = async (id: string, completedToday: boolean) => {
    try {
      await toggleHabit(id, completedToday)
      toast.success(completedToday ? 'Habit unmarked' : '🔥 Done!')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this habit?')) return
    try {
      await deleteHabit(id)
      toast.success('Habit deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingHabit(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>My Habits</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          className="input pl-9"
          placeholder="Search habits…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Habits grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-28 animate-pulse" style={{ background: 'var(--surface-2)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>
            {search ? 'No matching habits' : 'No habits yet'}
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            {search ? 'Try a different search' : 'Start building your daily routine'}
          </p>
          {!search && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Create First Habit
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              showActions
              onToggle={() => handleToggle(habit.id, habit.completedToday)}
              onEdit={() => handleEdit(habit)}
              onDelete={() => handleDelete(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <HabitFormModal
          habit={editingHabit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
