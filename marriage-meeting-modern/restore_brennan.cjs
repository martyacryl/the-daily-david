const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function restoreBrennan() {
  try {
    console.log('🔄 Restoring Brennan\'s account...')
    
    const email = 'brennan@demo.com'
    const name = 'Brennan'
    const password = 'brennan123' // Default password they can change
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Brennan\'s account already exists')
      return
    }
    
    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (display_name, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, passwordHash, false]
    )
    
    const user = result.rows[0]
    
    console.log('✅ Brennan\'s account restored successfully!')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.display_name}`)
    console.log(`   Admin: ${user.is_admin}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Temporary password: ${password}`)
    console.log('\n📧 Please let Brennan know to change their password after logging in!')
    
  } catch (error) {
    console.error('Error restoring Brennan:', error)
  } finally {
    await pool.end()
  }
}

restoreBrennan()
