// Core User Types
export interface User {
    id: string
    email: string
    name: string
    display_name: string
    role: 'user' | 'admin'
    is_admin: boolean
    createdAt: Date
    created_at: Date
    lastLoginAt?: Date
  }
  
  // Emotion Types for Check-In
  export type EmotionType = 'sad' | 'angry' | 'scared' | 'happy' | 'excited' | 'tender'
  
  // Check-In Data Structure
  export interface CheckInData {
    emotions: EmotionType[]
    feeling: string
  }
  
  // SOAP Bible Study Structure
  export interface SOAPData {
    scripture: string
    observation: string
    application: string
    prayer: string
    thoughts?: string
  }
  
  // Goal Management
  export interface Goal {
    id: string
    text: string
    description?: string
    category: 'spiritual' | 'personal' | 'outreach' | 'health' | 'work'
    completed: boolean
    priority: 'low' | 'medium' | 'high'
    createdAt?: Date
  }
  
  export interface GoalsByType {
    daily: Goal[]
    weekly: Goal[]
    monthly: Goal[]
  }
  
  // Leadership Rating Structure
  export interface LeadershipRating {
    wisdom: number
    courage: number
    patience: number
    integrity: number
  }
  
  export interface LeadershipTrait {
    key: string
    rating: number
    notes?: string
  }
  
  // Daily Entry Complete Structure
  export interface DailyEntry {
    id: string
    userId: string
    user_id: string
    date: string
    dateKey: string
    date_key: string
    
    // Main content sections
    checkIn?: CheckInData
    gratitude: string[]
    soap: SOAPData
    goals: GoalsByType
    
    // Additional tracking
    dailyIntention?: string
    growthQuestion?: string
    leadershipRating?: LeadershipRating
    leadershipTraits?: LeadershipTrait[]
    
    // Status
    completed: boolean
    
    // Timestamps
    createdAt: Date
    created_at: Date
    updatedAt: Date
    updated_at: Date
  }
  
  // Raw data structure as stored in database
  export interface DayData {
    checkIn?: CheckInData
    gratitude: string[]
    soap: SOAPData
    goals: GoalsByType
    dailyIntention?: string
    growthQuestion?: string
    leadershipRating?: LeadershipRating
    [key: string]: any
  }
  
  // Analytics and Progress
  export interface Analytics {
    totalEntries: number
    currentStreak: number
    longestStreak: number
    completionRate: number
    averageEmotion: string
    topGoals: Goal[]
  }
  
  export interface ProgressStats {
    totalDays: number
    completedDays: number
    completionRate: number
    currentStreak: number
    longestStreak: number
    averageGoalsCompleted: number
  }
  
  // Store State Interfaces
  export interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
  }
  
  export interface DailyState {
  entries: DailyEntry[]
  currentEntry: DailyEntry | null
  goals: GoalsByType
  isLoading: boolean
  error: string | null
}
  
  export interface AppState {
    currentDate: Date
    currentView: 'landing' | 'daily'
    theme: 'light' | 'dark'
    accentColor: string
    isLoading: boolean
  }
  
  // API Response Types
  export interface DatabaseResponse<T = any> {
    success: boolean
    data?: T
    error?: string
  }
  
  export interface UserResponse extends DatabaseResponse {
    data?: User
  }
  
  export interface DayDataResponse extends DatabaseResponse {
    data?: DayData
  }
  
  // Form Types
  export interface LoginFormData {
    email: string
    password: string
  }
  
  export interface CreateUserFormData {
    email: string
    displayName: string
    password: string
    isAdmin: boolean
  }
  
  // Component Props Types
  export interface DailyEntryViewProps {
    user: User
    dayData: DayData
    onUpdateDayData: (data: DayData) => void
    onSave?: () => void
  }
  
  export interface GoalSectionProps {
    goalType: 'daily' | 'weekly' | 'monthly'
    goals: Goal[]
    onUpdateGoals: (goals: Goal[]) => void
    onSave?: () => void
  }
  
  export interface CheckInSectionProps {
    checkIn: CheckInData
    onUpdate: (checkIn: CheckInData) => void
  }
  
  export interface SOAPSectionProps {
    soap: SOAPData
    onUpdate: (soap: SOAPData) => void
  }
  
  export interface GratitudeSectionProps {
    gratitude: string[]
    onUpdate: (gratitude: string[]) => void
  }
  
  // Database Types
  export interface DatabaseUser {
    id: string
    email: string
    display_name: string
    password_hash: string
    is_admin: boolean
    created_at: string
    updated_at: string
  }
  
  export interface DatabaseEntry {
    id: number
    date_key: string
    user_id: string
    data_content: DayData
    created_at: string
    updated_at: string
  }
  
  // Utility Types
  export type ViewType = 'landing' | 'daily'
  export type GoalType = 'daily' | 'weekly' | 'monthly'
  export type CategoryType = 'spiritual' | 'personal' | 'outreach' | 'health' | 'work'