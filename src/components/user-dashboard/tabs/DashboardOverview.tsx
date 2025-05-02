import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Home, MapPin, User, Search, Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { BookingType } from '../types';
import { apiService } from '../../../services/api';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select } from '../../ui/select';

interface ApiBookingResponse {
  id: string;
  service_name?: string;
  provider_name?: string;
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage, setBookingsPerPage] = useState(3);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
          service: booking.service_name ?? 'Unknown Service',
          provider: booking.provider_name ?? 'Unknown Provider',
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

  // Filter bookings based on search query and status filter
  const filteredBookings = upcomingBookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get current bookings for pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Pagination controls
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-homehelp-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-homehelp-200 rounded mb-4"></div>
          <div className="text-homehelp-600">Loading bookings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg border border-red-200 flex flex-col items-center">
          <div className="text-xl mb-2">⚠️</div>
          <div>{error}</div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-homehelp-700 to-homehelp-900 text-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
            <p className="text-homehelp-100 mb-4 md:mb-0">
              Manage your home services and bookings from one place.
            </p>
          </div>
          <Button 
            className="bg-white text-homehelp-900 hover:bg-homehelp-100"
            onClick={() => navigate('/services')}
          >
            Book New Service
          </Button>
        </div>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-homehelp-600 to-homehelp-800 text-white shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Home className="w-5 h-5 mr-2 opacity-90" />
              Book a Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90">Find trusted professionals for all your home maintenance needs.</p>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-homehelp-500/20 to-transparent">
            <Button 
              className="w-full bg-white/20 hover:bg-white hover:text-homehelp-800 border border-white/30 transition-colors"
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
        
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-homehelp-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <CalendarDays className="w-5 h-5 mr-2 text-homehelp-500" />
              Upcoming Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active bookings</p>
              <p className="text-2xl font-semibold text-homehelp-700">{upcomingBookings.length}</p>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50">
            <Button 
              variant="ghost" 
              className="w-full hover:text-homehelp-700 hover:bg-homehelp-50"
              onClick={() => setActiveTab('bookings')}
            >
              View All Bookings
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-homehelp-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <User className="w-5 h-5 mr-2 text-homehelp-500" />
              Service History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Completed services</p>
              <p className="text-2xl font-semibold text-homehelp-700">{serviceHistory.length}</p>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50">
            <Button 
              variant="ghost" 
              className="w-full hover:text-homehelp-700 hover:bg-homehelp-50"
              onClick={() => setActiveTab('history')}
            >
              View History
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Upcoming Bookings */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <CardTitle className="text-xl">Upcoming Bookings</CardTitle>
              <CardDescription>Manage your upcoming service appointments</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search bookings..." 
                  className="pl-9 w-full sm:w-48"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  className="pl-9 rounded-md border border-gray-300 shadow-sm py-1.5 w-full sm:w-32 text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBookings.length > 0 ? (
            <div>
              {currentBookings.map((booking, index) => (
                <div key={booking.id} className={`p-4 ${index !== currentBookings.length - 1 ? 'border-b' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-lg">{booking.service}</h3>
                        <Badge className={`${getStatusBadgeStyle(booking.status)} border`}>
                          {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2 text-homehelp-500" />
                          <span>{booking.provider}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-homehelp-500" />
                          <span>{booking.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4 mr-2 text-homehelp-500" />
                          <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-homehelp-500" />
                          <span>{booking.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 self-end md:self-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        View Details
                      </Button>
                      {booking.status === 'pending' && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {filteredBookings.length > bookingsPerPage && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastBooking, filteredBookings.length)}
                    </span> of{" "}
                    <span className="font-medium">{filteredBookings.length}</span> bookings
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={prevPage} 
                      disabled={currentPage === 1}
                      className="w-8 h-8 p-0 flex items-center justify-center"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(i + 1)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === i + 1 
                            ? 'bg-homehelp-600' 
                            : 'hover:bg-homehelp-50'
                        }`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={nextPage} 
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 p-0 flex items-center justify-center"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                <CalendarDays className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming bookings</h3>
              <p className="text-gray-500 mb-4">Book a new service to get started</p>
              <Button onClick={() => navigate('/services')}>
                Browse Services
              </Button>
            </div>
          )}
        </CardContent>
        {upcomingBookings.length > 0 && (
          <CardFooter className="border-t bg-gray-50 flex justify-center">
            <Button 
              variant="ghost" 
              className="hover:bg-homehelp-50 hover:text-homehelp-700"
              onClick={() => setActiveTab('bookings')}
            >
              View All Bookings
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default DashboardOverview;