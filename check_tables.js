// Check all tables in Supabase database
const SUPABASE_URL = 'https://baipdmbxmlywavyxkjbf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXBkbWJ4bWx5d2F2eXhramJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjc2MTcsImV4cCI6MjA3MDYwMzYxN30.EswsvKg3tXe6QoysWhF7JVqfLbGV7f2vFs0hQJgLeE0';

async function checkAllTables() {
  console.log('🔍 Checking all database tables...');
  
  const tables = [
    'user_profiles',
    'subscribers', 
    'tasks',
    'task_bids',
    'chat_messages',
    'reviews',
    'notifications',
    'profiles'
  ];
  
  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${table}: Table exists and accessible`);
      } else {
        const error = await response.text();
        console.log(`❌ ${table}: ${error}`);
      }
    } catch (err) {
      console.log(`💥 ${table}: ${err.message}`);
    }
  }
}

checkAllTables();
