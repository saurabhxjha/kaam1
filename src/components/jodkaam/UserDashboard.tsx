import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";
import { ReviewsDisplay } from "./ReviewsDisplay";
import TaskCompletionForm from "./TaskCompletionForm";
import TaskCompletionReview from "./TaskCompletionReview";
import { notifyTaskAssigned, notifyBidRejected } from "@/lib/notifications";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  MapPin, 
  Star, 
  MessageSquare,
  MessageCircle,
  User,
  TrendingUp,
  Calendar,
  Target,
  Send,
  Award,
  Briefcase
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import TaskCard from "./TaskCard";
import ChatWindow from "./ChatWindow";
import PostTaskForm from "./PostTaskForm";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  locationAddress: string;
  clientName?: string;
  workerName?: string;
  clientRating?: number;
  workerRating?: number;
  createdAt: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedAt?: string;
  completedAt?: string;
  client_id?: string; // Added for type safety
}

interface Bid {
  id: string;
  taskId: string;
  taskTitle: string;
  bidAmount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  clientName: string;
  bidderId?: string;
  bidderName?: string; // Added for type safety
}

interface TaskCompletion {
  id: string;
  task_id: string;
  worker_id: string;
  client_id: string;
  completion_note: string;
  completion_files: any[];
  submitted_at: string;
  client_approved: boolean;
  client_feedback: string | null;
  client_rating: number | null;
  status: string;
}

