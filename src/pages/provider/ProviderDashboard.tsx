
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp, 
  Star, 
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';

const ProviderDashboard = () => {
  // Dummy data for demonstration
  const stats = {
    appointmentsToday: 5,
    appointmentsUpcoming: 12,
    earnings: { 
      current: 25000, 
      previous: 22500, 
      currency: 'KSH' 
    },
    rating: 4.8,
    completedJobs: 124,
    cancelledJobs: 3,
    activeClients: 18
  };

  // Appointments data
  const upcomingAppointments = [
    { id: 1, client: 'Jane Mwangi', service: 'House Cleaning', time: '2:00 PM', date: new Date(Date.now() + 3600000 * 3) },
    { id: 2, client: 'Michael Ochieng', service: 'Plumbing', time: '10:30 AM', date: new Date(Date.now() + 3600000 * 24) },
    { id: 3, client: 'Sarah Njeri', service: 'Electrical', time: '3:45 PM', date: new Date(Date.now() + 3600000 * 26) },
  ];

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Provider Dashboard</h1>
          <p className="text-homehelp-600 mt-1">Welcome back, manage your bookings and services</p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <Button variant="outline" className="mr-2">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          <Button className="bg-homehelp-900 hover:bg-homehelp-800">
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Appointments" 
          value={stats.appointmentsToday.toString()} 
          description="appointments scheduled" 
          icon={<Calendar className="h-6 w-6 text-homehelp-600" />}
        />
        <StatCard 
          title="Upcoming Appointments" 
          value={stats.appointmentsUpcoming.toString()} 
          description="in the next 7 days" 
          icon={<Clock className="h-6 w-6 text-homehelp-600" />}
        />
        <StatCard 
          title="Earnings This Month" 
          value={formatCurrency(stats.earnings.current, stats.earnings.currency)} 
          description={`${getPercentageChange(stats.earnings.current, stats.earnings.previous)}% vs last month`}
          trend={stats.earnings.current > stats.earnings.previous ? "up" : "down"}
          icon={<TrendingUp className="h-6 w-6 text-homehelp-600" />}
        />
        <StatCard 
          title="Client Rating" 
          value={stats.rating.toString()} 
          description={`from ${stats.completedJobs} completed jobs`} 
          icon={<Star className="h-6 w-6 text-homehelp-600" />}
        />
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="upcoming" className="mt-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="upcoming">
            <Clock className="w-4 h-4 mr-2" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            <XCircle className="w-4 h-4 mr-2" />
            Cancelled
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-0">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled appointments in the coming days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-homehelp-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-homehelp-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-homehelp-900">{appointment.client}</h4>
                        <p className="text-sm text-homehelp-600">{appointment.service}</p>
                        <div className="flex items-center mt-1 text-xs text-homehelp-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(appointment.date)} • {appointment.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button size="sm" className="bg-homehelp-900 hover:bg-homehelp-800">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Completed Appointments</CardTitle>
              <CardDescription>Your recently completed appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-homehelp-500">
                <CheckCircle className="mx-auto h-12 w-12 text-homehelp-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">All caught up!</h3>
                <p>Your completed appointments will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cancelled">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Cancelled Appointments</CardTitle>
              <CardDescription>Your cancelled or missed appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-homehelp-500">
                <XCircle className="mx-auto h-12 w-12 text-homehelp-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">No cancelled appointments</h3>
                <p>Great work! You have no cancelled appointments.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weekly Summary */}
      <Card className="mt-8 border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Your performance overview for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-homehelp-50 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-homehelp-900">{stats.completedJobs}</span>
              <span className="text-sm text-homehelp-600">Completed Jobs</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-homehelp-50 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-3">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-homehelp-900">{stats.activeClients}</span>
              <span className="text-sm text-homehelp-600">Active Clients</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-homehelp-50 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-2xl font-bold text-homehelp-900">{stats.cancelledJobs}</span>
              <span className="text-sm text-homehelp-600">Cancelled Jobs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend 
}: { 
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-homehelp-600">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-homehelp-900">{value}</h3>
            <p className="text-xs mt-1 text-homehelp-500 flex items-center">
              {trend && (
                <span className={`mr-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {trend === 'up' ? '↑' : '↓'}
                </span>
              )}
              {description}
            </p>
          </div>
          <div className="p-3 bg-homehelp-50 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderDashboard;
