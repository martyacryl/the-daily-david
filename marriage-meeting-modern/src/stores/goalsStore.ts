import { create } from 'zustand'
import { GoalItem } from '../types/marriageTypes'
import { DatabaseManager } from '../lib/database'

interface GoalsState {
  goals: GoalItem[]
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  
  // Actions
  loadGoals: () => Promise<void>
  addGoal: (goal: Omit<GoalItem, 'id'>) => Promise<void>
  updateGoal: (id: number, updates: Partial<GoalItem>) => Promise<void>
  deleteGoal: (id: number) => Promise<void>
  toggleGoal: (id: number) => Promise<void>
  
  // Filtered getters
  getGoalsByTimeframe: (timeframe: GoalItem['timeframe']) => GoalItem[]
  getCurrentMonthGoals: () => GoalItem[]
  getOverdueMonthlyGoals: () => GoalItem[]
  getCurrentYearGoals: () => GoalItem[]
  getLongTermGoals: () => GoalItem[]
}

const dbManager = new DatabaseManager()

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  lastSaved: null,

  loadGoals: async () => {
    set({ isLoading: true, error: null })
    try {
      console.log('Goals Store: Loading goals...')
      const goals = await dbManager.getGoals()
      console.log('Goals Store: Loaded goals:', goals.length)
      set({ goals, isLoading: false })
    } catch (error) {
      console.error('Goals Store: Error loading goals:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load goals',
        isLoading: false 
      })
    }
  },

  addGoal: async (goalData) => {
    try {
      console.log('Goals Store: Adding goal:', goalData)
      const newGoal = await dbManager.addGoal(goalData)
      set(state => ({
        goals: [...state.goals, newGoal],
        lastSaved: new Date()
      }))
      console.log('Goals Store: Goal added successfully')
    } catch (error) {
      console.error('Goals Store: Error adding goal:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to add goal' })
    }
  },

  updateGoal: async (id, updates) => {
    try {
      console.log('Goals Store: Updating goal:', id, updates)
      const updatedGoal = await dbManager.updateGoal(id, updates)
      set(state => ({
        goals: state.goals.map(goal => goal.id === id ? updatedGoal : goal),
        lastSaved: new Date()
      }))
      console.log('Goals Store: Goal updated successfully')
    } catch (error) {
      console.error('Goals Store: Error updating goal:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update goal' })
    }
  },

  deleteGoal: async (id) => {
    try {
      console.log('Goals Store: Deleting goal:', id)
      await dbManager.deleteGoal(id)
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        lastSaved: new Date()
      }))
      console.log('Goals Store: Goal deleted successfully')
    } catch (error) {
      console.error('Goals Store: Error deleting goal:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to delete goal' })
    }
  },

  toggleGoal: async (id) => {
    const goal = get().goals.find(g => g.id === id)
    if (!goal) return

    try {
      console.log('Goals Store: Toggling goal:', id)
      await get().updateGoal(id, { completed: !goal.completed })
    } catch (error) {
      console.error('Goals Store: Error toggling goal:', error)
    }
  },

  getGoalsByTimeframe: (timeframe) => {
    return get().goals.filter(goal => goal.timeframe === timeframe)
  },

  getCurrentMonthGoals: () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return get().goals.filter(goal => {
      if (goal.timeframe !== 'monthly') return false
      if (!goal.created_at) return true // If no created_at, show it (backward compatibility)
      
      const goalDate = new Date(goal.created_at)
      const goalMonth = goalDate.getMonth()
      const goalYear = goalDate.getFullYear()
      
      // Show goals created in the current month
      return goalMonth === currentMonth && goalYear === currentYear
    })
  },

  getOverdueMonthlyGoals: () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return get().goals.filter(goal => {
      if (goal.timeframe !== 'monthly') return false
      if (goal.completed) return false // Don't show completed goals as overdue
      if (!goal.created_at) return false // Skip goals without created_at
      
      const goalDate = new Date(goal.created_at)
      const goalMonth = goalDate.getMonth()
      const goalYear = goalDate.getFullYear()
      
      // Show goals from previous months that are not completed
      return (goalYear < currentYear) || (goalYear === currentYear && goalMonth < currentMonth)
    })
  },

  getCurrentYearGoals: () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    
    return get().goals.filter(goal => {
      if (goal.timeframe === '1year') return true
      if (goal.timeframe === 'monthly') return true
      return false
    })
  },

  getLongTermGoals: () => {
    return get().goals.filter(goal => 
      goal.timeframe === '5year' || goal.timeframe === '10year'
    )
  }
}))
