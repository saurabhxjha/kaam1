// Migration script to create user_profiles table in Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://baipdmbxmlywavyxkjbf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXBkbWJ4bWx5d2F2eXhramJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyNzYxNywiZXhwIjoyMDcwNjAzNjE3fQ.BZhKSEWQKnmWUYoGjwqcNIhI3HO1FnQUWvJQ3aPK2GM'; // Service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
-- User profiles table for JodKaam (Final Version)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  bio TEXT,
  skills TEXT,
  profile_image TEXT,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  subscription_type TEXT NOT NULL DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro')),
  tasks_posted_this_month INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "delete_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

-- Create RLS policies
CREATE POLICY "Users can read their own profile" ON public.user_profiles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile" ON public.user_profiles
FOR DELETE
USING (user_id = auth.uid());

-- Create or replace updated_at function
CREATE OR REPLACE FUNCTION public.handle_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_user_profiles_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completed ON public.user_profiles(profile_completed);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- Test query
SELECT 'user_profiles table created successfully!' as status;
`;

async function runMigration() {
  try {
    console.log('🚀 Starting migration...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Result:', data);
    
    // Test the table
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error('⚠️  Warning: Table created but test query failed:', testError);
    } else {
      console.log('✅ Table is accessible and ready to use!');
    }
    
  } catch (err) {
    console.error('💥 Migration error:', err);
    process.exit(1);
  }
}

runMigration();
