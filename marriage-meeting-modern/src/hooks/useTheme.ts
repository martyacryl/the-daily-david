import { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

export const useTheme = () => {
  const { settings, updateGeneralSettings } = useSettingsStore()

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const { theme } = settings

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else { // auto - follow system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    }
  }, [settings.theme])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (settings.theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = document.documentElement
      root.classList.toggle('dark', mediaQuery.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings.theme])

  const toggleTheme = async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    await updateGeneralSettings({ theme: newTheme })
  }

  const setTheme = async (theme: 'light' | 'dark' | 'auto') => {
    await updateGeneralSettings({ theme })
  }

  return {
    theme: settings.theme,
    toggleTheme,
    setTheme,
    isDark: document.documentElement.classList.contains('dark')
  }
}
