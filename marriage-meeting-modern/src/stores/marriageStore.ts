// Marriage Meeting Tool - Zustand Store
// Manages marriage meeting week data

import { create } from 'zustand'
import { MarriageMeetingWeek, WeekData, ListItem, WeeklySchedule, DayName, ListType, GoalItem, TaskItem, GroceryStoreList, EncouragementNote } from '../types/marriageTypes'
import { dbManager } from '../lib/database'

interface MarriageState {
  // Data
  currentWeek: MarriageMeetingWeek | null
  weekData: WeekData
  currentDate: Date
  isLoading: boolean
  error: string | null
  lastSaved: Date | null

  // Actions
  setCurrentDate: (date: Date) => void
  loadWeekData: (weekKey: string) => Promise<void>
  saveWeekData: (weekKey: string, data: WeekData) => Promise<void>
  updateSchedule: (day: DayName, index: number, value: string) => void
  addScheduleLine: (day: DayName) => void
  removeScheduleLine: (day: DayName, index: number) => void
  updateListItem: (listType: ListType, id: number, text: string) => void
  addListItem: (listType: ListType, text: string) => void
  toggleListItem: (listType: ListType, id: number) => void
  removeListItem: (listType: ListType, id: number) => void
  updateTasks: (tasks: TaskItem[]) => void
  updateGrocery: (grocery: GroceryStoreList[]) => void
  updateEncouragementNotes: (encouragementNotes: EncouragementNote[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastSaved: (date: Date) => void
}

// Helper function to create empty week data
const createEmptyWeekData = (): WeekData => ({
  schedule: {
    Monday: [''],
    Tuesday: [''],
    Wednesday: [''],
    Thursday: [''],
    Friday: [''],
    Saturday: [''],
    Sunday: ['']
  },
  todos: [] as TaskItem[],
  prayers: [],
  grocery: [] as GroceryStoreList[],
  unconfessedSin: [],
  weeklyWinddown: [],
  encouragementNotes: []
})

// Helper function to get next ID for list items
const getNextId = (items: (ListItem | GoalItem)[]): number => {
  if (items.length === 0) return 1
  return Math.max(...items.map(item => item.id)) + 1
}

export const useMarriageStore = create<MarriageState>((set, get) => ({
  // Initial state
  currentWeek: null,
  weekData: createEmptyWeekData(),
  currentDate: new Date(),
  isLoading: false,
  error: null,
  lastSaved: null,

  // Actions
  setCurrentDate: (date: Date) => {
    set({ currentDate: date })
  },

  loadWeekData: async (weekKey: string) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Store: Loading week data for:', weekKey)
      
      const week = await dbManager.getMarriageMeetingWeekByDate(weekKey)
      
      if (week) {
        console.log('Store: Found existing week data:', {
          weekKey: week.week_key,
          todosCount: week.todos?.length || 0,
          todos: week.todos
        })

        // Migrate old todos to new TaskItem structure if needed
        const migratedTodos = week.todos?.map((todo: any) => {
          // If todo already has priority, it's already migrated
          if (todo.priority) {
            return {
              ...todo,
              assignedTo: todo.assignedTo || 'both' // Add default assignment if missing
            }
          }
          // Migrate old ListItem to new TaskItem structure
          return {
            id: todo.id,
            text: todo.text,
            completed: todo.completed,
            priority: 'medium' as const, // Default to medium priority
            dueDate: undefined,
            estimatedDuration: 30, // Default 30 minutes
            category: undefined,
            notes: undefined,
            assignedTo: 'both' as const // Default to both spouses
          }
        }) || []
        
        set({ 
          currentWeek: week,
          weekData: {
            schedule: week.schedule,
            todos: migratedTodos,
            prayers: week.prayers,
            grocery: week.grocery,
            unconfessedSin: week.unconfessedSin,
            weeklyWinddown: week.weeklyWinddown,
            encouragementNotes: week.encouragementNotes || []
          }
        })
      } else {
        console.log('Store: No existing data, using empty week data')
        set({ 
          currentWeek: null,
          weekData: createEmptyWeekData()
        })
      }
    } catch (error) {
      console.error('Store: Error loading week data:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load week data' })
    } finally {
      set({ isLoading: false })
    }
  },

  saveWeekData: async (weekKey: string, data: WeekData) => {
    try {
      console.log('Store: Saving week data for:', weekKey)
      
      const { currentDate } = get()
      
      // Get user from auth store
      let user = null
      try {
        const authData = localStorage.getItem('auth-storage')
        if (authData) {
          const parsed = JSON.parse(authData)
          user = parsed.state?.user
        }
      } catch (error) {
        console.error('Error getting user from auth store:', error)
      }
      
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const weekData: MarriageMeetingWeek = {
        user_id: user.id,
        week_key: weekKey,
        schedule: data.schedule,
        todos: data.todos,
        prayers: data.prayers,
        grocery: data.grocery,
        unconfessedSin: data.unconfessedSin,
        weeklyWinddown: data.weeklyWinddown,
        encouragementNotes: data.encouragementNotes
      }

      await dbManager.saveMarriageMeetingWeek(weekData)
      
      set({ 
        lastSaved: new Date(),
        currentWeek: { ...weekData, id: weekData.id || 'temp' }
      })
      
      console.log('Store: Week data saved successfully')
    } catch (error) {
      console.error('Store: Error saving week data:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to save week data' })
    }
  },

