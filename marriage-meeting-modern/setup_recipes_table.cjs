const { Pool } = require('pg')

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupRecipesTable() {
  try {
    console.log('Creating recipes table...')
    
    // Create recipes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        ingredients JSONB NOT NULL,
        instructions TEXT,
        source TEXT,
        servings INTEGER DEFAULT 4,
        prep_time INTEGER DEFAULT 0,
        cook_time INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)
    
    console.log('✅ recipes table created')
    
    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id)
    `)
    
    console.log('✅ Index created')
    
    // Grant permissions (no RLS needed for this simple setup)
    await pool.query(`
      GRANT ALL ON recipes TO PUBLIC
    `)
    
    console.log('✅ Permissions granted')
    
    // Add comments for documentation
    await pool.query(`
      COMMENT ON TABLE recipes IS 'Stores user recipes for meal planning'
    `)
    
    await pool.query(`
      COMMENT ON COLUMN recipes.ingredients IS 'JSONB array of ingredient strings'
    `)
    
    console.log('✅ Comments added')
    
    console.log('🎉 Recipes table setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up recipes table:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run the setup
setupRecipesTable()
  .then(() => {
    console.log('Setup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
