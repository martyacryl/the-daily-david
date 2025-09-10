const { Pool } = require('pg')

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function deleteOrphanedSettings() {
  try {
    console.log('Deleting orphaned settings records with user_id: null...')
    
    // First, let's see what we're about to delete
    const checkResult = await pool.query(`
      SELECT id, settings_data, created_at 
      FROM user_settings 
      WHERE user_id IS NULL
    `)
    
    console.log(`Found ${checkResult.rows.length} orphaned settings records:`)
    checkResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}`)
      console.log(`     Spouse1: ${row.settings_data.spouse1?.name || 'N/A'}`)
      console.log(`     Created: ${row.created_at}`)
    })
    
    // Delete the orphaned records
    const deleteResult = await pool.query(`
      DELETE FROM user_settings 
      WHERE user_id IS NULL
    `)
    
    console.log(`\n✅ Deleted ${deleteResult.rowCount} orphaned settings records`)
    
    // Verify they're gone
    const verifyResult = await pool.query(`
      SELECT COUNT(*) FROM user_settings WHERE user_id IS NULL
    `)
    
    console.log(`Verification: ${verifyResult.rows[0].count} orphaned records remaining`)
    
    // Show remaining settings
    const remainingResult = await pool.query(`
      SELECT 
        us.id,
        us.user_id,
        u.email,
        us.settings_data,
        us.created_at
      FROM user_settings us
      LEFT JOIN users u ON us.user_id = u.id
      ORDER BY us.created_at DESC
    `)
    
    console.log(`\nRemaining settings records: ${remainingResult.rows.length}`)
    remainingResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. User: ${row.email || 'Unknown'} (${row.user_id})`)
      console.log(`     Spouse1: ${row.settings_data.spouse1?.name || 'N/A'}`)
      console.log(`     Created: ${row.created_at}`)
    })
    
  } catch (error) {
    console.error('❌ Error deleting orphaned settings:', error)
  } finally {
    await pool.end()
  }
}

deleteOrphanedSettings()
