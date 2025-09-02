import { User, DayData, DatabaseUser, DatabaseEntry, DatabaseResponse } from '@/types'

// Neon connection string - should be in environment variable in production
declare global {
  interface Window {
    neonClient: any
    currentAuthenticatedUser: User | null
  }
}

const neonConnectionString = 'postgresql://neondb_owner:nWcjC8qXrjhN@ep-frosty-dust-a5gvh2f3.us-east-2.aws.neon.tech/neondb?sslmode=require'

export class DatabaseManager {
  private isInitialized = false
  private neonClient: any = null
  private saveDebounceTimer: NodeJS.Timeout | null = null
  private readonly SAVE_DEBOUNCE_DELAY = 2000

  async initializeNeon(): Promise<boolean> {
    try {
      // Make sure Neon client is properly loaded
      if (window.neonClient) {
        this.neonClient = window.neonClient
        this.isInitialized = true
        console.log('✅ [NEON] Client initialized successfully')
        return true
      } else {
        console.error('❌ [NEON] Client not found on window object')
        return false
      }
    } catch (error) {
      console.error('❌ [NEON] Initialization failed:', error)
      return false
    }
  }

  async executeQuery(query: string, params: any[] = []): Promise<any> {
    if (!this.isInitialized) {
      const initialized = await this.initializeNeon()
      if (!initialized) {
        throw new Error('Neon client not initialized')
      }
    }

    try {
      console.log('🚀 [NEON] Executing query:', query)
      console.log('🚀 [NEON] Parameters:', params)

      // The neon client function should be called directly with the connection string and query
      const sql = this.neonClient(neonConnectionString)
      const result = await sql(query, params)

      console.log('✅ [NEON] Query successful:', result)
      return result
    } catch (error) {
      console.error('❌ [NEON] Query failed:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT NOW() as test_time')
      console.log('✅ [NEON] Database connection test successful')
      return true
    } catch (error) {
      console.error('❌ [NEON] Database connection test failed:', error)
      return false
    }
  }

  // User Management Methods
  async createUsersTable(): Promise<boolean> {
    try {
      // First, check if the table exists and has the correct schema
      const checkQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id'
      `
      
      const checkResult = await this.executeQuery(checkQuery)
      console.log('🔍 [NEON] Current users table schema:', checkResult)
      
      if (checkResult && checkResult.length > 0) {
        const idColumn = checkResult[0]
        if (idColumn.data_type !== 'uuid') {
          console.log('⚠️ [NEON] Users table has wrong ID column type, recreating...')
          
          // Drop the existing table
          await this.executeQuery('DROP TABLE IF EXISTS users CASCADE')
          console.log('✅ [NEON] Dropped existing users table')
        }
      }
      
      const query = `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          display_name VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
      
      await this.executeQuery(query)
      console.log('✅ [NEON] Users table created/verified successfully')
      return true
    } catch (error) {
      console.error('❌ [NEON] Failed to create users table:', error)
      return false
    }
  }

