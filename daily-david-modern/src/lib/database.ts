// Database connection configuration - using API calls instead of direct connection
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface DailyEntry {
  id?: number
  user_id: number
  date: string
  scripture: string
  observation: string
  application: string
  prayer: string
  gratitude: string
  goals: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  email: string
  name: string
  created_at: string
}

export interface UserGoals {
  id?: number
  user_id: number
  goals: string
  created_at?: string
  updated_at?: string
}

class DatabaseManager {
  private static instance: DatabaseManager

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async getDailyEntry(date: string, userId: number = 1): Promise<DailyEntry | null> {
    try {
      console.log('API: Getting daily entry for date:', date, 'user:', userId)
      const response = await fetch(`${API_BASE_URL}/api/daily-entries?userId=${userId}&date=${date}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Daily entry result:', data.entry)
      return data.entry || null
    } catch (error) {
      console.error('API: Error getting daily entry:', error)
      throw error
    }
  }

  async saveDailyEntry(entry: Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DailyEntry> {
    try {
      console.log('API: Saving daily entry:', entry)
      const response = await fetch(`${API_BASE_URL}/api/daily-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Saved daily entry:', data.entry)
      return data.entry
    } catch (error) {
      console.error('API: Error saving daily entry:', error)
      throw error
    }
  }

  async updateDailyEntry(id: number, entry: Partial<DailyEntry>): Promise<DailyEntry> {
    try {
      console.log('API: Updating daily entry:', id, entry)
      const response = await fetch(`${API_BASE_URL}/api/daily-entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Updated daily entry:', data.entry)
      return data.entry
    } catch (error) {
      console.error('API: Error updating daily entry:', error)
      throw error
    }
  }

  async getUserGoals(userId: number = 1): Promise<UserGoals | null> {
    try {
      console.log('API: Getting user goals for user:', userId)
      const response = await fetch(`${API_BASE_URL}/api/user-goals?userId=${userId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: User goals result:', data.goals)
      return data.goals || null
    } catch (error) {
      console.error('API: Error getting user goals:', error)
      throw error
    }
  }

  async saveUserGoals(goals: Omit<UserGoals, 'id' | 'created_at' | 'updated_at'>): Promise<UserGoals> {
    try {
      console.log('API: Saving user goals:', goals)
      const response = await fetch(`${API_BASE_URL}/api/user-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goals),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Saved user goals:', data.goals)
      return data.goals
    } catch (error) {
      console.error('API: Error saving user goals:', error)
      throw error
    }
  }

  async updateUserGoals(id: number, goals: string): Promise<UserGoals> {
    try {
      console.log('API: Updating user goals:', id, goals)
      const response = await fetch(`${API_BASE_URL}/api/user-goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goals }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Updated user goals:', data.goals)
      return data.goals
    } catch (error) {
      console.error('API: Error updating user goals:', error)
      throw error
    }
  }

  async loadDayData(date: string, userId: number = 1): Promise<{ entry: DailyEntry | null; goals: UserGoals | null }> {
    try {
      console.log('API: Loading day data for date:', date, 'user:', userId)
      const [entry, goals] = await Promise.all([
        this.getDailyEntry(date, userId),
        this.getUserGoals(userId)
      ])
      console.log('API: Loaded day data:', { entry, goals })
      return { entry, goals }
    } catch (error) {
      console.error('API: Error loading day data:', error)
      throw error
    }
  }

  async saveDayData(date: string, data: Partial<DailyEntry>, userId: number = 1): Promise<DailyEntry> {
    try {
      console.log('API: Saving day data for date:', date, 'data:', data, 'user:', userId)
      
      // Check if entry exists
      const existingEntry = await this.getDailyEntry(date, userId)
      
      if (existingEntry) {
        // Update existing entry
        return await this.updateDailyEntry(existingEntry.id!, {
          ...existingEntry,
          ...data,
          user_id: userId,
          date
        })
      } else {
        // Create new entry
        return await this.saveDailyEntry({
          user_id: userId,
          date,
          scripture: data.scripture || '',
          observation: data.observation || '',
          application: data.application || '',
          prayer: data.prayer || '',
          gratitude: data.gratitude || '',
          goals: data.goals || ''
        })
      }
    } catch (error) {
      console.error('API: Error saving day data:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('API: Testing connection')
      const response = await fetch(`${API_BASE_URL}/api/health`)
      const isHealthy = response.ok
      console.log('API: Connection test result:', isHealthy)
      return isHealthy
    } catch (error) {
      console.error('API: Connection test failed:', error)
      return false
    }
  }
}

// Create singleton instance
const databaseInstance = new DatabaseManager()

// Export the class
export { DatabaseManager as default }

// Export singleton getter
export const getDatabaseManager = (): DatabaseManager => {
  return databaseInstance
}

// FIXED: Direct instance export for compatibility
export const dbManager = databaseInstance