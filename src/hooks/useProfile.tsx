import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export const useProfileCheck = (user: any) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      checkProfile();
    } else {
      setProfile(null);
      setProfileCompleted(false);
      setLoading(false);
    }
  }, [user]);

  const checkProfile = async () => {
    try {
      if (!user?.id) {
        setProfileCompleted(false);
        return;
      }

      // First try to get profile from Supabase
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile from database:', error);
        // Fallback to localStorage
        const profileKey = `profile_${user.id}`;
        const storedProfile = localStorage.getItem(profileKey);
        
        if (storedProfile) {
          const data = JSON.parse(storedProfile);
          setProfile(data);
          const isCompleted = !!(data.profile_completed && 
                                data.first_name && 
                                data.last_name && 
                                data.phone &&
                                data.first_name.trim() !== '' &&
                                data.last_name.trim() !== '' &&
                                data.phone.trim() !== '');
          setProfileCompleted(isCompleted);
        } else {
          setProfile(null);
          setProfileCompleted(false);
        }
        return;
      }

      if (profileData) {
        setProfile(profileData);
        // Check if profile is completed - all required fields must be filled
        const isCompleted = !!(profileData.profile_completed && 
                              profileData.first_name && 
                              profileData.last_name && 
                              profileData.phone &&
                              profileData.first_name.trim() !== '' &&
                              profileData.last_name.trim() !== '' &&
                              profileData.phone.trim() !== '');
        setProfileCompleted(isCompleted);
      } else {
        // Check localStorage as fallback for existing users
        const profileKey = `profile_${user.id}`;
        const storedProfile = localStorage.getItem(profileKey);
        
        if (storedProfile) {
          const data = JSON.parse(storedProfile);
          setProfile(data);
          const isCompleted = !!(data.profile_completed && 
                                data.first_name && 
                                data.last_name && 
                                data.phone &&
                                data.first_name.trim() !== '' &&
                                data.last_name.trim() !== '' &&
                                data.phone.trim() !== '');
          setProfileCompleted(isCompleted);
        } else {
          setProfile(null);
          setProfileCompleted(false);
        }
      }
    } catch (error) {
      console.error('Profile check failed:', error);
      setProfile(null);
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
      const updatedTaskCount = profile.tasks_posted_this_month + 1;

      // Update in Supabase first
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          tasks_posted_this_month: updatedTaskCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to increment task count in database:', error);
        // Fallback to localStorage
        const updatedProfile = {
          ...profile,
          tasks_posted_this_month: updatedTaskCount,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
      } else {
        // Update local state
        const updatedProfile = {
          ...profile,
          tasks_posted_this_month: updatedTaskCount,
          updated_at: new Date().toISOString()
        };
        setProfile(updatedProfile);
        
        // Also update localStorage for consistency
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
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
