// Check existing data in marriage_meetings_dev table
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkExistingData() {
  try {
    console.log('🔍 Checking existing data in marriage_meetings_dev table...\n')
    
    // Check table structure
    console.log('📋 Table Structure:')
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'marriage_meetings_dev' 
      ORDER BY ordinal_position
    `)
    
    if (structureResult.rows.length === 0) {
      console.log('❌ Table marriage_meetings_dev does not exist!')
      return
    }
    
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
    })
    
    // Check existing data
    console.log('\n📊 Existing Data:')
    const dataResult = await pool.query(`
      SELECT 
        id,
        user_id,
        week_key,
        created_at,
        updated_at,
        jsonb_object_keys(data_content) as data_keys
      FROM marriage_meetings_dev 
      ORDER BY created_at DESC
    `)
    
    if (dataResult.rows.length === 0) {
      console.log('📭 No data found in marriage_meetings_dev table')
    } else {
      console.log(`📈 Found ${dataResult.rows.length} records:`)
      dataResult.rows.forEach((row, index) => {
        console.log(`\n  ${index + 1}. Record ID: ${row.id}`)
        console.log(`     User ID: ${row.user_id}`)
        console.log(`     Week Key: ${row.week_key}`)
        console.log(`     Created: ${row.created_at}`)
        console.log(`     Updated: ${row.updated_at}`)
        console.log(`     Data Keys: ${row.data_keys}`)
      })
    }
    
    // Check users table
    console.log('\n👥 Users in database:')
    const usersResult = await pool.query(`
      SELECT id, email, display_name, is_admin, created_at 
      FROM users 
      ORDER BY created_at DESC
    `)
    
    if (usersResult.rows.length === 0) {
      console.log('❌ No users found in users table')
    } else {
      console.log(`👤 Found ${usersResult.rows.length} users:`)
      usersResult.rows.forEach((user, index) => {
        console.log(`\n  ${index + 1}. ${user.display_name || 'No name'} (${user.email})`)
        console.log(`     ID: ${user.id}`)
        console.log(`     Admin: ${user.is_admin ? 'Yes' : 'No'}`)
        console.log(`     Created: ${user.created_at}`)
      })
    }
    
    // Check data for specific user (stjohnashlynn@gmail.com)
    console.log('\n🔍 Data for stjohnashlynn@gmail.com:')
    const userDataResult = await pool.query(`
      SELECT 
        mm.id,
        mm.week_key,
        mm.data_content,
        mm.created_at,
        mm.updated_at
      FROM marriage_meetings_dev mm
      JOIN users u ON mm.user_id = u.id
      WHERE u.email = 'stjohnashlynn@gmail.com'
      ORDER BY mm.week_key DESC
    `)
    
    if (userDataResult.rows.length === 0) {
      console.log('📭 No marriage meeting data found for stjohnashlynn@gmail.com')
    } else {
      console.log(`📅 Found ${userDataResult.rows.length} weeks of data:`)
      userDataResult.rows.forEach((row, index) => {
        console.log(`\n  ${index + 1}. Week: ${row.week_key}`)
        console.log(`     Created: ${row.created_at}`)
        console.log(`     Updated: ${row.updated_at}`)
        
        // Show data content structure
        if (row.data_content) {
          const dataKeys = Object.keys(row.data_content)
          console.log(`     Data sections: ${dataKeys.join(', ')}`)
          
          // Show sample data for each section
          dataKeys.forEach(key => {
            const sectionData = row.data_content[key]
            if (Array.isArray(sectionData)) {
              console.log(`       ${key}: ${sectionData.length} items`)
            } else if (typeof sectionData === 'object') {
              const subKeys = Object.keys(sectionData)
              console.log(`       ${key}: ${subKeys.join(', ')}`)
            }
          })
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message)
  } finally {
    await pool.end()
  }
}

checkExistingData()
