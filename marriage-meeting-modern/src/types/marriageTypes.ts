// Marriage Meeting Tool - Type Definitions

import { CalendarEvent } from '../lib/calendarService'

// Core User Types
export interface User {
  id: string
  email: string
  name: string
  display_name: string
  is_admin: boolean
  created_at: string
}

// Weekly Schedule Structure
export interface WeeklySchedule {
  Monday: string[]
  Tuesday: string[]
  Wednesday: string[]
  Thursday: string[]
  Friday: string[]
  Saturday: string[]
  Sunday: string[]
}

// List Item Structure
export interface ListItem {
  id: number
  text: string
  completed: boolean
}

// Task Item Structure with Timeline
export interface TaskItem {
  id: number
  text: string
  completed: boolean
  dueDate?: string // ISO date string (YYYY-MM-DD)
  priority: 'low' | 'medium' | 'high'
  estimatedDuration?: number // in minutes
  category?: string
  notes?: string
  assignedTo?: 'both' | 'spouse1' | 'spouse2' // who's responsible for this task
}

// Goal Item Structure with Timeframe
export interface GoalItem {
  id: number
  text: string
  completed: boolean
  timeframe: 'monthly' | '1year' | '5year' | '10year'
  description?: string
  priority?: 'low' | 'medium' | 'high'
  created_at?: string
  updated_at?: string
}

// Encouragement Note Structure
export interface EncouragementNote {
  id: number
  text: string
  type: 'encouragement' | 'bible' | 'reminder' | 'love' | 'general'
  createdAt: string
  isRead?: boolean
}

// Marriage Meeting Week Data Structure
export interface MarriageMeetingWeek {
  id?: string
  user_id: string
  week_key: string // Format: 'YYYY-MM-DD' (Monday of week)
  schedule: WeeklySchedule
  todos: TaskItem[] // Updated to use TaskItem with timeline features
  prayers: ListItem[]
  grocery: ListItem[]
  lists: CustomList[] // New unified lists system
  unconfessedSin: ListItem[]
  weeklyWinddown: ListItem[]
  encouragementNotes: EncouragementNote[]
  calendarEvents?: CalendarEvent[] // Calendar events from iCal and Google Calendar
  created_at?: string
  updated_at?: string
}

// Raw data structure as stored in database
export interface WeekData {
  schedule: WeeklySchedule
  todos: TaskItem[] // Updated to use TaskItem with timeline features
  prayers: ListItem[]
  grocery: GroceryStoreList[] // Updated to use store-specific lists (legacy)
  lists: CustomList[] // New unified lists system
  unconfessedSin: ListItem[]
  weeklyWinddown: ListItem[]
  encouragementNotes: EncouragementNote[] // Encouragement notes and messages
  calendarEvents?: CalendarEvent[] // Calendar events from iCal and Google Calendar
}

// Grocery Store List
export interface GroceryStoreList {
  storeId: string
  storeName: string
  items: ListItem[]
}

// Recipe Item
export interface RecipeItem {
  id: string
  name: string
  ingredients: string[]
  instructions?: string
  source?: string // URL or cookbook reference
  servings?: number
  prepTime?: number // in minutes
  cookTime?: number // in minutes
}

// Meal Plan Item
export interface MealPlanItem {
  day: DayName
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  mealName: string
  ingredients?: string[] // Custom ingredients for this meal
  recipeId?: string // Link to a recipe
  recipe?: RecipeItem // Embedded recipe data
  servings?: number // How many servings for this meal
}

// List Metadata
export interface ListMetadata {
  // For grocery lists
  storeId?: string
  storeName?: string
  
  // For packing lists
  tripType?: 'camping' | 'weekend' | 'flight' | 'beach' | 'business' | 'custom'
  tripName?: string
  
  // For meal planning
  weekStart?: string  // ISO date
  meals?: MealPlanItem[]
  recipes?: RecipeItem[] // Saved recipes
  generatedGroceryItems?: CustomListItem[] // Generated grocery items from meal plan
  
  // For errands
  location?: string
  
  // For chores
  frequency?: 'daily' | 'weekly' | 'monthly'
  defaultAssignment?: 'both' | 'spouse1' | 'spouse2' // Default assignment for chore items
  
  // For suggestions
  selectedSuggestions?: string[] // Items selected from suggestions
}

// Custom List Item
export interface CustomListItem extends ListItem {
  source?: string  // e.g., "Spaghetti Dinner - Monday"
  category?: string  // e.g., "produce", "dairy", "cleaning"
  assignedTo?: 'both' | 'spouse1' | 'spouse2' // who's responsible for this item
}

// Custom List
export interface CustomList {
  id: string
  listType: CustomListType
  name: string  // e.g., "Camping Trip", "Weekly Meals"
  metadata: ListMetadata
  items: CustomListItem[]
  createdAt: string
  updatedAt: string
}

// List Types
export type ListType = 'todos' | 'prayers' | 'goals' | 'grocery' | 'unconfessedSin' | 'weeklyWinddown'

// Custom List Types
export type CustomListType = 'grocery' | 'errand' | 'meal-planning' | 'packing' | 'chore'

// Day Names
export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

// Store State Interfaces
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface MarriageState {
  currentWeek: MarriageMeetingWeek | null
  weekData: WeekData
  currentDate: Date
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
}

export interface AppState {
  currentDate: Date
  currentView: 'landing' | 'weekly' | 'admin'
  theme: 'light' | 'dark' | 'landing'
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

export interface WeekDataResponse extends DatabaseResponse {
  data?: WeekData
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
export interface WeeklyScheduleProps {
  schedule: WeeklySchedule
  onUpdateSchedule: (day: DayName, index: number, value: string) => void
  onAddLine: (day: DayName) => void
  onRemoveLine: (day: DayName, index: number) => void
}

export interface ListSectionProps {
  title: string
  listType: ListType
  items: ListItem[]
  onUpdate: (listType: ListType, id: number, text: string) => void
  onAdd: (listType: ListType, text: string) => void
  onToggle: (listType: ListType, id: number) => void
  onRemove: (listType: ListType, id: number) => void
}

export interface WeekNavigationProps {
  currentDate: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onCurrentWeek: () => void
}

export interface MarriageMeetingToolProps {
  user: User
  weekData: WeekData
  onUpdateWeekData: (data: WeekData) => void
  onSave?: () => void
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

export interface DatabaseWeek {
  id: string
  week_key: string
  user_id: string
  data: WeekData
  created_at: string
  updated_at: string
}

// Neon Database Configuration
export interface NeonConfig {
  connectionString: string
  tableName: string
}

// Environment Configuration
export interface AppConfig {
  neonConnectionString: string
  tableName: string
  environment: 'development' | 'production'
  enableDebugLogging: boolean
  enableMockData: boolean
}

// Utility Types
export type ViewType = 'landing' | 'weekly' | 'admin'
export type EnvironmentType = 'development' | 'production'
