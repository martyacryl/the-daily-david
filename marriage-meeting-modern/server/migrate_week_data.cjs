const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function migrateWeekData() {
  try {
    console.log('🔄 MIGRATING WEEK DATA FROM 2025-09-09 TO 2025-09-08...');
    
    // First, check if data exists in both weeks
    const oldWeekResult = await pool.query('SELECT * FROM marriage_meetings WHERE week_key = $1', ['2025-09-09']);
    const newWeekResult = await pool.query('SELECT * FROM marriage_meetings WHERE week_key = $1', ['2025-09-08']);
    
    if (oldWeekResult.rows.length === 0) {
      console.log('❌ No data found in 2025-09-09 to migrate');
      return;
    }
    
    if (newWeekResult.rows.length > 0) {
      console.log('⚠️  Data already exists in 2025-09-08. Updating existing data...');
      
      // Update existing data in 2025-09-08 with data from 2025-09-09
      const updateResult = await pool.query(
        'UPDATE marriage_meetings SET data_content = $1, updated_at = NOW() WHERE week_key = $2',
        [oldWeekResult.rows[0].data_content, '2025-09-08']
      );
      
      console.log('✅ Updated data in 2025-09-08');
    } else {
      console.log('📝 Creating new record in 2025-09-08...');
      
      // Insert new data into 2025-09-08
      const insertResult = await pool.query(
        'INSERT INTO marriage_meetings (week_key, user_id, data_content, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        ['2025-09-08', oldWeekResult.rows[0].user_id, oldWeekResult.rows[0].data_content]
      );
      
      console.log('✅ Created new record in 2025-09-08');
    }
    
    // Delete the old data from 2025-09-09
    const deleteResult = await pool.query('DELETE FROM marriage_meetings WHERE week_key = $1', ['2025-09-09']);
    console.log('🗑️  Deleted old data from 2025-09-09');
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error migrating week data:', error.message);
  } finally {
    await pool.end();
  }
}

migrateWeekData();
