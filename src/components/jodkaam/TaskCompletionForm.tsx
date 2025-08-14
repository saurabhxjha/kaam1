import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, FileText, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TaskCompletionFormProps {
  taskId: string;
  taskTitle: string;
  clientId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const TaskCompletionForm: React.FC<TaskCompletionFormProps> = ({
  taskId,
  taskTitle,
  clientId,
  onSuccess,
  onClose,
}) => {
  const { user } = useAuth();
  const [completionNote, setCompletionNote] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!completionNote.trim()) {
      toast({
        title: "Completion Note Required",
        description: "Please provide details about your completed work",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting task completion:', {
        taskId,
        workerId: user.id,
        clientId,
        completionNote
      });

      // For now, we'll store file info as JSON, in production you'd upload to storage
      const fileInfo = files ? Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // In production: upload file and get URL
        url: 'placeholder-url'
      })) : [];

      const { data, error } = await supabase
        .from('task_completions')
        .insert({
          task_id: taskId,
          worker_id: user.id,
          client_id: clientId,
          completion_note: completionNote.trim(),
          completion_files: fileInfo,
          status: 'submitted'
        })
        .select();

      if (error) {
        console.error('Error submitting completion:', error);
        throw error;
      }

      console.log('Task completion submitted successfully:', data);

      toast({
        title: "Task Completion Submitted!",
        description: "Your completed work has been sent to the client for review.",
      });

      setCompletionNote('');
      setFiles(null);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit completion:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit completion",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <CardTitle>Submit Task Completion</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">{taskTitle}</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="completionNote">
              Completion Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="completionNote"
              placeholder="Describe what you've completed, any important notes, instructions for the client..."
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="files">Attach Files (Optional)</Label>
            <Input
              id="files"
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="mt-1"
            />
            {files && files.length > 0 && (
              <div className="mt-2 space-y-1">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Completion
                </>
              )}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskCompletionForm;
