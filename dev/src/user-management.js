// User Management and Authentication for Neon Database
// This provides proper user management, authentication, and RLS functionality

class NeonUserManager {
    constructor(neonDB) {
        this.neonDB = neonDB;
        this.currentUser = null;
        this.sessionToken = null;
    }

    // Authenticate user with email and password
    async authenticateUser(email, password) {
        try {
            const query = `
                SELECT * FROM authenticate_user($1, $2)
            `;
            
            const result = await this.neonDB.executeQuery(query, [email, password]);
            
            if (result && Array.isArray(result) && result.length > 0) {
                const userData = result[0];
                
                // Store session token
                this.sessionToken = userData.session_token;
                
                // Create user object
                this.currentUser = {
                    id: userData.user_id,
                    email: userData.email,
                    display_name: userData.display_name,
                    is_admin: userData.is_admin
                };
                
                // Store in localStorage for persistence
                localStorage.setItem('neon_session_token', this.sessionToken);
                localStorage.setItem('neon_user_data', JSON.stringify(this.currentUser));
                
                console.log('✅ [NEON] User authenticated successfully:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                console.log('❌ [NEON] Authentication failed: Invalid credentials');
                return { success: false, error: 'Invalid email or password' };
            }
        } catch (error) {
            console.error('❌ [NEON] Authentication error:', error);
            return { success: false, error: error.message };
        }
    }

    // Validate existing session from localStorage
    async validateStoredSession() {
        try {
            const storedToken = localStorage.getItem('neon_session_token');
            const storedUser = localStorage.getItem('neon_user_data');
            
            if (!storedToken || !storedUser) {
                return { success: false, error: 'No stored session' };
            }
            
            const query = `
                SELECT * FROM validate_session($1)
            `;
            
            const result = await this.neonDB.executeQuery(query, [storedToken]);
            
            if (result && Array.isArray(result) && result.length > 0) {
                const userData = result[0];
                
                // Update current user
                this.currentUser = {
                    id: userData.user_id,
                    email: userData.email,
                    display_name: userData.display_name,
                    is_admin: userData.is_admin
                };
                this.sessionToken = storedToken;
                
                console.log('✅ [NEON] Stored session validated:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                // Clear invalid session
                this.clearSession();
                return { success: false, error: 'Session expired' };
            }
        } catch (error) {
            console.error('❌ [NEON] Session validation error:', error);
            this.clearSession();
            return { success: false, error: error.message };
        }
    }

    // Create a new user (admin only)
    async createUser(email, password, displayName, isAdmin = false) {
        if (!this.currentUser?.is_admin) {
            return { success: false, error: 'Admin access required' };
        }
        
        try {
            const query = `
                SELECT create_user($1, $2, $3, $4)
            `;
            
            const result = await this.neonDB.executeQuery(query, [email, password, displayName, isAdmin]);
            
            if (result && Array.isArray(result) && result.length > 0) {
                console.log('✅ [NEON] User created successfully');
                return { success: true, userId: result[0].create_user };
            } else {
                return { success: false, error: 'Failed to create user' };
            }
        } catch (error) {
            console.error('❌ [NEON] Create user error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all users (admin only)
    async getAllUsers() {
        if (!this.currentUser?.is_admin) {
            return { success: false, error: 'Admin access required' };
        }
        
        try {
            const query = `
                SELECT * FROM admin_users_view
            `;
            
            const result = await this.neonDB.executeQuery(query);
            
            if (result && Array.isArray(result)) {
                console.log('✅ [NEON] Users retrieved successfully');
                return { success: true, users: result };
            } else {
                return { success: false, error: 'Failed to retrieve users' };
            }
        } catch (error) {
            console.error('❌ [NEON] Get users error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user's own data with RLS
    async getUserData() {
        if (!this.currentUser || !this.sessionToken) {
            return { success: false, error: 'Not authenticated' };
        }
        
        try {
            const query = `
                SELECT * FROM get_user_data($1, $2)
            `;
            
            const result = await this.neonDB.executeQuery(query, [this.currentUser.id, this.sessionToken]);
            
            if (result && Array.isArray(result)) {
                console.log('✅ [NEON] User data retrieved successfully');
                return { success: true, data: result };
            } else {
                return { success: false, error: 'Failed to retrieve user data' };
            }
        } catch (error) {
            console.error('❌ [NEON] Get user data error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all data (admin only)
    async getAllData() {
        if (!this.currentUser?.is_admin || !this.sessionToken) {
            return { success: false, error: 'Admin access required' };
        }
        
        try {
            const query = `
                SELECT * FROM admin_get_all_data($1)
            `;
            
            const result = await this.neonDB.executeQuery(query, [this.sessionToken]);
            
            if (result && Array.isArray(result)) {
                console.log('✅ [NEON] All data retrieved successfully');
                return { success: true, data: result };
            } else {
                return { success: false, error: 'Failed to retrieve all data' };
            }
        } catch (error) {
            console.error('❌ [NEON] Get all data error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user data with RLS
    async updateUserData(dateKey, data) {
        if (!this.currentUser || !this.sessionToken) {
            return { success: false, error: 'Not authenticated' };
        }
        
        try {
            const query = `
                INSERT INTO daily_david_entries (date_key, user_id, data)
                VALUES ($1, $2, $3)
                ON CONFLICT (date_key, user_id) 
                DO UPDATE SET 
                    data = EXCLUDED.data,
                    updated_at = NOW()
                RETURNING id
            `;
            
            const result = await this.neonDB.executeQuery(query, [dateKey, this.currentUser.id, data]);
            
            if (result && Array.isArray(result) && result.length > 0) {
                console.log('✅ [NEON] User data updated successfully');
                return { success: true, id: result[0].id };
            } else {
                return { success: false, error: 'Failed to update user data' };
            }
        } catch (error) {
            console.error('❌ [NEON] Update user data error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out user
    async signOut() {
        try {
            if (this.sessionToken) {
                // In a real app, you'd invalidate the session on the server
                // For now, we'll just clear it locally
                console.log('✅ [NEON] User signed out');
            }
        } catch (error) {
            console.error('❌ [NEON] Sign out error:', error);
        } finally {
            this.clearSession();
        }
    }

    // Clear session data
    clearSession() {
        this.currentUser = null;
        this.sessionToken = null;
        localStorage.removeItem('neon_session_token');
        localStorage.removeItem('neon_user_data');
        console.log('✅ [NEON] Session cleared');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser && !!this.sessionToken;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser?.is_admin === true;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NeonUserManager };
} else {
    window.NeonUserManager = NeonUserManager;
}
