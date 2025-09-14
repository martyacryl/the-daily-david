// Marriage Meeting Tool - Database Service
// Uses Neon PostgreSQL like Daily David

import { 
  User, 
  MarriageMeetingWeek, 
  WeekData, 
  DatabaseResponse,
  CreateUserFormData,
  GoalItem
} from '../types/marriageTypes'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://theweeklyhuddle.vercel.app' : 'http://localhost:3001')

export class DatabaseManager {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Authentication
  async authenticateUser(email: string, password: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Authentication failed: ${error}`)
    }

    const result = await response.json()
    return result.user
  }

  // Marriage Meeting Week Operations
  async saveMarriageMeetingWeek(week: MarriageMeetingWeek): Promise<void> {
    const token = this.getAuthToken()
    console.log('API: Saving marriage week for:', week.week_key, 'with token:', token ? 'present' : 'missing')
    
    const requestBody = {
      week_key: week.week_key,
      user_id: week.user_id,
      data_content: {
        schedule: week.schedule,
        todos: week.todos,
        prayers: week.prayers,
        grocery: week.grocery,
        unconfessedSin: week.unconfessedSin,
        weeklyWinddown: week.weeklyWinddown,
        encouragementNotes: week.encouragementNotes,
        calendarEvents: week.calendarEvents
      }
    }

    console.log('API: Request body for save:', requestBody)
    console.log('API: Detailed data_content:', {
      schedule: Object.values(requestBody.data_content.schedule || {}).flat().filter(item => item && item.trim()).length,
      todos: requestBody.data_content.todos?.length || 0,
      prayers: requestBody.data_content.prayers?.length || 0,
      grocery: requestBody.data_content.grocery?.length || 0,
      encouragementNotes: requestBody.data_content.encouragementNotes?.length || 0,
      calendarEvents: requestBody.data_content.calendarEvents?.length || 0,
      fullDataContent: JSON.stringify(requestBody.data_content, null, 2)
    })

    const response = await fetch(`${this.baseUrl}/api/marriage-weeks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('API: Save response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('API: Save error response:', error)
      throw new Error(`Failed to save marriage meeting week: ${error}`)
    }

    console.log('API: Successfully saved week data')
  }

  async getMarriageMeetingWeeks(): Promise<MarriageMeetingWeek[]> {
    const response = await fetch(`${this.baseUrl}/api/marriage-weeks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch marriage meeting weeks: ${error}`)
    }

