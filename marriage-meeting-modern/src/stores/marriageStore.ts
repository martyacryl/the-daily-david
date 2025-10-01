// Marriage Meeting Tool - Zustand Store
// Manages marriage meeting week data

import { create } from 'zustand'
import { MarriageMeetingWeek, WeekData, ListItem, WeeklySchedule, DayName, ListType, GoalItem, TaskItem, GroceryStoreList, EncouragementNote } from '../types/marriageTypes'
import { CalendarEvent } from '../lib/calendarService'
import { dbManager, DatabaseManager } from '../lib/database'

interface MarriageState {
  // Data
  currentWeek: MarriageMeetingWeek | null
  weekData: WeekData
  currentDate: Date
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  lastCalendarUpdate: number | null

  // Actions
  setCurrentDate: (date: Date) => void
  loadWeekData: (weekKey: string) => Promise<void>
  saveWeekData: (weekKey: string, data: WeekData) => Promise<void>
  loadAllWeeks: () => Promise<MarriageMeetingWeek[]>
  calculateMeetingStreak: (weeks: MarriageMeetingWeek[]) => number
  calculateConsistencyScore: (weeks: MarriageMeetingWeek[]) => number
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
  updateCalendarEvents: (calendarEvents: CalendarEvent[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastSaved: (date: Date) => void
}

// Helper function to create empty week data
const createEmptyWeekData = (): WeekData => ({
  schedule: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  },
  todos: [] as TaskItem[],
  prayers: [],
  grocery: [] as GroceryStoreList[],
  unconfessedSin: [],
  weeklyWinddown: [],
  encouragementNotes: [],
  calendarEvents: []
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
  currentDate: new Date(), // Will be set to Monday when store initializes
  isLoading: false,
  error: null,
  lastSaved: null,
  lastCalendarUpdate: null,

  // Actions
  setCurrentDate: (date: Date) => {
    set({ currentDate: date })
  },

  // Ensure current date is set to Monday of current week
  setCurrentWeek: () => {
    const today = new Date()
    const mondayKey = DatabaseManager.formatWeekKey(today)
    // Create date in local timezone to avoid UTC issues
    const [year, month, day] = mondayKey.split('-').map(Number)
    const mondayDate = new Date(year, month - 1, day) // month is 0-indexed
    console.log('Store: setCurrentWeek - today:', today.toISOString())
    console.log('Store: setCurrentWeek - mondayKey:', mondayKey)
    console.log('Store: setCurrentWeek - mondayDate:', mondayDate.toISOString())
    set({ currentDate: mondayDate })
  },

  // Initialize the store with correct current date
  initializeStore: () => {
    const today = new Date()
    const mondayKey = DatabaseManager.formatWeekKey(today)
    // Create date in local timezone to avoid UTC issues
    const [year, month, day] = mondayKey.split('-').map(Number)
    const mondayDate = new Date(year, month - 1, day) // month is 0-indexed
    console.log('Store: Initializing with today:', today.toISOString())
    console.log('Store: Today local:', today.toLocaleDateString())
    console.log('Store: Calculated Monday key:', mondayKey)
    console.log('Store: Setting currentDate to:', mondayDate.toISOString())
    console.log('Store: Monday date local:', mondayDate.toLocaleDateString())
    set({ currentDate: mondayDate })
    
    // DO NOT auto-load week data here - let the component handle it
    // This prevents race conditions when navigating between weeks
    console.log('Store: Initialization complete - component will load week data')
  },

  loadWeekData: async (weekKey: string) => {
    console.log('🔍 Store: loadWeekData called with weekKey:', weekKey)
    console.log('🔍 Store: Current calendar events before loadWeekData:', get().weekData.calendarEvents?.length || 0)
    set({ isLoading: true, error: null })
    
    try {
      console.log('🔍 Store: Loading week data for:', weekKey)
      console.log('🔍 Store: Current date being used:', new Date().toISOString())
      
      const week = await dbManager.getMarriageMeetingWeekByDate(weekKey)
      console.log('🔍 Store: Raw data from database:', week)
      
      if (week) {
        console.log('🔍 Store: Found existing week data:', {
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
        
        console.log('🔍 Store: Setting weekData with prayers for week', weekKey, ':', week.prayers)
        console.log('🔍 Store: Prayers count:', week.prayers?.length || 0)
        console.log('🔍 Store: Prayers details:', week.prayers)
        console.log('Store: Setting weekData with todos:', migratedTodos)
        console.log('Store: Setting weekData with grocery:', week.grocery)
        console.log('Store: Setting weekData with encouragementNotes:', week.encouragementNotes)
        console.log('Store: Setting weekData with calendarEvents:', week.calendarEvents)
        
        // Normalize schedule structure to ensure consistency
        const normalizedSchedule = {
          Monday: week.schedule?.Monday || [],
          Tuesday: week.schedule?.Tuesday || [],
          Wednesday: week.schedule?.Wednesday || [],
          Thursday: week.schedule?.Thursday || [],
          Friday: week.schedule?.Friday || [],
          Saturday: week.schedule?.Saturday || [],
          Sunday: week.schedule?.Sunday || []
        }
        
            // Convert calendar events string dates back to Date objects and filter out invalid events
            const calendarEvents = (week.calendarEvents || [])
              .map(event => {
                const convertedEvent = {
                  ...event,
                  start: new Date(event.start),
                  end: new Date(event.end)
                }
                console.log('Store: Converting calendar event:', {
                  title: event.title,
                  originalStart: event.start,
                  convertedStart: convertedEvent.start,
                  originalEnd: event.end,
                  convertedEnd: convertedEvent.end
                })
                return convertedEvent
              })
              .filter(event => {
                // Filter out events with invalid dates (before 2020)
                const startYear = event.start.getFullYear()
                const endYear = event.end.getFullYear()
                
                if (startYear < 2020 || endYear < 2020) {
                  console.warn('⚠️ Filtering out event with invalid date:', {
                    title: event.title,
                    startYear,
                    endYear,
                    start: event.start.toISOString(),
                    end: event.end.toISOString()
                  })
                  return false
                }
                
                return true
              })
        
        // Use database calendar events if they exist, otherwise preserve existing ones
        const currentState = get()
        const existingCalendarEvents = currentState.weekData.calendarEvents || []
        const finalCalendarEvents = calendarEvents.length > 0 ? calendarEvents : existingCalendarEvents
        
        console.log('Store: Calendar events priority - database:', calendarEvents.length, 'existing:', existingCalendarEvents.length, 'final:', finalCalendarEvents.length)
        
        const weekDataToSet = {
          schedule: normalizedSchedule,
          todos: migratedTodos,
          prayers: week.prayers,
          grocery: week.grocery,
          unconfessedSin: week.unconfessedSin,
          weeklyWinddown: week.weeklyWinddown,
          encouragementNotes: week.encouragementNotes || [],
          calendarEvents: finalCalendarEvents
        }
        
        console.log('Store: Setting weekData with calendarEvents:', calendarEvents.length, 'events')
        
        console.log('🔍 Store: Complete weekData being set for week', weekKey, ':', weekDataToSet)
        console.log('🔍 Store: Final prayers data being set:', weekDataToSet.prayers)
        console.log('🔍 Store: Final prayers count:', weekDataToSet.prayers?.length || 0)
        console.log('🔍 Store: Schedule data being set:', weekDataToSet.schedule)
        
        set({ 
          currentWeek: week,
          weekData: weekDataToSet
        })
        
        console.log('🔍 Store: loadWeekData completed - final calendar events:', get().weekData.calendarEvents?.length || 0)
      } else {
        console.log('🔍 Store: No existing data, using empty week data')
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

  saveWeekData: async (weekKey: string, data?: WeekData) => {
    try {
      console.log('Store: Saving week data for:', weekKey)
      
      const { currentDate, weekData: currentWeekData } = get()
      
      // ALWAYS use current store data to ensure we save the latest changes
      // The passed data might be stale if updates happened after it was passed
      const dataToSave = currentWeekData
      
      console.log('Store: Using current store data (ignoring passed data)')
      console.log('Store: Data to save todos:', dataToSave.todos)
      console.log('Store: Data to save grocery:', dataToSave.grocery)
      
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
        schedule: dataToSave.schedule,
        todos: dataToSave.todos,
        prayers: dataToSave.prayers,
        grocery: dataToSave.grocery,
        unconfessedSin: dataToSave.unconfessedSin,
        weeklyWinddown: dataToSave.weeklyWinddown,
        encouragementNotes: dataToSave.encouragementNotes,
        calendarEvents: dataToSave.calendarEvents
      }

      console.log('Store: Saving weekData with todos:', dataToSave.todos)
      console.log('Store: Todos count:', dataToSave.todos?.length || 0)

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
      
      const newWeekData = {
        ...state.weekData,
        schedule: newSchedule
      }
      
      // Auto-save when schedule is updated (with debouncing)
      const weekKey = DatabaseManager.formatWeekKey(state.currentDate)
      console.log('Store: Auto-saving after updating schedule for:', day, 'index:', index, 'value:', value)
      
      // Clear any existing timeout to debounce saves
      if ((window as any).scheduleSaveTimeout) {
        clearTimeout((window as any).scheduleSaveTimeout)
      }
      
      // Trigger save with debouncing (500ms delay)
      (window as any).scheduleSaveTimeout = setTimeout(() => {
        get().saveWeekData(weekKey, newWeekData)
      }, 500)
      
      return {
        weekData: newWeekData
      }
    })
  },

  addScheduleLine: (day: DayName) => {
    set((state) => {
      const newSchedule = { ...state.weekData.schedule }
      // Ensure the day array exists before pushing
      if (!newSchedule[day]) {
        newSchedule[day] = []
      }
      newSchedule[day].push('')
      
      const newWeekData = {
        ...state.weekData,
        schedule: newSchedule
      }
      
      // Auto-save when schedule line is added
      const weekKey = DatabaseManager.formatWeekKey(state.currentDate)
      console.log('Store: Auto-saving after adding schedule line for:', day, 'weekKey:', weekKey)
      
      // Trigger save asynchronously to avoid blocking the UI
      setTimeout(() => {
        get().saveWeekData(weekKey, newWeekData)
      }, 100)
      
      return {
        weekData: newWeekData
      }
    })
  },

  removeScheduleLine: (day: DayName, index: number) => {
    set((state) => {
      const newSchedule = { ...state.weekData.schedule }
      // Ensure the day array exists before splicing
      if (newSchedule[day] && Array.isArray(newSchedule[day])) {
        newSchedule[day].splice(index, 1)
      }
      
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
    console.log('Store: updateTasks called with:', tasks.length, 'tasks')
    console.log('Store: Task details:', tasks)
    set((state) => ({
      weekData: {
        ...state.weekData,
        todos: tasks
      }
    }))
  },

    updateGrocery: (grocery: any[]) => {
      console.log('🏪 Store: updateGrocery called with:', grocery)
      set((state) => ({
        weekData: {
          ...state.weekData,
          grocery: grocery
        }
      }))
      console.log('🏪 Store: updateGrocery completed, new grocery count:', grocery.length)
    },

  updateEncouragementNotes: (encouragementNotes: EncouragementNote[]) => {
    set((state) => ({
      weekData: {
        ...state.weekData,
        encouragementNotes
      }
    }))
  },

  updateCalendarEvents: (calendarEvents: CalendarEvent[]) => {
    console.log('Store: updateCalendarEvents called with', calendarEvents.length, 'events')
    console.log('Store: Calendar events details:', calendarEvents.map(e => ({
      title: e.title,
      start: e.start.toISOString(),
      end: e.end.toISOString()
    })))
    console.log('Store: Current calendar events before update:', get().weekData.calendarEvents?.length || 0)
    
    set((state) => ({
      weekData: {
        ...state.weekData,
        calendarEvents
      }
    }))
    
    console.log('Store: Calendar events after update:', get().weekData.calendarEvents?.length || 0)
    
    // Force a re-render by updating a timestamp
    set((state) => ({
      lastCalendarUpdate: Date.now()
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
  },

  // Analytics methods
  loadAllWeeks: async (): Promise<MarriageMeetingWeek[]> => {
    try {
      const weeks = await dbManager.getAllWeeksForUser()
      console.log('Store: Loaded all weeks for analytics:', weeks.length)
      return weeks
    } catch (error) {
      console.error('Store: Error loading all weeks:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to load weeks' })
      return []
    }
  },

  calculateMeetingStreak: (weeks: MarriageMeetingWeek[]): number => {
    if (weeks.length === 0) return 0

    // Sort weeks by date (most recent first)
    const sortedWeeks = weeks.sort((a, b) => b.week_key.localeCompare(a.week_key))
    
    let streak = 0
    const today = new Date()
    const currentWeekKey = DatabaseManager.formatWeekKey(today)
    
    // Check if current week has data
    const hasCurrentWeek = sortedWeeks.some(week => week.week_key === currentWeekKey)
    if (!hasCurrentWeek) return 0
    
    // Count consecutive weeks with data, starting from current week
    for (let i = 0; i < sortedWeeks.length; i++) {
      const week = sortedWeeks[i]
      const weekDate = new Date(week.week_key)
      const expectedWeekKey = DatabaseManager.formatWeekKey(weekDate)
      
      if (week.week_key === expectedWeekKey) {
        streak++
        // Move to previous week for next iteration
        weekDate.setDate(weekDate.getDate() - 7)
      } else {
        break
      }
    }
    
    console.log('Store: Calculated meeting streak:', streak)
    return streak
  },

  calculateConsistencyScore: (weeks: MarriageMeetingWeek[]): number => {
    if (weeks.length === 0) return 0

    let totalScore = 0
    let weeksWithData = 0

    weeks.forEach(week => {
      const data = week.data_content || {}
      let weekScore = 0
      let sectionsUsed = 0
      const totalSections = 6

      // Check each section for data
      if (data.todos && data.todos.length > 0) {
        weekScore += 1
        sectionsUsed++
      }
      if (data.prayers && data.prayers.length > 0) {
        weekScore += 1
        sectionsUsed++
      }
      if (data.goals && data.goals.length > 0) {
        weekScore += 1
        sectionsUsed++
      }
      if (data.grocery && data.grocery.length > 0 && data.grocery.some(store => store.items && store.items.length > 0)) {
        weekScore += 1
        sectionsUsed++
      }
      if (data.unconfessedSin && data.unconfessedSin.length > 0) {
        weekScore += 1
        sectionsUsed++
      }
      if (data.weeklyWinddown && data.weeklyWinddown.length > 0) {
        weekScore += 1
        sectionsUsed++
      }

      // Calculate week's consistency percentage
      const weekConsistency = (sectionsUsed / totalSections) * 100
      totalScore += weekConsistency
      weeksWithData++
    })

    const averageConsistency = weeksWithData > 0 ? totalScore / weeksWithData : 0
    console.log('Store: Calculated consistency score:', Math.round(averageConsistency))
    return Math.round(averageConsistency)
  }
}))
