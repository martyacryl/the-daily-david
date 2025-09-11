const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function showActualData() {
  try {
    console.log('🔍 SHOWING YOUR ACTUAL DATA...\n');
    
    // Get all your data
    const result = await pool.query(
      'SELECT week_key, data_content, created_at, updated_at FROM marriage_meetings_dev WHERE user_id = $1 ORDER BY week_key DESC',
      ['8ce9f7b5-34ce-4f6b-87ef-ca0588710a72']
    );
    
    console.log(`📊 Found ${result.rows.length} weeks of data for you:\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`=== WEEK ${index + 1}: ${row.week_key} ===`);
      console.log(`Created: ${row.created_at}`);
      console.log(`Updated: ${row.updated_at}`);
      
      const data = row.data_content;
      console.log('\n📅 SCHEDULE DATA:');
      if (data.schedule) {
        Object.keys(data.schedule).forEach(day => {
          const dayData = data.schedule[day];
          console.log(`  ${day}: [${dayData.length} items]`);
          dayData.forEach((item, i) => {
            console.log(`    [${i}]: "${item}"`);
          });
        });
      } else {
        console.log('  No schedule data');
      }
      
      console.log('\n📝 GOALS:');
      if (data.goals && data.goals.length > 0) {
        data.goals.forEach((goal, i) => {
          console.log(`  [${i}]: ${goal.text || goal.title || 'No text'}`);
        });
      } else {
        console.log('  No goals');
      }
      
      console.log('\n✅ TODOS:');
      if (data.todos && data.todos.length > 0) {
        data.todos.forEach((todo, i) => {
          console.log(`  [${i}]: ${todo.text || 'No text'}`);
        });
      } else {
        console.log('  No todos');
      }
      
      console.log('\n🛒 GROCERY:');
      if (data.grocery && data.grocery.length > 0) {
        data.grocery.forEach((item, i) => {
          console.log(`  [${i}]: ${item.text || 'No text'}`);
        });
      } else {
        console.log('  No grocery items');
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

showActualData();
