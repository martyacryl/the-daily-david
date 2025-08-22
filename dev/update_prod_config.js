// Production Configuration Update for The Daily David App
// Replace the dev configuration in your index.html with this production config

// PRODUCTION Supabase Configuration
const supabaseUrl = 'YOUR_PRODUCTION_SUPABASE_URL'; // Replace with your production URL
const supabaseKey = 'YOUR_PRODUCTION_SUPABASE_ANON_KEY'; // Replace with your production anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// PRODUCTION TABLE NAME - Change from dev to production
const TABLE_NAME = 'daily_david_entries'; // Production table (not _dev)

// Example of what to replace in your index.html:
/*
REPLACE THIS (DEV CONFIG):
const supabaseUrl = 'https://gkmclzlgrcmqocfoxkui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWNsemxncmNtcW9jZm94a3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDYzNzEsImV4cCI6MjA3MTE4MjM3MX0.ovOR0iMGao5qvrAThrx8KucLyTctiRkVbNJvYdPEyk0';
const DEV_TABLE_NAME = 'daily_david_entries_dev';

WITH THIS (PROD CONFIG):
const supabaseUrl = 'YOUR_PRODUCTION_SUPABASE_URL';
const supabaseKey = 'YOUR_PRODUCTION_SUPABASE_ANON_KEY';
const TABLE_NAME = 'daily_david_entries';
*/

// Steps to get your production credentials:
// 1. Go to your Supabase dashboard
// 2. Select your production project
// 3. Go to Settings > API
// 4. Copy the "Project URL" (supabaseUrl)
// 5. Copy the "anon public" key (supabaseKey)

console.log('Production config loaded. Make sure to update the credentials!');

