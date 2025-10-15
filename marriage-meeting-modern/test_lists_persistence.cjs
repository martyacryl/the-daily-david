// Test script to verify lists persistence
const { Pool } = require('pg')

// Neon Database Connection
const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function testListsPersistence() {
  try {
    console.log('🔍 Testing lists persistence...')
    
    // Get the current week key
    const now = new Date()
    const day = now.getDay()
    const daysToSubtract = day === 0 ? 6 : day - 1
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToSubtract)
    const weekKey = monday.toISOString().split('T')[0]
    
    console.log('📅 Current week key:', weekKey)
    
    // Check if there's any data for this week
    const result = await pool.query(
      'SELECT * FROM marriage_meetings WHERE week_key = $1 ORDER BY updated_at DESC LIMIT 5',
      [weekKey]
    )
    
    console.log('📊 Found', result.rows.length, 'records for week', weekKey)
    
    if (result.rows.length > 0) {
      const latest = result.rows[0]
      console.log('📋 Latest record data_content keys:', Object.keys(latest.data_content))
      console.log('📋 Lists field exists:', 'lists' in latest.data_content)
      console.log('📋 Lists count:', latest.data_content.lists?.length || 0)
      
      if (latest.data_content.lists?.length > 0) {
        console.log('📋 Lists data:', JSON.stringify(latest.data_content.lists, null, 2))
      }
    }
    
    // Check all recent records
    const allResult = await pool.query(
      'SELECT week_key, data_content->\'lists\' as lists FROM marriage_meetings ORDER BY updated_at DESC LIMIT 10'
    )
    
    console.log('📊 Recent records with lists:')
    allResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. Week ${row.week_key}: ${row.lists?.length || 0} lists`)
    })
    
  } catch (error) {
    console.error('❌ Error testing lists persistence:', error)
  } finally {
    await pool.end()
  }
}

testListsPersistence()
