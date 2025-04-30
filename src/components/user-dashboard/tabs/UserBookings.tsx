import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDays, Clock, MessageCircle, RefreshCw, X, ChevronLeft, ChevronRight,
  MapPin, AlertCircle, CheckCircle, XCircle, Calendar as CalendarIcon, ArrowRight
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

// Define booking type
const BookingType = {
  id: '',
  providerId: '',
  serviceId: '',
  date: '',
  time: '',
  location: '',
  status: '',
  provider_name: '',
  business_name: '',
  service_name: '',
  notes: '',
  provider_details: null
};

const UserBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState(null);
  
  // Reschedule modal state
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // For review modal
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.bookings.getUserBookings();

      if (!res || !res.data) {
        throw new Error('Invalid response structure');
      }

      const bookingsData = res.data.map(booking => ({
        id: booking.id,
        providerId: booking.provider_id,
        serviceId: booking.service_id,
        date: booking.date,
        time: booking.time_slot || booking.time,
        location: booking.location || 'Location not specified',
        status: booking.status || 'pending',
        provider_name: booking.provider_name || 
                      (booking.provider && booking.provider.name) || 
                      booking.business_name || 
                      'Unknown Provider',
        service_name: booking.service_name || 
                     (booking.service && booking.service.name) || 
                     'Unknown Service',
        notes: booking.notes || '',
        provider_details: booking.provider ? {
          name: booking.provider.name,
          business_name: booking.provider.business_name,
          phone: booking.provider.phone
        } : null
      }));

      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (bookingId, currentDate, currentTime) => {
    setRescheduleBookingId(bookingId);
    setRescheduleDate(currentDate.split('T')[0]);
    const timeOnly = new Date(currentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setRescheduleTime(timeOnly);
  };

  const closeRescheduleModal = () => {
    setRescheduleBookingId(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleBookingId || !rescheduleDate || !rescheduleTime) {
      setError('Please provide both date and time.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiService.bookings.reschedule(rescheduleBookingId.toString(), rescheduleDate, rescheduleTime);
      setBookings(prev => prev.map(b => 
        b.id === rescheduleBookingId 
          ? { ...b, date: rescheduleDate, time: rescheduleTime, status: 'confirmed' } 
          : b
      ));
      closeRescheduleModal();
    } catch (err) {
      setError('Failed to reschedule booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setLoading(true);
    setError(null);
    try {
      await apiService.bookings.cancel(bookingId.toString());
      setBookings(prev => prev.map(b => 
        b.id === bookingId 
          ? { ...b, status: 'cancelled' } 
          : b
      ));
    } catch (err) {
      setError('Failed to cancel booking.');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (bookingId) => {
    setReviewBookingId(bookingId);
  };

  const closeReviewModal = () => {
    setReviewBookingId(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleReviewSubmit = async () => {
    if (!reviewBookingId) return;

    setLoading(true);
    setError(null);
    try {
      await apiService.reviews.create({
        bookingId: reviewBookingId,
        rating: reviewRating,
        comment: reviewComment
      });
      closeReviewModal();
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAgain = (booking) => {
    // Navigate to the service booking page with pre-filled data
    navigate(`/services/${booking.serviceId}/book`, { 
      state: { 
        providerId: booking.providerId,
        initialDate: new Date().toISOString().split('T')[0]
      } 
    });
  };

  const handleContactProvider = (booking) => {
    // Implementation depends on your app's communication features
    if (booking.provider_details?.phone) {
      window.open(`tel:${booking.provider_details.phone}`);
    } else {
      // Fallback to in-app messaging or notification
      alert('Contact provider feature not fully implemented');
    }
  };

  const handleBookService = () => {
    navigate('/services');
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Get status badge and icon
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      confirmed: "bg-green-100 text-green-800 hover:bg-green-200",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-200"
    };
    
    return (
      <Badge 
        className={`${styles[status] || styles.pending} capitalize cursor-pointer`} 
        onClick={() => setFilterStatus(status === filterStatus ? null : status)}
      >
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="text-amber-500" />;
      case 'confirmed':
        return <CheckCircle className="text-green-500" />;
      case 'completed':
        return <CheckCircle className="text-blue-500" />;
      case 'cancelled':
        return <XCircle className="text-red-500" />;
      default:
        return <AlertCircle className="text-gray-500" />;
    }
  };

  // Filter and paginate bookings
  const filteredBookings = filterStatus 
    ? bookings.filter(booking => booking.status === filterStatus)
    : bookings;

  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Skeleton loader for loading state
  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-4 w-32 mr-3" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-28" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <div className="flex items-center gap-2">
          {bookings.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={`${!filterStatus ? 'bg-gray-100' : ''}`}
                onClick={() => setFilterStatus(null)}
              >
                All
              </Button>
              {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                <Button 
                  key={status}
                  variant="outline" 
                  size="sm"
                  className={`${filterStatus === status ? 'bg-gray-100' : ''}`}
                  onClick={() => setFilterStatus(status === filterStatus ? null : status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchBookings} 
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
      
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl flex items-center">
            <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
            {filterStatus ? `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Appointments` : 'All Appointments'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {currentBookings.length > 0 ? (
            <div className="divide-y">
              {currentBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="p-4 md:p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <h3 className="font-medium text-lg text-blue-800">{booking.service_name}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <p className="text-gray-700 mb-2 font-medium">
                        Provider: <span className="text-gray-600 font-normal">
                          {booking.provider_details?.business_name || booking.provider_name}
                        </span>
                      </p>
                      
                      {booking.location && (
                        <div className="flex items-center text-gray-700 mb-2">
                          <MapPin className="h-4 w-4 mr-1.5 text-blue-500" />
                          <span className="text-gray-600">{booking.location}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mb-4 gap-2 sm:gap-4">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-1.5 text-blue-500" />
                          {formatDate(booking.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
                          {formatTime(booking.date)}
                        </div>
                      </div>
                      
                      {booking.notes && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                          <p className="font-medium mb-1">Notes:</p>
                          <p>{booking.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2">
                      {/* Actions based on booking status */}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openRescheduleModal(booking.id, booking.date, booking.time)} 
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>Reschedule</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancel(booking.id)} 
                            disabled={loading}
                            className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                            <span>Cancel</span>
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleContactProvider(booking)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>Contact</span>
                          </Button>
                        </>
                      )}
                      
                      {booking.status === 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => openReviewModal(booking.id)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>Leave Review</span>
                        </Button>
                      )}
                      
                      {booking.status === 'cancelled' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleBookAgain(booking)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Book Again</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <CalendarDays className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Appointments</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {filterStatus 
                  ? `You don't have any ${filterStatus} bookings.` 
                  : "You don't have any upcoming bookings. Would you like to schedule a service?"}
              </p>
              <Button 
                onClick={handleBookService}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Book a Service
              </Button>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mt-4 rounded-md">
              <p className="flex items-center">
                <X className="h-4 w-4 mr-2" />
                {error}
              </p>
            </div>
          )}
        </CardContent>
        
        {filteredBookings.length > itemsPerPage && (
          <CardFooter className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Reschedule Modal */}
      {rescheduleBookingId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Reschedule Booking</h3>
            <label className="block mb-2">
              <span className="text-gray-700">New Date:</span>
              <input 
                type="date" 
                value={rescheduleDate} 
                onChange={e => setRescheduleDate(e.target.value)} 
                className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
                min={new Date().toISOString().split('T')[0]}
              />
            </label>
            <label className="block mb-4">
              <span className="text-gray-700">New Time:</span>
              <input 
                type="time" 
                value={rescheduleTime} 
                onChange={e => setRescheduleTime(e.target.value)} 
                className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
              />
            </label>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeRescheduleModal}>Cancel</Button>
              <Button onClick={handleRescheduleSubmit} disabled={loading}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBookingId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Rating (1-5):</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl ${reviewRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <label className="block mb-4">
              <span className="text-gray-700">Comments:</span>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded px-3 py-2 h-24"
                placeholder="Share your experience..."
              />
            </label>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeReviewModal}>Cancel</Button>
              <Button onClick={handleReviewSubmit} disabled={loading}>Submit Review</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;