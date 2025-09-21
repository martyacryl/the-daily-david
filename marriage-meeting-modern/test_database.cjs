// Test script to verify database operations
const { Pool } = require('pg')

const connectionString = process.env.NEON_CONNECTION_STRING || 
  'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time')
    console.log('✅ Database connection successful:', result.rows[0].current_time)
    
    // Check existing tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log('📋 Existing tables:')
    tablesResult.rows.forEach(row => console.log('  -', row.table_name))
    
    // Check users table
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users')
    console.log('👥 Users count:', usersResult.rows[0].count)
    
    // Check marriage_meetings table
    const meetingsResult = await pool.query('SELECT COUNT(*) as count FROM marriage_meetings')
    console.log('💑 Marriage meetings count:', meetingsResult.rows[0].count)
    
    // Check goals table
    const goalsResult = await pool.query('SELECT COUNT(*) as count FROM goals')
    console.log('🎯 Goals count:', goalsResult.rows[0].count)
    
    // Test inserting a test marriage meeting
    console.log('🧪 Testing marriage meeting insert...')
    const testWeekKey = '2024-09-16' // Monday of current week
    const testData = {
      schedule: {
        Monday: ['Test meeting at 9am'],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
      },
      todos: [
        { id: 1, text: 'Test todo item', completed: false }
      ],
      prayers: [
        { id: 1, text: 'Test prayer request', completed: false, priority: 'high' }
      ],
      grocery: [],
      unconfessedSin: [],
      weeklyWinddown: [],
      encouragementNotes: [],
      calendarEvents: []
    }
    
    // Get first user ID for testing
    const userResult = await pool.query('SELECT id FROM users LIMIT 1')
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id
      console.log('👤 Using user ID for test:', userId)
      
      // Insert test data
      const insertResult = await pool.query(`
        INSERT INTO marriage_meetings (user_id, week_key, data_content)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, week_key) 
        DO UPDATE SET data_content = $3, updated_at = NOW()
        RETURNING id
      `, [userId, testWeekKey, JSON.stringify(testData)])
      
      console.log('✅ Test marriage meeting inserted/updated:', insertResult.rows[0].id)
      
      // Verify the data was saved
      const verifyResult = await pool.query(`
        SELECT data_content FROM marriage_meetings 
        WHERE user_id = $1 AND week_key = $2
      `, [userId, testWeekKey])
      
      if (verifyResult.rows.length > 0) {
        const savedData = verifyResult.rows[0].data_content
        console.log('✅ Data verification successful:')
        console.log('  - Schedule items:', Object.values(savedData.schedule || {}).flat().length)
        console.log('  - Todos:', savedData.todos?.length || 0)
        console.log('  - Prayers:', savedData.prayers?.length || 0)
      }
    } else {
      console.log('⚠️ No users found in database')
    }
    
    console.log('🎉 Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.error('Stack trace:', error.stack)
  } finally {
    await pool.end()
  }
}

testDatabase()

