// Database connection configuration - using API calls instead of direct connection
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001')

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
      const response = await fetch(`${API_BASE_URL}/api/entries/${date}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Daily entry result:', data.entry)
      
      // Transform the API response to match our interface
      if (data.entry && data.entry.data_content) {
        const content = JSON.parse(data.entry.data_content)
        return {
          id: data.entry.id,
          user_id: data.entry.user_id,
          date: data.entry.date_key,
          scripture: content.soap?.scripture || '',
          observation: content.soap?.observation || '',
          application: content.soap?.application || '',
          prayer: content.soap?.prayer || '',
          gratitude: content.gratitude || '',
          goals: content.goals || '',
          created_at: data.entry.created_at,
          updated_at: data.entry.updated_at
        }
      }
      return null
    } catch (error) {
      console.error('API: Error getting daily entry:', error)
      return null
    }
  }

  async saveDailyEntry(entry: Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DailyEntry> {
    try {
      console.log('API: Saving daily entry:', entry)
      const response = await fetch(`${API_BASE_URL}/api/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: entry.date,
          goals: entry.goals,
          gratitude: entry.gratitude,
          soap: {
            scripture: entry.scripture,
            observation: entry.observation,
            application: entry.application,
            prayer: entry.prayer
          }
        }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Saved daily entry:', data.entry)
      
      // Transform the response back to our interface
      if (data.entry && data.entry.data_content) {
        const content = JSON.parse(data.entry.data_content)
        return {
          id: data.entry.id,
          user_id: data.entry.user_id,
          date: data.entry.date_key,
          scripture: content.soap?.scripture || '',
          observation: content.soap?.observation || '',
          application: content.soap?.application || '',
          prayer: content.soap?.prayer || '',
          gratitude: content.gratitude || '',
          goals: content.goals || '',
          created_at: data.entry.created_at,
          updated_at: data.entry.updated_at
        }
      }
      return data.entry
    } catch (error) {
      console.error('API: Error saving daily entry:', error)
      throw error
    }
  }

  async updateDailyEntry(id: number, entry: Partial<DailyEntry>): Promise<DailyEntry> {
    // For now, just save as a new entry since the API doesn't have update
    return this.saveDailyEntry(entry as Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>)
  }

  async getUserGoals(userId: number = 1): Promise<UserGoals | null> {
    // Return default goals for now since this isn't in the API
    return {
      id: 1,
      user_id: userId,
      goals: 'Set your daily goals here',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  async saveUserGoals(goals: Omit<UserGoals, 'id' | 'created_at' | 'updated_at'>): Promise<UserGoals> {
    // For now, just return the goals since this isn't in the API
    return {
      id: 1,
      user_id: goals.user_id,
      goals: goals.goals,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  async updateUserGoals(id: number, goals: string): Promise<UserGoals> {
    // For now, just return the goals since this isn't in the API
    return {
      id: id,
      user_id: 1,
      goals: goals,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
        // Update existing entry by saving with merged data
        return await this.saveDailyEntry({
          user_id: userId,
          date,
          scripture: data.scripture || existingEntry.scripture || '',
          observation: data.observation || existingEntry.observation || '',
          application: data.application || existingEntry.application || '',
          prayer: data.prayer || existingEntry.prayer || '',
          gratitude: data.gratitude || existingEntry.gratitude || '',
          goals: data.goals || existingEntry.goals || ''
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