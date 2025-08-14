import { supabase } from '@/integrations/supabase/client';

// Test subscribers table functionality
export const testSubscribersTable = async () => {
  try {
    console.log('🔍 Testing subscribers table...');
    
    // Test 1: Check if table exists and is accessible
    const { data: testData, error: testError } = await supabase
      .from('subscribers')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Subscribers table error:', testError.message);
      return { 
        success: false, 
        error: 'Subscribers table not accessible: ' + testError.message,
        suggestions: [
          'Check if subscribers table exists in Supabase dashboard',
          'Verify RLS policies are correct',
          'Make sure user is authenticated'
        ]
      };
    }

    console.log('✅ Subscribers table is accessible');

    // Test 2: Try to get current user's subscription
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: true,
        message: 'Table accessible but no user logged in',
        tableStatus: 'working'
      };
    }

    const { data: subscription, error: subError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError && !subError.message.includes('No rows')) {
      console.error('❌ Error fetching subscription:', subError.message);
      return {
        success: false,
        error: 'Error fetching subscription: ' + subError.message
      };
    }

    if (!subscription) {
      console.log('⚠️ No subscription record found for user');
      return {
        success: true,
        message: 'Table working but no subscription record for current user',
        tableStatus: 'working',
        userSubscription: null,
        suggestion: 'User needs to subscribe or subscription record needs to be created'
      };
    }

    console.log('✅ Subscription record found:', subscription);
    return {
      success: true,
      message: 'Subscribers table working perfectly',
      tableStatus: 'working',
      userSubscription: subscription
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
