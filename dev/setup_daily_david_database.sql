-- Daily David Database Setup Script
-- Based on the working pattern from the marriage meeting tool

-- Create users table with proper UUID structure
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create daily_david_entries table for storing user data
CREATE TABLE IF NOT EXISTS daily_david_entries (
    id SERIAL PRIMARY KEY,
    date_key VARCHAR(10) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(date_key, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_daily_david_entries_user_date ON daily_david_entries(user_id, date_key);
CREATE INDEX IF NOT EXISTS idx_daily_david_entries_date ON daily_david_entries(date_key);

-- Insert default admin user
INSERT INTO users (email, display_name, password_hash, is_admin) 
VALUES ('admin@dailydavid.com', 'Admin User', 'admin123', true) 
ON CONFLICT (email) DO NOTHING;

-- Display created tables and users
SELECT 'Users table created successfully' as status;
SELECT 'Daily David entries table created successfully' as status;
SELECT 'Default admin user: admin@dailydavid.com (password: admin123)' as admin_info;
SELECT 'You can create new users through the admin panel after logging in' as next_steps;
