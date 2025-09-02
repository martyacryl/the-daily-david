import { neon } from '@neondatabase/serverless'

// Database connection configuration
const sql = neon(process.env.VITE_NEON_CONNECTION_STRING!)

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
      console.log('Database: Getting daily entry for date:', date, 'user:', userId)
      const result = await sql`
        SELECT * FROM daily_entries 
        WHERE date = ${date} AND user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT 1
      `
      console.log('Database: Daily entry result:', result)
      return result[0] || null
    } catch (error) {
      console.error('Database: Error getting daily entry:', error)
      throw error
    }
  }

  async saveDailyEntry(entry: Omit<DailyEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DailyEntry> {
    try {
      console.log('Database: Saving daily entry:', entry)
      const result = await sql`
        INSERT INTO daily_entries (user_id, date, scripture, observation, application, prayer, gratitude, goals)
        VALUES (${entry.user_id}, ${entry.date}, ${entry.scripture}, ${entry.observation}, ${entry.application}, ${entry.prayer}, ${entry.gratitude}, ${entry.goals})
        RETURNING *
      `
      console.log('Database: Saved daily entry:', result[0])
      return result[0]
    } catch (error) {
      console.error('Database: Error saving daily entry:', error)
      throw error
    }
  }

  async updateDailyEntry(id: number, entry: Partial<DailyEntry>): Promise<DailyEntry> {
    try {
      console.log('Database: Updating daily entry:', id, entry)
      const result = await sql`
        UPDATE daily_entries 
        SET scripture = ${entry.scripture}, 
            observation = ${entry.observation}, 
            application = ${entry.application}, 
            prayer = ${entry.prayer}, 
            gratitude = ${entry.gratitude}, 
            goals = ${entry.goals},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      console.log('Database: Updated daily entry:', result[0])
      return result[0]
    } catch (error) {
      console.error('Database: Error updating daily entry:', error)
      throw error
    }
  }

  async getUserGoals(userId: number = 1): Promise<UserGoals | null> {
    try {
      console.log('Database: Getting user goals for user:', userId)
      const result = await sql`
        SELECT * FROM user_goals 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT 1
      `
      console.log('Database: User goals result:', result)
      return result[0] || null
    } catch (error) {
      console.error('Database: Error getting user goals:', error)
      throw error
    }
  }

  async saveUserGoals(goals: Omit<UserGoals, 'id' | 'created_at' | 'updated_at'>): Promise<UserGoals> {
    try {
      console.log('Database: Saving user goals:', goals)
      const result = await sql`
        INSERT INTO user_goals (user_id, goals)
        VALUES (${goals.user_id}, ${goals.goals})
        RETURNING *
      `
      console.log('Database: Saved user goals:', result[0])
      return result[0]
    } catch (error) {
      console.error('Database: Error saving user goals:', error)
      throw error
    }
  }

  async updateUserGoals(id: number, goals: string): Promise<UserGoals> {
    try {
      console.log('Database: Updating user goals:', id, goals)
      const result = await sql`
        UPDATE user_goals 
        SET goals = ${goals}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `
      console.log('Database: Updated user goals:', result[0])
      return result[0]
    } catch (error) {
      console.error('Database: Error updating user goals:', error)
      throw error
    }
  }

  async loadDayData(date: string, userId: number = 1): Promise<{ entry: DailyEntry | null; goals: UserGoals | null }> {
    try {
      console.log('Database: Loading day data for date:', date, 'user:', userId)
      const [entry, goals] = await Promise.all([
        this.getDailyEntry(date, userId),
        this.getUserGoals(userId)
      ])
      console.log('Database: Loaded day data:', { entry, goals })
      return { entry, goals }
    } catch (error) {
      console.error('Database: Error loading day data:', error)
      throw error
    }
  }

  async saveDayData(date: string, data: Partial<DailyEntry>, userId: number = 1): Promise<DailyEntry> {
    try {
      console.log('Database: Saving day data for date:', date, 'data:', data, 'user:', userId)
      
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
      console.error('Database: Error saving day data:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Database: Testing connection')
      const result = await sql`SELECT 1 as test`
      console.log('Database: Connection test result:', result)
      return result[0]?.test === 1
    } catch (error) {
      console.error('Database: Connection test failed:', error)
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
