-- Setup Database for The Daily David App - NEON DATABASE
-- Run this in your Neon SQL editor or psql client

-- 1. Create the development table
CREATE TABLE IF NOT EXISTS daily_david_entries_dev (
    id BIGSERIAL PRIMARY KEY,
    date_key TEXT NOT NULL,
    user_id TEXT NOT NULL, -- Using TEXT instead of UUID for Neon compatibility
    data_content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the production table
CREATE TABLE IF NOT EXISTS daily_david_entries (
    id BIGSERIAL PRIMARY KEY,
    date_key TEXT NOT NULL,
    user_id TEXT NOT NULL, -- Using TEXT instead of UUID for Neon compatibility
    data_content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add unique constraints
ALTER TABLE daily_david_entries_dev 
ADD CONSTRAINT IF NOT EXISTS unique_date_user_dev UNIQUE(date_key, user_id);

ALTER TABLE daily_david_entries 
ADD CONSTRAINT IF NOT EXISTS unique_date_user_prod UNIQUE(date_key, user_id);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dev_date_user ON daily_david_entries_dev(date_key, user_id);
CREATE INDEX IF NOT EXISTS idx_prod_date_user ON daily_david_entries(date_key, user_id);
CREATE INDEX IF NOT EXISTS idx_dev_user_id ON daily_david_entries_dev(user_id);
CREATE INDEX IF NOT EXISTS idx_prod_user_id ON daily_david_entries(user_id);

-- 5. Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_daily_david_entries_dev_updated_at ON daily_david_entries_dev;
CREATE TRIGGER update_daily_david_entries_dev_updated_at
    BEFORE UPDATE ON daily_david_entries_dev
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_david_entries_updated_at ON daily_david_entries;
CREATE TRIGGER update_daily_david_entries_updated_at
    BEFORE UPDATE ON daily_david_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Create admin view for development
CREATE OR REPLACE VIEW admin_all_entries_dev AS
SELECT 
    e.*,
    e.user_id as user_email -- Since we're using email as user_id
FROM daily_david_entries_dev e;

-- 8. Create admin view for production
CREATE OR REPLACE VIEW admin_all_entries_prod AS
SELECT 
    e.*,
    e.user_id as user_email -- Since we're using email as user_id
FROM daily_david_entries e;

-- 9. Grant permissions (adjust based on your Neon setup)
-- Note: Neon may handle permissions differently than Supabase
-- You may need to adjust these based on your specific Neon configuration

-- 10. Insert sample data for testing (optional)
INSERT INTO daily_david_entries_dev (date_key, user_id, data_content) 
VALUES (
    '2024-01-15', 
    'test@example.com',
    '{"scripture": "John 3:16", "observation": "God so loved the world", "application": "Share this love", "prayer": "Thank you for your love"}'
) ON CONFLICT (date_key, user_id) DO NOTHING;

-- Success message
SELECT 'Neon database setup complete! Tables created: daily_david_entries_dev, daily_david_entries' as status;
