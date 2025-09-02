const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(express.json())

// Database connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-little-base-adgfntzb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

// JWT secret (in production, use a strong secret)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const client = await pool.connect()
    
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId])
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'User not found or inactive' })
      }
      
      req.user = result.rows[0]
      next()
    } finally {
      client.release()
    }
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' })
  }
}

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    res.json({ success: true, message: 'Database connection successful', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ success: false, error: 'Database connection failed' })
  }
})

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' })
    }

    const client = await pool.connect()
    
    try {
      // Get user by email (handle case where is_active column might not exist)
      let result
      try {
        result = await client.query(
          'SELECT * FROM users WHERE email = $1 AND is_active = true',
          [email]
        )
      } catch (columnError) {
        if (columnError.code === '42703') {
          // is_active column doesn't exist, query without it
          result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
          )
        } else {
          throw columnError
        }
      }

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' })
      }

      const user = result.rows[0]

      // Verify password - handle both bcrypt hashed and plain text passwords
      let isValidPassword = false
      
      // Check if password_hash looks like a bcrypt hash (starts with $2b$)
      if (user.password_hash.startsWith('$2b$')) {
        // Use bcrypt for hashed passwords
        isValidPassword = await bcrypt.compare(password, user.password_hash)
      } else {
        // Use direct comparison for plain text passwords
        isValidPassword = (password === user.password_hash)
      }
      
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' })
      }

      // Update last login
      await client.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      )

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, isAdmin: user.is_admin },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Create session
      await client.query(
        'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      )

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.display_name,
          role: user.is_admin ? 'admin' : 'user',
          is_admin: user.is_admin
        },
        token
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Login failed' })
  }
})

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    const client = await pool.connect()
    
    try {
      // Remove session
      await client.query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [token]
      )

      res.json({ success: true, message: 'Logged out successfully' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ success: false, error: 'Logout failed' })
  }
})

// Daily entries routes
app.post('/api/entries', authenticateToken, async (req, res) => {
  try {
    const { date, goals, gratitude, soap, dailyIntention, growthQuestion, leadershipRating } = req.body
    const userId = req.user.id
    const dateKey = date || new Date().toISOString().split('T')[0]

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `INSERT INTO ${process.env.NODE_ENV === 'production' ? 'daily_david_entries' : 'daily_david_entries_dev'} 
         (date_key, user_id, data_content) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [
          dateKey,
          userId,
          JSON.stringify({
            goals,
            gratitude,
            soap,
            dailyIntention,
            growthQuestion,
            leadershipRating
          })
        ]
      )

      res.json({ success: true, entry: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Create entry error:', error)
    res.status(500).json({ success: false, error: 'Failed to create entry' })
  }
})

app.get('/api/entries/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params
    const userId = req.user.id

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `SELECT * FROM ${process.env.NODE_ENV === 'production' ? 'daily_david_entries' : 'daily_david_entries_dev'} 
         WHERE date_key = $1 AND user_id = $2`,
        [date, userId]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Entry not found' })
      }

      res.json({ success: true, entry: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get entry error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch entry' })
  }
})

app.put('/api/entries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const userId = req.user.id

    const client = await pool.connect()
    
    try {
      // Verify ownership
      const checkResult = await client.query(
        `SELECT * FROM ${process.env.NODE_ENV === 'production' ? 'daily_david_entries' : 'daily_david_entries_dev'} 
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      )

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Entry not found' })
      }

      const currentEntry = checkResult.rows[0]
      const updatedData = { ...currentEntry.data_content, ...updates }

      const result = await client.query(
        `UPDATE ${process.env.NODE_ENV === 'production' ? 'daily_david_entries' : 'daily_david_entries_dev'} 
         SET data_content = $1, updated_at = NOW() 
         WHERE id = $1 
         RETURNING *`,
        [JSON.stringify(updatedData), id]
      )

      res.json({ success: true, entry: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Update entry error:', error)
    res.status(500).json({ success: false, error: 'Failed to update entry' })
  }
})

app.get('/api/entries', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user.id

    const client = await pool.connect()
    
    try {
      let query = `SELECT * FROM ${process.env.NODE_ENV === 'production' ? 'daily_david_entries' : 'daily_david_entries_dev'} WHERE user_id = $1`
      const params = [userId]

      if (startDate) {
        query += ' AND date_key >= $2'
        params.push(startDate)
      }
      if (endDate) {
        query += ' AND date_key <= $3'
        params.push(endDate)
      }

      query += ' ORDER BY date_key DESC'

      const result = await client.query(query, params)
      res.json({ success: true, entries: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get entries error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch entries' })
  }
})

// Setup endpoint to create first admin user (only works when no users exist)
app.post('/api/setup', async (req, res) => {
  try {
    const client = await pool.connect()
    
    try {
      // Check if any users exist
      const userCheck = await client.query('SELECT COUNT(*) FROM users')
      if (parseInt(userCheck.rows[0].count) > 0) {
        return res.status(400).json({ success: false, error: 'Setup already completed - users exist' })
      }

      const { email, password, displayName } = req.body

      if (!email || !password || !displayName) {
        return res.status(400).json({ success: false, error: 'Email, password, and display name required' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await client.query(
        'INSERT INTO users (email, password_hash, display_name, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, hashedPassword, displayName, true]
      )

      res.json({ success: true, user: result.rows[0], message: 'First admin user created successfully' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Setup error:', error)
    res.status(500).json({ success: false, error: 'Failed to create admin user' })
  }
})

// Setup endpoint to create first admin user (for demo purposes)
app.post('/api/setup', async (req, res) => {
  try {
    const client = await pool.connect()
    
    try {
      // Check if any users exist
      const userCheck = await client.query('SELECT COUNT(*) FROM users')
      if (parseInt(userCheck.rows[0].count) > 0) {
        return res.status(400).json({ success: false, error: 'Users already exist' })
      }

      // Create demo admin user
      const hashedPassword = await bcrypt.hash('demo123', 10)
      const result = await client.query(
        'INSERT INTO users (email, password_hash, display_name, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
        ['demo@dailydavid.com', hashedPassword, 'Demo Admin', true]
      )

      res.json({ success: true, user: result.rows[0], message: 'Demo admin user created successfully' })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Setup error:', error)
    res.status(500).json({ success: false, error: 'Failed to create demo user' })
  }
})

// Admin routes
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'SELECT id, email, display_name, is_admin, created_at, last_login FROM users ORDER BY created_at DESC'
      )

      res.json({ success: true, users: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch users' })
  }
})

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    const { email, password, displayName, isAdmin } = req.body

    if (!email || !password || !displayName) {
      return res.status(400).json({ success: false, error: 'Email, password, and display name required' })
    }

    const client = await pool.connect()
    
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await client.query(
        'INSERT INTO users (email, password_hash, display_name, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, hashedPassword, displayName, isAdmin || false]
      )

      res.json({ success: true, user: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Create user error:', error)
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ success: false, error: 'User with this email already exists' })
    } else {
      res.status(500).json({ success: false, error: 'Failed to create user' })
    }
  }
})

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
    console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

// Export for Vercel serverless functions
module.exports = app
