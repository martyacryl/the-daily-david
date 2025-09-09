// Marriage Meeting Tool - Authentication Store
// Manages user authentication state (matches Daily David approach)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  is_admin: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
}

type AuthStore = AuthState & {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
}

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://theweeklyhuddle.vercel.app' : 'http://localhost:3001')

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          console.log('Auth: Attempting login for:', email)
          
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (data.user && data.token) {
            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
            console.log('Auth: Login successful for:', data.user.email)
            return true
          } else {
            set({
              error: data.error || 'Login failed',
              isLoading: false
            })
            console.error('Auth: Login failed:', data.error)
            return false
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          })
          console.error('Auth: Login failed:', error)
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        })
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      initialize: async () => {
        const { token } = get()
        if (token) {
          try {
            // Verify token is still valid by making a test request
            const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              set({
                user: data.user,
                isAuthenticated: true
              })
            } else {
              // Token is invalid, clear it
              set({
                user: null,
                token: null,
                isAuthenticated: false
              })
            }
          } catch (error) {
            // Token verification failed, clear it
            set({
              user: null,
              token: null,
              isAuthenticated: false
            })
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = useAuthStore.getState().token
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}