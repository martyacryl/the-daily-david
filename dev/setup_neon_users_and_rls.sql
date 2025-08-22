-- User Management and Row Level Security (RLS) for Neon Database
-- This creates a proper user system with admin controls and data isolation

-- 1. Create users table for authentication and roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- In production, use proper password hashing
    display_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Create user_sessions table for managing active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- 3. Update the daily_david_entries table to use proper user_id references
ALTER TABLE daily_david_entries 
DROP CONSTRAINT IF EXISTS daily_david_entries_user_id_fkey;

ALTER TABLE daily_david_entries 
ADD CONSTRAINT daily_david_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Update the daily_david_entries_dev table similarly
ALTER TABLE daily_david_entries_dev 
DROP CONSTRAINT IF EXISTS daily_david_entries_dev_user_id_fkey;

ALTER TABLE daily_david_entries_dev 
ADD CONSTRAINT daily_david_entries_dev_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- 6. Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at_trigger ON users;
CREATE TRIGGER update_users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- 8. Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to create a new user
CREATE OR REPLACE FUNCTION create_user(
    p_email TEXT,
    p_password_hash TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    INSERT INTO users (email, password_hash, display_name, is_admin)
    VALUES (p_email, p_password_hash, p_display_name, p_is_admin)
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(
    p_email TEXT,
    p_password_hash TEXT
)
RETURNS TABLE(
    user_id INTEGER,
    email TEXT,
    display_name TEXT,
    is_admin BOOLEAN,
    session_token TEXT
) AS $$
DECLARE
    v_user_id INTEGER;
    v_session_token TEXT;
BEGIN
    -- Check if user exists and password matches
    SELECT id INTO v_user_id
    FROM users 
    WHERE email = p_email 
    AND password_hash = p_password_hash 
    AND is_active = TRUE;
    
    IF v_user_id IS NOT NULL THEN
        -- Generate session token (in production, use proper JWT or similar)
        v_session_token := encode(gen_random_bytes(32), 'hex');
        
        -- Create session
        INSERT INTO user_sessions (user_id, session_token, expires_at)
        VALUES (v_user_id, v_session_token, NOW() + INTERVAL '24 hours');
        
        -- Update last login
        UPDATE users SET last_login = NOW() WHERE id = v_user_id;
        
        -- Return user info and session token
        RETURN QUERY
        SELECT u.id, u.email, u.display_name, u.is_admin, v_session_token
        FROM users u
        WHERE u.id = v_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to validate session
CREATE OR REPLACE FUNCTION validate_session(p_session_token TEXT)
RETURNS TABLE(
    user_id INTEGER,
    email TEXT,
    display_name TEXT,
    is_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.display_name, u.is_admin
    FROM users u
    JOIN user_sessions s ON u.id = s.user_id
    WHERE s.session_token = p_session_token
    AND s.expires_at > NOW()
    AND u.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to get user's own data (RLS at application level)
CREATE OR REPLACE FUNCTION get_user_data(
    p_user_id INTEGER,
    p_session_token TEXT
)
RETURNS TABLE(
    date_key TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Validate session and user ownership
    IF EXISTS (
        SELECT 1 FROM user_sessions 
        WHERE user_id = p_user_id 
        AND session_token = p_session_token 
        AND expires_at > NOW()
    ) THEN
        RETURN QUERY
        SELECT e.date_key, e.data, e.created_at, e.updated_at
        FROM daily_david_entries e
        WHERE e.user_id = p_user_id
        ORDER BY e.date_key DESC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create function for admins to get all data
CREATE OR REPLACE FUNCTION admin_get_all_data(
    p_admin_session_token TEXT
)
RETURNS TABLE(
    user_id INTEGER,
    user_email TEXT,
    date_key TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Validate admin session
    IF EXISTS (
        SELECT 1 FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = p_admin_session_token
        AND s.expires_at > NOW()
        AND u.is_admin = TRUE
        AND u.is_active = TRUE
    ) THEN
        RETURN QUERY
        SELECT e.user_id, u.email, e.date_key, e.data, e.created_at, e.updated_at
        FROM daily_david_entries e
        JOIN users u ON e.user_id = u.id
        ORDER BY u.email, e.date_key DESC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Insert default admin user
INSERT INTO users (email, password_hash, display_name, is_admin) 
VALUES (
    'admin@dailydavid.com',
    'admin123', -- In production, use proper password hashing
    'System Administrator',
    TRUE
) ON CONFLICT (email) DO UPDATE SET 
    is_admin = TRUE,
    updated_at = NOW();

-- 15. Insert a few test users
INSERT INTO users (email, password_hash, display_name, is_admin) 
VALUES 
    ('user1@example.com', 'password123', 'Test User 1', FALSE),
    ('user2@example.com', 'password123', 'Test User 2', FALSE)
ON CONFLICT (email) DO NOTHING;

-- 16. Create view for admin user management
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.display_name,
    u.is_admin,
    u.is_active,
    u.created_at,
    u.last_login,
    COUNT(s.id) as active_sessions
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id AND s.expires_at > NOW()
GROUP BY u.id, u.email, u.display_name, u.is_admin, u.is_active, u.created_at, u.last_login;

-- 17. Grant permissions (adjust based on your Neon setup)
-- Note: Neon may handle permissions differently than traditional PostgreSQL
-- You may need to adjust these based on your specific Neon configuration

-- Success message
SELECT 'Neon user management and RLS setup complete!' as status;
SELECT 'Default admin: admin@dailydavid.com / admin123' as admin_credentials;
SELECT 'Test users: user1@example.com / password123, user2@example.com / password123' as test_users;
