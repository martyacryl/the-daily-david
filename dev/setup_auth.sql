-- Setup Authentication for The Daily David App
-- Run this in your Supabase SQL editor

-- 1. Enable Row Level Security (RLS) on the existing table
ALTER TABLE daily_david_entries_dev ENABLE ROW LEVEL SECURITY;

-- 2. Add user_id column to the existing table
ALTER TABLE daily_david_entries_dev 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 3. Create a unique constraint on date_key + user_id
ALTER TABLE daily_david_entries_dev 
ADD CONSTRAINT unique_date_user UNIQUE(date_key, user_id);

-- 4. Create RLS policy: users can only see their own data
CREATE POLICY "Users can only access their own data" ON daily_david_entries_dev
    FOR ALL USING (auth.uid()::text = user_id::text);

-- 5. Create a function to automatically set user_id on insert/update
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically set user_id
CREATE TRIGGER set_user_id_trigger
    BEFORE INSERT OR UPDATE ON daily_david_entries_dev
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id();

-- 7. Create admin user (replace with your email)
-- Note: You'll need to create this user through Supabase Auth first
-- Then run this to make them admin:
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{is_admin}', 'true')
-- WHERE email = 'your-email@example.com';

-- 8. Optional: Create a view for admins to see all data
CREATE OR REPLACE VIEW admin_all_entries AS
SELECT 
    e.*,
    u.email as user_email,
    u.raw_user_meta_data->>'display_name' as user_display_name
FROM daily_david_entries_dev e
JOIN auth.users u ON e.user_id = u.id;

-- 9. Grant access to the view (only for authenticated users)
GRANT SELECT ON admin_all_entries TO authenticated;

-- 10. Create RLS policy for admin view
CREATE POLICY "Admins can see all data" ON daily_david_entries_dev
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );
