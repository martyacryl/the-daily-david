const { Pool } = require('pg')

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function migrateCalendarSettings() {
  console.log('🔄 Starting calendar settings migration...')
  
  try {
    // Check if calendar column exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      AND column_name = 'calendar_settings'
    `)
    
    if (checkColumn.rows.length === 0) {
      console.log('📝 Adding calendar_settings column to user_settings table...')
      
      // Add calendar_settings column with default value
      await pool.query(`
        ALTER TABLE user_settings 
        ADD COLUMN calendar_settings JSONB DEFAULT '{
          "icalUrl": "",
          "googleCalendarEnabled": false,
          "syncFrequency": "daily",
          "showCalendarEvents": true
        }'::jsonb
      `)
      
      console.log('✅ Calendar settings column added successfully!')
    } else {
      console.log('ℹ️ Calendar settings column already exists')
    }
    
    // Update existing users who have null calendar_settings
    const updateResult = await pool.query(`
      UPDATE user_settings 
      SET calendar_settings = '{
        "icalUrl": "",
        "googleCalendarEnabled": false,
        "syncFrequency": "daily",
        "showCalendarEvents": true
      }'::jsonb
      WHERE calendar_settings IS NULL
    `)
    
    console.log(`✅ Updated ${updateResult.rowCount} users with default calendar settings`)
    
    // Verify the migration
    const verifyResult = await pool.query(`
      SELECT COUNT(*) as total_users,
             COUNT(calendar_settings) as users_with_calendar_settings
      FROM user_settings
    `)
    
    console.log('📊 Migration verification:', verifyResult.rows[0])
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCalendarSettings()
    .then(() => {
      console.log('🎉 Calendar settings migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateCalendarSettings }
