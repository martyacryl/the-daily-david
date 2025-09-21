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

async function fixReadingPlansUserId() {
  try {
    console.log('🔧 Fixing reading plans user_id to use UUIDs...')

    // Drop the existing tables
    await pool.query('DROP TABLE IF EXISTS reading_plan_progress CASCADE')
    await pool.query('DROP TABLE IF EXISTS reading_plans CASCADE')

    // Create reading_plans table with UUID user_id
    await pool.query(`
      CREATE TABLE reading_plans (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        current_day INTEGER NOT NULL DEFAULT 1,
        total_days INTEGER NOT NULL,
        start_date VARCHAR(10) NOT NULL,
        completed_days INTEGER[] DEFAULT '{}',
        bible_id VARCHAR(50) DEFAULT '65eec8e0b60e656b-01',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, plan_id)
      )
    `)

    // Create reading_plan_progress table with UUID user_id
    await pool.query(`
      CREATE TABLE reading_plan_progress (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        day_number INTEGER NOT NULL,
        completed_at TIMESTAMP,
        notes TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, plan_id, day_number)
      )
    `)

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX idx_reading_plans_user_plan 
      ON reading_plans(user_id, plan_id)
    `)

    await pool.query(`
      CREATE INDEX idx_reading_plan_progress_user_plan 
      ON reading_plan_progress(user_id, plan_id)
    `)

    console.log('✅ Reading plans tables recreated with UUID user_id!')
    
    // Test the tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('reading_plans', 'reading_plan_progress')
    `)
    
    console.log('📋 Created tables:', result.rows.map(row => row.table_name))
    
  } catch (error) {
    console.error('❌ Error fixing reading plans tables:', error)
    throw error
  } finally {
    await pool.end()
  }
}

fixReadingPlansUserId()
  .then(() => {
    console.log('🎉 Reading plans UUID fix complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error)
    process.exit(1)
  })
