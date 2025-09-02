import { create } from 'zustand'
import { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
  checkAuth: () => void
  initialize: () => void
}

// Initialize auth state from localStorage
const initializeAuthState = (): Partial<AuthState> => {
  try {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      const user = JSON.parse(userStr)
      return { user, isAuthenticated: true, isLoading: false }
    }
  } catch (error) {
    console.error('Error parsing stored user:', error)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
  
  return { user: null, isAuthenticated: false, isLoading: false }
}

export const useAuthStore = create<AuthStore>((set, get) => {
  const initialState = initializeAuthState()
  return {
    user: initialState.user || null,
    isAuthenticated: initialState.isAuthenticated || false,
    isLoading: initialState.isLoading || false,
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
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  // Initialize auth state
  initialize: () => {
    get().checkAuth()
  }
  }
})
