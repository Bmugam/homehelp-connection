import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Search,
  User,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from '../../services/api';
import { toast } from 'sonner';

// Types
interface Appointment {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  duration?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location: string;
  price?: string;
  clientImg?: string;
}

interface ApiResponse {
  success: boolean;
  data: Appointment[];
  message?: string;
}

const ProviderAppointments = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching appointments...');
      
      const response = await apiService.providers.getAppointments();
      const apiResponse = response.data as ApiResponse;
      console.log('Raw appointments response:', apiResponse);
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to fetch appointments');
      }
      
      const appointmentsData = apiResponse.data || [];
      console.log('Processed appointments data:', appointmentsData);
      
      setAppointments(
        appointmentsData.map((appointment: Appointment) => ({
          id: appointment.id,
          clientName: appointment.clientName,
          service: appointment.service,
          date: appointment.date,
          time: appointment.time,
          location: appointment.location,
          duration: appointment.duration || '1 hour',
          price: appointment.price || '-',
          status: ['pending', 'confirmed', 'completed', 'cancelled'].includes(appointment.status)
            ? appointment.status
            : 'pending',
          clientImg: appointment.clientImg
        }))
      );
    } catch (error: any) {
      console.error('Error details:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to load appointments';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await apiService.providers.updateAppointmentStatus(id, status);
      toast.success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await apiService.providers.deleteAppointment(id);
      toast.success('Appointment deleted successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Search filter
    const matchesSearch = 
      appointment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      appointment.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Group appointments by date for the calendar view
  const appointmentsByDate: Record<string, Appointment[]> = {};
  appointments.forEach(appointment => {
    if (!appointmentsByDate[appointment.date]) {
      appointmentsByDate[appointment.date] = [];
    }
    appointmentsByDate[appointment.date].push(appointment);
  });

  // Calendar navigation
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDay.getDay();
    
    // Total days in current month
    const daysInMonth = lastDay.getDate();
    
    // Create array for all calendar cells (6 weeks × 7 days = 42 cells)
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <User className="h-12 w-12 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Authentication Required</h3>
            <p className="text-gray-500">Please login to view your appointments</p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-homehelp-600" />
          <p className="text-homehelp-600">Loading your appointments...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-red-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Appointments</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            {error.includes('provider profile') && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">To start accepting appointments, please complete your provider profile:</p>
                <Button 
                  onClick={() => window.location.href = '/provider/settings'}
                  variant="default"
                  size="sm"
                >
                  Complete Profile Setup
                </Button>
              </div>
            )}
            {!error.includes('provider profile') && (
              <Button 
                onClick={fetchAppointments}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (!Array.isArray(appointments)) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-12 w-12 text-red-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Data Format Error</h3>
            <p className="text-gray-500">There was an issue with the appointment data format. Please try again later.</p>
          </div>
          <Button 
            onClick={fetchAppointments}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-homehelp-900">Appointments</h1>
            <p className="text-homehelp-600">Manage your upcoming and past service appointments</p>
          </div>
        </div>
        
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Calendar className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-4">
                You haven't received any appointments yet. Make sure your services are set up and your profile is complete to start accepting bookings.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => window.location.href = '/provider/services'}
                  variant="default"
                  size="sm"
                >
                  Manage Services
                </Button>
                <Button 
                  onClick={() => window.location.href = '/provider/settings'}
                  variant="outline"
                  size="sm"
                >
                  Update Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

// Map API status to UI display status
const mapStatusToDisplay = (status: string) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Upcoming',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || 'Pending';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Appointments</h1>
          <p className="text-homehelp-600">Manage your upcoming and past service appointments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Clock className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Calendar View
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search appointments..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Filter className="h-4 w-4 text-homehelp-600" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="confirmed">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">
              + New Appointment
            </Button>
          </div>
        </div>
      </Card>

      {/* List View */}
      {viewMode === 'list' && (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="flex items-center">
              <CalendarClock className="mr-2 h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center">
              <XCircle className="mr-2 h-4 w-4" />
              Cancelled
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            {filteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length > 0 ? (
              filteredAppointments
                .filter(a => a.status === 'confirmed' || a.status === 'pending')
                .map(appointment => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteAppointment}
                    displayStatus={mapStatusToDisplay(appointment.status)}
                  />
                ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-homehelp-600">No upcoming appointments found.</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {filteredAppointments.filter(a => a.status === 'completed').length > 0 ? (
              filteredAppointments
                .filter(a => a.status === 'completed')
                .map(appointment => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteAppointment}
                    displayStatus={mapStatusToDisplay(appointment.status)}
                  />
                ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-homehelp-600">No completed appointments found.</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-4">
            {filteredAppointments.filter(a => a.status === 'cancelled').length > 0 ? (
              filteredAppointments
                .filter(a => a.status === 'cancelled')
                .map(appointment => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteAppointment}
                    displayStatus={mapStatusToDisplay(appointment.status)}
                  />
                ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-homehelp-600">No cancelled appointments found.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
              Today
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {weekdays.map(day => (
              <div key={day} className="text-center font-medium text-sm py-2 text-homehelp-600">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-32 bg-gray-50 border border-gray-100"></div>;
              }
              
              const dateStr = day.toISOString().split('T')[0];
              const dayAppointments = appointmentsByDate[dateStr] || [];
              const isToday = new Date().toDateString() === day.toDateString();
              
              return (
                <div 
                  key={dateStr} 
                  className={`h-32 border border-gray-200 p-1 overflow-hidden ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                      {day.getDate()}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-xs text-homehelp-600">
                        {dayAppointments.length} appt{dayAppointments.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <div 
                        key={appointment.id}
                        className={`text-xs px-1 py-1 rounded truncate ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {appointment.time} - {appointment.clientName}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 pl-1">
                        + {dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// Component for appointment cards
const AppointmentCard = ({ 
  appointment, 
  onStatusUpdate, 
  onDelete,
  displayStatus 
}: { 
  appointment: Appointment, 
  onStatusUpdate: (id: number, status: string) => void,
  onDelete: (id: number) => void,
  displayStatus: string
}) => {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-homehelp-200">
            {appointment.clientImg ? (
              <img 
                src={appointment.clientImg} 
                alt={appointment.clientName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-homehelp-400 text-white text-xl font-bold">
                {appointment.clientName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
            <div>
              <h3 className="font-medium text-lg text-homehelp-900">{appointment.clientName}</h3>
              <p className="text-homehelp-600">{appointment.service}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                appointment.status === "confirmed" ? "bg-green-100 text-green-800" : 
                appointment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                appointment.status === "completed" ? "bg-blue-100 text-blue-800" :
                "bg-red-100 text-red-800"
              }`}>
                {displayStatus}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center text-sm text-homehelp-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(appointment.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-homehelp-600">
              <Clock className="h-4 w-4 mr-2" />
              {appointment.time} {appointment.duration && `(${appointment.duration})`}
            </div>
            <div className="flex items-center text-sm text-homehelp-600">
              <MapPin className="h-4 w-4 mr-2" />
              {appointment.location}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-lg font-medium text-homehelp-900">
              {appointment.price || 'N/A'}
            </div>
            <div className="flex space-x-2 mt-3 md:mt-0">
              {appointment.status === "pending" && (
                <>
                  <Button
                    onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
                    variant="default"
                    size="sm"
                  >
                    Confirm
                  </Button>
                  <Button
                    onClick={() => onDelete(appointment.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                  <Button size="sm">
                    View Details
                  </Button>
                </>
              )}
              {appointment.status === "confirmed" && (
                <>
                  <Button
                    onClick={() => onStatusUpdate(appointment.id, 'completed')}
                    variant="default"
                    size="sm"
                  >
                    Mark Completed
                  </Button>
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                  <Button
                    onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
                    variant="destructive"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button size="sm">
                    View Details
                  </Button>
                </>
              )}
              {appointment.status === "completed" && (
                <>
                  <Button variant="outline" size="sm">
                    Invoice
                  </Button>
                  <Button size="sm">
                    View Details
                  </Button>
                </>
              )}
              {appointment.status === "cancelled" && (
                <Button size="sm">
                  View Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProviderAppointments;
