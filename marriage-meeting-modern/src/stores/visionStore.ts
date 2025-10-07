import { create } from 'zustand'
import { DatabaseManager } from '../lib/database'

const dbManager = new DatabaseManager()

// Vision Data Types
export interface VisionGoal {
  id: number
  text: string
  category: 'spiritual' | 'family' | 'personal' | 'financial' | 'ministry'
  timeframe: '1year' | '5year' | '10year'
  completed: boolean
  progress: number
  target_date?: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  created_at?: string
  updated_at?: string
}

export interface FamilyVision {
  id?: number
  user_id?: string
  title?: string
  mission_statement: string
  core_values: string[]
  priorities?: string[]
  created_at?: string
  updated_at?: string
}

export interface SpiritualGrowth {
  id?: number
  user_id?: string
  prayer_requests: string[]
  answered_prayers: string[]
  bible_reading_plan: string
  bible_reading_progress: number
  devotionals: string[]
  spiritual_goals: string[]
  reflection_notes: string
  created_at?: string
  updated_at?: string
}

export interface FamilyPlanning {
  id?: number
  user_id?: string
  family_events: string[]
  financial_goals: string[]
  home_goals: string[]
  education_goals: string[]
  vacation_plans: string[]
  milestone_dates: Record<string, any>
  notes: string
  created_at?: string
  updated_at?: string
}

interface VisionState {
  // Family Vision
  familyVision: FamilyVision | null
  isFamilyVisionLoading: boolean
  
  // Vision Goals
  visionGoals: VisionGoal[]
  isVisionGoalsLoading: boolean
  
  // Spiritual Growth
  spiritualGrowth: SpiritualGrowth | null
  isSpiritualGrowthLoading: boolean
  
  // Family Planning
  familyPlanning: FamilyPlanning | null
  isFamilyPlanningLoading: boolean
  
  // General state
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  
  // Actions
  loadFamilyVision: () => Promise<void>
  updateFamilyVision: (data: Partial<FamilyVision>) => Promise<void>
  
  loadVisionGoals: () => Promise<void>
  addVisionGoal: (goal: Omit<VisionGoal, 'id'>) => Promise<void>
  updateVisionGoal: (id: number, updates: Partial<VisionGoal>) => Promise<void>
  deleteVisionGoal: (id: number) => Promise<void>
  toggleVisionGoal: (id: number) => Promise<void>
  
  loadSpiritualGrowth: () => Promise<void>
  updateSpiritualGrowth: (data: Partial<SpiritualGrowth>) => Promise<void>
  
  loadFamilyPlanning: () => Promise<void>
  updateFamilyPlanning: (data: Partial<FamilyPlanning>) => Promise<void>
  
  // Getters
  getGoalsByTimeframe: (timeframe: '1year' | '5year' | '10year') => VisionGoal[]
  getGoalsByCategory: (category: string) => VisionGoal[]
  
  clearError: () => void
}

