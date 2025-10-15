import { create } from 'zustand'
import { AppState, ViewType } from '@/types'

interface AppStore extends AppState {
  // State setters
  setCurrentDate: (date: Date) => void
  setCurrentView: (view: ViewType) => void
  setTheme: (theme: 'light' | 'dark' | 'landing') => void
  setAccentColor: (color: string) => Promise<void>
  setLoading: (loading: boolean) => void
  
  // Complex state operations
  setCurrentViewWithPersistence: (view: ViewType) => void
  navigateToDate: (date: Date) => void
  toggleTheme: () => void
  
  // Utilities
  formatDateKey: (date?: Date) => string
  parseDate: (dateKey: string) => Date
  isToday: (date: Date) => boolean
  isSameDay: (date1: Date, date2: Date) => boolean
}

// Utility functions
const formatDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDate = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  currentView: 'landing', // Default to landing page
  theme: 'light',
  accentColor: 'slate', // Default accent color
  isLoading: false,

  // Basic setters
  setCurrentDate: (date) => {
    set({ currentDate: date })
    console.log('📅 [AppStore] Date changed to:', formatDateKey(date))
  },

  setCurrentView: (view) => {
    set({ currentView: view })
    console.log('🎯 [AppStore] View changed to:', view)
  },

  setTheme: (theme) => {
    set({ theme })
    // Persist theme preference
    localStorage.setItem('dailyDavid_theme', theme)
    console.log('🎨 [AppStore] Theme changed to:', theme)
  },

  setAccentColor: async (color) => {
    set({ accentColor: color })
    // Persist accent color preference to localStorage for immediate UI update
    localStorage.setItem('dailyDavid_accentColor', color)
    console.log('🎨 [AppStore] Accent color changed to:', color)
    
    // Also save to database via settings store
    try {
      const { useSettingsStore } = await import('./settingsStore')
      const { updateGeneralSettings } = useSettingsStore.getState()
      await updateGeneralSettings({ accentColor: color })
      console.log('💾 [AppStore] Accent color saved to database:', color)
    } catch (error) {
      console.error('❌ [AppStore] Failed to save accent color to database:', error)
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  // Complex operations
  setCurrentViewWithPersistence: (view) => {
    set({ currentView: view })
    
    // Persist view preference
    try {
      localStorage.setItem('dailyDavid_currentView', view)
      console.log('💾 [AppStore] View persisted to localStorage:', view)
    } catch (error) {
      console.error('❌ [AppStore] Failed to persist view:', error)
    }
    
    console.log('🎯 [AppStore] View changed with persistence to:', view)
  },

  navigateToDate: (date) => {
    set({ 
      currentDate: date,
      currentView: 'daily' // Automatically switch to daily view when navigating to a date
    })
    
    console.log('🗓️ [AppStore] Navigated to date:', formatDateKey(date))
  },

  toggleTheme: () => {
    const currentTheme = get().theme
    const themeCycle = ['light', 'dark', 'landing'] as const
    const currentIndex = themeCycle.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeCycle.length
    const newTheme = themeCycle[nextIndex]
    
    set({ theme: newTheme })
    localStorage.setItem('dailyDavid_theme', newTheme)
    
    console.log('🎨 [AppStore] Theme toggled from', currentTheme, 'to', newTheme)
  },

  // Utility functions
  formatDateKey,
  parseDate,
  isToday,
  isSameDay
}))

// Helper hooks for specific parts of state
export const useCurrentDate = () => useAppStore(state => state.currentDate)
export const useCurrentView = () => useAppStore(state => state.currentView)
export const useTheme = () => useAppStore(state => state.theme)
export const useAccentColor = () => useAppStore(state => state.accentColor)
export const useAppLoading = () => useAppStore(state => state.isLoading)

// Helper for current date as formatted string
export const useCurrentDateKey = () => {
  const currentDate = useCurrentDate()
  return formatDateKey(currentDate)
}

// Initialize app store from localStorage and database
export const initializeAppStore = async () => {
  try {
    const state = useAppStore.getState()
    
    // Load theme preference
    const savedTheme = localStorage.getItem('dailyDavid_theme')
    if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'landing') {
      state.setTheme(savedTheme as 'light' | 'dark' | 'landing')
      console.log('🎨 [AppStore] Loaded theme from localStorage:', savedTheme)
    }
    
    // Load accent color preference from database first, then localStorage as fallback
    try {
      const { useSettingsStore } = await import('./settingsStore')
      const { loadSettings } = useSettingsStore.getState()
      const settings = await loadSettings()
      
      if (settings.accentColor) {
        state.setAccentColor(settings.accentColor)
        console.log('🎨 [AppStore] Loaded accent color from database:', settings.accentColor)
      } else {
        // Fallback to localStorage
        const savedAccentColor = localStorage.getItem('dailyDavid_accentColor')
        if (savedAccentColor) {
          state.setAccentColor(savedAccentColor)
          console.log('🎨 [AppStore] Loaded accent color from localStorage:', savedAccentColor)
        } else {
          console.log('🎨 [AppStore] No saved accent color found, using default: slate')
        }
      }
    } catch (error) {
      console.error('❌ [AppStore] Failed to load accent color from database, using localStorage:', error)
      // Fallback to localStorage
      const savedAccentColor = localStorage.getItem('dailyDavid_accentColor')
      if (savedAccentColor) {
        state.setAccentColor(savedAccentColor)
        console.log('🎨 [AppStore] Loaded accent color from localStorage:', savedAccentColor)
      }
    }
    
    // Load view preference
    const savedView = localStorage.getItem('dailyDavid_currentView')
    if (savedView === 'landing' || savedView === 'daily') {
      state.setCurrentView(savedView)
      console.log('🎯 [AppStore] Loaded view from localStorage:', savedView)
    }
    
    console.log('✅ [AppStore] Initialized from localStorage and database')
  } catch (error) {
    console.error('❌ [AppStore] Failed to initialize from localStorage and database:', error)
  }
}

// Export utility functions for use outside of components
export { formatDateKey, parseDate, isToday, isSameDay }