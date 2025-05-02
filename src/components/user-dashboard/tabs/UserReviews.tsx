import React, { useEffect, useState } from 'react';
import userService, { ReviewData } from '../../../services/userService';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/card';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { useToast } from '../../ui/use-toast';

interface ReviewFormProps {
  initialRating?: number;
  initialComment?: string;
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
  submitLabel: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }
    onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-semibold">Rating (1-5)</label>
        <Input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Comment</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  const [addingReview, setAddingReview] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getReviewsByClient();
      setReviews(data);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await userService.deleteReview(reviewId);
      toast({ title: 'Review deleted', description: 'The review was deleted successfully.' });
      fetchReviews();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete review.', variant: 'destructive' });
    }
  };

  const handleEdit = (review: ReviewData) => {
    setEditingReview(review);
    setAddingReview(false);
  };

  const handleCancel = () => {
    setEditingReview(null);
    setAddingReview(false);
  };

  const handleUpdate = async (rating: number, comment: string) => {
    if (!editingReview) return;
    try {
      await userService.updateReview(editingReview.id, { rating, comment });
      toast({ title: 'Review updated', description: 'The review was updated successfully.' });
      setEditingReview(null);
      fetchReviews();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update review.', variant: 'destructive' });
    }
  };

  const handleAdd = () => {
    setAddingReview(true);
    setEditingReview(null);
  };

  const handleCreate = async (rating: number, comment: string) => {
    // For simplicity, user must select bookingId from completed bookings to add review
    // Here we assume bookingId is known or selected elsewhere; for now, we use a placeholder
    const bookingId = window.prompt('Enter booking ID to review (must be completed booking):');
    if (!bookingId) {
      toast({ title: 'Error', description: 'Booking ID is required.', variant: 'destructive' });
      return;
    }
    try {
      await userService.createReview({ bookingId: Number(bookingId), rating, comment });
      toast({ title: 'Review created', description: 'The review was created successfully.' });
      setAddingReview(false);
      fetchReviews();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create review.', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Reviews</h2>
        {!addingReview && !editingReview && (
          <Button onClick={handleAdd}>Add Review</Button>
        )}
      </div>

      {(addingReview || editingReview) && (
        <Card>
          <CardContent>
            <ReviewForm
              initialRating={editingReview?.rating}
              initialComment={editingReview?.comment}
              onSubmit={editingReview ? handleUpdate : handleCreate}
              onCancel={handleCancel}
              submitLabel={editingReview ? 'Update Review' : 'Create Review'}
            />
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 && !addingReview && !editingReview && (
        <div>No reviews found.</div>
      )}

      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <CardTitle>
              {review.service_name} - {review.provider_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Rating: {review.rating}</p>
            <p>Comment: {review.comment}</p>
            <p>Date: {new Date(review.created_at).toLocaleDateString()}</p>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => handleEdit(review)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(review.id)}>
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default UserReviews;
