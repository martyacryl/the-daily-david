const { Pool } = require('pg')

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupUserSettingsTable() {
  try {
    console.log('Creating user_settings table...')
    
    // Create user_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        settings_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `)
    
    console.log('✅ user_settings table created')
    
    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)
    `)
    
    console.log('✅ Index created')
    
    // Enable Row Level Security
    await pool.query(`
      ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY
    `)
    
    console.log('✅ RLS enabled')
    
    // Create RLS policies for user isolation
    await pool.query(`
      CREATE POLICY "Users can view own settings" ON user_settings
        FOR SELECT USING (auth.uid() = user_id)
    `)
    
    await pool.query(`
      CREATE POLICY "Users can insert own settings" ON user_settings
        FOR INSERT WITH CHECK (auth.uid() = user_id)
    `)
    
    await pool.query(`
      CREATE POLICY "Users can update own settings" ON user_settings
        FOR UPDATE USING (auth.uid() = user_id)
    `)
    
    await pool.query(`
      CREATE POLICY "Users can delete own settings" ON user_settings
        FOR DELETE USING (auth.uid() = user_id)
    `)
    
    console.log('✅ RLS policies created')
    
    // Admin override policy
    await pool.query(`
      CREATE POLICY "Admins can view all user settings" ON user_settings
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
          )
        )
    `)
    
    console.log('✅ Admin policy created')
    
    // Grant permissions
    await pool.query(`
      GRANT ALL ON user_settings TO authenticated
    `)
    
    await pool.query(`
      GRANT ALL ON user_settings TO service_role
    `)
    
    console.log('✅ Permissions granted')
    
    // Add comments for documentation
    await pool.query(`
      COMMENT ON TABLE user_settings IS 'Stores user settings including spouse info, location, grocery stores, family creed'
    `)
    
    await pool.query(`
      COMMENT ON COLUMN user_settings.settings_data IS 'JSONB containing spouse1, spouse2, location, groceryStores, familyCreed, etc.'
    `)
    
    console.log('✅ Comments added')
    
    console.log('🎉 user_settings table setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up user_settings table:', error)
  } finally {
    await pool.end()
  }
}

setupUserSettingsTable()
