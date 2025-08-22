-- Setup Authentication for The Daily David App - PRODUCTION (FIXED)
-- Run this in your PRODUCTION Supabase SQL editor

-- 1. Create the production table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS daily_david_entries (
    id BIGSERIAL PRIMARY KEY,
    date_key TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add user_id column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_david_entries' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE daily_david_entries ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. Enable Row Level Security (RLS) on the production table
ALTER TABLE daily_david_entries ENABLE ROW LEVEL SECURITY;

-- 4. Add unique constraint (drop first if exists to avoid conflicts)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_date_user_prod'
    ) THEN
        ALTER TABLE daily_david_entries 
        ADD CONSTRAINT unique_date_user_prod UNIQUE(date_key, user_id);
    END IF;
END $$;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can only access their own data" ON daily_david_entries;
DROP POLICY IF EXISTS "Admins can see all data" ON daily_david_entries;

-- 6. Create RLS policy: users can only see their own data
CREATE POLICY "Users can only access their own data" ON daily_david_entries
    FOR ALL USING (auth.uid() = user_id);

-- 7. Create admin policy (for user management)
CREATE POLICY "Admins can see all data" ON daily_david_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- 8. Create function to automatically set user_id (drop first if exists)
DROP FUNCTION IF EXISTS set_user_id_prod() CASCADE;

CREATE OR REPLACE FUNCTION set_user_id_prod()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger to automatically set user_id (drop first if exists)
DROP TRIGGER IF EXISTS set_user_id_trigger_prod ON daily_david_entries;

CREATE TRIGGER set_user_id_trigger_prod
    BEFORE INSERT OR UPDATE ON daily_david_entries
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_prod();

-- 10. Create updated_at function (drop first if exists)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create updated_at trigger (drop first if exists)
DROP TRIGGER IF EXISTS update_daily_david_entries_updated_at ON daily_david_entries;

CREATE TRIGGER update_daily_david_entries_updated_at
    BEFORE UPDATE ON daily_david_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Create admin view (drop first if exists)
DROP VIEW IF EXISTS admin_all_entries_prod;

CREATE VIEW admin_all_entries_prod AS
SELECT 
    e.*,
    u.email as user_email,
    u.raw_user_meta_data->>'display_name' as user_display_name
FROM daily_david_entries e
JOIN auth.users u ON e.user_id = u.id;

-- 13. Grant access to the view
GRANT SELECT ON admin_all_entries_prod TO authenticated;

-- Success message
SELECT 'Production database setup complete! Next: Create your admin user.' as status;
