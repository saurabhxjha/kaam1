import { supabase } from "@/integrations/supabase/client";

// Fallback storage using localStorage
const STORAGE_KEYS = {
  TASKS: 'jodkaam_tasks',
  USER_PROFILE: 'jodkaam_user_profile',
  APPLICATIONS: 'jodkaam_applications',
};

// Task storage functions with localStorage fallback
export const taskStorage = {
  // Get all tasks
  async getTasks() {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    return stored ? JSON.parse(stored) : [];
  },

  // Save a new task
  async saveTask(task: any) {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const taskWithId = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      user_id: user?.id || 'anonymous',
      status: 'open'
    };

    // Use localStorage for now
    const existingTasks = await this.getTasks();
    const updatedTasks = [taskWithId, ...existingTasks];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    return taskWithId;
  },

  // Update task status
  async updateTask(id: string, updates: any) {
    const existingTasks = await this.getTasks();
    const updatedTasks = existingTasks.map((task: any) => 
      task.id === id ? { ...task, ...updates } : task
    );
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    return updatedTasks.find((task: any) => task.id === id);
  },

  // Delete a task
  async deleteTask(id: string) {
    const existingTasks = await this.getTasks();
    const updatedTasks = existingTasks.filter((task: any) => task.id !== id);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    return true;
  }
};

// User profile storage with localStorage
export const profileStorage = {
  async getProfile(userId: string) {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return stored ? JSON.parse(stored) : null;
  },

  async saveProfile(profile: any) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return profile;
  }
};

// Application storage with localStorage
export const applicationStorage = {
  async getApplications() {
    const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return stored ? JSON.parse(stored) : [];
  },

  async saveApplication(application: any) {
    const appWithId = {
      ...application,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    const existingApps = await this.getApplications();
    const updatedApps = [appWithId, ...existingApps];
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApps));
    return appWithId;
  }
};

// Subscription storage using the existing 'subscribers' table
export const subscriptionStorage = {
  async getSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error) return data;
    } catch (error) {
      console.warn('Subscription fetch failed, using localStorage fallback');
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(`subscription_${userId}`);
    return stored ? JSON.parse(stored) : null;
  },

  async saveSubscription(subscription: any) {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .upsert([subscription])
        .select()
        .single();
      
      if (!error) return data;
    } catch (error) {
      console.warn('Subscription save failed, using localStorage fallback');
    }
    
    // Fallback to localStorage
    localStorage.setItem(`subscription_${subscription.user_id}`, JSON.stringify(subscription));
    return subscription;
  }
};
