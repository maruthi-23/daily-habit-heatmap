export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Habit {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  targetDaysPerWeek: number
  isActive: boolean
  createdAt: string
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  completedToday: boolean
}

export interface HabitEntry {
  id: string
  habitId: string
  date: string
  status: 'DONE' | 'SKIPPED'
  note?: string
}

export interface HeatmapEntry {
  date: string
  count: number
  total: number
  intensity: number
}

export interface HeatmapResponse {
  entries: HeatmapEntry[]
  totalDays: number
  completedDays: number
  completionRate: number
}

export interface DashboardStats {
  totalHabits: number
  todayCompleted: number
  todayTotal: number
  currentStreak: number
  longestStreak: number
  weeklyCompletionRate: number
  habits: Habit[]
}

export interface CreateHabitRequest {
  name: string
  description?: string
  icon?: string
  color?: string
  targetDaysPerWeek?: number
}

export interface UpdateHabitRequest {
  name?: string
  description?: string
  icon?: string
  color?: string
  targetDaysPerWeek?: number
  isActive?: boolean
}

export interface ApiError {
  status: number
  error: string
  message: string
  fieldErrors?: Record<string, string>
}
