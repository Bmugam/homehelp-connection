import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { BookingType } from '../types';

interface DashboardOverviewProps {
  userName: string;
  upcomingBookings: BookingType[];
  serviceHistory: BookingType[];
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardOverview = ({
  userName,
  upcomingBookings,
  serviceHistory,
  setActiveTab
}: DashboardOverviewProps) => {
  const navigate = useNavigate();
  
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
                  // Fallback navigation
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
                      {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
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
