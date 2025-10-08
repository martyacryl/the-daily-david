const { Pool } = require('pg')

const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function deleteDemoUsers() {
  try {
    console.log('🔍 Identifying demo users to delete...')
    
    // First, let's see all users
    const allUsers = await pool.query('SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at')
    
    console.log(`\nFound ${allUsers.rows.length} total users:`)
    allUsers.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.display_name}`)
      console.log(`   Admin: ${user.is_admin}`)
      console.log(`   Created: ${user.created_at}`)
      console.log('')
    })
    
    // Define demo user patterns (emails that contain "demo", "test", or are clearly test accounts)
    const demoPatterns = [
      'demo@demo.com',
      'test@test.com', 
      'testuser@example.com',
      'test@example.com',
      'test2@example.com'
    ]
    
    console.log('\n🎯 Demo users to delete:')
    const demoUsers = allUsers.rows.filter(user => 
      demoPatterns.includes(user.email) || 
      user.email.includes('demo') || 
      user.email.includes('test@')
    )
    
    if (demoUsers.length === 0) {
      console.log('✅ No demo users found to delete')
      return
    }
    
    demoUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.display_name})`)
    })
    
    console.log(`\n🗑️  Deleting ${demoUsers.length} demo users...`)
    
    // Delete demo users
    for (const user of demoUsers) {
      try {
        // Delete user settings first (if they exist)
        await pool.query('DELETE FROM user_settings WHERE user_id = $1', [user.id])
        
        // Delete marriage meetings
        await pool.query('DELETE FROM marriage_meetings WHERE user_id = $1', [user.id])
        
        // Delete goals
        await pool.query('DELETE FROM goals WHERE user_id = $1', [user.id])
        
        // Finally delete the user
        await pool.query('DELETE FROM users WHERE id = $1', [user.id])
        
        console.log(`✅ Deleted demo user: ${user.email}`)
      } catch (error) {
        console.error(`❌ Error deleting user ${user.email}:`, error.message)
      }
    }
    
    console.log(`\n🎉 Demo user cleanup complete!`)
    
    // Show remaining users
    const remainingUsers = await pool.query('SELECT id, email, display_name, is_admin FROM users ORDER BY created_at')
    console.log(`\n📋 Remaining users (${remainingUsers.rows.length}):`)
    remainingUsers.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.display_name}) - Admin: ${user.is_admin}`)
    })
    
  } catch (error) {
    console.error('Error deleting demo users:', error)
  } finally {
    await pool.end()
  }
}

deleteDemoUsers()
