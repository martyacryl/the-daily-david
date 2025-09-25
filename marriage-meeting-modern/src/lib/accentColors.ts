// Accent color definitions and utilities
export const ACCENT_COLORS = {
  purple: {
    name: 'Purple',
    primary: 'purple-600',
    primaryDark: 'purple-500',
    secondary: 'purple-100',
    secondaryDark: 'purple-900/20',
    text: 'purple-700',
    textDark: 'purple-300',
    border: 'purple-200',
    borderDark: 'purple-700',
    bg: 'purple-50',
    bgDark: 'purple-900/10'
  },
  green: {
    name: 'Green',
    primary: 'green-600',
    primaryDark: 'green-500',
    secondary: 'green-100',
    secondaryDark: 'green-900/20',
    text: 'green-700',
    textDark: 'green-300',
    border: 'green-200',
    borderDark: 'green-700',
    bg: 'green-50',
    bgDark: 'green-900/10'
  },
  blue: {
    name: 'Blue',
    primary: 'blue-600',
    primaryDark: 'blue-500',
    secondary: 'blue-100',
    secondaryDark: 'blue-900/20',
    text: 'blue-700',
    textDark: 'blue-300',
    border: 'blue-200',
    borderDark: 'blue-700',
    bg: 'blue-50',
    bgDark: 'blue-900/10'
  },
  slate: {
    name: 'Slate',
    primary: 'slate-600',
    primaryDark: 'slate-500',
    secondary: 'slate-100',
    secondaryDark: 'slate-900/20',
    text: 'slate-700',
    textDark: 'slate-300',
    border: 'slate-200',
    borderDark: 'slate-700',
    bg: 'slate-50',
    bgDark: 'slate-900/10'
  },
  red: {
    name: 'Red',
    primary: 'red-600',
    primaryDark: 'red-500',
    secondary: 'red-100',
    secondaryDark: 'red-900/20',
    text: 'red-700',
    textDark: 'red-300',
    border: 'red-200',
    borderDark: 'red-700',
    bg: 'red-50',
    bgDark: 'red-900/10'
  },
  orange: {
    name: 'Orange',
    primary: 'orange-600',
    primaryDark: 'orange-500',
    secondary: 'orange-100',
    secondaryDark: 'orange-900/20',
    text: 'orange-700',
    textDark: 'orange-300',
    border: 'orange-200',
    borderDark: 'orange-700',
    bg: 'orange-50',
    bgDark: 'orange-900/10'
  },
  indigo: {
    name: 'Indigo',
    primary: 'indigo-600',
    primaryDark: 'indigo-500',
    secondary: 'indigo-100',
    secondaryDark: 'indigo-900/20',
    text: 'indigo-700',
    textDark: 'indigo-300',
    border: 'indigo-200',
    borderDark: 'indigo-700',
    bg: 'indigo-50',
    bgDark: 'indigo-900/10'
  },
  emerald: {
    name: 'Emerald',
    primary: 'emerald-600',
    primaryDark: 'emerald-500',
    secondary: 'emerald-100',
    secondaryDark: 'emerald-900/20',
    text: 'emerald-700',
    textDark: 'emerald-300',
    border: 'emerald-200',
    borderDark: 'emerald-700',
    bg: 'emerald-50',
    bgDark: 'emerald-900/10'
  }
} as const

export type AccentColorKey = keyof typeof ACCENT_COLORS

// Utility function to get accent color classes
export const getAccentClasses = (colorKey: string, variant: 'primary' | 'secondary' | 'text' | 'border' | 'bg' = 'primary') => {
  const color = ACCENT_COLORS[colorKey as AccentColorKey]
  if (!color) return ACCENT_COLORS.purple[variant] // fallback to purple
  
  return color[variant]
}

// Utility function to get accent color classes with dark mode support
export const getAccentClassesWithDark = (colorKey: string, variant: 'primary' | 'secondary' | 'text' | 'border' | 'bg' = 'primary') => {
  const color = ACCENT_COLORS[colorKey as AccentColorKey]
  if (!color) return `${ACCENT_COLORS.purple[variant]} dark:${ACCENT_COLORS.purple[`${variant}Dark` as keyof typeof ACCENT_COLORS.purple]}` // fallback to purple
  
  const darkVariant = `${variant}Dark` as keyof typeof color
  return `${color[variant]} dark:${color[darkVariant]}`
}

// Get all available accent colors as array
export const getAccentColorOptions = () => {
  return Object.entries(ACCENT_COLORS).map(([key, value]) => ({
    key,
    name: value.name,
    primary: value.primary,
    secondary: value.secondary
  }))
}
