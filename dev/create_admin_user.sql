-- Create Admin User for The Daily David App - PRODUCTION
-- Run this AFTER creating your user account in Supabase Auth

-- STEP 1: First create your user account through Supabase Dashboard:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add User" 
-- 3. Enter your email and password
-- 4. Click "Create User"

-- STEP 2: Then run this SQL to make yourself admin:
-- Replace 'your-email@example.com' with your actual email address

UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'), 
    '{is_admin}', 
    'true'
)
WHERE email = 'martystjohn@live.com';

-- STEP 3: Verify admin status (optional check)
SELECT 
    email,
    raw_user_meta_data->>'is_admin' as is_admin,
    created_at
FROM auth.users 
WHERE email = 'martystjohn@live.com';

-- Success message
SELECT 'Admin user created! You can now sign in and access the admin panel.' as status;

