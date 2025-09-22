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

async function setupPlanningTables() {
  try {
    console.log('🚀 Setting up planning tables...')

    // Family Vision Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS family_vision (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(200) NOT NULL,
        statement TEXT NOT NULL,
        values TEXT[] DEFAULT '{}',
        priorities TEXT[] DEFAULT '{}',
        year INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year)
      )
    `)

    // Annual Goals Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS annual_goals (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        target_date DATE,
        progress INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'not-started',
        priority VARCHAR(20) DEFAULT 'medium',
        vision TEXT,
        impact TEXT,
        quarterly_breakdown JSONB DEFAULT '{}',
        completed_milestones TEXT[] DEFAULT '{}',
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Quarterly Themes Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quarterly_themes (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        quarter VARCHAR(10) NOT NULL,
        year INTEGER NOT NULL,
        theme VARCHAR(200) NOT NULL,
        focus TEXT,
        scripture TEXT,
        color VARCHAR(50) DEFAULT 'from-blue-500 to-cyan-500',
        goals TEXT[] DEFAULT '{}',
        progress INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, quarter, year)
      )
    `)

    // Quarterly Goals Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quarterly_goals (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        annual_goal_id INTEGER REFERENCES annual_goals(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        target_date DATE,
        progress INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'not-started',
        priority VARCHAR(20) DEFAULT 'medium',
        milestones TEXT[] DEFAULT '{}',
        completed_milestones TEXT[] DEFAULT '{}',
        quarter VARCHAR(10) NOT NULL,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for performance (after tables are created)
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_family_vision_user_year 
        ON family_vision(user_id, year)
      `)

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_annual_goals_user_year 
        ON annual_goals(user_id, year)
      `)

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_quarterly_themes_user_quarter_year 
        ON quarterly_themes(user_id, quarter, year)
      `)

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_quarterly_goals_user_quarter_year 
        ON quarterly_goals(user_id, quarter, year)
      `)
    } catch (indexError) {
      console.log('⚠️  Some indexes may already exist, continuing...')
    }

    // Create triggers to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    // Add triggers for all tables
    const tables = ['family_vision', 'annual_goals', 'quarterly_themes', 'quarterly_goals']
    
    for (const table of tables) {
      await pool.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}
      `)
      
      await pool.query(`
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      `)
    }

    console.log('✅ Planning tables created successfully!')
    
    // Test the tables
    const visionCount = await pool.query('SELECT COUNT(*) FROM family_vision')
    const goalsCount = await pool.query('SELECT COUNT(*) FROM annual_goals')
    const themesCount = await pool.query('SELECT COUNT(*) FROM quarterly_themes')
    const quarterlyGoalsCount = await pool.query('SELECT COUNT(*) FROM quarterly_goals')
    
    console.log('📊 Table counts:')
    console.log(`  - family_vision: ${visionCount.rows[0].count}`)
    console.log(`  - annual_goals: ${goalsCount.rows[0].count}`)
    console.log(`  - quarterly_themes: ${themesCount.rows[0].count}`)
    console.log(`  - quarterly_goals: ${quarterlyGoalsCount.rows[0].count}`)

  } catch (error) {
    console.error('❌ Error setting up planning tables:', error)
    throw error
  } finally {
    await pool.end()
  }
}

setupPlanningTables()
  .then(() => {
    console.log('🎉 Planning tables setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })
