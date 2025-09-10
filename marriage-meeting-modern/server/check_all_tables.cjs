const { Pool } = require('pg')

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkAllTables() {
  try {
    console.log('Checking all tables in the database...\n')
    
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('Tables found:', tablesResult.rows.map(row => row.table_name))
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Check each table
    for (const table of tablesResult.rows) {
      const tableName = table.table_name
      console.log(`\n--- ${tableName.toUpperCase()} TABLE ---`)
      
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`)
        const count = countResult.rows[0].count
        console.log(`Total records: ${count}`)
        
        if (count > 0) {
          // Get sample records
          const sampleResult = await pool.query(`SELECT * FROM ${tableName} LIMIT 3`)
          console.log('Sample records:')
          sampleResult.rows.forEach((row, index) => {
            console.log(`  Record ${index + 1}:`, JSON.stringify(row, null, 2))
          })
        }
      } catch (error) {
        console.log(`Error reading ${tableName}:`, error.message)
      }
      
      console.log('\n' + '-'.repeat(30))
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error)
  } finally {
    await pool.end()
  }
}

checkAllTables()
