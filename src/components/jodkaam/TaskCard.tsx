import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Clock, DollarSign, User, MessageSquare, Star, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { notifyNewBid } from "@/lib/notifications";
import ChatWindow from "./ChatWindow";

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  locationAddress: string;
  distance?: number; // in meters
  clientName: string;
  clientRating: number;
  client_id?: string; // Add client_id for notifications
  createdAt: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

interface TaskCardProps {
  task: Task;
  onBid?: (taskId: string) => void;
  showBidButton?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onBid, showBidButton = true }) => {
  const { user } = useAuth();
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidding, setBidding] = useState(false);
  const [hasAlreadyBid, setHasAlreadyBid] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);

  useEffect(() => {
    if (user && task.id) {
      checkExistingBid();
    }
  }, [user, task.id]);

  const checkExistingBid = async () => {
    if (!user) return;
    
    try {
      const { data: existingBids, error } = await supabase
        .from('task_bids')
        .select('id')
        .eq('task_id', task.id)
        .eq('worker_id', user.id);

      if (!error && existingBids && existingBids.length > 0) {
        setHasAlreadyBid(true);
      }
    } catch (error) {
      console.error('Error checking existing bid:', error);
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return "";
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const formatBudget = (min?: number, max?: number) => {
    if (min && max) return `₹${min} - ₹${max}`;
    if (min) return `₹${min}+`;
    if (max) return `Up to ₹${max}`;
    return "Budget negotiable";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'normal': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'home': 'bg-blue-100 text-blue-800',
      'delivery': 'bg-green-100 text-green-800',
      'cleaning': 'bg-purple-100 text-purple-800',
      'tech': 'bg-orange-100 text-orange-800',
      'care': 'bg-pink-100 text-pink-800',
      'events': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['other'];
  };

  const handleBidSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bid on tasks.",
        variant: "destructive",
      });
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast({
        title: "Invalid Bid Amount",
        description: "Please enter a valid bid amount.",
        variant: "destructive",
      });
      return;
    }

    setBidding(true);
    try {
      console.log('Submitting bid for task:', task.id, 'client:', task.client_id);
      
      // Check if user has already bid on this task
      const { data: existingBids, error: checkError } = await supabase
        .from('task_bids')
        .select('id')
        .eq('task_id', task.id)
        .eq('worker_id', user.id);

      if (checkError) {
        console.error('Error checking existing bids:', checkError);
        throw new Error('Failed to check existing bids');
      }

      if (existingBids && existingBids.length > 0) {
        toast({
          title: "Already Bid",
          description: "You have already placed a bid on this task.",
          variant: "destructive",
        });
        return;
      }

      // Submit bid to Supabase
      const bidData = {
        task_id: task.id,
        worker_id: user.id,
        bid_amount: parseFloat(bidAmount),
        message: bidMessage.trim() || null,
        status: 'pending'
      };

      console.log('Bid data:', bidData);

      const { data: savedBid, error: bidError } = await supabase
        .from('task_bids')
        .insert(bidData)
        .select()
        .single();

      if (bidError) {
        console.error('Bid submission error:', bidError);
        throw new Error(`Failed to submit bid: ${bidError.message}`);
      }

      console.log('Bid submitted successfully:', savedBid);

      // Create notification for task poster (only if client_id exists)
      if (task.client_id) {
        await notifyNewBid(task.id, task.client_id, user.id, parseFloat(bidAmount));
      } else {
        console.warn('No client_id found for task:', task.id);
      }

      toast({
        title: "Bid Submitted!",
        description: `Your bid of ₹${bidAmount} has been sent to the client.`,
      });

      setShowBidDialog(false);
      setBidAmount("");
      setBidMessage("");
      onBid?.(task.id);
    } catch (error) {
      console.error('Bid submission failed:', error);
      toast({
        title: "Failed to Submit Bid",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBidding(false);
    }
  };

  return (
  <Card className="bg-white shadow hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <User className="h-4 w-4" />
              <span>{task.clientName}</span>
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="ml-1">{task.clientRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={getUrgencyColor(task.urgency)} className="text-xs">
              {task.urgency}
            </Badge>
            <Badge className={`text-xs ${getCategoryColor(task.category)}`}>
              {task.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-medium">{formatBudget(task.budgetMin, task.budgetMax)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>{task.locationAddress}</span>
          </div>
        </div>

        {task.distance && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDistance(task.distance)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Posted {new Date(task.createdAt).toLocaleDateString()}
          </span>

          {/* Bid button logic remains the same */}
          {showBidButton && task.status === 'open' && !hasAlreadyBid && (
            <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Bid on Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white shadow-xl border border-gray-200">
                <DialogHeader>
                  <DialogTitle>Submit Your Bid</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Your Bid Amount (₹)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter your bid amount"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message to Client</label>
                    <textarea
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      placeholder="Tell the client why you're the right person for this job..."
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleBidSubmit} 
                      disabled={!bidAmount || bidding}
                      className="flex-1"
                    >
                      {bidding ? "Submitting..." : "Submit Bid"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBidDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Always show chat button for all users except task owner (for owner, show info) */}
          {user?.id !== (task.client_id || task.clientId) ? (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowChatWindow(true)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              disabled
              onClick={() => {
                toast({
                  title: "Chat Unavailable",
                  description: "You can chat with workers after they bid on your task",
                  variant: "default",
                });
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat with Workers
            </Button>
          )}
        </div>
      </CardContent>
      
      {/* Chat Window */}
      {showChatWindow && task.client_id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white shadow-xl border border-gray-200 rounded-xl max-w-lg w-full mx-2">
            {/* ChatWindow content will be rendered here */}
            <ChatWindow
              taskId={task.id}
              receiverId={task.client_id}
              receiverName={task.clientName || "Client"}
              taskTitle={task.title}
              onClose={() => setShowChatWindow(false)}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default TaskCard;
