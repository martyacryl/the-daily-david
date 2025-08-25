const { neon } = require('@neondatabase/serverless');

const connectionString = 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setupDatabase() {
    try {
        console.log('🔧 Setting up Daily David database...');
        
        // Create users table
        await neon(connectionString)('CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE NOT NULL, display_name VARCHAR(255) NOT NULL, password_hash VARCHAR(255) NOT NULL, is_admin BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());');
        console.log('✅ Users table created');
        
        // Create daily_david_entries table
        await neon(connectionString)('CREATE TABLE IF NOT EXISTS daily_david_entries (id SERIAL PRIMARY KEY, date_key VARCHAR(10) NOT NULL, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, data_content JSONB NOT NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(), UNIQUE(date_key, user_id));');
        console.log('✅ Daily David entries table created');
        
        // Create indexes
        await neon(connectionString)('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
        await neon(connectionString)('CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);');
        await neon(connectionString)('CREATE INDEX IF NOT EXISTS idx_daily_david_entries_user_date ON daily_david_entries(user_id, date_key);');
        await neon(connectionString)('CREATE INDEX IF NOT EXISTS idx_daily_david_entries_date ON daily_david_entries(date_key);');
        console.log('✅ Indexes created');
        
        // Insert admin user
        await neon(connectionString)('INSERT INTO users (email, display_name, password_hash, is_admin) VALUES (\'admin@dailydavid.com\', \'Admin User\', \'admin123\', true) ON CONFLICT (email) DO NOTHING;');
        console.log('✅ Admin user created');
        
        console.log('🎉 Database setup completed!');
        console.log('📋 Login credentials:');
        console.log('  Admin: admin@dailydavid.com / admin123');
        console.log('📋 You can create new users through the admin panel after logging in');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

setupDatabase();
