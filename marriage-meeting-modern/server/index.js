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
app.use(cors())
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

    const result = await pool.query(
      'SELECT * FROM marriage_meetings WHERE user_id = $1 AND week_key = $2',
      [req.user.id, weekKey]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Marriage meeting week not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching marriage week:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/marriage-weeks', authenticateToken, async (req, res) => {
  try {
    const { week_key, user_id, data_content } = req.body

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

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error saving marriage week:', error)
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
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

module.exports = app