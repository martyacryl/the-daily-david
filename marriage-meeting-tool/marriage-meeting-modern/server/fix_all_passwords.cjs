// Fix all user passwords to use proper bcrypt hashing
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function fixAllPasswords() {
  try {
    console.log('🔍 Checking all user passwords...\n')
    
    // Get all users
    const result = await pool.query(
      'SELECT id, email, display_name, password_hash, is_admin FROM users ORDER BY created_at'
    )
    
    console.log(`👥 Found ${result.rows.length} users:`)
    
    for (const user of result.rows) {
      console.log(`\n👤 ${user.display_name || 'No name'} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Admin: ${user.is_admin ? 'Yes' : 'No'}`)
      console.log(`   Current Hash: ${user.password_hash}`)
      
      // Check if password is already properly hashed (starts with $2a$)
      const isProperlyHashed = user.password_hash.startsWith('$2a$')
      
      if (isProperlyHashed) {
        console.log('   ✅ Password is already properly hashed')
      } else {
        console.log('   🔧 Password needs to be hashed')
        
        // Use the plain text as the password and hash it
        const plainPassword = user.password_hash
        const saltRounds = 10
        const newPasswordHash = await bcrypt.hash(plainPassword, saltRounds)
        
        // Update the password
        await pool.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [newPasswordHash, user.id]
        )
        
        console.log(`   ✅ Password hashed successfully`)
        console.log(`   New hash: ${newPasswordHash}`)
        
        // Verify the new password works
        const isNewPasswordValid = await bcrypt.compare(plainPassword, newPasswordHash)
        console.log(`   Verification: ${isNewPasswordValid ? '✅ SUCCESS' : '❌ FAILED'}`)
      }
    }
    
    console.log('\n🎉 Password fix complete!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

fixAllPasswords()
