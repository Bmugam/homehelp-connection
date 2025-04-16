import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { BookingType } from '../types';
import { apiService } from '../../../services/api';

interface ApiBookingResponse {
  id: string;
  service?: { name: string };
  provider?: { name: string };
  date: string;
  time: string;
  status: string;
  providerId: string;
  serviceId: string;
  location: string;
  notes?: string;
}

interface DashboardOverviewProps {
  userName: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardOverview = ({
  userName,
  setActiveTab
}: DashboardOverviewProps) => {
  const navigate = useNavigate();
  const [upcomingBookings, setUpcomingBookings] = useState<BookingType[]>([]);
  const [serviceHistory, setServiceHistory] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await apiService.bookings.getUserBookings();
        const bookings = res.data as ApiBookingResponse[];

        const isValidBooking = (booking: unknown): booking is ApiBookingResponse => {
          if (!booking || typeof booking !== 'object') return false;
          const b = booking as Partial<ApiBookingResponse>;
          return (
            typeof b.id === 'string' &&
            typeof b.date === 'string' &&
            typeof b.time === 'string' &&
            typeof b.status === 'string' &&
            typeof b.providerId === 'string' &&
            typeof b.serviceId === 'string' &&
            typeof b.location === 'string'
          );
        };

        // Transform API response to match BookingType
        const transformBooking = (booking: ApiBookingResponse): BookingType => ({
          id: parseInt(booking.id),
          service: booking.service?.name ?? 'Unknown Service',
          provider: booking.provider?.name ?? 'Unknown Provider',
          date: booking.date,
          time: booking.time,
          status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
          providerId: booking.providerId,
          serviceId: booking.serviceId,
          location: booking.location,
          notes: booking.notes
        });

        const transformedBookings = bookings.map(transformBooking);
        const upcoming = transformedBookings.filter(b => !['completed', 'cancelled'].includes(b.status));
        const history = transformedBookings.filter(b => b.status === 'completed');

        setUpcomingBookings(upcoming);
        setServiceHistory(history);
      } catch (err) {
        setError('Failed to load bookings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-homehelp-900">Welcome back, {userName}!</h2>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-homehelp-600 to-homehelp-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle  className="text-lg">Book a Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90">Find the perfect service provider for your home needs.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="info" 
              className="w-full border-white text-white hover:bg-white hover:text-homehelp-800"
              onClick={() => {
                try {
                  navigate('/services');
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.href = '/services';
                }
              }}
            >
              Browse Services
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">You have {upcomingBookings.length} upcoming bookings.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setActiveTab('bookings')}
            >
              View Bookings
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Service History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">You've used {serviceHistory.length} services in the past.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setActiveTab('history')}
            >
              View History
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <CardDescription>Your upcoming service appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{booking.service}</h3>
                    <p className="text-sm text-gray-500">Provider: {booking.provider}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {new Date(booking.date).toLocaleDateString()}
                      <Clock className="h-4 w-4 ml-2 mr-1" />
                      {booking.time}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">No upcoming bookings</p>
          )}
        </CardContent>
        {upcomingBookings.length > 0 && (
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab('bookings')}>
              View All Bookings
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default DashboardOverview;
