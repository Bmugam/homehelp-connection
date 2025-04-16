import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { BookingType } from '../types';
import { apiService } from '../../../services/api';

const UserBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching user bookings...');
        const res = await apiService.bookings.getUserBookings();
        console.log('Raw API response:', res);

        // Validate the response structure
        if (!res || !res.data) {
          console.error('Invalid response structure:', res);
          throw new Error('Invalid response structure');
        }

        const bookingsData = res.data.map((booking: any) => {
          console.log('Processing booking:', booking);
          return {
            id: parseInt(booking.id),
            service: booking.service_name || booking.service || 'Unknown Service',
            provider: booking.provider_name || booking.business_name || 'Unknown Provider',
            date: booking.date,
            time: booking.time_slot || booking.time,
            status: booking.status,
            providerId: booking.provider_id,
            serviceId: booking.service_id,
            location: booking.location,
            notes: booking.notes
          };
        });

        console.log('Transformed bookings:', bookingsData);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleReschedule = async (bookingId: number) => {
    console.log('Attempting to reschedule booking:', bookingId);
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    const newTime = prompt('Enter new time (HH:mm):');
    if (!newDate || !newTime) return;

    const combinedDateTime = `${newDate}T${newTime}:00`;

    setLoading(true);
    setError(null);
    try {
      await apiService.bookings.update(bookingId.toString(), { date: combinedDateTime });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, date: combinedDateTime } : b));
    } catch (err) {
      setError('Failed to reschedule booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setLoading(true);
    setError(null);
    try {
      await apiService.bookings.cancel(bookingId.toString());
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      setError('Failed to cancel booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    navigate('/services');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-homehelp-900">My Bookings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-lg">{booking.service}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">Provider: {booking.provider}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {new Date(booking.date).toLocaleDateString()}
                    <Clock className="h-4 w-4 ml-3 mr-1" />
                    {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleReschedule(booking.id)} disabled={loading}>Reschedule</Button>
                    <Button variant="outline" size="sm" onClick={() => handleCancel(booking.id)} disabled={loading}>Cancel Booking</Button>
                    <Button size="sm" onClick={() => alert('Contact provider feature not implemented')}>Contact Provider</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">You don't have any upcoming bookings</p>
              <Button onClick={handleBookService}>Book a Service</Button>
            </div>
          )}
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBookings;
