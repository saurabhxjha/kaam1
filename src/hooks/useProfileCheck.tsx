import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_completed: boolean;
  subscription_type: 'free' | 'pro';
  tasks_posted_this_month: number;
}

export const useProfileCheck = (user: any) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    try {
      // Get profile data
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile check error:', error);
        setProfileCompleted(false);
      } else if (data) {
        setProfile(data);
        setProfileCompleted(!!data.profile_completed && !!data.first_name && !!data.last_name && !!data.phone);
      } else {
        setProfileCompleted(false);
      }
    } catch (error) {
      console.error('Profile check failed:', error);
      setProfileCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const canPostTask = () => {
    if (!profile) return false;
    
    if (profile.subscription_type === 'pro') {
      return true; // Unlimited for pro users
    }
    
    // Free users: max 3 tasks per month
    return profile.tasks_posted_this_month < 3;
  };

  const getTasksRemaining = () => {
    if (!profile) return 0;
    
    if (profile.subscription_type === 'pro') {
      return -1; // Unlimited
    }
    
    return Math.max(0, 3 - profile.tasks_posted_this_month);
  };

  const incrementTaskCount = async () => {
    if (!profile || !user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          tasks_posted_this_month: profile.tasks_posted_this_month + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!error) {
        setProfile(prev => prev ? {
          ...prev,
          tasks_posted_this_month: prev.tasks_posted_this_month + 1
        } : null);
      }
    } catch (error) {
      console.error('Failed to increment task count:', error);
    }
  };

  const refreshProfile = () => {
    if (user) {
      checkProfile();
    }
  };

  return {
    profile,
    loading,
    profileCompleted,
    canPostTask: canPostTask(),
    tasksRemaining: getTasksRemaining(),
    incrementTaskCount,
    refreshProfile
  };
};
