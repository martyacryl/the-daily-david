// Check and fix admin user password
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkAndFixPassword() {
  try {
    console.log('🔍 Checking admin user password...\n')
    
    // Get the admin user
    const result = await pool.query(
      'SELECT id, email, display_name, password_hash, is_admin FROM users WHERE email = $1',
      ['stjohnashlynn@gmail.com']
    )
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found!')
      return
    }
    
    const user = result.rows[0]
    console.log('👤 Admin User Found:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Display Name: ${user.display_name}`)
    console.log(`   Is Admin: ${user.is_admin}`)
    console.log(`   Current Password Hash: ${user.password_hash}`)
    
    // Test current password
    const testPassword = 'admin123'
    const isValid = await bcrypt.compare(testPassword, user.password_hash)
    console.log(`\n🔐 Password Test:`)
    console.log(`   Testing password: ${testPassword}`)
    console.log(`   Is valid: ${isValid}`)
    
    if (!isValid) {
      console.log('\n🔧 Fixing password...')
      
      // Generate new hash for admin123
      const saltRounds = 10
      const newPasswordHash = await bcrypt.hash(testPassword, saltRounds)
      
      // Update the password
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, user.id]
      )
      
      console.log('✅ Password updated successfully!')
      console.log(`   New hash: ${newPasswordHash}`)
      
      // Verify the new password works
      const verifyResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [user.id]
      )
      
      const newHash = verifyResult.rows[0].password_hash
      const isNewPasswordValid = await bcrypt.compare(testPassword, newHash)
      console.log(`   Verification: ${isNewPasswordValid ? '✅ SUCCESS' : '❌ FAILED'}`)
      
    } else {
      console.log('✅ Password is already correct!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await pool.end()
  }
}

checkAndFixPassword()
