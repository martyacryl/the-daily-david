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

  // Get all weeks for analytics calculations
  async getAllWeeksForUser(): Promise<MarriageMeetingWeek[]> {
    const response = await fetch(`${this.baseUrl}/api/marriage-weeks/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch all marriage meeting weeks: ${error}`)
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
  async createUser(userData: CreateUserFormData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
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
        return { success: false, error: `Failed to create user: ${error}` }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `Failed to delete user: ${error}` }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async changeUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({ newPassword }),
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `Failed to change password: ${error}` }
      }

      const result = await response.json()
      return { success: true, message: result.message }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getAllUsers(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, error: `Failed to fetch users: ${error}` }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
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
    
    // Return in YYYY-MM-DD format using local date components to avoid timezone issues
    const year = monday.getFullYear()
    const month = String(monday.getMonth() + 1).padStart(2, '0')
    const dayOfMonth = String(monday.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${dayOfMonth}`
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

  // ===== VISION DATA MANAGEMENT =====

  // Family Vision
  async getFamilyVision(): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/family-vision`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch family vision: ${error}`)
    }

    return await response.json()
  }

  async updateFamilyVision(data: any): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/family-vision`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update family vision: ${error}`)
    }

    return await response.json()
  }

  // Vision Goals
  async getVisionGoals(): Promise<any[]> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/vision-goals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch vision goals: ${error}`)
    }

    return await response.json()
  }

  async addVisionGoal(goal: any): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/vision-goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(goal),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to add vision goal: ${error}`)
    }

    return await response.json()
  }

  async updateVisionGoal(id: number, updates: any): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/vision-goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update vision goal: ${error}`)
    }

    return await response.json()
  }

  async deleteVisionGoal(id: number): Promise<void> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/vision-goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete vision goal: ${error}`)
    }
  }

  // Spiritual Growth
  async getSpiritualGrowth(): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/spiritual-growth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch spiritual growth: ${error}`)
    }

    return await response.json()
  }

  async updateSpiritualGrowth(data: any): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/spiritual-growth`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update spiritual growth: ${error}`)
    }

    return await response.json()
  }

  // Family Planning
  async getFamilyPlanning(): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/family-planning`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch family planning: ${error}`)
    }

    return await response.json()
  }

  async updateFamilyPlanning(data: any): Promise<any> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.baseUrl}/api/family-planning`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update family planning: ${error}`)
    }

    return await response.json()
  }

  // Meeting Progress Methods
  async getMeetingProgress(weekKey?: string): Promise<any[]> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    const url = weekKey 
      ? `${this.baseUrl}/api/meeting-progress?week_key=${weekKey}`
      : `${this.baseUrl}/api/meeting-progress`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch meeting progress: ${error}`)
    }

    return await response.json()
  }

  async saveMeetingProgress(data: {
    meeting_date: string
    week_key: string
    steps_completed: string[]
    total_steps?: number
    completion_percentage: number
    meeting_duration_minutes?: number
    notes?: string
  }): Promise<any> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    const response = await fetch(`${this.baseUrl}/api/meeting-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to save meeting progress: ${error}`)
    }

    return await response.json()
  }

  async getMeetingStats(): Promise<{
    current_streak: number
    longest_streak: number
    total_meetings: number
    avg_completion: string
    total_duration: number
    recent_meetings: any[]
  }> {
    const token = this.getAuthToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    const response = await fetch(`${this.baseUrl}/api/meeting-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch meeting stats: ${error}`)
    }

    return await response.json()
  }
}

// Create singleton instance
export const dbManager = new DatabaseManager()