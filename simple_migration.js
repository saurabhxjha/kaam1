// Simple migration using fetch API
const SUPABASE_URL = 'https://baipdmbxmlywavyxkjbf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaXBkbWJ4bWx5d2F2eXhramJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjc2MTcsImV4cCI6MjA3MDYwMzYxN30.EswsvKg3tXe6QoysWhF7JVqfLbGV7f2vFs0hQJgLeE0';

const migrationSQL = `
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

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

CREATE POLICY "Users can read their own profile" ON public.user_profiles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile" ON public.user_profiles
FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_user_profiles_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON public.user_profiles(subscription_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completed ON public.user_profiles(profile_completed);

GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
`;

async function runMigration() {
  try {
    console.log('🚀 Starting migration...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        sql: migrationSQL
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Migration failed:', error);
      console.log('🔧 Trying alternative approach...');
      
      // Alternative: Create table using POST to Supabase REST API
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          // This will fail but may show if table exists
        })
      });
      
      const createError = await createResponse.text();
      console.log('📋 Alternative response:', createError);
      
      if (createError.includes('relation "public.user_profiles" does not exist')) {
        console.log('⚠️  Table does not exist. Please run migration manually in Supabase dashboard.');
        console.log('📂 Open: https://supabase.com/dashboard/project/baipdmbxmlywavyxkjbf/sql');
        console.log('📋 Copy-paste the content from user_profiles_migration.sql');
      } else {
        console.log('✅ Table may already exist!');
      }
      
      return;
    }
    
    const result = await response.json();
    console.log('✅ Migration completed successfully!');
    console.log('📋 Result:', result);
    
  } catch (err) {
    console.error('💥 Migration error:', err.message);
    console.log('📋 Manual migration required.');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/baipdmbxmlywavyxkjbf/sql');
    console.log('📄 Copy content from: user_profiles_migration.sql');
  }
}

runMigration();
