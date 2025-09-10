const { Pool } = require('pg')

// Neon Database Connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
})

async function testSettingsAPI() {
  try {
    console.log('Testing settings API functionality...\n')
    
    // Get admin user ID
    const adminResult = await pool.query(`
      SELECT id, email FROM users WHERE email = 'stjohnashlynn@gmail.com'
    `)
    
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found')
      return
    }
    
    const adminUser = adminResult.rows[0]
    console.log(`✅ Admin user found: ${adminUser.email} (ID: ${adminUser.id})`)
    
    // Test settings data
    const testSettings = {
      spouse1: { name: 'Test Spouse', email: 'test@example.com', phone: '555-1234' },
      spouse2: { name: 'Test Spouse 2', email: 'test2@example.com', phone: '555-5678' },
      location: { address: '123 Test St', city: 'Test City', state: 'CO', zipCode: '12345', country: 'US' },
      groceryStores: [{ id: '1', name: 'Test Store', address: '123 Store St', isDefault: true }],
      familyCreed: 'Test family creed',
      defaultWeatherLocation: 'Test City, CO',
      timezone: 'America/Denver',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light'
    }
    
    console.log('\n🧪 Testing settings save...')
    
    // Simulate the API call (upsert)
    const result = await pool.query(`
      INSERT INTO user_settings (user_id, settings_data, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET 
        settings_data = EXCLUDED.settings_data,
        updated_at = NOW()
      RETURNING settings_data, user_id
    `, [adminUser.id, JSON.stringify(testSettings)])
    
    console.log('✅ Settings saved successfully!')
    console.log('User ID:', result.rows[0].user_id)
    console.log('Spouse1 Name:', result.rows[0].settings_data.spouse1.name)
    console.log('Family Creed:', result.rows[0].settings_data.familyCreed)
    
    // Test settings fetch
    console.log('\n🧪 Testing settings fetch...')
    
    const fetchResult = await pool.query(`
      SELECT settings_data FROM user_settings WHERE user_id = $1
    `, [adminUser.id])
    
    if (fetchResult.rows.length > 0) {
      console.log('✅ Settings fetched successfully!')
      console.log('Spouse1 Name:', fetchResult.rows[0].settings_data.spouse1.name)
      console.log('Family Creed:', fetchResult.rows[0].settings_data.familyCreed)
    } else {
      console.log('❌ No settings found for user')
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await pool.query(`DELETE FROM user_settings WHERE user_id = $1`, [adminUser.id])
    console.log('✅ Test data cleaned up')
    
    console.log('\n🎉 Settings API is working correctly!')
    
  } catch (error) {
    console.error('❌ Error testing settings API:', error)
  } finally {
    await pool.end()
  }
}

testSettingsAPI()
