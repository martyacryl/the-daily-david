import { useAccentColor as useAccentColorStore } from '../stores/appStore'
import { getAccentClassesWithDark, ACCENT_COLORS, type AccentColorKey } from '../lib/accentColors'

export const useAccentColor = () => {
  const accentColor = useAccentColorStore()
  
  const getClasses = (variant: 'primary' | 'secondary' | 'text' | 'border' | 'bg' = 'primary') => {
    return getAccentClassesWithDark(accentColor, variant)
  }
  
  // Simple color getter for basic usage (no dark mode)
  const getColor = (variant: 'primary' | 'secondary' | 'text' | 'border' | 'bg' = 'primary') => {
    const color = ACCENT_COLORS[accentColor as AccentColorKey] || ACCENT_COLORS.purple
    return color[variant]
  }
  
  const getColorInfo = () => {
    return ACCENT_COLORS[accentColor as AccentColorKey] || ACCENT_COLORS.purple
  }
  
  return {
    accentColor,
    getClasses,
    getColor,
    getColorInfo
  }
}
