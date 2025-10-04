import { getAuthHeaders } from '../stores/authStore'

// Database connection configuration - using API calls instead of direct connection
const API_BASE_URL = ''

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
  deletedGoalIds?: string[]
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
      const response = await fetch(`${API_BASE_URL}/api/entries/${date}?t=${Date.now()}`, {
        headers: {
          ...getAuthHeaders(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
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
        // data_content is already a JavaScript object, not a JSON string
        const content = typeof data.entry.data_content === 'string' ? JSON.parse(data.entry.data_content) : data.entry.data_content
        return {
          id: data.entry.id,
          user_id: data.entry.user_id,
          date: data.entry.date_key,
          scripture: content.soap?.scripture || '',
          observation: content.soap?.observation || '',
          application: content.soap?.application || '',
          prayer: content.soap?.prayer || '',
          gratitude: content.gratitude || '',
          goals: content.goals || { daily: [], weekly: [], monthly: [] },
          checkIn: content.checkIn || { emotions: [], feeling: '' },
          dailyIntention: content.dailyIntention || '',
          growthQuestion: content.growthQuestion || '',
          leadershipRating: content.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
          deletedGoalIds: content.deletedGoalIds || [],
          readingPlan: content.readingPlan || undefined,
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
      
      // Handle different data structures - entry might be the full dayData object
      const soapData = entry.soap || {
        scripture: entry.scripture || '',
        observation: entry.observation || '',
        application: entry.application || '',
        prayer: entry.prayer || '',
        thoughts: entry.thoughts || ''
      }
      
      const requestBody = {
        date: entry.date,
        goals: entry.goals,
        gratitude: entry.gratitude,
        soap: soapData,
        dailyIntention: entry.dailyIntention || '',
        growthQuestion: entry.growthQuestion || '',
        leadershipRating: entry.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
        checkIn: entry.checkIn || { emotions: [], feeling: '' },
        deletedGoalIds: entry.deletedGoalIds || [],
        readingPlan: entry.readingPlan || undefined
      }
      
      console.log('API: Request body for save:', requestBody)
      console.log('API: SOAP data in request body:', JSON.stringify(requestBody.soap, null, 2))
      console.log('API: CheckIn data being saved:', {
        checkIn: entry.checkIn,
        checkInType: typeof entry.checkIn,
        emotions: entry.checkIn?.emotions,
        emotionsType: typeof entry.checkIn?.emotions,
        emotionsIsArray: Array.isArray(entry.checkIn?.emotions),
        feeling: entry.checkIn?.feeling
      })
      
      const response = await fetch(`${API_BASE_URL}/api/entries`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: Saved daily entry:', data.entry)
      
      // Transform the response back to our interface
      if (data.entry && data.entry.data_content) {
        // data_content is already a JavaScript object, not a JSON string
        const content = typeof data.entry.data_content === 'string' ? JSON.parse(data.entry.data_content) : data.entry.data_content
        
        return {
          id: data.entry.id,
          user_id: data.entry.user_id,
          date: data.entry.date_key,
          scripture: content.soap?.scripture || '',
          observation: content.soap?.observation || '',
          application: content.soap?.application || '',
          prayer: content.soap?.prayer || '',
          gratitude: content.gratitude || '',
          goals: content.goals || { daily: [], weekly: [], monthly: [] },
          checkIn: content.checkIn || { emotions: [], feeling: '' },
          dailyIntention: content.dailyIntention || '',
          growthQuestion: content.growthQuestion || '',
          leadershipRating: content.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
          deletedGoalIds: content.deletedGoalIds || [],
          readingPlan: content.readingPlan || undefined,
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

  async loadDayData(date: string, userId: string | number): Promise<any> {
    try {
      console.log('API: Loading day data for date:', date, 'user:', userId)
      const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId
      const entry = await this.getDailyEntry(date, userIdNum)
      
      if (entry) {
        // Get reading plan data from data_content if it exists
        const dataContent = entry.data_content || {}
        const readingPlan = dataContent.readingPlan || null
        
        // Transform the entry to match the expected format
        return {
          checkIn: {
            emotions: [],
            feeling: ''
          },
          gratitude: entry.gratitude ? entry.gratitude.split(', ') : ['', '', ''],
          soap: {
            scripture: entry.scripture || '',
            observation: entry.observation || '',
            application: entry.application || '',
            prayer: entry.prayer || '',
            thoughts: dataContent.soap?.thoughts || ''
          },
          goals: entry.goals ? JSON.parse(entry.goals) : {
            daily: [],
            weekly: [],
            monthly: []
          },
          dailyIntention: '',
          growthQuestion: '',
          leadershipRating: {
            wisdom: 5,
            courage: 5,
            patience: 5,
            integrity: 5
          },
          readingPlan: readingPlan
        }
      }
      return null
    } catch (error) {
      console.error('API: Error loading day data:', error)
      return null
    }
  }

  async saveDayData(userId: string | number, date: string, data: any): Promise<boolean> {
    try {
      console.log('API: Saving day data for date:', date, 'data:', data, 'user:', userId)
      console.log('API: SOAP data being saved:', JSON.stringify(data.soap, null, 2))
      
      const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId
      
      // Check if entry exists
      const existingEntry = await this.getDailyEntry(date, userIdNum)
      
      if (existingEntry) {
        // Update existing entry by saving with merged data
        const entryData = {
          user_id: userIdNum,
          userId: userIdNum.toString(),
          user_id: userIdNum.toString(),
          date,
          dateKey: date,
          date_key: date,
          scripture: data.soap?.scripture || existingEntry.scripture || '',
          observation: data.soap?.observation || existingEntry.observation || '',
          application: data.soap?.application || existingEntry.application || '',
          prayer: data.soap?.prayer || existingEntry.prayer || '',
          gratitude: Array.isArray(data.gratitude) ? data.gratitude : (data.gratitude || []),
          goals: data.goals || { daily: [], weekly: [], monthly: [] },
          checkIn: data.checkIn || existingEntry.checkIn || { emotions: [], feeling: '' },
          dailyIntention: data.dailyIntention || existingEntry.dailyIntention || '',
          growthQuestion: data.growthQuestion || existingEntry.growthQuestion || '',
          leadershipRating: data.leadershipRating || existingEntry.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
          deletedGoalIds: data.deletedGoalIds || existingEntry.deletedGoalIds || [],
          readingPlan: data.readingPlan || existingEntry.readingPlan || undefined,
          soap: data.soap || {
            scripture: existingEntry.scripture || '',
            observation: existingEntry.observation || '',
            application: existingEntry.application || '',
            prayer: existingEntry.prayer || '',
            thoughts: existingEntry.data_content?.soap?.thoughts || ''
          }
        }
        console.log('API: Entry data being saved (update):', JSON.stringify(entryData, null, 2))
        await this.saveDailyEntry(entryData)
      } else {
        // Create new entry
        const entryData = {
          user_id: userIdNum,
          userId: userIdNum.toString(),
          user_id: userIdNum.toString(),
          date,
          dateKey: date,
          date_key: date,
          scripture: data.soap?.scripture || '',
          observation: data.soap?.observation || '',
          application: data.soap?.application || '',
          prayer: data.soap?.prayer || '',
          gratitude: Array.isArray(data.gratitude) ? data.gratitude : [],
          goals: data.goals || { daily: [], weekly: [], monthly: [] },
          checkIn: data.checkIn || { emotions: [], feeling: '' },
          dailyIntention: data.dailyIntention || '',
          growthQuestion: data.growthQuestion || '',
          leadershipRating: data.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
          deletedGoalIds: data.deletedGoalIds || [],
          readingPlan: data.readingPlan || undefined,
          soap: data.soap || {
            scripture: '',
            observation: '',
            application: '',
            prayer: '',
            thoughts: ''
          }
        }
        console.log('API: Entry data being saved (create):', JSON.stringify(entryData, null, 2))
        await this.saveDailyEntry(entryData)
      }
      return true
    } catch (error) {
      console.error('API: Error saving day data:', error)
      return false
    }
  }

  async getDailyEntries(userId: number = 1): Promise<DailyEntry[]> {
    try {
      console.log('API: Getting all daily entries for user:', userId)
      const response = await fetch(`${API_BASE_URL}/api/entries?t=${Date.now()}`, {
        headers: {
          ...getAuthHeaders(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('API: All entries result:', data.entries)
      console.log('API: First entry data_content:', data.entries[0]?.data_content)
      console.log('API: First entry soap in data_content:', data.entries[0]?.data_content?.soap)
      
      // Transform the API response to match our interface
      return data.entries.map((entry: any) => {
        if (entry.data_content) {
          // data_content is already a JavaScript object, not a JSON string
          const content = typeof entry.data_content === 'string' ? JSON.parse(entry.data_content) : entry.data_content
          return {
            id: entry.id,
            user_id: entry.user_id,
            date: entry.date_key,
            scripture: content.soap?.scripture || '',
            observation: content.soap?.observation || '',
            application: content.soap?.application || '',
            prayer: content.soap?.prayer || '',
            gratitude: content.gratitude || '',
            goals: content.goals || { daily: [], weekly: [], monthly: [] },
            checkIn: content.checkIn || { emotions: [], feeling: '' },
            dailyIntention: content.dailyIntention || '',
            growthQuestion: content.growthQuestion || '',
            leadershipRating: content.leadershipRating || { wisdom: 0, courage: 0, patience: 0, integrity: 0 },
            deletedGoalIds: content.deletedGoalIds || [],
          readingPlan: content.readingPlan || undefined,
            // Debug: log the content to see what's in the database
            _debug_content: content,
            created_at: entry.created_at,
            updated_at: entry.updated_at
          }
        }
        return null
      }).filter(Boolean)
    } catch (error) {
      console.error('API: Error getting all entries:', error)
      return []
    }
  }

  async createDailyEntry(entryData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const result = await this.saveDailyEntry(entryData)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create entry' }
    }
  }

  async updateDailyEntryWrapper(id: number, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const result = await this.updateDailyEntry(id, updates)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update entry' }
    }
  }

  async updateGoals(type: string, goals: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const result = await this.updateUserGoals(1, goals)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update goals' }
    }
  }

  async getAllUsers(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      console.log('API: Getting all users')
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API: All users result:', data.users)
      
      return { success: true, data: data.users || [] }
    } catch (error) {
      console.error('API: Error getting all users:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get users' }
    }
  }

  async createUser(userData: { email: string; password: string; displayName: string; isAdmin: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('API: Creating user:', userData.email)
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API: User created:', data.user)
      
      return { success: true, data: data.user }
    } catch (error) {
      console.error('API: Error creating user:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create user' }
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('API: Deleting user:', userId)
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API: User deleted:', data.user)
      
      return { success: true, data: data.user }
    } catch (error) {
      console.error('API: Error deleting user:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete user' }
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