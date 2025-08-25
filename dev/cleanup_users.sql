-- Clean up Daily David database - Remove test users, keep only admin
-- This removes the marriage meeting app users that were copied over

-- Remove test users (keep only admin)
DELETE FROM users WHERE email IN (
    'user1@example.com',
    'user2@example.com'
);

-- Verify only admin remains
SELECT 'Users after cleanup:' as status;
SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at;

-- Clean up any orphaned data entries
DELETE FROM daily_david_entries WHERE user_id NOT IN (
    SELECT id FROM users
);

-- Show final state
SELECT 'Final user count:' as status;
SELECT COUNT(*) as user_count FROM users;

SELECT 'Admin user details:' as status;
SELECT email, display_name, is_admin FROM users WHERE is_admin = true;
