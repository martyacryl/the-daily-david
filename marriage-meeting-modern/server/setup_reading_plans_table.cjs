const { Pool } = require('pg')

// Neon Database Connection
const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupReadingPlansTable() {
  try {
    console.log('🔧 Setting up reading plans table...')

    // Create reading_plans table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reading_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        current_day INTEGER NOT NULL DEFAULT 1,
        total_days INTEGER NOT NULL,
        start_date VARCHAR(10) NOT NULL,
        completed_days INTEGER[] DEFAULT '{}',
        bible_id VARCHAR(50) DEFAULT 'de4e12af7f28f599-02',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, plan_id)
      )
    `)

    // Create index for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reading_plans_user_plan 
      ON reading_plans(user_id, plan_id)
    `)

    // Create reading_plan_progress table for detailed tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reading_plan_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        day_number INTEGER NOT NULL,
        completed_at TIMESTAMP,
        notes TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, plan_id, day_number)
      )
    `)

    // Create index for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reading_plan_progress_user_plan 
      ON reading_plan_progress(user_id, plan_id)
    `)

    console.log('✅ Reading plans tables created successfully!')
    
    // Test the tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('reading_plans', 'reading_plan_progress')
    `)
    
    console.log('📋 Created tables:', result.rows.map(row => row.table_name))
    
  } catch (error) {
    console.error('❌ Error setting up reading plans tables:', error)
    throw error
  } finally {
    await pool.end()
  }
}

setupReadingPlansTable()
  .then(() => {
    console.log('🎉 Reading plans setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
