const { Pool } = require('pg')

const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function cleanupTestUser() {
  try {
    console.log('🧹 Cleaning up test user...')
    
    const userId = '59118448-06eb-4209-b9f8-9645b36d3337'
    
    // Delete user data
    await pool.query('DELETE FROM user_settings WHERE user_id = $1', [userId])
    await pool.query('DELETE FROM marriage_meetings WHERE user_id = $1', [userId])
    await pool.query('DELETE FROM goals WHERE user_id = $1', [userId])
    await pool.query('DELETE FROM users WHERE id = $1', [userId])
    
    console.log('✅ Test user cleaned up successfully')
    
  } catch (error) {
    console.error('Error cleaning up test user:', error)
  } finally {
    await pool.end()
  }
}

cleanupTestUser()
