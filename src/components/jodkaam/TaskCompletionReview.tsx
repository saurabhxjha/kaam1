import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Star, FileText, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

interface TaskCompletionReviewProps {
  completion: TaskCompletion;
  taskTitle: string;
  workerName: string;
  onUpdate?: () => void;
}

const TaskCompletionReview: React.FC<TaskCompletionReviewProps> = ({
  completion,
  taskTitle,
  workerName,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(completion.client_feedback || '');
  const [rating, setRating] = useState(completion.client_rating || 0);
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    if (!user || rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before approving the task",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('task_completions')
        .update({
          client_approved: true,
          client_feedback: feedback.trim() || null,
          client_rating: rating,
          approved_at: new Date().toISOString(),
          status: 'approved'
        })
        .eq('id', completion.id);

      if (error) throw error;

      toast({
        title: "Task Approved!",
        description: "The worker has been notified of your approval.",
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error approving task:', error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve task",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback when rejecting work",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('task_completions')
        .update({
          client_approved: false,
          client_feedback: feedback.trim(),
          status: 'revision_requested'
        })
        .eq('id', completion.id);

      if (error) throw error;

      toast({
        title: "Revision Requested",
        description: "The worker has been notified of your feedback.",
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to request revision",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approved</Badge>;
      case 'revision_requested':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Revision Requested</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Task Completion Review</CardTitle>
            <p className="text-sm text-muted-foreground">{taskTitle}</p>
            <p className="text-sm text-muted-foreground">by {workerName}</p>
          </div>
          {getStatusBadge(completion.status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Completion Details</Label>
          <div className="mt-1 p-3 bg-muted rounded-md">
            <p className="text-sm whitespace-pre-wrap">{completion.completion_note}</p>
          </div>
        </div>

        {completion.completion_files && completion.completion_files.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Attached Files</Label>
            <div className="mt-1 space-y-2">
              {completion.completion_files.map((file: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Submitted on {formatDate(completion.submitted_at)}
        </div>

        {completion.status === 'submitted' && user?.id === completion.client_id && (
          <>
            <Separator />
            
            <div>
              <Label htmlFor="rating">Rating (1-5 stars) *</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Provide feedback about the completed work..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleApprove}
                disabled={processing || rating === 0}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Complete
              </Button>
              <Button 
                variant="outline"
                onClick={handleReject}
                disabled={processing}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Request Revision
              </Button>
            </div>
          </>
        )}

        {completion.status === 'approved' && completion.client_rating && (
          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Task Approved</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= completion.client_rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({completion.client_rating}/5)
              </span>
            </div>
            {completion.client_feedback && (
              <p className="text-sm text-green-700 mt-2">{completion.client_feedback}</p>
            )}
          </div>
        )}

        {completion.status === 'revision_requested' && (
          <div className="bg-yellow-50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Revision Requested</span>
            </div>
            {completion.client_feedback && (
              <p className="text-sm text-yellow-700 mt-2">{completion.client_feedback}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCompletionReview;
