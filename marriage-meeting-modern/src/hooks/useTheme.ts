import { useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'

export const useTheme = () => {
  const { settings, updateGeneralSettings } = useSettingsStore()

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    const { theme } = settings

    // Remove all theme classes first
    root.classList.remove('dark', 'landing')

    // Apply appropriate theme classes
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'landing') {
      root.classList.add('dark', 'landing')
    }
    // 'light' theme has no additional classes
  }, [settings.theme])

  const toggleTheme = async () => {
    const themeCycle = ['light', 'dark', 'landing'] as const
    const currentIndex = themeCycle.indexOf(settings.theme)
    const nextIndex = (currentIndex + 1) % themeCycle.length
    const newTheme = themeCycle[nextIndex]
    await updateGeneralSettings({ theme: newTheme })
  }

  const setTheme = async (theme: 'light' | 'dark' | 'landing') => {
    await updateGeneralSettings({ theme })
  }

  return {
    theme: settings.theme,
    toggleTheme,
    setTheme,
    isDark: document.documentElement.classList.contains('dark'),
    isLanding: document.documentElement.classList.contains('landing')
  }
}
