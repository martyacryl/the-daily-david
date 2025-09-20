const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
})

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS meeting_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL,
    week_key VARCHAR(10) NOT NULL, -- e.g., '2025-09-15'
    steps_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_steps INTEGER NOT NULL DEFAULT 8,
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    meeting_duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, meeting_date)
  );

  -- Create index for faster queries
  CREATE INDEX IF NOT EXISTS idx_meeting_progress_user_date ON meeting_progress(user_id, meeting_date);
  CREATE INDEX IF NOT EXISTS idx_meeting_progress_week_key ON meeting_progress(week_key);
  
  -- Create a view for meeting streaks
  CREATE OR REPLACE VIEW meeting_streaks AS
  WITH weekly_meetings AS (
    SELECT 
      user_id,
      week_key,
      meeting_date,
      completion_percentage,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY meeting_date) as meeting_number
    FROM meeting_progress 
    WHERE completion_percentage >= 50.0 -- Consider 50%+ as a completed meeting
  ),
  streaks AS (
    SELECT 
      user_id,
      week_key,
      meeting_date,
      completion_percentage,
      meeting_number,
      meeting_number - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY meeting_date) as streak_group
    FROM weekly_meetings
  ),
  streak_counts AS (
    SELECT 
      user_id,
      week_key,
      meeting_date,
      completion_percentage,
      COUNT(*) OVER (PARTITION BY user_id, streak_group ORDER BY meeting_date) as current_streak
    FROM streaks
  )
  SELECT 
    user_id,
    week_key,
    meeting_date,
    completion_percentage,
    current_streak,
    MAX(current_streak) OVER (PARTITION BY user_id) as longest_streak
  FROM streak_counts
  ORDER BY user_id, meeting_date;
`

const disableRLSQuery = `
  ALTER TABLE meeting_progress DISABLE ROW LEVEL SECURITY;
`

async function setupMeetingProgressTable() {
  try {
    console.log('Creating meeting_progress table...')
    await pool.query(createTableQuery)
    console.log('✅ meeting_progress table created successfully')
    
    console.log('Disabling RLS for development...')
    await pool.query(disableRLSQuery)
    console.log('✅ RLS disabled for meeting_progress table')
    
    console.log('🎉 Meeting progress table setup complete!')
  } catch (error) {
    console.error('❌ Error setting up meeting progress table:', error)
  } finally {
    await pool.end()
  }
}

setupMeetingProgressTable()
