-- Marriage Meeting Tool - Simple Database Setup
-- Creates the marriage_meetings table in Neon PostgreSQL (without Supabase auth)

-- Create marriage_meetings table
CREATE TABLE IF NOT EXISTS marriage_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,  -- References users table but without foreign key constraint
    week_key TEXT NOT NULL,  -- Format: 'YYYY-MM-DD' (Monday of week)
    data_content JSONB NOT NULL,     -- Complete week data structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_key)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_marriage_meetings_user_id ON marriage_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_marriage_meetings_week_key ON marriage_meetings(week_key);
CREATE INDEX IF NOT EXISTS idx_marriage_meetings_user_week ON marriage_meetings(user_id, week_key);

-- Add comments for documentation
COMMENT ON TABLE marriage_meetings IS 'Stores weekly marriage meeting data for each user';
COMMENT ON COLUMN marriage_meetings.week_key IS 'Monday date of the week in YYYY-MM-DD format';
COMMENT ON COLUMN marriage_meetings.data_content IS 'JSONB containing schedule, todos, prayers, goals, grocery, unconfessedSin, weeklyWinddown';