    const results = await response.json()
    return results.map((result: any) => this.transformDatabaseResult(result))
  }

  async getMarriageMeetingWeekByDate(weekKey: string): Promise<MarriageMeetingWeek | null> {
    const token = this.getAuthToken()
    console.log('API: Getting marriage week for:', weekKey, 'with token:', token ? 'present' : 'missing')
    
    const response = await fetch(`${this.baseUrl}/api/marriage-weeks/${weekKey}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    console.log('API: Response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        console.log('API: Week not found, returning null')
        return null
      }
      const error = await response.text()
      console.error('API: Error response:', error)
      throw new Error(`Failed to fetch marriage meeting week: ${error}`)
    }

    const result = await response.json()
    console.log('API: Successfully fetched week data')
    return this.transformDatabaseResult(result)
  }

  // Admin User Management
  async createUser(userData: CreateUserFormData): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create user: ${error}`)
    }

    return await response.json()
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete user: ${error}`)
    }
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch users: ${error}`)
    }

    return await response.json()
  }

  // Utility Methods
  private transformDatabaseResult(result: any): MarriageMeetingWeek {
    const dataContent = result.data_content || {}
    
    console.log('Database: Raw result data_content:', JSON.stringify(dataContent, null, 2))
    console.log('Database: encouragementNotes in data_content:', dataContent.encouragementNotes)
    
    return {
      id: result.id,
      user_id: result.user_id,
      week_key: result.week_key,
      schedule: dataContent.schedule || {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      },
      todos: dataContent.todos || [],
      prayers: dataContent.prayers || [],
      grocery: dataContent.grocery || [],
      unconfessedSin: dataContent.unconfessedSin || [],
      weeklyWinddown: dataContent.weeklyWinddown || [],
      encouragementNotes: dataContent.encouragementNotes || [],
      calendarEvents: dataContent.calendarEvents || [],
      created_at: result.created_at,
      updated_at: result.updated_at
    }
  }

  private getAuthToken(): string {
    // Get token from auth store
    try {
      const authData = localStorage.getItem('auth-storage')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.state?.token || ''
      }
    } catch (error) {
      console.error('Error getting auth token:', error)
    }
    return ''
  }

  // Helper method to format week key (Monday of the week)
  static formatWeekKey(date: Date): string {
    // Create a new date to avoid mutating the original
    const d = new Date(date.getTime())
    
    console.log('formatWeekKey input:', date.toISOString().split('T')[0], 'day:', d.getDay())
    
    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const day = d.getDay()
    
    // Calculate days to subtract to get to Monday
    // If it's Sunday (0), subtract 6 days to get to Monday
    // If it's Monday (1), subtract 0 days (already Monday)
    // Otherwise, subtract (day - 1) to get to Monday
    const daysToSubtract = day === 0 ? 6 : day - 1
    
    // Create Monday date by subtracting the calculated days
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysToSubtract)
    
    console.log('formatWeekKey result:', monday.toISOString().split('T')[0])
    
    // Return in YYYY-MM-DD format
    return monday.toISOString().split('T')[0]
  }

  // Helper method to get week range from week key
  static getWeekRange(weekKey: string): { start: string, end: string } {
    const monday = new Date(weekKey)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    }
  }

  // Goals Management (Independent of weeks)
  async getGoals(): Promise<GoalItem[]> {
    const token = this.getAuthToken()
    console.log('API: Getting goals with token:', token ? 'present' : 'missing')
    
    const response = await fetch(`${this.baseUrl}/api/goals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    console.log('API: Goals response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        console.log('API: No goals found, returning empty array')
        return []
      }
      const error = await response.text()
      console.error('API: Error response:', error)
      throw new Error(`Failed to fetch goals: ${error}`)
    }

    const result = await response.json()
    console.log('API: Successfully fetched goals')
    return result
  }

  async addGoal(goal: Omit<GoalItem, 'id'>): Promise<GoalItem> {
    const token = this.getAuthToken()
    console.log('API: Adding goal with token:', token ? 'present' : 'missing')
    
    const response = await fetch(`${this.baseUrl}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(goal),
    })

    console.log('API: Add goal response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('API: Add goal error response:', error)
      throw new Error(`Failed to add goal: ${error}`)
    }

    const result = await response.json()
    console.log('API: Successfully added goal')
    return result
  }

  async updateGoal(id: number, updates: Partial<GoalItem>): Promise<GoalItem> {
    const token = this.getAuthToken()
    console.log('API: Updating goal:', id, 'with token:', token ? 'present' : 'missing')
    
    const response = await fetch(`${this.baseUrl}/api/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })

    console.log('API: Update goal response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('API: Update goal error response:', error)
      throw new Error(`Failed to update goal: ${error}`)
    }

    const result = await response.json()
    console.log('API: Successfully updated goal')
    return result
  }

  async deleteGoal(id: number): Promise<void> {
    const token = this.getAuthToken()
    console.log('API: Deleting goal:', id, 'with token:', token ? 'present' : 'missing')
    
    const response = await fetch(`${this.baseUrl}/api/goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    console.log('API: Delete goal response status:', response.status)

    if (!response.ok) {
      const error = await response.text()
      console.error('API: Delete goal error response:', error)
      throw new Error(`Failed to delete goal: ${error}`)
    }

    console.log('API: Successfully deleted goal')
  }
}

// Create singleton instance
export const dbManager = new DatabaseManager()