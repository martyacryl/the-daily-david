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
  updateSpouse1: (spouse: Partial<SpouseInfo>) => void
  updateSpouse2: (spouse: Partial<SpouseInfo>) => void
  updateLocation: (location: Partial<LocationSettings>) => void
  addGroceryStore: (store: Omit<GroceryStore, 'id'>) => void
  updateGroceryStore: (id: string, store: Partial<GroceryStore>) => void
  removeGroceryStore: (id: string) => void
  setDefaultGroceryStore: (id: string) => void
  updateGeneralSettings: (settings: Partial<Pick<AppSettings, 'familyCreed' | 'defaultWeatherLocation' | 'timezone' | 'currency' | 'dateFormat' | 'theme'>>) => void
  resetSettings: () => void
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

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSpouse1: (spouse) =>
        set((state) => ({
          settings: {
            ...state.settings,
            spouse1: { ...state.settings.spouse1, ...spouse }
          }
        })),

      updateSpouse2: (spouse) =>
        set((state) => ({
          settings: {
            ...state.settings,
            spouse2: { ...state.settings.spouse2, ...spouse }
          }
        })),

      updateLocation: (location) =>
        set((state) => ({
          settings: {
            ...state.settings,
            location: { ...state.settings.location, ...location }
          }
        })),

      addGroceryStore: (store) =>
        set((state) => ({
          settings: {
            ...state.settings,
            groceryStores: [
              ...state.settings.groceryStores,
              { ...store, id: Date.now().toString() }
            ]
          }
        })),

      updateGroceryStore: (id, store) =>
        set((state) => ({
          settings: {
            ...state.settings,
            groceryStores: state.settings.groceryStores.map((s) =>
              s.id === id ? { ...s, ...store } : s
            )
          }
        })),

      removeGroceryStore: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            groceryStores: state.settings.groceryStores.filter((s) => s.id !== id)
          }
        })),

      setDefaultGroceryStore: (id) =>
        set((state) => ({
          settings: {
            ...state.settings,
            groceryStores: state.settings.groceryStores.map((s) => ({
              ...s,
              isDefault: s.id === id
            }))
          }
        })),

      updateGeneralSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings
          }
        })),

      resetSettings: () =>
        set({ settings: defaultSettings })
    }),
    {
      name: 'marriage-meeting-settings',
      version: 1,
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state) => {
        console.log('Settings store rehydrated:', state?.settings)
      }
    }
  )
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
