import { create } from 'zustand'

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

export interface CalendarSettings {
  icalUrl: string
  googleCalendarEnabled: boolean
  googleCalendarConfig: {
    clientId: string
    apiKey: string
    discoveryDocs: string[]
    scope: string
  }
  syncFrequency: 'realtime' | 'hourly' | 'daily'
  showCalendarEvents: boolean
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
  calendar: CalendarSettings
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
  updateCalendarSettings: (calendar: Partial<CalendarSettings>) => Promise<void>
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
  theme: 'light',
    calendar: {
      icalUrl: '',
      googleCalendarEnabled: false,
      googleCalendarConfig: {
        clientId: '',
        apiKey: '',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
      },
      syncFrequency: 'daily',
      showCalendarEvents: true
    }
}

// API functions
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://theweeklyhuddle.vercel.app' : 'http://localhost:3001')

const fetchSettings = async (): Promise<AppSettings> => {
  console.log('🔍 Fetching settings from database...')
  
  // Get token from auth store
  let token = ''
  try {
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      const parsed = JSON.parse(authData)
      token = parsed.state?.token || ''
      console.log('🔑 Token found:', token ? 'Yes' : 'No')
    } else {
      console.log('❌ No auth data in localStorage')
    }
  } catch (error) {
    console.error('❌ Error getting auth token:', error)
  }
  
  if (!token) {
    console.log('⚠️ No auth token found, returning default settings')
    return defaultSettings
  }

  try {
    console.log('🌐 Making API request to:', `${API_BASE_URL}/api/settings`)
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 Response status:', response.status)

    if (!response.ok) {
      console.error(`❌ Failed to fetch settings: ${response.statusText}`)
      return defaultSettings
    }

    const settings = await response.json()
    console.log('✅ Settings fetched successfully:', settings)
    return settings
  } catch (error) {
    console.error('❌ Network error fetching settings:', error)
    return defaultSettings
  }
}

const saveSettings = async (settings: AppSettings): Promise<AppSettings> => {
  console.log('💾 Saving settings to database...', settings)
  
  // Get token from auth store
  let token = ''
  try {
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      const parsed = JSON.parse(authData)
      token = parsed.state?.token || ''
      console.log('🔑 Token found for save:', token ? 'Yes' : 'No')
    } else {
      console.log('❌ No auth data in localStorage for save')
    }
  } catch (error) {
    console.error('❌ Error getting auth token for save:', error)
  }
  
  if (!token) {
    console.log('⚠️ No auth token found, cannot save settings')
    return settings
  }

  try {
    console.log('🌐 Making API request to save:', `${API_BASE_URL}/api/settings`)
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })

    console.log('📡 Save response status:', response.status)

    if (!response.ok) {
      console.error(`❌ Failed to save settings: ${response.statusText}`)
      return settings
    }

    const savedSettings = await response.json()
    console.log('✅ Settings saved successfully:', savedSettings)
    return savedSettings
  } catch (error) {
    console.error('❌ Network error saving settings:', error)
    return settings
  }
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

    updateCalendarSettings: async (calendar) => {
      const newSettings = {
        ...get().settings,
        calendar: { ...get().settings.calendar, ...calendar }
      }
      set({ settings: newSettings })
      try {
        await saveSettings(newSettings)
      } catch (error) {
        console.error('Failed to save calendar settings update:', error)
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
      console.log('🔄 Loading settings from database...')
      try {
        const settings = await fetchSettings()
        console.log('📥 Settings loaded, updating store:', settings)
        set({ settings })
        return settings
      } catch (error) {
        console.error('❌ Failed to load settings:', error)
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
