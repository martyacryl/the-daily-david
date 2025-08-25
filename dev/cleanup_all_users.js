const { neon } = require('@neondatabase/serverless');

const connectionString = 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function cleanupAllUsers() {
    try {
        console.log('🧹 Cleaning up ALL users except Daily David admin...');
        
        const sql = neon(connectionString);
        
        // Remove ALL users except the Daily David admin
        await sql('DELETE FROM users WHERE email != \'admin@dailydavid.com\'');
        console.log('✅ All non-admin users removed');
        
        // Clean up orphaned data entries
        await sql('DELETE FROM daily_david_entries WHERE user_id NOT IN (SELECT id FROM users)');
        console.log('✅ Orphaned data entries cleaned up');
        
        // Show final state
        const users = await sql('SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY created_at');
        console.log('📋 Remaining users:', users);
        
        const userCount = await sql('SELECT COUNT(*) as user_count FROM users');
        console.log('📊 Total users:', userCount[0].user_count);
        
        console.log('🎉 Cleanup completed! Only Daily David admin remains.');
        console.log('📋 Login with: admin@dailydavid.com / admin123');
        console.log('📋 You can now create new users through the admin panel');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

cleanupAllUsers();
