const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupGoalsTable() {
  try {
    console.log('🔧 Setting up goals table (simple version)...\n')
    
    // Create goals table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        timeframe VARCHAR(10) NOT NULL CHECK (timeframe IN ('monthly', '1year', '5year', '10year')),
        description TEXT DEFAULT '',
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    await pool.query(createTableQuery)
    console.log('✅ Goals table created successfully')
    
    // Create indexes
    const createIndexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_goals_timeframe ON goals(timeframe);
      CREATE INDEX IF NOT EXISTS idx_goals_user_timeframe ON goals(user_id, timeframe);
    `
    
    await pool.query(createIndexesQuery)
    console.log('✅ Indexes created successfully')
    
    console.log('\n🎉 Goals table setup completed!')
    
  } catch (error) {
    console.error('❌ Error setting up goals table:', error.message)
  } finally {
    await pool.end()
  }
}

setupGoalsTable()
