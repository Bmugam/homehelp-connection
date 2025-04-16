import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
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

// Types
interface Appointment {
  id: number;
  client: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Pending';
  address: string;
  price: string;
  clientImg?: string;
}

const ProviderAppointments = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Dummy data for the appointments
  const appointments: Appointment[] = [
    {
      id: 1,
      client: "James Wilson",
      service: "Plumbing Repair",
      date: "2025-04-18",
      time: "10:00 AM",
      duration: "2 hours",
      status: "Upcoming",
      address: "123 Main St, Nairobi",
      price: "$120",
      clientImg: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      client: "Maria Johnson",
      service: "Electrical Work",
      date: "2025-04-19",
      time: "2:30 PM",
      duration: "3 hours",
      status: "Pending",
      address: "456 Oak Ave, Nairobi",
      price: "$180",
      clientImg: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      client: "Robert Smith",
      service: "House Cleaning",
      date: "2025-04-17",
      time: "9:00 AM",
      duration: "4 hours",
      status: "Upcoming",
      address: "789 Pine Rd, Nairobi",
      price: "$150",
      clientImg: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      id: 4,
      client: "Linda Parker",
      service: "Plumbing Repair",
      date: "2025-04-15",
      time: "11:30 AM",
      duration: "1 hour",
      status: "Completed",
      address: "567 Elm St, Nairobi",
      price: "$85",
      clientImg: "https://randomuser.me/api/portraits/women/28.jpg"
    },
    {
      id: 5,
      client: "Michael Brown",
      service: "Electrical Installation",
      date: "2025-04-14",
      time: "3:00 PM",
      duration: "2.5 hours",
      status: "Completed",
      address: "890 Cedar Ave, Nairobi",
      price: "$200",
      clientImg: "https://randomuser.me/api/portraits/men/41.jpg"
    },
    {
      id: 6,
      client: "Susan White",
      service: "Appliance Repair",
      date: "2025-04-16",
      time: "1:00 PM",
      duration: "1 hour",
      status: "Cancelled",
      address: "234 Birch Blvd, Nairobi",
      price: "$65",
      clientImg: "https://randomuser.me/api/portraits/women/50.jpg"
    }
  ];

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Search filter
    const matchesSearch = 
      appointment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.address.toLowerCase().includes(searchQuery.toLowerCase());
    
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
                <SelectItem value="upcoming">Upcoming</SelectItem>
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
            {filteredAppointments.filter(a => a.status === 'Upcoming' || a.status === 'Pending').length > 0 ? (
              filteredAppointments
                .filter(a => a.status === 'Upcoming' || a.status === 'Pending')
                .map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-homehelp-600">No upcoming appointments found.</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {filteredAppointments.filter(a => a.status === 'Completed').length > 0 ? (
              filteredAppointments
                .filter(a => a.status === 'Completed')
                .map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-homehelp-600">No completed appointments found.</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="cancelled" className="space-y-4">
            {filteredAppointments.filter(a => a.status === 'Cancelled').length > 0 ? (
              filteredAppointments
                .filter(a => a.status === 'Cancelled')
                .map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
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
              <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
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
                          appointment.status === 'Upcoming' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {appointment.time} - {appointment.client}
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
const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-homehelp-200">
            {appointment.clientImg ? (
              <img 
                src={appointment.clientImg} 
                alt={appointment.client} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-homehelp-400 text-white text-xl font-bold">
                {appointment.client.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
            <div>
              <h3 className="font-medium text-lg text-homehelp-900">{appointment.client}</h3>
              <p className="text-homehelp-600">{appointment.service}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                appointment.status === "Upcoming" ? "bg-green-100 text-green-800" : 
                appointment.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                appointment.status === "Completed" ? "bg-blue-100 text-blue-800" :
                "bg-red-100 text-red-800"
              }`}>
                {appointment.status}
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
              {appointment.time} ({appointment.duration})
            </div>
            <div className="flex items-center text-sm text-homehelp-600">
              <MapPin className="h-4 w-4 mr-2" />
              {appointment.address}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-lg font-medium text-homehelp-900">
              {appointment.price}
            </div>
            <div className="flex space-x-2 mt-3 md:mt-0">
              {appointment.status === "Upcoming" || appointment.status === "Pending" ? (
                <>
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                  <Button variant="destructive" size="sm">
                    Cancel
                  </Button>
                  <Button size="sm">
                    View Details
                  </Button>
                </>
              ) : appointment.status === "Completed" ? (
                <>
                  <Button variant="outline" size="sm">
                    Invoice
                  </Button>
                  <Button size="sm">
                    View Details
                  </Button>
                </>
              ) : (
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