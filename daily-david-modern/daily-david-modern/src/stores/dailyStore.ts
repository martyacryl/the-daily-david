import { create } from 'zustand'
import { DailyState, DailyEntry, Goal, LeadershipTrait } from '../types'
import { formatDateKey } from '../lib/utils'

interface DailyStore extends DailyState {
  createEntry: (entry: Omit<DailyEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, updates: Partial<DailyEntry>) => void
  deleteEntry: (id: string) => void
  getEntryByDate: (date: Date) => DailyEntry | null
  setCurrentEntry: (entry: DailyEntry | null) => void
  clearError: () => void
}

export const useDailyStore = create<DailyStore>((set, get) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,

  createEntry: (entryData) => {
    const newEntry: DailyEntry = {
      ...entryData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    set(state => ({
      entries: [...state.entries, newEntry],
      currentEntry: newEntry
    }))
  },

  updateEntry: (id, updates) => {
    set(state => ({
      entries: state.entries.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      ),
      currentEntry: state.currentEntry?.id === id 
        ? { ...state.currentEntry, ...updates, updatedAt: new Date() }
        : state.currentEntry
    }))
  },

  deleteEntry: (id) => {
    set(state => ({
      entries: state.entries.filter(entry => entry.id !== id),
      currentEntry: state.currentEntry?.id === id ? null : state.currentEntry
    }))
  },

  getEntryByDate: (date) => {
    const dateKey = formatDateKey(date)
    return get().entries.find(entry => entry.date === dateKey) || null
  },

  setCurrentEntry: (entry) => {
    set({ currentEntry: entry })
  },

  clearError: () => {
    set({ error: null })
  }
}))
