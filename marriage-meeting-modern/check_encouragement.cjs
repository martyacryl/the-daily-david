const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkEncouragement() {
  try {
    console.log('Checking encouragement notes in database...')
    
    const result = await pool.query(`
      SELECT week_key, data_content->'encouragementNotes' as encouragement_notes
      FROM marriage_meetings 
      WHERE week_key = '2025-09-08'
      ORDER BY updated_at DESC
      LIMIT 5
    `)
    
    console.log('Found', result.rows.length, 'records for week 2025-09-08')
    
    result.rows.forEach((row, index) => {
      console.log(`\nRecord ${index + 1}:`)
      console.log('Week key:', row.week_key)
      console.log('Encouragement notes:', JSON.stringify(row.encouragement_notes, null, 2))
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkEncouragement()
