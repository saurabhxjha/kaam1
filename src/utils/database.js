// Database initialization and migration utility
import { supabase } from './src/integrations/supabase/client.js';

async function createUserProfilesTable() {
  try {
    console.log('🚀 Checking if user_profiles table exists...');
    
    // Try to query the table - if it doesn't exist, this will fail
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('📋 Table does not exist. Manual migration required.');
      console.log('🔗 Please go to: https://supabase.com/dashboard/project/baipdmbxmlywavyxkjbf/sql');
      console.log('📄 And run the SQL from: user_profiles_migration.sql');
      return false;
    } else if (error) {
      console.log('⚠️  Unknown error:', error);
      return false;
    } else {
      console.log('✅ user_profiles table exists and is accessible!');
      return true;
    }
    
  } catch (err) {
    console.error('💥 Error checking table:', err);
    return false;
  }
}

// Test function to verify everything works
async function testDatabase() {
  const tableExists = await createUserProfilesTable();
  
  if (tableExists) {
    try {
      // Test insert with a dummy user ID (this will fail due to foreign key, but that's expected)
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: '123e4567-e89b-12d3-a456-426614174000', // dummy UUID
          first_name: 'Test',
          last_name: 'User',
          phone: '1234567890',
          profile_completed: true
        });
      
      if (error && error.code === '23503') {
        console.log('✅ Table structure is correct (foreign key constraint working)');
      } else if (error) {
        console.log('⚠️  Table exists but may have different structure:', error.message);
      } else {
        console.log('✅ Test insert successful');
        // Clean up test data
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', '123e4567-e89b-12d3-a456-426614174000');
      }
    } catch (err) {
      console.log('⚠️  Test insert failed:', err.message);
    }
  }
  
  return tableExists;
}

export { createUserProfilesTable, testDatabase };
