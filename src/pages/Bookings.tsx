import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  providerId: string;
  serviceId: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  provider_name?: string;
  service_name?: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiService.bookings.getUserBookings();
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const getStatusIcon = (status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
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
        return null;
    }
  };

  const getStatusBadge = (status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const styles = {
      pending: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      confirmed: "bg-green-100 text-green-800 hover:bg-green-200",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-200"
    };
    
    return (
      <Badge className={`${styles[status]} capitalize cursor-pointer`} onClick={() => setFilterStatus(status === filterStatus ? null : status)}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredBookings = filterStatus 
    ? bookings.filter(booking => booking.status === filterStatus)
    : bookings;

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="text-gray-600 font-medium">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
        
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
      </div>
      
      {bookings.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8 px-6 flex flex-col items-center text-center">
            <CalendarIcon className="h-16 w-16 text-blue-500 mb-4" />
            <CardTitle className="text-2xl mb-2">No Active Bookings</CardTitle>
            <CardDescription className="text-lg mb-6">You don't have any bookings scheduled at the moment</CardDescription>
            <Button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              Browse Services <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.length === 0 ? (
            <Card className="border border-gray-200 shadow-sm p-6">
              <div className="text-center py-8">
                <p className="text-gray-600">No bookings match the selected filter</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilterStatus(null)}>
                  Show All Bookings
                </Button>
              </div>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div className={`
                  w-full h-1
                  ${booking.status === 'pending' ? 'bg-amber-500' : ''}
                  ${booking.status === 'confirmed' ? 'bg-green-500' : ''}
                  ${booking.status === 'completed' ? 'bg-blue-500' : ''}
                  ${booking.status === 'cancelled' ? 'bg-red-500' : ''}
                `}></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-gray-800 mb-1">
                        {booking.service_name || booking.serviceId}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {formatDate(booking.date)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 font-medium mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>Provider: {booking.provider_name || booking.providerId}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <>
                      <Button variant="outline" className="flex-1 bg-white hover:bg-gray-50">
                        Reschedule
                      </Button>
                      <Button variant="destructive" className="flex-1">
                        Cancel
                      </Button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Leave Review
                    </Button>
                  )}
                  {booking.status === 'cancelled' && (
                    <Button variant="outline" className="w-full">
                      Book Again
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;