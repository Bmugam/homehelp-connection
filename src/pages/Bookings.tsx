import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>No Active Bookings</CardTitle>
              <CardDescription>You don't have any active bookings at the moment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Browse our services to find the help you need for your home.</p>
            </CardContent>
            <CardFooter>
              <Button>Browse Services</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>{booking.service_name || booking.serviceId}</CardTitle>
                <CardDescription>
                  {new Date(booking.date).toLocaleDateString()} at {booking.time}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">Provider: {booking.provider_name || booking.providerId}</p>
                <p>Location: {booking.location}</p>
                <p>Status: {booking.status}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline">Reschedule</Button>
                <Button variant="destructive">Cancel</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
