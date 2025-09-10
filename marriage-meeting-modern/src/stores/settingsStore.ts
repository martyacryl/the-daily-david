import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SpouseInfo {
  name: string
  email?: string
  phone?: string
}

export interface LocationSettings {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude?: number
  longitude?: number
}

export interface GroceryStore {
  id: string
  name: string
  address: string
  isDefault: boolean
}

export interface AppSettings {
  spouse1: SpouseInfo
  spouse2: SpouseInfo
  location: LocationSettings
  groceryStores: GroceryStore[]
  familyCreed: string
  defaultWeatherLocation: string
  timezone: string
  currency: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  theme: 'light' | 'dark' | 'auto'
}

interface SettingsStore {
  settings: AppSettings
  updateSpouse1: (spouse: Partial<SpouseInfo>) => Promise<void>
  updateSpouse2: (spouse: Partial<SpouseInfo>) => Promise<void>
  updateLocation: (location: Partial<LocationSettings>) => Promise<void>
  addGroceryStore: (store: Omit<GroceryStore, 'id'>) => Promise<void>
  updateGroceryStore: (id: string, store: Partial<GroceryStore>) => Promise<void>
  removeGroceryStore: (id: string) => Promise<void>
  setDefaultGroceryStore: (id: string) => Promise<void>
  updateGeneralSettings: (settings: Partial<Pick<AppSettings, 'familyCreed' | 'defaultWeatherLocation' | 'timezone' | 'currency' | 'dateFormat' | 'theme'>>) => Promise<void>
  resetSettings: () => Promise<void>
  loadSettings: () => Promise<AppSettings>
}

const defaultSettings: AppSettings = {
  spouse1: {
    name: '',
    email: '',
    phone: ''
  },
  spouse2: {
    name: '',
    email: '',
    phone: ''
  },
  location: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  },
  groceryStores: [],
  familyCreed: '',
  defaultWeatherLocation: '',
  timezone: 'America/New_York',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light'
}

// API functions
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://theweeklyhuddle.vercel.app' : 'http://localhost:3001')

const fetchSettings = async (): Promise<AppSettings> => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No auth token found')
  }

  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.statusText}`)
  }

  return response.json()
}

const saveSettings = async (settings: AppSettings): Promise<AppSettings> => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('No auth token found')
  }

  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  })

  if (!response.ok) {
    throw new Error(`Failed to save settings: ${response.statusText}`)
  }

  return response.json()
}

export const useSettingsStore = create<SettingsStore>()(
  (set, get) => ({
    settings: defaultSettings,

    updateSpouse1: async (spouse) => {
      const newSettings = {
        ...get().settings,
        spouse1: { ...get().settings.spouse1, ...spouse }
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save spouse1 update:', error)
      }
    },

    updateSpouse2: async (spouse) => {
      const newSettings = {
        ...get().settings,
        spouse2: { ...get().settings.spouse2, ...spouse }
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save spouse2 update:', error)
      }
    },

    updateLocation: async (location) => {
      const newSettings = {
        ...get().settings,
        location: { ...get().settings.location, ...location }
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save location update:', error)
      }
    },

    addGroceryStore: async (store) => {
      const newSettings = {
        ...get().settings,
        groceryStores: [
          ...get().settings.groceryStores,
          { ...store, id: Date.now().toString() }
        ]
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save grocery store addition:', error)
      }
    },

    updateGroceryStore: async (id, store) => {
      const newSettings = {
        ...get().settings,
        groceryStores: get().settings.groceryStores.map((s) =>
          s.id === id ? { ...s, ...store } : s
        )
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save grocery store update:', error)
      }
    },

    removeGroceryStore: async (id) => {
      const newSettings = {
        ...get().settings,
        groceryStores: get().settings.groceryStores.filter((s) => s.id !== id)
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save grocery store removal:', error)
      }
    },

    setDefaultGroceryStore: async (id) => {
      const newSettings = {
        ...get().settings,
        groceryStores: get().settings.groceryStores.map((s) => ({
          ...s,
          isDefault: s.id === id
        }))
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save default grocery store:', error)
      }
    },

    updateGeneralSettings: async (settings) => {
      const newSettings = {
        ...get().settings,
        ...settings
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save general settings update:', error)
      }
    },

    resetSettings: async () => {
      set({ settings: defaultSettings })
      try {
        await saveSettings(defaultSettings)
      } catch (error) {
        console.error('Failed to reset settings:', error)
      }
    },

    // New method to load settings from database
    loadSettings: async () => {
      try {
        const settings = await fetchSettings()
        set({ settings })
        return settings
      } catch (error) {
        console.error('Failed to load settings:', error)
        return defaultSettings
      }
    }
  })
)

// Helper functions
export const getSpouseNames = (): string[] => {
  const { settings } = useSettingsStore.getState()
  return [settings.spouse1.name, settings.spouse2.name].filter(Boolean)
}

export const getDefaultWeatherLocation = (): string => {
  const { settings } = useSettingsStore.getState()
  const { city, state, country } = settings.location
  if (city && state) {
    return `${city}, ${state}, ${country}`
  }
  return settings.defaultWeatherLocation || 'New York, NY, US'
}

export const getDefaultGroceryStore = (): GroceryStore | null => {
  const { settings } = useSettingsStore.getState()
  return settings.groceryStores.find(store => store.isDefault) || null
}