  updateSchedule: (day: DayName, index: number, value: string) => {
    set((state) => {
      const newSchedule = { ...state.weekData.schedule }
      newSchedule[day][index] = value
      
      return {
        weekData: {
          ...state.weekData,
          schedule: newSchedule
        }
      }
    })
  },

  addScheduleLine: (day: DayName) => {
    set((state) => {
      const newSchedule = { ...state.weekData.schedule }
      newSchedule[day].push('')
      
      return {
        weekData: {
          ...state.weekData,
          schedule: newSchedule
        }
      }
    })
  },

  removeScheduleLine: (day: DayName, index: number) => {
    set((state) => {
      const newSchedule = { ...state.weekData.schedule }
      newSchedule[day].splice(index, 1)
      
      return {
        weekData: {
          ...state.weekData,
          schedule: newSchedule
        }
      }
    })
  },

  updateListItem: (listType: ListType, id: number, text: string) => {
    set((state) => {
      const newList = state.weekData[listType].map(item =>
        item.id === id ? { ...item, text } : item
      )
      
      return {
        weekData: {
          ...state.weekData,
          [listType]: newList
        }
      }
    })
  },

  addListItem: (listType: ListType, text: string) => {
    set((state) => {
      const newItem: ListItem = {
        id: getNextId(state.weekData[listType]),
        text,
        completed: false
      }
      
      return {
        weekData: {
          ...state.weekData,
          [listType]: [...state.weekData[listType], newItem]
        }
      }
    })
  },

  toggleListItem: (listType: ListType, id: number) => {
    set((state) => {
      const newList = state.weekData[listType].map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
      
      return {
        weekData: {
          ...state.weekData,
          [listType]: newList
        }
      }
    })
  },

  removeListItem: (listType: ListType, id: number) => {
    set((state) => {
      const newList = state.weekData[listType].filter(item => item.id !== id)
      
      return {
        weekData: {
          ...state.weekData,
          [listType]: newList
        }
      }
    })
  },


    updateTasks: (tasks: TaskItem[]) => {
      set((state) => ({
        weekData: {
          ...state.weekData,
          todos: tasks
        }
      }))
    },

    updateGrocery: (grocery: any[]) => {
      set((state) => ({
        weekData: {
          ...state.weekData,
          grocery: grocery
        }
      }))
    },

    updateEncouragementNotes: (encouragementNotes: EncouragementNote[]) => {
      set((state) => ({
        weekData: {
          ...state.weekData,
          encouragementNotes
        }
      }))
    },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  setLastSaved: (date: Date) => {
    set({ lastSaved: date })
  }
}))
