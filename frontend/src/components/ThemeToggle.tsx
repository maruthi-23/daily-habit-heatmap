import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore, ThemeMode } from '@/store/themeStore'

const modes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'light',  icon: <Sun size={15} />,     label: 'Light'  },
  { value: 'dark',   icon: <Moon size={15} />,    label: 'Dark'   },
  { value: 'system', icon: <Monitor size={15} />, label: 'System' },
]

export default function ThemeToggle() {
  const { mode, setMode } = useThemeStore()

  return (
    <div
      className="flex items-center rounded-xl p-1 gap-0.5"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      title="Toggle theme"
    >
      {modes.map(({ value, icon, label }) => {
        const active = mode === value
        return (
          <button
            key={value}
            onClick={() => setMode(value)}
            title={label}
            aria-label={`Switch to ${label} mode`}
            className="flex items-center justify-center rounded-lg transition-all duration-200"
            style={{
              width: 32,
              height: 28,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text-muted)',
              transform: active ? 'scale(1)' : 'scale(0.95)',
            }}
          >
            {icon}
          </button>
        )
      })}
    </div>
  )
}
