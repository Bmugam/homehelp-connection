import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { apiService } from '../../../services/api';
import { Alert, AlertDescription } from '../../ui/alert';

const UserReviews = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('reviewBooking');
    
    if (bookingId) {
      fetchBookingDetails(bookingId);
    }
  }, []);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await apiService.bookings.getById(bookingId);
      setBookingDetails(response.data);
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Failed to load booking details');
    }
  };

  const handleSubmitReview = async () => {
    if (!bookingDetails) {
      setError('No booking selected for review');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.reviews.create({
        bookingId: bookingDetails.id,
        rating,
        comment
      });

      setSuccess('Review submitted successfully!');
      // Clear the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('reviewBooking');
      window.history.pushState({}, '', url);
      
      // Reset form
      setRating(5);
      setComment('');
      setBookingDetails(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">No Service Selected for Review</h2>
        <p className="text-gray-600 mb-6">Please select a completed service from your history to leave a review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
        <Button 
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">{bookingDetails.service_name}</h3>
              <p className="text-gray-600">Provider: {bookingDetails.provider_name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          value <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your experience with this service..."
                  className="min-h-[120px]"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmitReview}
                disabled={loading || !comment.trim()}
                className="w-full"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserReviews;
