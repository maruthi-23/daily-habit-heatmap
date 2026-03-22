import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { AuthResponse, CreateHabitRequest, DashboardStats, Habit, HabitEntry, HeatmapResponse, UpdateHabitRequest } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor – attach access token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor – refresh on 401
let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true

      if (isRefreshing) {
        return new Promise(resolve => {
          queue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        queue.forEach(cb => cb(data.accessToken))
        queue = []

        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  logout: () => api.post('/auth/logout').then(r => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then(r => r.data),
}

// ---- Habits ----
export const habitsApi = {
  getAll: () => api.get<Habit[]>('/habits').then(r => r.data),

  create: (data: CreateHabitRequest) =>
    api.post<Habit>('/habits', data).then(r => r.data),

  update: (id: string, data: UpdateHabitRequest) =>
    api.put<Habit>(`/habits/${id}`, data).then(r => r.data),

  delete: (id: string) => api.delete(`/habits/${id}`),

  complete: (id: string, date?: string, note?: string) =>
    api.post<HabitEntry>(`/habits/${id}/complete`, { date, note }).then(r => r.data),

  uncomplete: (id: string, date?: string) =>
    api.delete(`/habits/${id}/complete`, { params: { date } }),

  getHeatmap: (year?: number) =>
    api.get<HeatmapResponse>('/habits/heatmap', { params: { year } }).then(r => r.data),

  getDashboard: () => api.get<DashboardStats>('/habits/dashboard').then(r => r.data),
}

export default api
