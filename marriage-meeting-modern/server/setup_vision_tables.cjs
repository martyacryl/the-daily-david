const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupVisionTables() {
  try {
    console.log('🔧 Setting up vision tables...\n')
    
    // 1. Family Vision Table
    const createFamilyVisionTable = `
      CREATE TABLE IF NOT EXISTS family_vision (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mission_statement TEXT DEFAULT '',
        core_values TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `
    
    await pool.query(createFamilyVisionTable)
    console.log('✅ Family vision table created successfully')
    
    // 2. Vision Goals Table
    const createVisionGoalsTable = `
      CREATE TABLE IF NOT EXISTS vision_goals (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('spiritual', 'family', 'personal', 'financial', 'ministry')),
        timeframe VARCHAR(10) NOT NULL CHECK (timeframe IN ('1year', '5year', '10year')),
        completed BOOLEAN DEFAULT FALSE,
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        target_date DATE,
        description TEXT DEFAULT '',
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    await pool.query(createVisionGoalsTable)
    console.log('✅ Vision goals table created successfully')
    
    // 3. Spiritual Growth Table
    const createSpiritualGrowthTable = `
      CREATE TABLE IF NOT EXISTS spiritual_growth (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        prayer_requests TEXT[] DEFAULT '{}',
        answered_prayers TEXT[] DEFAULT '{}',
        bible_reading_plan TEXT DEFAULT '',
        bible_reading_progress INTEGER DEFAULT 0,
        devotionals TEXT[] DEFAULT '{}',
        spiritual_goals TEXT[] DEFAULT '{}',
        reflection_notes TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `
    
    await pool.query(createSpiritualGrowthTable)
    console.log('✅ Spiritual growth table created successfully')
    
    // 4. Family Planning Table
    const createFamilyPlanningTable = `
      CREATE TABLE IF NOT EXISTS family_planning (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        family_events TEXT[] DEFAULT '{}',
        financial_goals TEXT[] DEFAULT '{}',
        home_goals TEXT[] DEFAULT '{}',
        education_goals TEXT[] DEFAULT '{}',
        vacation_plans TEXT[] DEFAULT '{}',
        milestone_dates JSONB DEFAULT '{}',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `
    
    await pool.query(createFamilyPlanningTable)
    console.log('✅ Family planning table created successfully')
    
    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_family_vision_user_id ON family_vision(user_id);
      CREATE INDEX IF NOT EXISTS idx_vision_goals_user_id ON vision_goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_vision_goals_timeframe ON vision_goals(timeframe);
      CREATE INDEX IF NOT EXISTS idx_vision_goals_category ON vision_goals(category);
      CREATE INDEX IF NOT EXISTS idx_spiritual_growth_user_id ON spiritual_growth(user_id);
      CREATE INDEX IF NOT EXISTS idx_family_planning_user_id ON family_planning(user_id);
    `
    
    await pool.query(createIndexes)
    console.log('✅ Indexes created successfully')
    
    // Enable RLS
    const enableRLS = `
      ALTER TABLE family_vision ENABLE ROW LEVEL SECURITY;
      ALTER TABLE vision_goals ENABLE ROW LEVEL SECURITY;
      ALTER TABLE spiritual_growth ENABLE ROW LEVEL SECURITY;
      ALTER TABLE family_planning ENABLE ROW LEVEL SECURITY;
    `
    
    await pool.query(enableRLS)
    console.log('✅ Row Level Security enabled')
    
    // Create RLS policies
    const createPolicies = `
      -- Family Vision Policies
      DROP POLICY IF EXISTS "Users can view their own family vision" ON family_vision;
      DROP POLICY IF EXISTS "Users can insert their own family vision" ON family_vision;
      DROP POLICY IF EXISTS "Users can update their own family vision" ON family_vision;
      DROP POLICY IF EXISTS "Users can delete their own family vision" ON family_vision;
      
      CREATE POLICY "Users can view their own family vision" ON family_vision
        FOR SELECT USING (user_id = auth.uid());
      CREATE POLICY "Users can insert their own family vision" ON family_vision
        FOR INSERT WITH CHECK (user_id = auth.uid());
      CREATE POLICY "Users can update their own family vision" ON family_vision
        FOR UPDATE USING (user_id = auth.uid());
      CREATE POLICY "Users can delete their own family vision" ON family_vision
        FOR DELETE USING (user_id = auth.uid());
      
      -- Vision Goals Policies
      DROP POLICY IF EXISTS "Users can view their own vision goals" ON vision_goals;
      DROP POLICY IF EXISTS "Users can insert their own vision goals" ON vision_goals;
      DROP POLICY IF EXISTS "Users can update their own vision goals" ON vision_goals;
      DROP POLICY IF EXISTS "Users can delete their own vision goals" ON vision_goals;
      
      CREATE POLICY "Users can view their own vision goals" ON vision_goals
        FOR SELECT USING (user_id = auth.uid());
      CREATE POLICY "Users can insert their own vision goals" ON vision_goals
        FOR INSERT WITH CHECK (user_id = auth.uid());
      CREATE POLICY "Users can update their own vision goals" ON vision_goals
        FOR UPDATE USING (user_id = auth.uid());
      CREATE POLICY "Users can delete their own vision goals" ON vision_goals
        FOR DELETE USING (user_id = auth.uid());
      
      -- Spiritual Growth Policies
      DROP POLICY IF EXISTS "Users can view their own spiritual growth" ON spiritual_growth;
      DROP POLICY IF EXISTS "Users can insert their own spiritual growth" ON spiritual_growth;
      DROP POLICY IF EXISTS "Users can update their own spiritual growth" ON spiritual_growth;
      DROP POLICY IF EXISTS "Users can delete their own spiritual growth" ON spiritual_growth;
      
      CREATE POLICY "Users can view their own spiritual growth" ON spiritual_growth
        FOR SELECT USING (user_id = auth.uid());
      CREATE POLICY "Users can insert their own spiritual growth" ON spiritual_growth
        FOR INSERT WITH CHECK (user_id = auth.uid());
      CREATE POLICY "Users can update their own spiritual growth" ON spiritual_growth
        FOR UPDATE USING (user_id = auth.uid());
      CREATE POLICY "Users can delete their own spiritual growth" ON spiritual_growth
        FOR DELETE USING (user_id = auth.uid());
      
      -- Family Planning Policies
      DROP POLICY IF EXISTS "Users can view their own family planning" ON family_planning;
      DROP POLICY IF EXISTS "Users can insert their own family planning" ON family_planning;
      DROP POLICY IF EXISTS "Users can update their own family planning" ON family_planning;
      DROP POLICY IF EXISTS "Users can delete their own family planning" ON family_planning;
      
      CREATE POLICY "Users can view their own family planning" ON family_planning
        FOR SELECT USING (user_id = auth.uid());
      CREATE POLICY "Users can insert their own family planning" ON family_planning
        FOR INSERT WITH CHECK (user_id = auth.uid());
      CREATE POLICY "Users can update their own family planning" ON family_planning
        FOR UPDATE USING (user_id = auth.uid());
      CREATE POLICY "Users can delete their own family planning" ON family_planning
        FOR DELETE USING (user_id = auth.uid());
    `
    
    await pool.query(createPolicies)
    console.log('✅ RLS policies created successfully')
    
    console.log('\n🎉 Vision tables setup completed!')
    console.log('\nTables created:')
    console.log('- family_vision (mission statement, core values)')
    console.log('- vision_goals (1year, 5year, 10year goals)')
    console.log('- spiritual_growth (prayer requests, bible reading, etc.)')
    console.log('- family_planning (events, financial goals, etc.)')
    
  } catch (error) {
    console.error('❌ Error setting up vision tables:', error.message)
  } finally {
    await pool.end()
  }
}

setupVisionTables()