export const useVisionStore = create<VisionState>((set, get) => ({
  // Initial state
  familyVision: null,
  isFamilyVisionLoading: false,
  visionGoals: [],
  isVisionGoalsLoading: false,
  spiritualGrowth: null,
  isSpiritualGrowthLoading: false,
  familyPlanning: null,
  isFamilyPlanningLoading: false,
  isLoading: false,
  error: null,
  lastSaved: null,

  // Family Vision Actions
  loadFamilyVision: async () => {
    set({ isFamilyVisionLoading: true, error: null })
    try {
      console.log('Vision Store: Loading family vision...')
      const data = await dbManager.getFamilyVision()
      console.log('Vision Store: Loaded family vision:', data)
      set({ familyVision: data, isFamilyVisionLoading: false })
    } catch (error) {
      console.error('Vision Store: Error loading family vision:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load family vision',
        isFamilyVisionLoading: false 
      })
    }
  },

  updateFamilyVision: async (data) => {
    try {
      console.log('Vision Store: Updating family vision:', data)
      const updatedData = await dbManager.updateFamilyVision(data)
      console.log('Vision Store: Updated family vision:', updatedData)
      set({ 
        familyVision: updatedData, 
        lastSaved: new Date() 
      })
    } catch (error) {
      console.error('Vision Store: Error updating family vision:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update family vision' })
    }
  },

  // Vision Goals Actions
  loadVisionGoals: async () => {
    set({ isVisionGoalsLoading: true, error: null })
    try {
      const data = await dbManager.getVisionGoals()
      set({ visionGoals: data, isVisionGoalsLoading: false })
    } catch (error) {
      console.error('Error loading vision goals:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load vision goals',
        isVisionGoalsLoading: false 
      })
    }
  },

  addVisionGoal: async (goalData) => {
    try {
      const newGoal = await dbManager.addVisionGoal(goalData)
      set(state => ({
        visionGoals: [...state.visionGoals, newGoal],
        lastSaved: new Date()
      }))
    } catch (error) {
      console.error('Error adding vision goal:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to add vision goal' })
    }
  },

  updateVisionGoal: async (id, updates) => {
    try {
      const updatedGoal = await dbManager.updateVisionGoal(id, updates)
      set(state => ({
        visionGoals: state.visionGoals.map(goal => goal.id === id ? updatedGoal : goal),
        lastSaved: new Date()
      }))
    } catch (error) {
      console.error('Error updating vision goal:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update vision goal' })
    }
  },

  deleteVisionGoal: async (id) => {
    try {
      await dbManager.deleteVisionGoal(id)
      set(state => ({
        visionGoals: state.visionGoals.filter(goal => goal.id !== id),
        lastSaved: new Date()
      }))
    } catch (error) {
      console.error('Error deleting vision goal:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to delete vision goal' })
    }
  },

  toggleVisionGoal: async (id) => {
    const goal = get().visionGoals.find(g => g.id === id)
    if (!goal) return

    try {
      await get().updateVisionGoal(id, { completed: !goal.completed })
    } catch (error) {
      console.error('Error toggling vision goal:', error)
    }
  },

  // Spiritual Growth Actions
  loadSpiritualGrowth: async () => {
    set({ isSpiritualGrowthLoading: true, error: null })
    try {
      const data = await dbManager.getSpiritualGrowth()
      set({ spiritualGrowth: data, isSpiritualGrowthLoading: false })
    } catch (error) {
      console.error('Error loading spiritual growth:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load spiritual growth',
        isSpiritualGrowthLoading: false 
      })
    }
  },

  updateSpiritualGrowth: async (data) => {
    try {
      const updatedData = await dbManager.updateSpiritualGrowth(data)
      set({ 
        spiritualGrowth: updatedData, 
        lastSaved: new Date() 
      })
    } catch (error) {
      console.error('Error updating spiritual growth:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update spiritual growth' })
    }
  },

  // Family Planning Actions
  loadFamilyPlanning: async () => {
    set({ isFamilyPlanningLoading: true, error: null })
    try {
      const data = await dbManager.getFamilyPlanning()
      set({ familyPlanning: data, isFamilyPlanningLoading: false })
    } catch (error) {
      console.error('Error loading family planning:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load family planning',
        isFamilyPlanningLoading: false 
      })
    }
  },

  updateFamilyPlanning: async (data) => {
    try {
      const updatedData = await dbManager.updateFamilyPlanning(data)
      set({ 
        familyPlanning: updatedData, 
        lastSaved: new Date() 
      })
    } catch (error) {
      console.error('Error updating family planning:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update family planning' })
    }
  },

  // Getters
  getGoalsByTimeframe: (timeframe) => {
    return get().visionGoals.filter(goal => goal.timeframe === timeframe)
  },

  getGoalsByCategory: (category) => {
    return get().visionGoals.filter(goal => goal.category === category)
  },

  clearError: () => {
    set({ error: null })
  }
}))
