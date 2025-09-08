const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 'postgresql://neondb_owner:npg_L5ysD0JfHSFP@ep-little-base-adgfntzb-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function checkReadingPlan() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT date_key, data_content FROM daily_david_entries WHERE date_key = $1 ORDER BY created_at DESC LIMIT 1', ['2025-09-08']);
    
    if (result.rows.length > 0) {
      const data = result.rows[0].data_content;
      console.log('Latest entry data_content:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\nHas readingPlan:', !!data.readingPlan);
      if (data.readingPlan) {
        console.log('ReadingPlan data:', data.readingPlan);
      }
    } else {
      console.log('No entries found for 2025-09-08');
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkReadingPlan();
