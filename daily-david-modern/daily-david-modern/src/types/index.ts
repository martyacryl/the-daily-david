export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  lastLoginAt?: Date
}

export interface DailyEntry {
  id: string
  userId: string
  date: string
  scripture: string
  observation: string
  application: string
  prayer: string
  gratitude: string[]
  emotions: string[]
  goals: Goal[]
  leadershipTraits: LeadershipTrait[]
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  category: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface LeadershipTrait {
  key: string
  rating: number
  notes?: string
}

export interface Analytics {
  totalEntries: number
  currentStreak: number
  longestStreak: number
  completionRate: number
  averageEmotion: string
  topGoals: Goal[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface DailyState {
  entries: DailyEntry[]
  currentEntry: DailyEntry | null
  isLoading: boolean
  error: string | null
}
