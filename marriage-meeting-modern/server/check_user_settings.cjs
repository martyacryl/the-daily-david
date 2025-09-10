const { Pool } = require('pg')

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkUserSettings() {
  try {
    console.log('Checking user_settings table...')
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings'
      )
    `)
    
    console.log('Table exists:', tableCheck.rows[0].exists)
    
    if (tableCheck.rows[0].exists) {
      // Get all user_settings records
      const settingsResult = await pool.query(`
        SELECT 
          us.id,
          us.user_id,
          u.email,
          us.settings_data,
          us.created_at,
          us.updated_at
        FROM user_settings us
        LEFT JOIN users u ON us.user_id = u.id
        ORDER BY us.created_at DESC
      `)
      
      console.log(`\nFound ${settingsResult.rows.length} settings records:`)
      
      settingsResult.rows.forEach((row, index) => {
        console.log(`\n--- Record ${index + 1} ---`)
        console.log('ID:', row.id)
        console.log('User ID:', row.user_id)
        console.log('Email:', row.email)
        console.log('Created:', row.created_at)
        console.log('Updated:', row.updated_at)
        console.log('Settings Data:', JSON.stringify(row.settings_data, null, 2))
      })
      
      // Check for specific user (stjohnashlynn@gmail.com)
      const adminUser = await pool.query(`
        SELECT id, email, display_name FROM users WHERE email = 'stjohnashlynn@gmail.com'
      `)
      
      if (adminUser.rows.length > 0) {
        console.log(`\n--- Admin User Found ---`)
        console.log('ID:', adminUser.rows[0].id)
        console.log('Email:', adminUser.rows[0].email)
        console.log('Name:', adminUser.rows[0].display_name)
        
        // Check settings for this user
        const adminSettings = await pool.query(`
          SELECT settings_data FROM user_settings WHERE user_id = $1
        `, [adminUser.rows[0].id])
        
        if (adminSettings.rows.length > 0) {
          console.log('Admin Settings:', JSON.stringify(adminSettings.rows[0].settings_data, null, 2))
        } else {
          console.log('No settings found for admin user')
        }
      } else {
        console.log('\nAdmin user not found')
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking user settings:', error)
  } finally {
    await pool.end()
  }
}

checkUserSettings()
