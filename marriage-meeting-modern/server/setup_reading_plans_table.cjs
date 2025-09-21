// Setup Reading Plans Table for Marriage Meeting Tool
// This creates the reading_plans table for tracking devotional progress

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
    console.log('🔧 Setting up reading_plans table...')
    
    // Create reading_plans table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reading_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
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
      );
    `
    
    await pool.query(createTableQuery)
    console.log('✅ reading_plans table created successfully')
    
    // Create index for performance
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_reading_plans_user_plan 
      ON reading_plans(user_id, plan_id);
    `
    
    await pool.query(createIndexQuery)
    console.log('✅ Index created successfully')
    
    // Create trigger to update updated_at timestamp
    const createTriggerQuery = `
      CREATE OR REPLACE FUNCTION update_reading_plans_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_reading_plans_updated_at ON reading_plans;
      CREATE TRIGGER update_reading_plans_updated_at
        BEFORE UPDATE ON reading_plans
        FOR EACH ROW
        EXECUTE FUNCTION update_reading_plans_updated_at();
    `
    
    await pool.query(createTriggerQuery)
    console.log('✅ Trigger created successfully')
    
    // Test the table
    const testQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reading_plans'
      ORDER BY ordinal_position;
    `
    
    const result = await pool.query(testQuery)
    console.log('📋 Table structure:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })
    
    console.log('🎉 Reading plans table setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Error setting up reading_plans table:', error.message)
    console.error('Full error:', error)
  } finally {
    await pool.end()
  }
}

// Run the setup
setupReadingPlansTable()