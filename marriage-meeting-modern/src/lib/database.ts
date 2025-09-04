// Marriage Meeting Tool - Database Service
// Uses Neon PostgreSQL like Daily David

import { 
  User, 
  MarriageMeetingWeek, 
  WeekData, 
  DatabaseResponse,
  CreateUserFormData 
} from '../types/marriageTypes'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
    const requestBody = {
      week_key: week.week_key,
      user_id: week.user_id,
      data_content: {
        schedule: week.schedule,
        todos: week.todos,
        prayers: week.prayers,
        goals: week.goals,
        grocery: week.grocery,
        unconfessedSin: week.unconfessedSin,
        weeklyWinddown: week.weeklyWinddown
      }
    }

    console.log('API: Request body for save:', requestBody)

    const response = await fetch(`${this.baseUrl}/api/marriage-weeks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to save marriage meeting week: ${error}`)
    }
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
    const response = await fetch(`${this.baseUrl}/api/marriage-weeks/${weekKey}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const error = await response.text()
      throw new Error(`Failed to fetch marriage meeting week: ${error}`)
    }

    const result = await response.json()
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
      goals: dataContent.goals || [],
      grocery: dataContent.grocery || [],
      unconfessedSin: dataContent.unconfessedSin || [],
      weeklyWinddown: dataContent.weeklyWinddown || [],
      created_at: result.created_at,
      updated_at: result.updated_at
    }
  }

  private getAuthToken(): string {
    // Get token from localStorage or auth store
    return localStorage.getItem('auth_token') || ''
  }

  // Helper method to format week key (Monday of the week)
  static formatWeekKey(date: Date): string {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff))
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
}

// Create singleton instance
export const dbManager = new DatabaseManager()