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
    } else {
      root.classList.remove('dark')
    }
  }, [settings.theme])

  const toggleTheme = async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    await updateGeneralSettings({ theme: newTheme })
  }

  const setTheme = async (theme: 'light' | 'dark') => {
    await updateGeneralSettings({ theme })
  }

  return {
    theme: settings.theme,
    toggleTheme,
    setTheme,
    isDark: document.documentElement.classList.contains('dark')
  }
}
