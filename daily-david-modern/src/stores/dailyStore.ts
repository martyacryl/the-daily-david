import { create } from 'zustand'
import { DailyState, DailyEntry, Goal } from '../types'
import { formatDateKey } from '../lib/utils'
import { dbManager } from '../lib/database'

interface DailyStore extends DailyState {
  createEntry: (entry: Omit<DailyEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEntry: (id: string, updates: Partial<DailyEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  getEntryByDate: (date: Date) => DailyEntry | null
  setCurrentEntry: (entry: DailyEntry | null) => void
  updateGoals: (type: 'daily' | 'weekly' | 'monthly', goals: Goal[]) => Promise<void>
  clearError: () => void
  loadEntries: () => Promise<void>
  loadEntryByDate: (date: string) => Promise<DailyEntry | null>
}

export const useDailyStore = create<DailyStore>((set, get) => ({
  entries: [],
  currentEntry: null,
  goals: {
    daily: [],
    weekly: [],
    monthly: []
  },
  isLoading: false,
  error: null,

  createEntry: async (entryData) => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await dbManager.createDailyEntry(entryData)
      
      if (result.success && result.data) {
        const newEntry: DailyEntry = {
          ...result.data,
          id: result.data.id || Date.now().toString(),
          createdAt: new Date(result.data.created_at || result.data.createdAt),
          updatedAt: new Date(result.data.updated_at || result.data.updatedAt)
        }
        
        set(state => ({
          entries: [...state.entries, newEntry],
          currentEntry: newEntry,
          isLoading: false
        }))
      } else {
        throw new Error(result.error || 'Failed to create entry')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create entry',
        isLoading: false 
      })
    }
  },

  updateEntry: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await dbManager.updateDailyEntryWrapper(id, updates)
      
      if (result.success && result.data) {
        const updatedEntry: DailyEntry = {
          ...result.data,
          id: result.data.id || id,
          createdAt: new Date(result.data.created_at || result.data.createdAt),
          updatedAt: new Date(result.data.updated_at || result.data.updatedAt)
        }
        
        set(state => ({
          entries: state.entries.map(entry => 
            entry.id === id ? updatedEntry : entry
          ),
          currentEntry: state.currentEntry?.id === id ? updatedEntry : state.currentEntry,
          isLoading: false
        }))
      } else {
        throw new Error(result.error || 'Failed to update entry')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update entry',
        isLoading: false 
      })
    }
  },

  deleteEntry: async (id) => {
    try {
      set({ isLoading: true, error: null })
      
      // Note: The backend doesn't have a delete endpoint yet, so we'll just remove from local state
      set(state => ({
        entries: state.entries.filter(entry => entry.id !== id),
        currentEntry: state.currentEntry?.id === id ? null : state.currentEntry,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete entry',
        isLoading: false 
      })
    }
  },

  getEntryByDate: (date) => {
    const dateKey = formatDateKey(date)
    return get().entries.find(entry => entry.date === dateKey) || null
  },

  setCurrentEntry: (entry) => {
    set({ currentEntry: entry })
  },

  updateGoals: async (type, goals) => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await dbManager.updateGoals(type, goals)
      
      if (result.success && result.data) {
        set(state => ({
          goals: {
            ...state.goals,
            [type]: goals
          },
          isLoading: false
        }))
      } else {
        throw new Error(result.error || 'Failed to update goals')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update goals',
        isLoading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },

  loadEntries: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await dbManager.getDailyEntries()
      
      if (result && result.length > 0) {
        const formattedEntries: DailyEntry[] = result.map(entry => ({
          id: entry.id?.toString() || Date.now().toString(),
          userId: entry.user_id,
          user_id: entry.user_id,
          date: entry.date,
          dateKey: entry.date,
          date_key: entry.date,
          checkIn: entry.checkIn || { emotions: [], feeling: '' },
          gratitude: Array.isArray(entry.gratitude) ? entry.gratitude : (entry.gratitude ? [entry.gratitude] : []),
          soap: {
            scripture: entry.scripture || '',
            observation: entry.observation || '',
            application: entry.application || '',
            prayer: entry.prayer || ''
          },
          goals: typeof entry.goals === 'string' ? JSON.parse(entry.goals) : (entry.goals || { daily: [], weekly: [], monthly: [] }),
          dailyIntention: entry.dailyIntention || '',
          growthQuestion: entry.growthQuestion || '',
          leadershipRating: entry.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
          completed: false,
          createdAt: new Date(entry.created_at),
          created_at: new Date(entry.created_at),
          updatedAt: new Date(entry.updated_at),
          updated_at: new Date(entry.updated_at)
        }))
        
        set({ 
          entries: formattedEntries,
          isLoading: false 
        })
      } else {
        set({ 
          entries: [],
          isLoading: false 
        })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load entries',
        isLoading: false 
      })
    }
  },

  loadEntryByDate: async (date: string) => {
    try {
      console.log('Store: Loading entry for date:', date)
      set({ isLoading: true, error: null })
      
      const result = await dbManager.getDailyEntry(date)
      console.log('Store: Database result:', result)
      
      if (result) {
        console.log('Store: Found entry data:', result)
        const formattedEntry: DailyEntry = {
          id: result.id?.toString() || Date.now().toString(),
          userId: result.user_id,
          user_id: result.user_id,
          date: result.date,
          dateKey: result.date,
          date_key: result.date,
          checkIn: result.checkIn || { emotions: [], feeling: '' },
          gratitude: Array.isArray(result.gratitude) ? result.gratitude : (result.gratitude ? [result.gratitude] : []),
          soap: {
            scripture: result.scripture || '',
            observation: result.observation || '',
            application: result.application || '',
            prayer: result.prayer || ''
          },
          goals: typeof result.goals === 'string' ? JSON.parse(result.goals) : (result.goals || { daily: [], weekly: [], monthly: [] }),
          dailyIntention: result.dailyIntention || '',
          growthQuestion: result.growthQuestion || '',
          leadershipRating: result.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
          completed: false,
          createdAt: new Date(result.created_at),
          created_at: new Date(result.created_at),
          updatedAt: new Date(result.updated_at),
          updated_at: new Date(result.updated_at)
        }
        
        console.log('Store: Setting formatted entry:', formattedEntry)
        set({ 
          currentEntry: formattedEntry,
          isLoading: false 
        })
        return formattedEntry
      } else {
        console.log('Store: No entry found for date:', date)
        // No entry found for this date
        set({ 
          currentEntry: null,
          isLoading: false 
        })
        return null
      }
    } catch (error) {
      console.error('Store: Error loading entry:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load entry',
        isLoading: false 
      })
      return null
    }
  }
}))
