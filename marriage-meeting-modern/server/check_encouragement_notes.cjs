const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkEncouragementNotes() {
  try {
    console.log('Checking for encouragement notes in marriage_meetings table...\n');
    
    const result = await pool.query(
      'SELECT week_key, data_content FROM marriage_meetings WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 3',
      ['8ce9f7b5-34ce-4f6b-87ef-ca0588710a72']
    );
    
    if (result.rows.length > 0) {
      result.rows.forEach((week, index) => {
        console.log(`--- Week ${index + 1}: ${week.week_key} ---`);
        console.log('Data content keys:', Object.keys(week.data_content));
        console.log('Encouragement notes:', week.data_content.encouragementNotes || 'NOT FOUND');
        console.log('');
      });
    } else {
      console.log('No data found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkEncouragementNotes();
