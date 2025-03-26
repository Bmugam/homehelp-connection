
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookingType } from '../types';

interface UserBookingsProps {
  upcomingBookings: BookingType[];
}

const UserBookings = ({ upcomingBookings }: UserBookingsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-homehelp-900">My Bookings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map(booking => (
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
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button variant="outline" size="sm">Cancel Booking</Button>
                    <Button size="sm">Contact Provider</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">You don't have any upcoming bookings</p>
              <Button onClick={() => navigate('/services')}>Book a Service</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBookings;