// Task Bids Section Component
const TaskBidsSection: React.FC<{
  taskId: string;
  onAccept: (bidId: string, taskId: string, bidderId: string, bidAmount: number) => void;
  onReject: (bidId: string, taskId: string, bidderId: string) => void;
}> = ({ taskId, onAccept, onReject }) => {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Optimistic update handlers
  const handleAcceptLocal = (bidId: string, taskId: string, bidderId: string, bidAmount: number) => {
    setBids((prevBids) =>
      prevBids.map((bid) => {
        const bidTaskId = bid.task_id || bid.taskId;
        if (bid.id === bidId) {
          return { ...bid, status: 'accepted' };
        } else if (bidTaskId === taskId && bid.id !== bidId) {
          return { ...bid, status: 'rejected' };
        } else {
          return bid;
        }
      })
    );
    onAccept(bidId, taskId, bidderId, bidAmount);
  };
  const handleRejectLocal = (bidId: string, taskId: string, bidderId: string) => {
    setBids((prevBids) =>
      prevBids.map((bid) =>
        bid.id === bidId ? { ...bid, status: 'rejected' } : bid
      )
    );
    onReject(bidId, taskId, bidderId);
  };

  useEffect(() => {
    loadBids();
  }, [taskId]);

  const loadBids = async () => {
    try {
      const { data: bidsData, error } = await supabase
        .from('task_bids')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading bids:', error);
        setBids([]);
      } else {
        // Fetch bidder names for each bid
        const bidsWithNames = await Promise.all((bidsData || []).map(async (bid) => {
          let bidderName = '';
          if (bid.worker_id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('first_name, last_name')
              .eq('user_id', bid.worker_id)
              .single();
            if (profile) {
              bidderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            }
          }
          return { ...bid, bidderName };
        }));
        setBids(bidsWithNames);
      }
    } catch (error) {
      console.error('Error loading bids:', error);
      setBids([]);
    } finally {
      setLoading(false);
    }
  }

  if (bids.length === 0) {
    return <p className="text-center text-muted-foreground py-4 border rounded-lg">No bids received yet</p>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {bids.map((bid) => (
  <div key={bid.id} className="border rounded-lg p-4 bg-white shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-sm">Bidder: {bid.bidderName || bid.worker_id}</p>
              <p className="text-sm text-muted-foreground mb-2">{bid.message || 'No message'}</p>
              <p className="font-semibold text-green-600">₹{bid.bid_amount}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(bid.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={getStatusColor(bid.status)}>
                {getStatusIcon(bid.status)}
                <span className="ml-1">{bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}</span>
              </Badge>
              
              {bid.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleAcceptLocal(bid.id, taskId, bid.worker_id, bid.bid_amount)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleRejectLocal(bid.id, taskId, bid.worker_id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfileCheck(user);
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ type: 'client' | 'worker', userId: string, taskId: string } | null>(null);
  const [chatTarget, setChatTarget] = useState<{ taskId: string, userId: string, userName: string, taskTitle: string } | null>(null);
  const [realStats, setRealStats] = useState<any>({});
  const [showPostTaskForm, setShowPostTaskForm] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [chatUnreadCounts, setChatUnreadCounts] = useState<Record<string, number>>({});
  const [taskBids, setTaskBids] = useState<Record<string, Bid[]>>({});

  useEffect(() => {
    loadDashboardData();
    fetchAllUnreadCounts();
    fetchChatUnreadCounts();
    // Optionally, poll unread counts every 10s
    const interval = setInterval(() => {
      fetchAllUnreadCounts();
      fetchChatUnreadCounts();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Recompute chat unread counts whenever tasks change (ensures we don't check an empty task list)
  useEffect(() => {
    if (!user) return;
    console.log('♻️ Tasks changed, recomputing unread counts. myTasks:', myTasks.map(t => t.id), 'assignedTasks:', assignedTasks.map(t => t.id));
    fetchChatUnreadCounts();
  }, [user, myTasks, assignedTasks]);

  // Fetch unread chat message counts for tasks
  const fetchChatUnreadCounts = async () => {
    if (!user) return;
    
    try {
      const newCounts: Record<string, number> = {};
      
      // Check unread messages for all tasks where user is involved
      const allTaskIds = [...myTasks.map(t => t.id), ...assignedTasks.map(t => t.id)];
      console.log('🔍 Checking unread counts for tasks:', allTaskIds);
      
      for (const taskId of allTaskIds) {
        // Check if chat_messages table exists first
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('task_id', taskId)
          .eq('receiver_id', user.id)
          .eq('is_read', false);
          
        if (!error && data) {
          newCounts[taskId] = data.length;
          console.log(`📨 Task ${taskId}: ${data.length} unread messages`);
        } else if (error && !error.message.includes('does not exist')) {
          console.error('Error checking unread messages for task', taskId, ':', error);
        }
      }
      
      console.log('🔴 Final unread counts:', newCounts);
      setChatUnreadCounts(newCounts);
    } catch (error) {
      console.error('Error fetching chat unread counts:', error);
      // Fallback: use notification-based unread count
      setChatUnreadCounts({});
    }
  };

  // Fetch unread counts for all relevant chats (for all posted tasks and bids)
  const fetchAllUnreadCounts = async () => {
    if (!user) return;
    const newCounts: Record<string, number> = {};
    // For tasks you posted (bids from workers)
    for (const task of myTasks) {
      if (task.id) {
        // All bids for this task
        const bids = taskBids[task.id] || [];
        for (const bid of bids) {
          if (bid.bidderId) {
            const count = await getUnreadCount(task.id, user.id, bid.bidderId);
            newCounts[`${task.id}_${bid.bidderId}`] = count;
          }
        }
      }
    }
    // For tasks you are working on (messages from client)
    for (const task of assignedTasks) {
      if (task.id && task.client_id) {
        const count = await getUnreadCount(task.id, user.id, task.client_id);
        newCounts[`${task.id}_${task.client_id}`] = count;
      }
    }
    setUnreadCounts(newCounts);
  };

  // Get unread count for a chat (taskId, receiverId = current user, senderId = other)
  const getUnreadCount = async (taskId: string, receiverId: string, senderId: string) => {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', taskId)
      .eq('receiver_id', receiverId)
      .eq('sender_id', senderId)
      .eq('is_read', false);
    return count || 0;
  };

  const handleAcceptBid = async (bidId: string, taskId: string, bidderId: string, bidAmount: number) => {
    try {
      // Update bid status to accepted
      const { error: bidUpdateError } = await supabase
        .from('task_bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      if (bidUpdateError) {
        console.error('Error accepting bid:', bidUpdateError);
        toast({
          title: "Error",
          description: "Failed to accept bid. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update task status to assigned
      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update({ 
          status: 'assigned',
          worker_id: bidderId 
        })
        .eq('id', taskId);

      if (taskUpdateError) {
        console.error('Error updating task:', taskUpdateError);
      }

      // Reject all other bids for this task
      const { error: rejectOthersError } = await supabase
        .from('task_bids')
        .update({ status: 'rejected' })
        .eq('task_id', taskId)
        .neq('id', bidId);

      if (rejectOthersError) {
        console.error('Error rejecting other bids:', rejectOthersError);
      }

      // Create notification for accepted bidder
      await notifyTaskAssigned(taskId, bidderId, bidAmount);

      toast({
        title: "Success",
        description: "Bid accepted successfully!",
      });

      // Reload data
      loadDashboardData();
    } catch (error) {
      console.error('Error accepting bid:', error);
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectBid = async (bidId: string, taskId: string, bidderId: string) => {
    try {
      const { error } = await supabase
        .from('task_bids')
        .update({ status: 'rejected' })
        .eq('id', bidId);

      if (error) {
        console.error('Error rejecting bid:', error);
        toast({
          title: "Error",
          description: "Failed to reject bid. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create notification for rejected bidder
      await notifyBidRejected(taskId, bidderId);

      toast({
        title: "Success",
        description: "Bid rejected successfully!",
      });

      // Reload data
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting bid:', error);
      toast({
        title: "Error",
        description: "Failed to reject bid. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadDashboardData = async () => {
  setLoading(true);
  try {
    if (!user) return;

    // Load real tasks from Supabase
    const { data: userTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    let myProfileName = 'You';
    if (user) {
      const { data: myProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();
      if (myProfile) {
        myProfileName = `${myProfile.first_name || ''} ${myProfile.last_name || ''}`.trim() || 'You';
      }
    }

    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
    } else {
      // Convert Supabase tasks to the expected format, always include client_id
      const convertedTasks = (userTasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        budgetMin: task.budget_min,
        budgetMax: task.budget_max,
        urgency: task.urgency,
        locationAddress: task.location_address,
        createdAt: task.created_at,
        status: task.status,
        assignedAt: task.assigned_at,
        completedAt: task.completed_at,
        client_id: task.client_id, // ensure client_id is present
        clientName: myProfileName,
        clientRating: 5.0
      }));

      setMyTasks(convertedTasks);
      console.log('✅ Loaded myTasks:', convertedTasks.map(t => t.id));
      // Calculate real stats
      setRealStats({
        totalTasksPosted: convertedTasks.length,
        activeTasks: convertedTasks.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status)).length,
        completedTasks: convertedTasks.filter(t => t.status === 'completed').length
      });
    }

    // For each posted task, fetch its bids and store in taskBids
    const bidsByTask: Record<string, Bid[]> = {};
    for (const task of userTasks || []) {
      const { data: bids, error: bidsError } = await supabase
        .from('task_bids')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });
      if (!bidsError && bids) {
        // For each bid, fetch bidder name
        const bidsWithNames = await Promise.all((bids || []).map(async (bid: any) => {
          let bidderName = '';
          if (bid.worker_id) {
            const { data: bidderProfile } = await supabase
              .from('user_profiles')
              .select('first_name, last_name')
              .eq('user_id', bid.worker_id)
              .single();
            if (bidderProfile) {
              bidderName = `${bidderProfile.first_name || ''} ${bidderProfile.last_name || ''}`.trim();
            }
          }
          return {
            id: bid.id,
            taskId: bid.task_id,
            taskTitle: task.title || '',
            bidAmount: bid.bid_amount,
            message: bid.message || '',
            status: bid.status,
            createdAt: bid.created_at,
            bidderId: bid.worker_id,
            bidderName,
            clientName: myProfileName
          };
        }));
        bidsByTask[task.id] = bidsWithNames;
      } else {
        bidsByTask[task.id] = [];
      }
    }
    setTaskBids(bidsByTask);

    // Load real bids from Supabase
    const { data: userBids, error: bidsError } = await supabase
      .from('task_bids')
      .select(`*, tasks!inner(title, budget_min, budget_max, client_id)`)
      .eq('worker_id', user.id)
      .order('created_at', { ascending: false });

    if (bidsError) {
      console.error('Error loading bids:', bidsError);
      setMyBids([]);
    } else {
      // Convert Supabase bids to the expected format
      // Get your own profile name for use as bidderName
      let myProfileName = 'You';
      if (user) {
        const { data: myProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();
        if (myProfile) {
          myProfileName = `${myProfile.first_name || ''} ${myProfile.last_name || ''}`.trim() || 'You';
        }
      }
      const convertedBids = await Promise.all((userBids || []).map(async (bid: any) => {
        let clientName = 'Client';
        if (bid.tasks?.client_id) {
          const { data: clientProfile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('user_id', bid.tasks.client_id)
            .single();
          if (clientProfile) {
            clientName = `${clientProfile.first_name || ''} ${clientProfile.last_name || ''}`.trim() || 'Client';
          }
        }
        return {
          id: bid.id,
          taskId: bid.task_id,
          taskTitle: bid.tasks?.title || 'Unknown Task',
          bidAmount: bid.bid_amount,
          message: bid.message || '',
          status: bid.status,
          createdAt: bid.created_at,
          clientName,
          bidderName: myProfileName
        };
      }));

      setMyBids(convertedBids);
    }

    // Load assigned tasks (tasks where user is the worker)
    const { data: assignedTasksData, error: assignedError } = await supabase
      .from('tasks')
      .select('*')
      .eq('worker_id', user.id)
      .order('created_at', { ascending: false });

    if (assignedError) {
      console.error('Error loading assigned tasks:', assignedError);
      setAssignedTasks([]);
    } else {
      // Convert assigned tasks to the expected format, always include client_id and fetch clientName
      const convertedAssignedTasks = await Promise.all(
        (assignedTasksData || []).map(async (task: any) => {
          let clientName = 'Client';
          if (task.client_id) {
            const { data: clientProfile } = await supabase
              .from('user_profiles')
              .select('first_name, last_name')
              .eq('user_id', task.client_id)
              .single();
            if (clientProfile) {
              clientName = `${clientProfile.first_name || ''} ${clientProfile.last_name || ''}`.trim() || 'Client';
            }
          }
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            category: task.category,
            budgetMin: task.budget_min,
            budgetMax: task.budget_max,
            urgency: task.urgency,
            locationAddress: task.location_address,
            createdAt: task.created_at,
            status: task.status,
            assignedAt: task.assigned_at,
            completedAt: task.completed_at,
            client_id: task.client_id,
            clientName,
            clientRating: 4.5
          };
        })
      );
      setAssignedTasks(convertedAssignedTasks);
      console.log('✅ Loaded assignedTasks:', convertedAssignedTasks.map(t => t.id));
    }

    if (userTasks && userTasks.length > 0) {
      toast({
        title: "Dashboard Loaded",
        description: `Found ${userTasks.length} tasks you've posted.`,
      });
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    toast({
      title: "Error Loading Dashboard",
      description: "Failed to load your dashboard data.",
      variant: "destructive",
    });
    // Set empty arrays on error
    setMyTasks([]);
    setMyBids([]);
    setAssignedTasks([]);
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'assigned': 
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': 
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateStats = () => {
    // Use real stats from database
    const totalTasksPosted = realStats.totalTasksPosted || myTasks.length;
    const activeTasks = realStats.activeTasks || myTasks.filter(t => ['open', 'assigned', 'in_progress'].includes(t.status)).length;
    const completedTasks = realStats.completedTasks || myTasks.filter(t => t.status === 'completed').length;
    const totalBids = myBids.length;
    const acceptedBids = myBids.filter(b => b.status === 'accepted').length;
    const tasksWorking = assignedTasks.filter(t => ['assigned', 'in_progress'].includes(t.status)).length;
    const totalBidsReceived = realStats.totalBidsReceived || 0;

    return {
      totalTasksPosted,
      activeTasks,
      completedTasks,
      totalBids,
      acceptedBids,
      tasksWorking,
      totalBidsReceived
    };
  };

  const stats = calculateStats();

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setReviewTarget(null);
    // Optionally reload data or show success message
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center p-8 glass-panel rounded-2xl shadow-soft">
          <div className="relative mb-6">
            <div className="w-16 h-16 animate-spin mx-auto border-4 border-primary/30 border-t-primary rounded-full"></div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-primary/20 animate-pulse"></div>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gradient-primary">Loading Dashboard</h3>
          <p className="text-muted-foreground text-sm">Fetching your tasks and bids...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 glass-panel rounded-2xl shadow-soft border-0">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your tasks and bids efficiently</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base">
              <Target className="w-4 h-4 mr-2" />
              Post New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">Post a New Task</DialogTitle>
            </DialogHeader>
            <PostTaskForm onTaskPosted={loadDashboardData} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <Card className="surface-card border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Tasks</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient-primary">{stats.totalTasksPosted}</p>
              </div>
              <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 mx-auto sm:mx-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Active</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient-primary">{stats.activeTasks}</p>
              </div>
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-600 mx-auto sm:mx-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Bids</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient-primary">{stats.totalBidsReceived}</p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 mx-auto sm:mx-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Done</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient-primary">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 mx-auto sm:mx-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Sent</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient-primary">{stats.totalBids}</p>
              </div>
              <Send className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 mx-auto sm:mx-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Won</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient-primary">{stats.acceptedBids}</p>
              </div>
              <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 mx-auto sm:mx-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card border-0 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Work</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gradient-primary">{stats.tasksWorking}</p>
              </div>
              <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-indigo-600 mx-auto sm:mx-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="my-bids">My Bids</TabsTrigger>
          <TabsTrigger value="working">Working On</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks Posted */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Tasks Posted</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {myTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-base text-gray-900">{task.title}</h4>
                        <p className="text-xs text-gray-500">{task.locationAddress}</p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">{task.status}</span>
                      </Badge>
                    </div>
                    {taskBids[task.id]?.length > 0 && (
                      <div className="mt-1 text-xs text-blue-700 font-medium">
                        <span className="font-semibold">Bidder:</span> {taskBids[task.id][0].bidderName || taskBids[task.id][0].bidderId}
                      </div>
                    )}
                  </div>
                ))}
                {myTasks.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No tasks posted yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Bids (received on your own tasks) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Bids</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 max-h-72 overflow-y-auto pr-2">
                {Object.values(taskBids)
                  .flat()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 3)
                  .map((bid) => (
                    <div key={bid.id} className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-base text-gray-900">{bid.taskTitle}</h4>
                          <p className="text-xs text-blue-700 mt-1 font-medium">Bidder: {bid.bidderName || bid.bidderId}</p>
                        </div>
                        <Badge className={getStatusColor(bid.status)}>
                          {getStatusIcon(bid.status)}
                          <span className="ml-1 capitalize">{bid.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground font-semibold">₹{bid.bidAmount}</span>
                        <span className="text-xs text-gray-500">{new Date(bid.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">Status: {bid.status}</div>
                    </div>
                  ))}
                {Object.values(taskBids).flat().length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No bids received yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="my-tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Posted Tasks</h2>
            <Button onClick={() => navigate('/browse')}>Post New Task</Button>
          </div>
          {myTasks.length > 0 ? (
            <div className="space-y-6">
              {myTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ₹{task.budgetMin} - ₹{task.budgetMax}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {task.locationAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{task.status}</span>
                        </Badge>
                        {/* Show delete icon if task is not assigned */}
                        {task.status !== 'assigned' && (
                          <button
                            title="Delete Task"
                            className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this task?')) {
                                const { error } = await supabase
                                  .from('tasks')
                                  .delete()
                                  .eq('id', task.id);
                                if (!error) {
                                  toast({ title: 'Task deleted', description: 'Your task has been deleted.' });
                                  loadDashboardData();
                                } else {
                                  toast({ title: 'Error', description: 'Failed to delete task.', variant: 'destructive' });
                                }
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Received Bids ({taskBids[task.id]?.length || 0})</h4>
                        <Button size="sm" variant="outline" onClick={() => loadDashboardData()}>
                          Refresh
                        </Button>
                      </div>
                      
                      {/* Simplified bid display with prominent buttons */}
                      {taskBids[task.id]?.length > 0 ? (
                        <>
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                            {taskBids[task.id].map((bid) => (
                              <div key={bid.id} className="border rounded-lg p-4 bg-white shadow">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">Bidder: {bid.bidderName || bid.bidderId}</p>
                                    <p className="text-sm text-muted-foreground mb-2">{bid.message || 'No message'}</p>
                                    <p className="font-semibold text-green-600">₹{bid.bidAmount}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(bid.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 ml-4">
                                    <Badge className={getStatusColor(bid.status)}>
                                      {getStatusIcon(bid.status)}
                                      <span className="ml-1">{bid.status}</span>
                                    </Badge>
                                    {bid.status === 'accepted' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="relative"
                                        onClick={() => setChatTarget({
                                          taskId: task.id,
                                          userId: bid.bidderId,
                                          userName: bid.bidderName || "Worker",
                                          taskTitle: task.title
                                        })}
                                      >
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        Chat
                                        {chatUnreadCounts[task.id] > 0 && (
                                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></div>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-muted-foreground py-8 border rounded-lg">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p>No bids received yet</p>
                          <p className="text-sm">Bids will appear here when freelancers respond to your task</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks posted yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by posting your first task to get help with your work.
                </p>
                <Button onClick={() => setShowPostTaskForm(true)}>Post Your First Task</Button>
      {/* Post Task Modal */}
      <Dialog open={showPostTaskForm} onOpenChange={setShowPostTaskForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">Post a New Task</DialogTitle>
          </DialogHeader>
          <PostTaskForm 
            onClose={() => setShowPostTaskForm(false)}
            onTaskPosted={() => {
              setShowPostTaskForm(false);
              loadDashboardData();
            }}
          />
        </DialogContent>
      </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-bids" className="space-y-4">
          <h2 className="text-xl font-semibold">My Bids</h2>
          {myBids.length > 0 ? (
            <div className="space-y-4">
              {myBids.map((bid) => (
                <Card key={bid.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{bid.taskTitle}</h3>
                        <p className="text-muted-foreground">Client: {bid.clientName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{bid.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ₹{bid.bidAmount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(bid.status)}>
                        {getStatusIcon(bid.status)}
                        <span className="ml-1">{bid.status}</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bids submitted yet</h3>
                <p className="text-muted-foreground mb-4">
                  Browse available tasks and submit your bids to start earning.
                </p>
                <Button>Browse Tasks</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="working" className="space-y-4">
          <h2 className="text-xl font-semibold">Tasks I'm Working On</h2>
          {assignedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedTasks.map((task) => (
                <div key={task.id} className="relative">
                  <TaskCard
                    task={{
                      ...task,
                      clientName: task.clientName || "Unknown client",
                      clientRating: task.clientRating || 0,
                      distance: undefined
                    }}
                    showBidButton={false}
                  />
                  {/* Chat button with unread indicator */}
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative"
                      onClick={() => setChatTarget({
                        taskId: task.id,
                        userId: task.client_id,
                        userName: task.clientName || "Client",
                        taskTitle: task.title
                      })}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Client
                      {chatUnreadCounts[task.id] > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active work</h3>
                <p className="text-muted-foreground mb-4">
                  You're not currently working on any tasks. Browse and bid on new tasks to start earning.
                </p>
                <Button>Browse Available Tasks</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          {reviewTarget && (
            <ReviewForm
              taskId={reviewTarget.taskId}
              revieweeId={reviewTarget.userId}
              revieweeName={reviewTarget.userName}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Window */}
      {chatTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ChatWindow
            taskId={chatTarget.taskId}
            receiverId={chatTarget.userId}
            receiverName={chatTarget.userName}
            taskTitle={chatTarget.taskTitle}
            onClose={() => setChatTarget(null)}
          />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
