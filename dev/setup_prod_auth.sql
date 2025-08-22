-- Setup Authentication for The Daily David App - PRODUCTION
-- Run this in your PRODUCTION Supabase SQL editor

-- 1. Create the production table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS daily_david_entries (
    id BIGSERIAL PRIMARY KEY,
    date_key TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- 2. Enable Row Level Security (RLS) on the production table
ALTER TABLE daily_david_entries ENABLE ROW LEVEL SECURITY;

-- 3. Create a unique constraint on date_key + user_id
ALTER TABLE daily_david_entries 
ADD CONSTRAINT unique_date_user_prod UNIQUE(date_key, user_id);

-- 4. Create RLS policy: users can only see their own data
CREATE POLICY "Users can only access their own data" ON daily_david_entries
    FOR ALL USING (auth.uid()::text = user_id::text);

-- 5. Create a function to automatically set user_id on insert/update
CREATE OR REPLACE FUNCTION set_user_id_prod()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically set user_id
CREATE TRIGGER set_user_id_trigger_prod
    BEFORE INSERT OR UPDATE ON daily_david_entries
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_prod();

-- 7. Create admin user policy (for user management)
CREATE POLICY "Admins can see all data" ON daily_david_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- 8. Create a view for admins to see all data
CREATE OR REPLACE VIEW admin_all_entries_prod AS
SELECT 
    e.*,
    u.email as user_email,
    u.raw_user_meta_data->>'display_name' as user_display_name
FROM daily_david_entries e
JOIN auth.users u ON e.user_id = u.id;

-- 9. Grant access to the view (only for authenticated users)
GRANT SELECT ON admin_all_entries_prod TO authenticated;

-- 10. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create updated_at trigger
CREATE TRIGGER update_daily_david_entries_updated_at
    BEFORE UPDATE ON daily_david_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Enable email confirmations (optional - run in Auth settings or here)
-- This is typically done in the Supabase dashboard under Authentication > Settings

-- Success message
SELECT 'Production database setup complete! Next: Create your admin user.' as status;

