-- Marriage Meeting Tool - Database Setup
-- Creates the marriage_meetings table in Neon PostgreSQL

-- Create marriage_meetings table
CREATE TABLE IF NOT EXISTS marriage_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Enable Row Level Security
ALTER TABLE marriage_meetings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view own marriage meetings" ON marriage_meetings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marriage meetings" ON marriage_meetings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marriage meetings" ON marriage_meetings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own marriage meetings" ON marriage_meetings
    FOR DELETE USING (auth.uid() = user_id);

-- Admin override policy (if using Supabase Auth)
CREATE POLICY "Admins can view all marriage meetings" ON marriage_meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Grant permissions
GRANT ALL ON marriage_meetings TO authenticated;
GRANT ALL ON marriage_meetings TO service_role;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    settings_data JSONB NOT NULL,  -- Complete settings structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Admin override policy
CREATE POLICY "Admins can view all user settings" ON user_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Grant permissions
GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON user_settings TO service_role;

-- Add comments for documentation
COMMENT ON TABLE marriage_meetings IS 'Stores weekly marriage meeting data for each user';
COMMENT ON COLUMN marriage_meetings.week_key IS 'Monday date of the week in YYYY-MM-DD format';
COMMENT ON COLUMN marriage_meetings.data_content IS 'JSONB containing schedule, todos, prayers, goals, grocery, unconfessedSin, weeklyWinddown';
COMMENT ON TABLE user_settings IS 'Stores user settings including spouse info, location, grocery stores, family creed';
COMMENT ON COLUMN user_settings.settings_data IS 'JSONB containing spouse1, spouse2, location, groceryStores, familyCreed, etc.';
