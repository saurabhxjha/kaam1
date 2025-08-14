import { supabase } from '@/integrations/supabase/client';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'new_task' | 'new_bid' | 'task_assigned' | 'message' | 'task_completed' | 'bid_rejected';
  relatedTaskId?: string;
  relatedUserId?: string;
}

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  relatedTaskId,
  relatedUserId
}: CreateNotificationParams) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        notification_type: type,
        related_task_id: relatedTaskId || null,
        related_user_id: relatedUserId || null
      });

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }

    console.log('✅ Notification created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

// Helper functions for common notification scenarios

export const notifyNewBid = async (taskId: string, clientId: string, bidderId: string, bidAmount: number) => {
  try {
    // Get bidder name from user_profiles
    const { data: bidderProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', bidderId)
      .single();

    const bidderName = bidderProfile 
      ? `${bidderProfile.first_name} ${bidderProfile.last_name}`.trim()
      : 'Someone';

    // Get task title
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single();

    const taskTitle = task?.title || 'your task';

    return createNotification({
      userId: clientId,
      title: 'New Bid Received',
      message: `${bidderName} placed a bid of ₹${bidAmount} on "${taskTitle}"`,
      type: 'new_bid',
      relatedTaskId: taskId,
      relatedUserId: bidderId
    });
  } catch (error) {
    console.error('Error in notifyNewBid:', error);
    return { success: false, error };
  }
};

export const notifyTaskAssigned = async (taskId: string, workerId: string, bidAmount: number) => {
  try {
    // Get task title
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single();

    const taskTitle = task?.title || 'a task';

    return createNotification({
      userId: workerId,
      title: 'Task Assigned',
      message: `Congratulations! You have been assigned to work on "${taskTitle}" for ₹${bidAmount}`,
      type: 'task_assigned',
      relatedTaskId: taskId
    });
  } catch (error) {
    console.error('Error in notifyTaskAssigned:', error);
    return { success: false, error };
  }
};

export const notifyBidRejected = async (taskId: string, bidderId: string) => {
  try {
    // Get task title
    const { data: task } = await supabase
      .from('tasks')
      .select('title')
      .eq('id', taskId)
      .single();

    const taskTitle = task?.title || 'a task';

    return createNotification({
      userId: bidderId,
      title: 'Bid Not Selected',
      message: `Your bid for "${taskTitle}" was not selected. Don't worry, there are more opportunities!`,
      type: 'bid_rejected',
      relatedTaskId: taskId
    });
  } catch (error) {
    console.error('Error in notifyBidRejected:', error);
    return { success: false, error };
  }
};

export const notifyTaskCompleted = async (clientId: string, taskTitle: string, taskId: string) => {
  return createNotification({
    userId: clientId,
    title: 'Task Completed',
    message: `The task "${taskTitle}" has been completed`,
    type: 'task_completed',
    relatedTaskId: taskId
  });
};

export const notifyNewTask = async (workerId: string, taskTitle: string, taskId: string) => {
  return createNotification({
    userId: workerId,
    title: 'New Task Available',
    message: `A new task "${taskTitle}" is available in your area`,
    type: 'new_task',
    relatedTaskId: taskId
  });
};
