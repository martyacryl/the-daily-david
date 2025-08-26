const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

// Read the SQL setup file
const sqlSetup = fs.readFileSync('./setup_neon_users_and_rls.sql', 'utf8');

// Neon connection string from config
const connectionString = 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-curly-bird-91689233-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setupDatabase() {
    try {
        console.log('🔧 Setting up Neon database...');
        console.log('📝 Executing SQL setup file...');
        
        // Execute the entire SQL file as one statement
        const result = await neon(connectionString)(sqlSetup);
        
        console.log('✅ Database setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Try logging in with admin@dailydavid.com / admin123');
        console.log('2. The admin panel should now work properly');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
