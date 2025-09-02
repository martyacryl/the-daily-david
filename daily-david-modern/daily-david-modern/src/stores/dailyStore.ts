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
  loadEntryByDate: (date: string) => Promise<void>
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
      
      const result = await dbManager.get().createDailyEntry(entryData)
      
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
      
      const result = await dbManager.get().updateDailyEntry(id, updates)
      
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
      
      const result = await dbManager.get().getDailyEntries()
      
      if (result.success && result.data) {
        const formattedEntries: DailyEntry[] = result.data.map(entry => ({
          id: entry.id || entry.id?.toString(),
          userId: entry.user_id || entry.userId,
          user_id: entry.user_id || entry.userId,
          date: entry.date_key || entry.date,
          dateKey: entry.date_key || entry.date,
          date_key: entry.date_key || entry.date,
          checkIn: entry.data_content?.checkIn || {
            emotions: [],
            feeling: ''
          },
          gratitude: entry.data_content?.gratitude || [],
          soap: entry.data_content?.soap || {
            scripture: '',
            observation: '',
            application: '',
            prayer: ''
          },
          goals: entry.data_content?.goals || {
            daily: [],
            weekly: [],
            monthly: []
          },
          dailyIntention: entry.data_content?.dailyIntention || '',
          growthQuestion: entry.data_content?.growthQuestion || '',
          leadershipRating: entry.data_content?.leadershipRating || {
            wisdom: 0,
            courage: 0,
            patience: 0,
            integrity: 0
          },
          completed: entry.data_content?.completed || false,
          createdAt: new Date(entry.created_at || entry.createdAt),
          created_at: new Date(entry.created_at || entry.createdAt),
          updatedAt: new Date(entry.updated_at || entry.updatedAt),
          updated_at: new Date(entry.updated_at || entry.updatedAt)
        }))
        
        set({ 
          entries: formattedEntries,
          isLoading: false 
        })
      } else {
        throw new Error(result.error || 'Failed to load entries')
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
      
      const result = await dbManager.get().getDailyEntry(date)
      console.log('Store: Database result:', result)
      
      if (result.success) {
        if (result.data) {
          console.log('Store: Found entry data:', result.data)
          const formattedEntry: DailyEntry = {
            id: result.data.id || result.data.id?.toString(),
            userId: result.data.user_id || result.data.userId,
            user_id: result.data.user_id || result.data.userId,
            date: result.data.date_key || result.data.date,
            dateKey: result.data.date_key || result.data.date,
            date_key: result.data.date_key || result.data.date,
            checkIn: result.data.data_content?.checkIn || {
              emotions: [],
              feeling: ''
            },
            gratitude: result.data.data_content?.gratitude || [],
            soap: result.data.data_content?.soap || {
              scripture: '',
              observation: '',
              application: '',
              prayer: ''
            },
            goals: result.data.data_content?.goals || {
              daily: [],
              weekly: [],
              monthly: []
            },
            dailyIntention: result.data.data_content?.dailyIntention || '',
            growthQuestion: result.data.data_content?.growthQuestion || '',
            leadershipRating: result.data.data_content?.leadershipRating || {
              wisdom: 0,
              courage: 0,
              patience: 0,
              integrity: 0
            },
            completed: result.data.data_content?.completed || false,
            createdAt: new Date(result.data.created_at || result.data.createdAt),
            created_at: new Date(result.data.created_at || result.data.createdAt),
            updatedAt: new Date(result.data.updated_at || result.data.updatedAt),
            updated_at: new Date(result.data.updated_at || result.data.updatedAt)
          }
          
          console.log('Store: Setting formatted entry:', formattedEntry)
          set({ 
            currentEntry: formattedEntry,
            isLoading: false 
          })
        } else {
          console.log('Store: No entry found for date:', date)
          // No entry found for this date
          set({ 
            currentEntry: null,
            isLoading: false 
          })
        }
      } else {
        console.log('Store: Database error:', result.error)
        throw new Error(result.error || 'Failed to load entry')
      }
    } catch (error) {
      console.error('Store: Error loading entry:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load entry',
        isLoading: false 
      })
    }
  }
}))
