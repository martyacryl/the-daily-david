// Marriage Meeting Tool - Backend Server
// Uses Neon PostgreSQL like Daily David

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: [
    'https://theweeklyhuddle.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Neon Database Connection
const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

console.log('🔍 Database connection string:', connectionString.substring(0, 50) + '...')
console.log('🔍 Using environment variable:', !!process.env.NEON_CONNECTION_STRING)

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

// Test database connection on startup
pool.query('SELECT NOW()')
  .then(result => {
    console.log('✅ Database connection successful:', result.rows[0].now)
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message)
  })

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'marriage-meeting-secret-key'

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Helper function to check if user is admin
const isAdmin = (user) => {
  return user && user.is_admin === true
}

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user in database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        is_admin: user.is_admin 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        is_admin: user.is_admin,
        created_at: user.created_at
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Marriage Meeting Weeks Routes
app.get('/api/marriage-weeks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM marriage_meetings WHERE user_id = $1 ORDER BY week_key DESC',
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching marriage weeks:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all weeks for analytics (same as above but with explicit naming)
app.get('/api/marriage-weeks/all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM marriage_meetings WHERE user_id = $1 ORDER BY week_key DESC',
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching all marriage weeks:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/marriage-weeks/:weekKey', authenticateToken, async (req, res) => {
  try {
    const { weekKey } = req.params

    console.log('Server: Fetching marriage week data for:', { weekKey, userId: req.user.id })

    const result = await pool.query(
      'SELECT * FROM marriage_meetings WHERE user_id = $1 AND week_key = $2',
      [req.user.id, weekKey]
    )

    if (result.rows.length === 0) {
      console.log('Server: No marriage week data found for:', { weekKey, userId: req.user.id })
      return res.status(404).json({ error: 'Marriage meeting week not found' })
    }

    const data = result.rows[0]
    console.log('Server: Found marriage week data:', {
      weekKey: data.week_key,
      goalsCount: data.data_content?.goals?.length || 0,
      goals: data.data_content?.goals
    })

    res.json(data)
  } catch (error) {
    console.error('Error fetching marriage week:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/marriage-weeks', authenticateToken, async (req, res) => {
  try {
    const { week_key, user_id, data_content } = req.body

    console.log('Server: Saving marriage week data:', {
      week_key,
      user_id,
      scheduleCount: Object.values(data_content?.schedule || {}).flat().filter(item => item && item.trim()).length,
      todosCount: data_content?.todos?.length || 0,
      prayersCount: data_content?.prayers?.length || 0,
      groceryCount: data_content?.grocery?.length || 0,
      encouragementCount: data_content?.encouragementNotes?.length || 0,
      calendarEventsCount: data_content?.calendarEvents?.length || 0,
      fullDataContent: JSON.stringify(data_content, null, 2)
    })

    if (!week_key || !user_id || !data_content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify user owns this data
    if (req.user.id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Upsert marriage meeting week
    const result = await pool.query(
      `INSERT INTO marriage_meetings (user_id, week_key, data_content, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id, week_key)
       DO UPDATE SET 
         data_content = $3,
         updated_at = NOW()
       RETURNING *`,
      [user_id, week_key, JSON.stringify(data_content)]
    )

    console.log('Server: Successfully saved marriage week data')
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving marriage week:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Settings Routes
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    console.log('GET /api/settings - User ID:', userId)

    const result = await pool.query(
      'SELECT settings_data FROM user_settings WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // Return default settings if none exist
      const defaultSettings = {
        spouse1: { name: '', email: '', phone: '' },
        spouse2: { name: '', email: '', phone: '' },
        location: { address: '', city: '', state: '', zipCode: '', country: 'US' },
        groceryStores: [],
        familyCreed: '',
        defaultWeatherLocation: '',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'light',
        calendar: {
          icalUrl: '',
          googleCalendarEnabled: false,
          googleCalendarConfig: {
            clientId: '',
            apiKey: '',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar.readonly'
          },
          syncFrequency: 'realtime',
          showCalendarEvents: true
        }
      }
      return res.json(defaultSettings)
    }

    let settings = result.rows[0].settings_data
    
    // Migrate existing users to include calendar settings
    if (!settings.calendar) {
      settings.calendar = {
        icalUrl: '',
        googleCalendarEnabled: false,
        googleCalendarConfig: {
          clientId: '',
          apiKey: '',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar.readonly'
        },
        syncFrequency: 'daily',
        showCalendarEvents: true
      }
      
      // Update the database with migrated settings
      await pool.query(
        'UPDATE user_settings SET settings_data = $1 WHERE user_id = $2',
        [settings, userId]
      )
    }
    
    res.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const settingsData = req.body
    console.log('POST /api/settings - User ID:', userId)
    console.log('POST /api/settings - Settings Data:', JSON.stringify(settingsData, null, 2))

    // Upsert settings (insert or update)
    const result = await pool.query(`
      INSERT INTO user_settings (user_id, settings_data, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET 
        settings_data = EXCLUDED.settings_data,
        updated_at = NOW()
      RETURNING settings_data
    `, [userId, JSON.stringify(settingsData)])

    res.json(result.rows[0].settings_data)
  } catch (error) {
    console.error('Error saving settings:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() })
})

// Database connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, COUNT(*) as user_count FROM users')
    res.json({ 
      success: true, 
      database: 'connected',
      current_time: result.rows[0].current_time,
      user_count: result.rows[0].user_count,
      connection_string: process.env.NEON_CONNECTION_STRING ? 'using_env_var' : 'using_hardcoded'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      connection_string: process.env.NEON_CONNECTION_STRING ? 'using_env_var' : 'using_hardcoded'
    })
  }
})

// Test user creation endpoint
app.post('/api/test-create-user', async (req, res) => {
  try {
    console.log('🧪 Test: Starting user creation test...')
    const { email, displayName, password, isAdmin } = req.body || {
      email: 'test@example.com',
      displayName: 'Test User',
      password: 'test123',
      isAdmin: false
    }
    
    console.log('🧪 Test: User data:', { email, displayName, password: password ? '[REDACTED]' : 'MISSING', isAdmin })
    
    // Check if user exists
    console.log('🧪 Test: Checking if user exists...')
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    console.log('🧪 Test: Existing user check result:', existingUser.rows.length)
    
    if (existingUser.rows.length > 0) {
      console.log('🧪 Test: User exists, deleting first...')
      await pool.query('DELETE FROM users WHERE email = $1', [email])
    }
    
    // Hash password
    console.log('🧪 Test: Hashing password...')
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log('🧪 Test: Password hashed successfully')
    
    // Create user
    console.log('🧪 Test: Inserting user...')
    const result = await pool.query(
      'INSERT INTO users (email, display_name, password_hash, is_admin, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, display_name, is_admin, created_at',
      [email, displayName, passwordHash, isAdmin || false]
    )
    console.log('🧪 Test: User created successfully:', result.rows[0])
    
    res.json({ 
      success: true, 
      message: 'User created successfully',
      user: result.rows[0]
    })
  } catch (error) {
    console.error('🧪 Test: Error creating user:', error)
    console.error('🧪 Test: Error stack:', error.stack)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    })
  }
})

// Admin Routes
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const result = await pool.query(
      'SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at DESC'
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Admin: Creating user request received')
    console.log('🔍 Admin: Request body:', req.body)
    
    if (!isAdmin(req.user)) {
      console.log('❌ Admin: User is not admin')
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { email, displayName, password, isAdmin } = req.body
    console.log('🔍 Admin: Extracted fields:', { email, displayName, password: password ? '[REDACTED]' : 'MISSING', isAdmin })

    if (!email || !displayName || !password) {
      console.log('❌ Admin: Missing required fields')
      return res.status(400).json({ error: 'Email, display name, and password are required' })
    }

    // Check if user already exists
    console.log('🔍 Admin: Checking if user exists...')
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      console.log('❌ Admin: User already exists')
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    console.log('🔍 Admin: Hashing password...')
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    console.log('✅ Admin: Password hashed successfully')

    // Create user
    console.log('🔍 Admin: Inserting user into database...')
    const result = await pool.query(
      'INSERT INTO users (email, display_name, password_hash, is_admin, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, display_name, is_admin, created_at',
      [email, displayName, passwordHash, isAdmin || false]
    )
    console.log('✅ Admin: User created successfully:', result.rows[0])

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Admin: Error creating user:', error)
    console.error('❌ Admin: Error stack:', error.stack)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { id } = req.params

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id])

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Change user password endpoint
app.put('/api/admin/users/:id/password', authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password in the database
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING email, display_name',
      [hashedPassword, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    console.log(`Password updated for user: ${result.rows[0].email}`)
    res.json({ 
      success: true, 
      message: `Password updated successfully for ${result.rows[0].display_name}` 
    })
  } catch (error) {
    console.error('Error updating password:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Token verification endpoint
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Token is valid (authenticateToken middleware already verified it)
    // Get fresh user data from database
    const result = await pool.query(
      'SELECT id, email, display_name, is_admin, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name,
        is_admin: user.is_admin,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Debug endpoint to check what URL the frontend is using
app.get('/api/debug', (req, res) => {
  res.json({ 
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    origin: req.get('origin'),
    referer: req.get('referer')
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Marriage Meeting Tool server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Goals Routes (Independent of weeks)
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY timeframe, created_at DESC',
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching goals:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { text, completed, timeframe, description, priority } = req.body

    console.log('Server: Creating goal:', { text, timeframe, userId: req.user.id })

    if (!text || !timeframe) {
      return res.status(400).json({ error: 'Missing required fields: text and timeframe' })
    }

    const result = await pool.query(
      `INSERT INTO goals (user_id, text, completed, timeframe, description, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [req.user.id, text, completed || false, timeframe, description || '', priority || 'medium']
    )

    console.log('Server: Successfully created goal')
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating goal:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { text, completed, timeframe, description, priority } = req.body

    console.log('Server: Updating goal:', { id, updates: req.body, userId: req.user.id })

    const result = await pool.query(
      `UPDATE goals 
       SET text = COALESCE($2, text),
           completed = COALESCE($3, completed),
           timeframe = COALESCE($4, timeframe),
           description = COALESCE($5, description),
           priority = COALESCE($6, priority),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $7
       RETURNING *`,
      [id, text, completed, timeframe, description, priority, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    console.log('Server: Successfully updated goal')
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating goal:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    console.log('Server: Deleting goal:', { id, userId: req.user.id })

    const result = await pool.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' })
    }

    console.log('Server: Successfully deleted goal')
    res.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ===== VISION API ENDPOINTS =====

// Family Vision Endpoints
app.get('/api/family-vision', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM family_vision WHERE user_id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      // Create default family vision if none exists
      const defaultVision = await pool.query(
        `INSERT INTO family_vision (user_id, mission_statement, core_values, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [req.user.id, 'Building a Christ-centered family that loves God, serves others, and grows together in faith, love, and purpose.', ['Faith', 'Love', 'Service', 'Growth', 'Unity']]
      )
      return res.json(defaultVision.rows[0])
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching family vision:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/family-vision', authenticateToken, async (req, res) => {
  try {
    const { mission_statement, core_values } = req.body

    const result = await pool.query(
      `INSERT INTO family_vision (user_id, mission_statement, core_values, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         mission_statement = EXCLUDED.mission_statement,
         core_values = EXCLUDED.core_values,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, mission_statement, core_values]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating family vision:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Vision Goals Endpoints
app.get('/api/vision-goals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vision_goals WHERE user_id = $1 ORDER BY timeframe, created_at DESC',
      [req.user.id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching vision goals:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/vision-goals', authenticateToken, async (req, res) => {
  try {
    const { text, category, timeframe, completed, progress, target_date, description, priority } = req.body

    if (!text || !category || !timeframe) {
      return res.status(400).json({ error: 'Missing required fields: text, category, and timeframe' })
    }

    const result = await pool.query(
      `INSERT INTO vision_goals (user_id, text, category, timeframe, completed, progress, target_date, description, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [req.user.id, text, category, timeframe, completed || false, progress || 0, target_date, description || '', priority || 'medium']
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating vision goal:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/vision-goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { text, category, timeframe, completed, progress, target_date, description, priority } = req.body

    const result = await pool.query(
      `UPDATE vision_goals 
       SET text = COALESCE($2, text),
           category = COALESCE($3, category),
           timeframe = COALESCE($4, timeframe),
           completed = COALESCE($5, completed),
           progress = COALESCE($6, progress),
           target_date = COALESCE($7, target_date),
           description = COALESCE($8, description),
           priority = COALESCE($9, priority),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $10
       RETURNING *`,
      [id, text, category, timeframe, completed, progress, target_date, description, priority, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vision goal not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating vision goal:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.delete('/api/vision-goals/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM vision_goals WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vision goal not found' })
    }

    res.json({ message: 'Vision goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting vision goal:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Spiritual Growth Endpoints
app.get('/api/spiritual-growth', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM spiritual_growth WHERE user_id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      // Create default spiritual growth if none exists
      const defaultSpiritual = await pool.query(
        `INSERT INTO spiritual_growth (user_id, prayer_requests, answered_prayers, bible_reading_plan, bible_reading_progress, devotionals, spiritual_goals, reflection_notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [req.user.id, [], [], 'Read through the Bible in one year', 0, [], [], '']
      )
      return res.json(defaultSpiritual.rows[0])
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching spiritual growth:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/spiritual-growth', authenticateToken, async (req, res) => {
  try {
    const { prayer_requests, answered_prayers, bible_reading_plan, bible_reading_progress, devotionals, spiritual_goals, reflection_notes } = req.body

    const result = await pool.query(
      `INSERT INTO spiritual_growth (user_id, prayer_requests, answered_prayers, bible_reading_plan, bible_reading_progress, devotionals, spiritual_goals, reflection_notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         prayer_requests = EXCLUDED.prayer_requests,
         answered_prayers = EXCLUDED.answered_prayers,
         bible_reading_plan = EXCLUDED.bible_reading_plan,
         bible_reading_progress = EXCLUDED.bible_reading_progress,
         devotionals = EXCLUDED.devotionals,
         spiritual_goals = EXCLUDED.spiritual_goals,
         reflection_notes = EXCLUDED.reflection_notes,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, prayer_requests || [], answered_prayers || [], bible_reading_plan || '', bible_reading_progress || 0, devotionals || [], spiritual_goals || [], reflection_notes || '']
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating spiritual growth:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Family Planning Endpoints
app.get('/api/family-planning', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM family_planning WHERE user_id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      // Create default family planning if none exists
      const defaultPlanning = await pool.query(
        `INSERT INTO family_planning (user_id, family_events, financial_goals, home_goals, education_goals, vacation_plans, milestone_dates, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [req.user.id, [], [], [], [], [], '{}', '']
      )
      return res.json(defaultPlanning.rows[0])
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching family planning:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/family-planning', authenticateToken, async (req, res) => {
  try {
    const { family_events, financial_goals, home_goals, education_goals, vacation_plans, milestone_dates, notes } = req.body

    const result = await pool.query(
      `INSERT INTO family_planning (user_id, family_events, financial_goals, home_goals, education_goals, vacation_plans, milestone_dates, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         family_events = EXCLUDED.family_events,
         financial_goals = EXCLUDED.financial_goals,
         home_goals = EXCLUDED.home_goals,
         education_goals = EXCLUDED.education_goals,
         vacation_plans = EXCLUDED.vacation_plans,
         milestone_dates = EXCLUDED.milestone_dates,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, family_events || [], financial_goals || [], home_goals || [], education_goals || [], vacation_plans || [], milestone_dates || '{}', notes || '']
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating family planning:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Meeting Progress API Endpoints
app.get('/api/meeting-progress', authenticateToken, async (req, res) => {
  try {
    const { week_key } = req.query
    
    let query = 'SELECT * FROM meeting_progress WHERE user_id = $1'
    let params = [req.user.id]
    
    if (week_key) {
      query += ' AND week_key = $2'
      params.push(week_key)
    }
    
    query += ' ORDER BY meeting_date DESC'
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching meeting progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/meeting-progress', authenticateToken, async (req, res) => {
  try {
    const { 
      meeting_date, 
      week_key, 
      steps_completed, 
      total_steps = 8, 
      completion_percentage, 
      meeting_duration_minutes, 
      notes 
    } = req.body

    const result = await pool.query(
      `INSERT INTO meeting_progress (user_id, meeting_date, week_key, steps_completed, total_steps, completion_percentage, meeting_duration_minutes, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (user_id, meeting_date) 
       DO UPDATE SET 
         steps_completed = EXCLUDED.steps_completed,
         total_steps = EXCLUDED.total_steps,
         completion_percentage = EXCLUDED.completion_percentage,
         meeting_duration_minutes = EXCLUDED.meeting_duration_minutes,
         notes = EXCLUDED.notes,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, meeting_date, week_key, JSON.stringify(steps_completed || []), total_steps, completion_percentage || 0, meeting_duration_minutes, notes || '']
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving meeting progress:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/meeting-stats', authenticateToken, async (req, res) => {
  try {
    // Get current streak and longest streak
    const streakResult = await pool.query(
      `SELECT current_streak, longest_streak 
       FROM meeting_streaks 
       WHERE user_id = $1 
       ORDER BY meeting_date DESC 
       LIMIT 1`,
      [req.user.id]
    )

    // Get total meetings completed
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total_meetings, 
              AVG(completion_percentage) as avg_completion,
              SUM(meeting_duration_minutes) as total_duration
       FROM meeting_progress 
       WHERE user_id = $1 AND completion_percentage >= 50`,
      [req.user.id]
    )

    // Get recent meetings (last 4 weeks)
    const recentResult = await pool.query(
      `SELECT week_key, meeting_date, completion_percentage, steps_completed
       FROM meeting_progress 
       WHERE user_id = $1 
       ORDER BY meeting_date DESC 
       LIMIT 4`,
      [req.user.id]
    )

    const stats = {
      current_streak: streakResult.rows[0]?.current_streak || 0,
      longest_streak: streakResult.rows[0]?.longest_streak || 0,
      total_meetings: parseInt(totalResult.rows[0]?.total_meetings || 0),
      avg_completion: parseFloat(totalResult.rows[0]?.avg_completion || 0).toFixed(1),
      total_duration: parseInt(totalResult.rows[0]?.total_duration || 0),
      recent_meetings: recentResult.rows
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching meeting stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = app