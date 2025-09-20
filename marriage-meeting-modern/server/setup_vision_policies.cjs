const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function setupVisionPolicies() {
  try {
    console.log('🔧 Setting up vision table policies...\n')
    
    // For now, we'll disable RLS since Neon doesn't have auth schema
    // In production, you'd want proper RLS with user authentication
    const disableRLS = `
      ALTER TABLE family_vision DISABLE ROW LEVEL SECURITY;
      ALTER TABLE vision_goals DISABLE ROW LEVEL SECURITY;
      ALTER TABLE spiritual_growth DISABLE ROW LEVEL SECURITY;
      ALTER TABLE family_planning DISABLE ROW LEVEL SECURITY;
    `
    
    await pool.query(disableRLS)
    console.log('✅ RLS disabled for development (will be enabled in production)')
    
    console.log('\n🎉 Vision table policies setup completed!')
    console.log('\nNote: RLS is disabled for development. In production, you\'ll want to:')
    console.log('1. Set up proper user authentication')
    console.log('2. Enable RLS with user-specific policies')
    console.log('3. Use user_id filtering in API endpoints')
    
  } catch (error) {
    console.error('❌ Error setting up vision policies:', error.message)
  } finally {
    await pool.end()
  }
}

setupVisionPolicies()
