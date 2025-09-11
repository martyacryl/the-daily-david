const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function migrateGoals() {
  try {
    console.log('🔄 MIGRATING GOALS FROM WEEKLY DATA TO GOALS TABLE...\n')
    
    const userId = '8ce9f7b5-34ce-4f6b-87ef-ca0588710a72'
    
    // Get all weekly data with goals
    const result = await pool.query(
      'SELECT week_key, data_content FROM marriage_meetings WHERE user_id = $1 ORDER BY week_key DESC',
      [userId]
    )
    
    console.log(`Found ${result.rows.length} weeks of data`)
    
    const allGoals = new Map() // Use Map to deduplicate by text + timeframe
    
    result.rows.forEach(row => {
      const data = row.data_content
      if (data.goals && data.goals.length > 0) {
        data.goals.forEach(goal => {
          const key = `${goal.text}-${goal.timeframe}`
          if (!allGoals.has(key)) {
            allGoals.set(key, {
              text: goal.text,
              completed: goal.completed || false,
              timeframe: goal.timeframe || 'monthly',
              description: goal.description || '',
              priority: goal.priority || 'medium'
            })
          }
        })
      }
    })
    
    console.log(`Found ${allGoals.size} unique goals to migrate:`)
    allGoals.forEach((goal, key) => {
      console.log(`  - ${goal.text} (${goal.timeframe}) - ${goal.completed ? '✅' : '⏳'}`)
    })
    
    // Insert goals into new table
    for (const [key, goal] of allGoals) {
      try {
        const insertResult = await pool.query(
          `INSERT INTO goals (user_id, text, completed, timeframe, description, priority)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [userId, goal.text, goal.completed, goal.timeframe, goal.description, goal.priority]
        )
        
        if (insertResult.rows.length > 0) {
          console.log(`✅ Migrated: ${goal.text}`)
        } else {
          console.log(`⚠️  Already exists: ${goal.text}`)
        }
      } catch (error) {
        console.error(`❌ Error migrating ${goal.text}:`, error.message)
      }
    }
    
    // Verify migration
    const verifyResult = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY timeframe, created_at DESC',
      [userId]
    )
    
    console.log(`\n🎉 Migration complete! Goals in new table:`)
    verifyResult.rows.forEach(goal => {
      console.log(`  - ${goal.text} (${goal.timeframe}) - ${goal.completed ? '✅' : '⏳'}`)
    })
    
  } catch (error) {
    console.error('❌ Error migrating goals:', error.message)
  } finally {
    await pool.end()
  }
}

migrateGoals()
