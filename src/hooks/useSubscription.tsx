import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchSubscriptionStatus(user.id);
      } else {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchSubscriptionStatus(session.user.id);
        } else {
          setUser(null);
          setSubscriptionStatus('free');
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchSubscriptionStatus = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        setSubscriptionStatus('free');
      } else {
        // Determine status based on subscribed flag and tier
        if (data?.subscribed && data?.subscription_tier) {
          setSubscriptionStatus('active');
        } else {
          setSubscriptionStatus('free');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setSubscriptionStatus('free');
    } finally {
      setLoading(false);
    }
  };

  const isPro = subscriptionStatus === 'active';
  const isFreePlan = subscriptionStatus === 'free' || !subscriptionStatus;

  return {
    user,
    subscriptionStatus,
    isPro,
    isFreePlan,
    loading,
    refetch: () => user && fetchSubscriptionStatus(user.id),
  };
};
