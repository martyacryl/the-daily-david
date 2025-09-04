-- Fix RLS Policies for Marriage Meeting Tool
-- This script ensures users can access their own data from any device

-- First, enable RLS on the table if not already enabled
ALTER TABLE marriage_meetings ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be blocking access
DROP POLICY IF EXISTS "Users can view own data" ON marriage_meetings;
DROP POLICY IF EXISTS "Users can insert own data" ON marriage_meetings;
DROP POLICY IF EXISTS "Users can update own data" ON marriage_meetings;
DROP POLICY IF EXISTS "Users can delete own data" ON marriage_meetings;

-- Create policy for users to view their own data
CREATE POLICY "Users can view own data" ON marriage_meetings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert own data" ON marriage_meetings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON marriage_meetings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own data
CREATE POLICY "Users can delete own data" ON marriage_meetings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'marriage_meetings';

-- Test the policies by checking if they exist
SELECT 
    p.policyname,
    p.cmd,
    p.permissive,
    p.roles,
    p.qual,
    p.with_check
FROM pg_policies p
WHERE p.tablename = 'marriage_meetings';
