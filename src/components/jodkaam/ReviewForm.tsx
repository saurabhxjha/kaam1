import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReviewFormProps {
  taskId: string;
  revieweeId: string;
  revieweeName: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  taskId,
  revieweeId,
  revieweeName,
  onReviewSubmitted,
  onCancel
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          task_id: taskId,
          reviewer_id: user.user.id,
          reviewee_id: revieweeId,
          rating: rating,
          review_text: reviewText.trim() || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Review Submitted! ⭐",
        description: "Thank you for your feedback.",
      });

      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Review Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Rate {revieweeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">How was your experience?</p>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm font-medium">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Review (Optional)
          </label>
          <Textarea
            placeholder="Share your experience with this person..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {reviewText.length}/500 characters
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitReview}
          disabled={submitting || rating === 0}
          className="flex-1"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </CardFooter>
    </Card>
  );
};
