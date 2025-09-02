import { create } from 'zustand'
import { AuthState, User } from '../types'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: {
    id: 'demo-user-123',
    email: 'demo@dailydavid.com',
    name: 'Demo User',
    display_name: 'Demo User',
    role: 'user' as const,
    is_admin: false,
    createdAt: new Date(),
    created_at: new Date(),
    lastLoginAt: new Date()
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    
    try {
      // Call the backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.success) {
        const user: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          name: data.user.display_name || data.user.name || 'User',
          display_name: data.user.display_name || data.user.name || 'User',
          role: data.user.is_admin ? 'admin' : 'user',
          is_admin: data.user.is_admin || false,
          createdAt: new Date(data.user.created_at),
          created_at: new Date(data.user.created_at),
          lastLoginAt: data.user.last_login ? new Date(data.user.last_login) : undefined
        }
        
        set({ user, isAuthenticated: true, isLoading: false })
        
        // Store token in localStorage
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      })
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        // Call logout endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and state
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      set({ user: null, isAuthenticated: false, error: null })
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true })
  },

  clearError: () => {
    set({ error: null })
  },

  // Check for existing authentication on app startup
  checkAuth: () => {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, isAuthenticated: true, isLoading: false })
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
  }
}))
