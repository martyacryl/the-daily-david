import { useAccentColor as useAccentColorStore } from '../stores/appStore'
import { getAccentClassesWithDark, ACCENT_COLORS, type AccentColorKey } from '../lib/accentColors'

export const useAccentColor = () => {
  const accentColor = useAccentColorStore()
  
  const getClasses = (variant: 'primary' | 'secondary' | 'text' | 'border' | 'bg' = 'primary') => {
    return getAccentClassesWithDark(accentColor, variant)
  }
  
  // Simple color getter for basic usage (no dark mode)
  const getColor = (variant: 'primary' | 'primaryDark' | 'secondary' | 'text' | 'border' | 'bg' | 'bgDark' = 'primary') => {
    // Ensure accentColor is a valid key
    const validAccentColor = accentColor && ACCENT_COLORS[accentColor as AccentColorKey] ? accentColor : 'slate'
    const color = ACCENT_COLORS[validAccentColor as AccentColorKey]
    return color[variant]
  }
  
  const getColorInfo = () => {
    return ACCENT_COLORS[accentColor as AccentColorKey] || ACCENT_COLORS.slate
  }
  
  return {
    accentColor,
    getClasses,
    getColor,
    getColorInfo
  }
}
