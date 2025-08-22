const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

// Read the SQL setup file
const sqlSetup = fs.readFileSync('./setup_neon_users_and_rls.sql', 'utf8');

// Neon connection string from config
const connectionString = 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-little-base-adgfntzb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setupDatabase() {
    try {
        console.log('🔧 Setting up Neon database...');
        
        // Split SQL into individual statements
        const statements = sqlSetup
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`\n📋 Executing statement ${i + 1}/${statements.length}:`);
                    console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
                    
                    const result = await neon(connectionString)(statement);
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                } catch (error) {
                    console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                    // Continue with other statements
                }
            }
        }
        
        console.log('\n🎉 Database setup completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Try logging in with admin@dailydavid.com / admin123');
        console.log('2. The admin panel should now work properly');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
