const { neon } = require('@neondatabase/serverless');

const connectionString = 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-curly-bird-91689233-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
    try {
        console.log('🧪 Testing Neon connection...');
        
        // Test basic connection
        const sql = neon(connectionString);
        const result = await sql('SELECT 1 as test');
        console.log('✅ Basic connection test:', result);
        
        // Test users table
        const users = await sql('SELECT COUNT(*) as count FROM users');
        console.log('✅ Users table test:', users);
        
        // Test daily_david_entries table
        const entries = await sql('SELECT COUNT(*) as count FROM daily_david_entries');
        console.log('✅ Daily David entries table test:', entries);
        
        // Test admin user
        const admin = await sql('SELECT email, is_admin FROM users WHERE email = $1', ['admin@dailydavid.com']);
        console.log('✅ Admin user test:', admin);
        
        console.log('🎉 All tests passed! Neon connection is working properly.');
        
    } catch (error) {
        console.error('❌ Connection test failed:', error);
    }
}

testConnection();
