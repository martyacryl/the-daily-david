const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkCurrentWeek() {
  try {
    console.log('🔍 CHECKING CURRENT WEEK 2025-09-08...\n');
    
    const result = await pool.query(
      'SELECT week_key, data_content, created_at, updated_at FROM marriage_meetings_dev WHERE user_id = $1 AND week_key = $2',
      ['8ce9f7b5-34ce-4f6b-87ef-ca0588710a72', '2025-09-08']
    );
    
    if (result.rows.length > 0) {
      console.log('📅 FOUND DATA FOR CURRENT WEEK 2025-09-08:');
      const data = result.rows[0].data_content;
      console.log('Thursday schedule:', JSON.stringify(data.schedule?.Thursday, null, 2));
    } else {
      console.log('❌ NO DATA FOUND FOR CURRENT WEEK 2025-09-08');
    }
    
    console.log('\n🔍 CHECKING ALL RECENT WEEKS:');
    const allResult = await pool.query(
      'SELECT week_key, data_content, created_at, updated_at FROM marriage_meetings_dev WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 5',
      ['8ce9f7b5-34ce-4f6b-87ef-ca0588710a72']
    );
    
    allResult.rows.forEach((row, index) => {
      console.log(`\nWeek ${index + 1}: ${row.week_key}`);
      console.log(`Updated: ${row.updated_at}`);
      const data = row.data_content;
      if (data.schedule?.Thursday) {
        console.log('Thursday:', JSON.stringify(data.schedule.Thursday, null, 2));
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCurrentWeek();
