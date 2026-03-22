import { create } from 'zustand'
import { Habit, DashboardStats, HeatmapResponse, CreateHabitRequest, UpdateHabitRequest } from '@/types'
import { habitsApi } from '@/services/api'

interface HabitsState {
  habits: Habit[]
  dashboard: DashboardStats | null
  heatmap: HeatmapResponse | null
  loading: boolean
  error: string | null

  fetchDashboard: () => Promise<void>
  fetchHeatmap: (year?: number) => Promise<void>
  createHabit: (data: CreateHabitRequest) => Promise<void>
  updateHabit: (id: string, data: UpdateHabitRequest) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleHabit: (id: string, completed: boolean) => Promise<void>
  clearError: () => void
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  dashboard: null,
  heatmap: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const dashboard = await habitsApi.getDashboard()
      set({ dashboard, habits: dashboard.habits, loading: false })
    } catch (e: any) {
      set({ error: e?.response?.data?.message || 'Failed to load', loading: false })
    }
  },

  fetchHeatmap: async (year) => {
    try {
      const heatmap = await habitsApi.getHeatmap(year)
      set({ heatmap })
    } catch (e: any) {
      set({ error: e?.response?.data?.message || 'Failed to load heatmap' })
    }
  },

  createHabit: async (data) => {
    const habit = await habitsApi.create(data)
    set(state => ({
      habits: [habit, ...state.habits],
      dashboard: state.dashboard
        ? { ...state.dashboard, totalHabits: state.dashboard.totalHabits + 1, habits: [habit, ...state.dashboard.habits] }
        : null,
    }))
  },

  updateHabit: async (id, data) => {
    const updated = await habitsApi.update(id, data)
    set(state => ({
      habits: state.habits.map(h => h.id === id ? updated : h),
      dashboard: state.dashboard
        ? { ...state.dashboard, habits: state.dashboard.habits.map(h => h.id === id ? updated : h) }
        : null,
    }))
  },

  deleteHabit: async (id) => {
    await habitsApi.delete(id)
    set(state => ({
      habits: state.habits.filter(h => h.id !== id),
      dashboard: state.dashboard
        ? { ...state.dashboard, totalHabits: state.dashboard.totalHabits - 1, habits: state.dashboard.habits.filter(h => h.id !== id) }
        : null,
    }))
  },

  toggleHabit: async (id, completed) => {
    if (completed) {
      await habitsApi.uncomplete(id)
    } else {
      await habitsApi.complete(id)
    }
    // Optimistic update
    set(state => ({
      habits: state.habits.map(h =>
        h.id === id
          ? { ...h, completedToday: !completed, currentStreak: !completed ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1) }
          : h
      ),
      dashboard: state.dashboard ? {
        ...state.dashboard,
        todayCompleted: state.dashboard.todayCompleted + (!completed ? 1 : -1),
        habits: state.dashboard.habits.map(h =>
          h.id === id ? { ...h, completedToday: !completed } : h
        ),
      } : null,
    }))
    // Refresh heatmap
    get().fetchHeatmap()
  },

  clearError: () => set({ error: null }),
}))
