import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  reviewer: {
    first_name: string;
    last_name: string;
  };
  task: {
    title: string;
  };
}

interface ReviewsDisplayProps {
  userId: string;
  className?: string;
}

export const ReviewsDisplay: React.FC<ReviewsDisplayProps> = ({
  userId,
  className = ""
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [userId]);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          reviewer_id,
          task_id,
          profiles!reviews_reviewer_id_fkey(first_name, last_name),
          tasks(title)
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reviews:', error);
        setReviews([]);
        return;
      }

      const formattedReviews = (data || []).map((review: any) => ({
        id: review.id,
        rating: review.rating,
        review_text: review.review_text,
        created_at: review.created_at,
        reviewer: {
          first_name: review.profiles?.first_name || 'Anonymous',
          last_name: review.profiles?.last_name || 'User'
        },
        task: {
          title: review.tasks?.title || 'Task'
        }
      }));

      setReviews(formattedReviews);

      // Calculate average rating
      if (formattedReviews.length > 0) {
        const avg = formattedReviews.reduce((sum, review) => sum + review.rating, 0) / formattedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }

    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reviews ({reviews.length})</span>
          {reviews.length > 0 && (
            <div className="flex items-center space-x-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm font-medium">{averageRating}/5</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Complete tasks to start receiving reviews</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">
                      {review.reviewer.first_name} {review.reviewer.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.task.title}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(review.rating)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {review.review_text && (
                <p className="text-sm text-muted-foreground mt-2 pl-7">
                  "{review.review_text}"
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
