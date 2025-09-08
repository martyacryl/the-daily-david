#!/usr/bin/env node

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Marriage Meeting Tool Database...\n');

// Read the SQL setup file
const sqlPath = path.join(__dirname, 'setup_marriage_database.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('❌ setup_marriage_database.sql not found');
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Database connection
const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING || 
    'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('📡 Connecting to Neon database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Execute the SQL setup
    console.log('🔧 Creating marriage_meetings table...');
    await client.query(sqlContent);
    console.log('✅ Marriage meetings table created successfully');
    
    // Check if table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'marriage_meetings'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification: marriage_meetings table exists');
    } else {
      console.log('❌ Table verification failed: marriage_meetings table not found');
    }
    
    client.release();
    
    console.log('\n🎉 Database setup complete!');
    console.log('Your marriage meeting tool should now be able to save and retrieve data.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
