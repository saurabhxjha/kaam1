import { supabase } from '@/integrations/supabase/client';

// Function to check if task_applications table exists
export const checkTaskApplicationsExists = async () => {
  try {
    console.log('Checking if task_applications table exists...');
    
    // Try to query the table directly - if it fails, it doesn't exist
    const { data, error } = await supabase
      .from('task_applications' as any)
      .select('count')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('✅ task_applications table does not exist - already cleaned up!');
      return { exists: false, message: 'Table does not exist' };
    } else if (error) {
      console.log('Error checking table:', error.message);
      return { exists: 'unknown', error: error.message };
    } else {
      console.log('⚠️ task_applications table still exists and needs to be removed');
      return { exists: true, message: 'Table exists and should be removed' };
    }

  } catch (error) {
    console.error('Error:', error);
    return { exists: 'unknown', error: error.message };
  }
};

// Manual SQL to remove task_applications table
export const getCleanupSQL = () => {
  return `
-- Remove deprecated task_applications table
-- Run this in Supabase SQL Editor

DROP TABLE IF EXISTS public.task_applications CASCADE;

-- Verify cleanup
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%task%'
ORDER BY table_name;
  `;
};
