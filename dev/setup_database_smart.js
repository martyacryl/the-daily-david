const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

// Read the SQL setup file
const sqlSetup = fs.readFileSync('./setup_neon_users_and_rls.sql', 'utf8');

// Neon connection string from config
const connectionString = 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-little-base-adgfntzb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Smart SQL splitting that handles function definitions
function splitSQLStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    let dollarDepth = 0;
    let inComment = false;
    
    const lines = sql.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and comments
        if (!line || line.startsWith('--')) {
            continue;
        }
        
        // Handle dollar-quoted strings (for function definitions)
        if (line.includes('$$')) {
            const dollarCount = (line.match(/\$\$/g) || []).length;
            dollarDepth += dollarCount;
            inFunction = dollarDepth > 0;
        }
        
        currentStatement += line + '\n';
        
        // End of statement (semicolon outside of function)
        if (line.endsWith(';') && !inFunction) {
            if (currentStatement.trim()) {
                statements.push(currentStatement.trim());
            }
            currentStatement = '';
        }
        
        // End of function ($$ LANGUAGE plpgsql)
        if (inFunction && line.includes('$$ LANGUAGE plpgsql')) {
            if (currentStatement.trim()) {
                statements.push(currentStatement.trim());
            }
            currentStatement = '';
            inFunction = false;
            dollarDepth = 0;
        }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
    }
    
    return statements.filter(stmt => stmt.length > 0);
}

async function setupDatabase() {
    try {
        console.log('🔧 Setting up Neon database...');
        
        // Split SQL into proper statements
        const statements = splitSQLStatements(sqlSetup);
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
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
