const { neon } = require('@neondatabase/serverless');

const connectionString = 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-curly-bird-91689233-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testDirectAuth() {
    try {
        console.log('🔍 Testing direct Neon authentication...');
        
        // Test 1: Simple query to users table
        console.log('\n📋 Test 1: Check users table');
        const users = await neon(connectionString)('SELECT id, email, display_name, is_admin FROM users;');
        console.log('✅ Users found:', users);
        
        // Test 2: Direct authentication query
        console.log('\n🔐 Test 2: Direct auth query');
        const authResult = await neon(connectionString)(
            'SELECT id, email, display_name, is_admin FROM users WHERE email = $1 AND password_hash = $2 AND is_active = TRUE;',
            ['admin@dailydavid.com', 'admin123']
        );
        console.log('✅ Auth result:', authResult);
        
        if (authResult && authResult.length > 0) {
            console.log('\n🎉 Direct authentication works!');
            console.log('User:', authResult[0]);
            
            // Test 3: Create a simple session
            console.log('\n🔑 Test 3: Create session');
            const sessionToken = Math.random().toString(36).substring(2);
            const sessionResult = await neon(connectionString)(
                'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'24 hours\') RETURNING id;',
                [authResult[0].id, sessionToken]
            );
            console.log('✅ Session created:', sessionResult);
            
        } else {
            console.log('\n❌ Authentication failed - no user found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDirectAuth();
