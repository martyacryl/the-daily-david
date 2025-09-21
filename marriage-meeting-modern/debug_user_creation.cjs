const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function testUserCreation() {
  try {
    console.log('🧪 Testing user creation...');
    
    const email = 'testuser@example.com';
    const displayName = 'Test User';
    const password = 'test123';
    const isAdmin = false;
    
    console.log('🧪 User data:', { email, displayName, password: password ? '[REDACTED]' : 'MISSING', isAdmin });
    
    // Check if user exists
    console.log('🧪 Checking if user exists...');
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    console.log('🧪 Existing user check result:', existingUser.rows.length);
    
    if (existingUser.rows.length > 0) {
      console.log('🧪 User exists, deleting first...');
      await pool.query('DELETE FROM users WHERE email = $1', [email]);
    }
    
    // Hash password
    console.log('🧪 Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('🧪 Password hashed successfully');
    
    // Create user
    console.log('🧪 Inserting user...');
    const result = await pool.query(
      'INSERT INTO users (email, display_name, password_hash, is_admin, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, display_name, is_admin, created_at',
      [email, displayName, passwordHash, isAdmin || false]
    );
    console.log('🧪 User created successfully:', result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('🧪 Error creating user:', error);
    console.error('🧪 Error stack:', error.stack);
    process.exit(1);
  }
}

testUserCreation();
