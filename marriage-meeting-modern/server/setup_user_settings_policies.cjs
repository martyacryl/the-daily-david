const { Pool } = require('pg')

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupUserSettingsPolicies() {
  try {
    console.log('Setting up user_settings policies...')
    
    // Drop existing policies if they exist
    try {
      await pool.query(`DROP POLICY IF EXISTS "Users can view own settings" ON user_settings`)
      await pool.query(`DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings`)
      await pool.query(`DROP POLICY IF EXISTS "Users can update own settings" ON user_settings`)
      await pool.query(`DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings`)
      await pool.query(`DROP POLICY IF EXISTS "Admins can view all user settings" ON user_settings`)
      console.log('✅ Existing policies dropped')
    } catch (error) {
      console.log('No existing policies to drop')
    }
    
    // Disable RLS temporarily to set up policies
    await pool.query(`ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY`)
    console.log('✅ RLS disabled temporarily')
    
    // Grant permissions directly (no RLS for now)
    await pool.query(`GRANT ALL ON user_settings TO PUBLIC`)
    console.log('✅ Permissions granted to PUBLIC')
    
    // Add comments for documentation
    await pool.query(`
      COMMENT ON TABLE user_settings IS 'Stores user settings including spouse info, location, grocery stores, family creed'
    `)
    
    await pool.query(`
      COMMENT ON COLUMN user_settings.settings_data IS 'JSONB containing spouse1, spouse2, location, groceryStores, familyCreed, etc.'
    `)
    
    console.log('✅ Comments added')
    
    console.log('🎉 user_settings table setup complete!')
    console.log('Note: RLS is disabled - authentication is handled at the API level')
    
  } catch (error) {
    console.error('❌ Error setting up user_settings policies:', error)
  } finally {
    await pool.end()
  }
}

setupUserSettingsPolicies()
