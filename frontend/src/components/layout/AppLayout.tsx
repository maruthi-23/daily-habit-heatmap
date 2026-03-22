import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Flame, BarChart2, LogOut, Zap, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { useState } from 'react'
import clsx from 'clsx'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits',    icon: Flame,           label: 'Habits'    },
  { to: '/heatmap',   icon: BarChart2,       label: 'Heatmap'   },
]

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            HabitMap
          </span>
          <button
            className="ml-auto lg:hidden btn-ghost rounded-md p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive ? 'text-white' : 'hover:bg-[var(--surface-2)]'
                )
              }
              style={({ isActive }) => isActive
                ? { background: 'var(--accent)', color: '#fff' }
                : { color: 'var(--text-muted)' }
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Theme toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Theme
            </span>
            <ThemeToggle />
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn-danger w-full justify-start text-xs rounded-lg px-3 py-2"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="flex items-center gap-4 px-4 py-3 lg:hidden"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            className="btn-ghost rounded-md p-1.5"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--accent)' }}>
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold" style={{ color: 'var(--text)' }}>HabitMap</span>
          </div>
          {/* Mobile theme toggle */}
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg)' }}>
          <div className="page-enter max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
