const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanEmptyScheduleItems() {
  try {
    console.log('Cleaning empty schedule items from database...\n');
    
    // Get all marriage meeting records
    const result = await pool.query(
      'SELECT id, week_key, data_content FROM marriage_meetings WHERE user_id = $1',
      ['8ce9f7b5-34ce-4f6b-87ef-ca0588710a72']
    );
    
    console.log(`Found ${result.rows.length} records to process`);
    
    for (const record of result.rows) {
      const dataContent = record.data_content;
      let hasChanges = false;
      
      // Clean schedule data
      if (dataContent.schedule) {
        const cleanedSchedule = {};
        Object.keys(dataContent.schedule).forEach(day => {
          const originalItems = dataContent.schedule[day];
          const cleanedItems = originalItems.filter(item => item && item.trim() !== '');
          
          if (cleanedItems.length !== originalItems.length) {
            hasChanges = true;
            console.log(`  ${record.week_key} - ${day}: Removed ${originalItems.length - cleanedItems.length} empty items`);
          }
          
          cleanedSchedule[day] = cleanedItems;
        });
        
        if (hasChanges) {
          dataContent.schedule = cleanedSchedule;
          
          // Update the record
          await pool.query(
            'UPDATE marriage_meetings SET data_content = $1, updated_at = NOW() WHERE id = $2',
            [dataContent, record.id]
          );
          
          console.log(`  ✅ Updated ${record.week_key}`);
        } else {
          console.log(`  ⏭️  No changes needed for ${record.week_key}`);
        }
      }
    }
    
    console.log('\n✅ Cleanup completed!');
    
  } catch (error) {
    console.error('Error cleaning schedule data:', error);
  } finally {
    await pool.end();
  }
}

cleanEmptyScheduleItems();
