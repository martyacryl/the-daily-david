const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

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

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Helper function to get local date string (YYYY-MM-DD)
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Simple middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
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

// Debug endpoint to see database structure
app.get('/api/debug/tables', async (req, res) => {
  try {
    const client = await pool.connect()
    
    try {
      // Get all tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)
      
      // Get sample data from daily_david_entries
      const dailyEntriesResult = await client.query(`
        SELECT user_id, date_key, created_at, data_content 
        FROM daily_david_entries 
        ORDER BY created_at DESC 
        LIMIT 5
      `)
      
      // Check if there are other potential entry tables
      const otherTablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%entry%'
        ORDER BY table_name
      `)
      
      res.json({ 
        success: true, 
        all_tables: tablesResult.rows,
        daily_david_entries: dailyEntriesResult.rows,
        potential_entry_tables: otherTablesResult.rows
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Debug error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Simple login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' })
    }

    const client = await pool.connect()
    
    try {
      // Get user by email
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' })
      }

      const user = result.rows[0]

      // Simple password check - handle both plain text and bcrypt
      let isValidPassword = false
      
      if (user.password_hash.startsWith('$2b$')) {
        // Bcrypt hash
        isValidPassword = await bcrypt.compare(password, user.password_hash)
      } else {
        // Plain text
        isValidPassword = (password === user.password_hash)
      }
      
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' })
      }

      // Generate JWT token with user info
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          isAdmin: user.is_admin || false,
          displayName: user.display_name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.display_name,
          role: user.is_admin ? 'admin' : 'user',
          is_admin: user.is_admin || false
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

// Simple logout (just return success - client handles token removal)
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' })
})

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    user: {
      id: req.user.userId,
      email: req.user.email,
      name: req.user.displayName,
      role: req.user.isAdmin ? 'admin' : 'user',
      is_admin: req.user.isAdmin
    }
  })
})

// Admin routes
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `SELECT id, email, display_name, is_admin, created_at 
         FROM users 
         ORDER BY created_at DESC`
      )
      
      res.json({ success: true, users: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ success: false, error: 'Failed to get users' })
  }
})

// Daily entries routes
app.post('/api/entries', authenticateToken, async (req, res) => {
  try {
    const { date, goals, gratitude, soap, dailyIntention, growthQuestion, leadershipRating } = req.body
    const userId = req.user.userId
    const dateKey = date || getLocalDateString()

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `INSERT INTO daily_david_entries 
         (date_key, user_id, data_content) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (date_key, user_id) 
         DO UPDATE SET data_content = $3
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
    console.error('Save entry error:', error)
    res.status(500).json({ success: false, error: 'Failed to save entry' })
  }
})

app.get('/api/entries/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params
    const userId = req.user.userId

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `SELECT * FROM daily_david_entries 
         WHERE date_key = $1 AND user_id = $2`,
        [date, userId]
      )

      if (result.rows.length > 0) {
        res.json({ success: true, entry: result.rows[0] })
      } else {
        res.json({ success: true, entry: null })
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get entry error:', error)
    res.status(500).json({ success: false, error: 'Failed to get entry' })
  }
})

// Get all entries for a user
app.get('/api/entries', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const { limit = 30 } = req.query

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `SELECT * FROM daily_david_entries 
         WHERE user_id = $1 
         ORDER BY date_key DESC 
         LIMIT $2`,
        [userId, limit]
      )

      res.json({ success: true, entries: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Get entries error:', error)
    res.status(500).json({ success: false, error: 'Failed to get entries' })
  }
})

// Admin routes
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' })
    }

    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at DESC'
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