  async createDailyDavidEntriesTable(): Promise<boolean> {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS daily_david_entries (
          id SERIAL PRIMARY KEY,
          date_key VARCHAR(10) NOT NULL,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          data_content JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(date_key, user_id)
        )
      `
      
      await this.executeQuery(query)
      console.log('✅ [NEON] Daily David entries table created successfully')
      
      // Create indexes for performance
      await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_daily_david_entries_user_date ON daily_david_entries(user_id, date_key)')
      await this.executeQuery('CREATE INDEX IF NOT EXISTS idx_daily_david_entries_date ON daily_david_entries(date_key)')
      
      return true
    } catch (error) {
      console.error('❌ [NEON] Failed to create daily david entries table:', error)
      return false
    }
  }

  async createUser(email: string, displayName: string, password: string, isAdmin = false): Promise<DatabaseUser> {
    try {
      // In a real app, you'd hash the password
      // For development, we'll store it as-is (NOT recommended for production)
      const passwordHash = password // In production: await bcrypt.hash(password, 10)
      
      const query = `
        INSERT INTO users (id, email, display_name, password_hash, is_admin)
        VALUES (gen_random_uuid(), $1, $2, $3, $4)
        RETURNING id, email, display_name, is_admin, created_at
      `
      
      const result = await this.executeQuery(query, [email, displayName, passwordHash, isAdmin])
      
      if (!result || result.length === 0) {
        throw new Error('Failed to create user - no result returned')
      }
      
      console.log('✅ [NEON] User created successfully:', result[0])
      return result[0]
    } catch (error) {
      console.error('❌ [NEON] Failed to create user:', error)
      throw error
    }
  }

  async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1'
      const result = await this.executeQuery(query, [email])
      
      if (result && result.length > 0) {
        console.log('✅ [NEON] User found by email:', result[0].email)
        return result[0]
      }
      
      console.log('🔍 [NEON] No user found with email:', email)
      return null
    } catch (error) {
      console.error('❌ [NEON] Error getting user by email:', error)
      return null
    }
  }

  async getAllUsers(): Promise<DatabaseUser[]> {
    try {
      const query = 'SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at DESC'
      const result = await this.executeQuery(query)
      return result || []
    } catch (error) {
      console.error('❌ [NEON] Error getting all users:', error)
      return []
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM users WHERE id = $1'
      await this.executeQuery(query, [userId])
      console.log('✅ [NEON] User deleted successfully:', userId)
      return true
    } catch (error) {
      console.error('❌ [NEON] Error deleting user:', error)
      return false
    }
  }

  // Daily Entry Methods
  async saveDayData(userId: string, dateKey: string, data: DayData): Promise<boolean> {
    try {
      const query = `
        INSERT INTO daily_david_entries (date_key, user_id, data_content, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (date_key, user_id)
        DO UPDATE SET 
          data_content = $3,
          updated_at = NOW()
        RETURNING id
      `
      
      const result = await this.executeQuery(query, [dateKey, userId, JSON.stringify(data)])
      
      if (result && result.length > 0) {
        console.log('✅ [NEON] Day data saved successfully for:', dateKey)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ [NEON] Error saving day data:', error)
      return false
    }
  }

  async loadDayData(dateKey: string, userId: string): Promise<DayData | null> {
    try {
      const query = 'SELECT data_content FROM daily_david_entries WHERE date_key = $1 AND user_id = $2'
      const result = await this.executeQuery(query, [dateKey, userId])
      
      if (result && result.length > 0) {
        console.log('✅ [NEON] Day data loaded successfully for:', dateKey)
        return result[0].data_content
      }
      
      console.log('🔍 [NEON] No day data found for:', dateKey)
      return null
    } catch (error) {
      console.error('❌ [NEON] Error loading day data:', error)
      return null
    }
  }

  async getUserEntries(userId: string, limit = 30): Promise<DatabaseEntry[]> {
    try {
      const query = `
        SELECT * FROM daily_david_entries 
        WHERE user_id = $1 
        ORDER BY date_key DESC 
        LIMIT $2
      `
      const result = await this.executeQuery(query, [userId, limit])
      return result || []
    } catch (error) {
      console.error('❌ [NEON] Error getting user entries:', error)
      return []
    }
  }

  // Utility Methods
  debouncedSave(userId: string, dateKey: string, data: DayData): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer)
    }

    this.saveDebounceTimer = setTimeout(async () => {
      try {
        await this.saveDayData(userId, dateKey, data)
        console.log('🔄 [NEON] Debounced save completed for:', dateKey)
      } catch (error) {
        console.error('❌ [NEON] Debounced save failed:', error)
      }
    }, this.SAVE_DEBOUNCE_DELAY)
  }

  // Admin Methods
  async createAdminUser(): Promise<void> {
    try {
      // Check if admin user exists
      const existingAdmin = await this.getUserByEmail('davidadmin@davidadmin.com')
      
      if (!existingAdmin) {
        await this.createUser('davidadmin@davidadmin.com', 'David Admin', 'davidadmin', true)
        console.log('✅ [NEON] Default admin user created')
      } else {
        console.log('✅ [NEON] Admin user already exists')
      }
    } catch (error) {
      console.error('❌ [NEON] Error creating admin user:', error)
    }
  }
}

// Singleton instance
let databaseInstance: DatabaseManager | null = null

export const getDatabaseManager = (): DatabaseManager => {
  if (!databaseInstance) {
    databaseInstance = new DatabaseManager()
  }
  return databaseInstance
}

// Export as default for convenience
export const dbManager = getDatabaseManager()

export default DatabaseManager
// FORCE REBUILD Mon Sep  1 23:09:42 MDT 2025
