// Marriage Meeting Tool - Authentication Store
// Manages user authentication state

import { create } from 'zustand'
import { User } from '../types/marriageTypes'
import { dbManager } from '../lib/database'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    
    try {
      console.log('Auth: Attempting login for:', email)
      
      const result = await dbManager.authenticateUser(email, password)
      
      // Store user data and token
      localStorage.setItem('user', JSON.stringify(result.user))
      localStorage.setItem('auth_token', result.token)
      
      set({ 
        user: result.user,
        isAuthenticated: true,
        error: null
      })
      
      console.log('Auth: Login successful for:', result.user.email)
    } catch (error) {
      console.error('Auth: Login failed:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isAuthenticated: false,
        user: null
      })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    console.log('Auth: Logging out user')
    
    // Clear stored data
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    
    set({ 
      user: null,
      isAuthenticated: false,
      error: null
    })
  },

  checkAuth: async () => {
    set({ isLoading: true })
    
    try {
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser)
        
        // Verify token is still valid (basic check)
        if (user.id && user.email) {
          set({ 
            user,
            isAuthenticated: true,
            error: null
          })
          console.log('Auth: User authenticated from storage:', user.email)
        } else {
          // Invalid stored data, clear it
          localStorage.removeItem('user')
          localStorage.removeItem('auth_token')
          set({ 
            user: null,
            isAuthenticated: false,
            error: null
          })
        }
      } else {
        set({ 
          user: null,
          isAuthenticated: false,
          error: null
        })
      }
    } catch (error) {
      console.error('Auth: Error checking authentication:', error)
      set({ 
        error: 'Authentication check failed',
        user: null,
        isAuthenticated: false
      })
    } finally {
      set({ isLoading: false })
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  }
}))