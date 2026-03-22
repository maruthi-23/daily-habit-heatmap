import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

function getEffectiveTheme(mode: string): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode as 'dark' | 'light'
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)

  useEffect(() => {
    const apply = () => {
      const effective = getEffectiveTheme(mode)
      document.documentElement.setAttribute('data-theme', effective)
    }

    apply()

    // Listen for OS-level changes when in system mode
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    if (mode === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [mode])

  return <>{children}</>
}
