// Check tasks table structure
const SUPABASE_URL = 'https://baipdmbxmlywavyxkjbf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXBkbWJ4bWx5d2F2eXhramJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjc2MTcsImV4cCI6MjA3MDYwMzYxN30.EswsvKg3tXe6QoysWhF7JVqfLbGV7f2vFs0hQJgLeE0';

async function checkTasksTable() {
  console.log('🔍 Checking tasks table structure...');
  
  try {
    // Try to get tasks with all expected columns
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=id,title,description,budget_min,budget_max,location_lat,location_lng,location_address,category,urgency,status,client_id,worker_id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Tasks table has proper structure');
    } else {
      const error = await response.text();
      console.log('❌ Tasks table structure issue:', error);
    }
  } catch (err) {
    console.log('💥 Error checking tasks table:', err.message);
  }
  
  // Check profiles table
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,email,full_name,bio,skills,phone,is_pro&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Profiles table has proper structure');
    } else {
      const error = await response.text();
      console.log('❌ Profiles table structure issue:', error);
    }
  } catch (err) {
    console.log('💥 Error checking profiles table:', err.message);
  }
}

checkTasksTable();
