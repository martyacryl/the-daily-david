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
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
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
          syncFrequency: 'daily',
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
    if (!isAdmin(req.user)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { email, displayName, password, isAdmin } = req.body

    if (!email || !displayName || !password) {
      return res.status(400).json({ error: 'Email, display name, and password are required' })
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, display_name, password_hash, is_admin, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, display_name, is_admin, created_at',
      [email, displayName, passwordHash, isAdmin || false]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error creating user:', error)
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

module.exports = app