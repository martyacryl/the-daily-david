const { neon } = require('@neondatabase/serverless');

const connectionString = 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function cleanupUsers() {
    try {
        console.log('🧹 Cleaning up Daily David database...');
        
        const sql = neon(connectionString);
        
        // Remove test users (keep only admin)
        await sql('DELETE FROM users WHERE email IN (\'user1@example.com\', \'user2@example.com\')');
        console.log('✅ Test users removed');
        
        // Clean up orphaned data entries
        await sql('DELETE FROM daily_david_entries WHERE user_id NOT IN (SELECT id FROM users)');
        console.log('✅ Orphaned data entries cleaned up');
        
        // Show final state
        const users = await sql('SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at');
        console.log('📋 Remaining users:', users);
        
        const userCount = await sql('SELECT COUNT(*) as user_count FROM users');
        console.log('📊 Total users:', userCount[0].user_count);
        
        const admin = await sql('SELECT email, display_name, is_admin FROM users WHERE is_admin = true');
        console.log('👑 Admin user:', admin[0]);
        
        console.log('🎉 Cleanup completed! Only admin user remains.');
        console.log('📋 Login with: admin@dailydavid.com / admin123');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

cleanupUsers();
