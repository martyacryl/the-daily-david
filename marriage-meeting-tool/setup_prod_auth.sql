-- Authentication Setup for Marriage Meeting Tool - PRODUCTION
-- Run this in your Supabase SQL editor to enable user authentication

-- Enable Row Level Security (RLS)
ALTER TABLE marriage_meetings ENABLE ROW LEVEL SECURITY;

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marriage_meetings' AND column_name = 'user_id') THEN
        ALTER TABLE marriage_meetings ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marriage_meetings' AND column_name = 'updated_at') THEN
        ALTER TABLE marriage_meetings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create unique constraint on week_key and user_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marriage_meetings_week_key_user_id_key') THEN
        ALTER TABLE marriage_meetings ADD CONSTRAINT marriage_meetings_week_key_user_id_key UNIQUE (week_key, user_id);
    END IF;
END $$;

-- Create RLS policies
-- Policy 1: Users can only see their own data
DROP POLICY IF EXISTS "Users can view own data" ON marriage_meetings;
CREATE POLICY "Users can view own data" ON marriage_meetings
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own data
DROP POLICY IF EXISTS "Users can insert own data" ON marriage_meetings;
CREATE POLICY "Users can insert own data" ON marriage_meetings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own data
DROP POLICY IF EXISTS "Users can update own data" ON marriage_meetings;
CREATE POLICY "Users can update own data" ON marriage_meetings
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own data
DROP POLICY IF EXISTS "Users can delete own data" ON marriage_meetings;
CREATE POLICY "Users can delete own data" ON marriage_meetings
    FOR DELETE USING (auth.uid() = user_id);

-- Policy 5: Admins can see all data (override)
DROP POLICY IF EXISTS "Admins can view all data" ON marriage_meetings;
CREATE POLICY "Admins can view all data" ON marriage_meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- Policy 6: Admins can modify all data (override)
DROP POLICY IF EXISTS "Admins can modify all data" ON marriage_meetings;
CREATE POLICY "Admins can modify all data" ON marriage_meetings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- Create trigger to automatically set user_id and updated_at
CREATE OR REPLACE FUNCTION set_user_id_and_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_user_id_and_updated_at_trigger ON marriage_meetings;

-- Create the trigger
CREATE TRIGGER set_user_id_and_updated_at_trigger
    BEFORE INSERT OR UPDATE ON marriage_meetings
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_and_updated_at();

-- Success message
SELECT 'Authentication setup completed successfully!' as status;
