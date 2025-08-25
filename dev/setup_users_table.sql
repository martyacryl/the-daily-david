-- Simple users table for cross-device user management
CREATE TABLE IF NOT EXISTS daily_david_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO daily_david_users (email, display_name, is_admin) 
VALUES ('admin@dailydavid.com', 'Admin User', true)
ON CONFLICT (email) DO NOTHING;

-- Insert some test users
INSERT INTO daily_david_users (email, display_name, is_admin) 
VALUES 
    ('user1@example.com', 'Test User 1', false),
    ('user2@example.com', 'Test User 2', false)
ON CONFLICT (email) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON daily_david_users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON daily_david_users(is_admin);
