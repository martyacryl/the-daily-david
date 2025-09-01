import { create } from 'zustand'
import { AuthState, User } from '../types'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    
    try {
      // Mock login for now - replace with actual API call
      if (email === 'admin@dailydavid.com' && password === 'admin123') {
        const user: User = {
          id: '1',
          email: 'admin@dailydavid.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date(),
          lastLoginAt: new Date()
        }
        
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false 
      })
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null })
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true })
  },

  clearError: () => {
    set({ error: null })
  }
}))
