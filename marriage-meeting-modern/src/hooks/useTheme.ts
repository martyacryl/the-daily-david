import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

export const useTheme = () => {
  const { theme, setTheme: setAppTheme } = useAppStore()

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    // Remove all theme classes first
    root.classList.remove('dark', 'landing')

    // Apply appropriate theme classes
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'landing') {
      root.classList.add('dark', 'landing')
    }
    // 'light' theme has no additional classes
  }, [theme])

  const toggleTheme = async () => {
    const themeCycle = ['light', 'dark', 'landing'] as const
    const currentIndex = themeCycle.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeCycle.length
    const newTheme = themeCycle[nextIndex]
    setAppTheme(newTheme)
  }

  const setTheme = async (newTheme: 'light' | 'dark' | 'landing') => {
    setAppTheme(newTheme)
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: document.documentElement.classList.contains('dark'),
    isLanding: document.documentElement.classList.contains('landing')
  }
}
