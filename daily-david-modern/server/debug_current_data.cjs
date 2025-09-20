const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-little-base-adgfntzb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function debugCurrentData() {
  try {
    const client = await pool.connect()
    
    console.log('🔍 Checking current reading plan data for user 5d893914-0343-4373-ab16-ae835f9baf33...')
    
    // Get the most recent entry with reading plan data
    const entryResult = await client.query(
      `SELECT id, user_id, date_key, data_content 
       FROM daily_david_entries 
       WHERE user_id = '5d893914-0343-4373-ab16-ae835f9baf33' 
       AND data_content->>'readingPlan' IS NOT NULL
       ORDER BY updated_at DESC 
       LIMIT 3`
    )
    
    console.log('📅 Recent entries with reading plan data:', entryResult.rows.length)
    entryResult.rows.forEach((row, index) => {
      const dataContent = row.data_content || {}
      const readingPlan = dataContent.readingPlan || {}
      console.log(`Entry ${index + 1} (${row.date_key}):`, {
        currentDay: readingPlan.currentDay,
        totalDays: readingPlan.totalDays,
        completedDays: readingPlan.completedDays,
        planId: readingPlan.planId,
        planName: readingPlan.planName
      })
    })
    
    // Get reading_plans table data
    const readingPlansResult = await client.query(
      `SELECT * FROM reading_plans 
       WHERE user_id = '5d893914-0343-4373-ab16-ae835f9baf33' 
       ORDER BY updated_at DESC 
       LIMIT 3`
    )
    
    console.log('\n📚 Reading plans table data:', readingPlansResult.rows.length)
    readingPlansResult.rows.forEach((row, index) => {
      console.log(`Plan ${index + 1}:`, {
        plan_id: row.plan_id,
        plan_name: row.plan_name,
        current_day: row.current_day,
        total_days: row.total_days,
        completed_days: row.completed_days,
        updated_at: row.updated_at
      })
    })
    
    client.release()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

debugCurrentData()
