-- Fix the authenticate_user function to resolve ambiguous column references
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
        
        -- Return user info and session token with explicit table aliases
        RETURN QUERY
        SELECT 
            u.id AS user_id, 
            u.email AS email, 
            u.display_name AS display_name, 
            u.is_admin AS is_admin, 
            v_session_token AS session_token
        FROM users u
        WHERE u.id = v_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
