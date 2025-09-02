const { Pool } = require('pg')

async function checkUser() {
  const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-little-base-adgfntzb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    const client = await pool.connect()
    
    // Check the specific user
    const result = await client.query(
      'SELECT email, password_hash, display_name, is_admin FROM users WHERE email = $1',
      ['marty@dailydavid.com']
    )
    
    if (result.rows.length > 0) {
      const user = result.rows[0]
      console.log('👤 User found:')
      console.log('Email:', user.email)
      console.log('Display Name:', user.display_name)
      console.log('Is Admin:', user.is_admin)
      console.log('Password Hash:', user.password_hash)
      console.log('Password Hash Length:', user.password_hash.length)
      console.log('Password Hash Type:', typeof user.password_hash)
    } else {
      console.log('❌ User not found')
    }
    
    client.release()
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkUser()
