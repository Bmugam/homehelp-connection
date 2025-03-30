import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { 
  UserCircle, 
  Users, 
  Settings, 
  LayoutDashboard,
  Calendar,
  HelpCircle,
  FileText,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  PieChart,
  ArrowUpRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from '@/services/api';

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
  userGrowth: number;
  providerGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
  newUsersThisWeek: number;
  newProvidersThisWeek: number;
  newBookingsThisWeek: number;
  revenueDifferenceThisWeek: number;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  joinedDate: string;
}

interface AdminActivity {
  id: number;
  action: string;
  time: string;
  adminName: string;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch dashboard statistics with error handling
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        const response = await api.get('/api/admin/dashboard/stats');
        return response.data;
      } catch (error) {
        if (error.response?.status === 403) {
          // Handle forbidden error
          console.error('Access denied to admin dashboard');
        }
        throw error;
      }
    },
    retry: 1 // Only retry once on failure
  });

  // Fetch recent users
  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: async (): Promise<RecentUser[]> => {
      const response = await api.get('/api/admin/recent-users');
      return response.data;
    }
  });

  // Fetch admin activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['adminActivities'],
    queryFn: async (): Promise<AdminActivity[]> => {
      const response = await api.get('/api/admin/activities');
      return response.data;
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (statsLoading || usersLoading || activitiesLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="w-16 h-16 border-4 border-homehelp-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (statsError) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">
      Error loading dashboard data
    </div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-84' : 'ml-20'} transition-all duration-300 ease-in-out p-6`}>
        {/* Header */}
        <header className="bg-white p-4 rounded-lg shadow flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-64"
              />
            </div>

            <div className="relative">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1.5 bg-red-500 rounded-full w-2 h-2"></span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <UserCircle className="h-8 w-8 text-gray-700" />
              {user && (
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stats?.totalUsers?.toLocaleString() ?? '0'}</div>
                <div className={`flex items-center ${(stats?.userGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stats?.userGrowth ?? 0) >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  <span className="text-xs font-medium">{`${stats?.userGrowth ?? 0}%`}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">+{stats?.newUsersThisWeek ?? 0} new this week</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Service Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stats?.totalProviders?.toLocaleString() ?? '0'}</div>
                <div className={`flex items-center ${(stats?.providerGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stats?.providerGrowth ?? 0) >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  <span className="text-xs font-medium">{`${stats?.providerGrowth ?? 0}%`}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">+{stats?.newProvidersThisWeek ?? 0} new this week</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{stats?.totalBookings?.toLocaleString() ?? '0'}</div>
                <div className={`flex items-center ${(stats?.bookingGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stats?.bookingGrowth ?? 0) >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  <span className="text-xs font-medium">{`${stats?.bookingGrowth ?? 0}%`}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">+{stats?.newBookingsThisWeek ?? 0} new this week</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">${stats?.totalRevenue?.toLocaleString() ?? '0'}</div>
                <div className={`flex items-center ${(stats?.revenueGrowth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stats?.revenueGrowth ?? 0) >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  <span className="text-xs font-medium">{`${stats?.revenueGrowth ?? 0}%`}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">
                {((stats?.revenueDifferenceThisWeek ?? 0) >= 0 ? `+$${stats?.revenueDifferenceThisWeek}` : `-$${Math.abs(stats?.revenueDifferenceThisWeek ?? 0)}`)} compared to last week
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.joinedDate}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">Showing {recentUsers?.length} of 100 users</p>
              <Button variant="outline" size="sm">
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Admin Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity</CardTitle>
              <CardDescription>Recent actions by admins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-homehelp-100 flex items-center justify-center mt-1">
                      <Settings className="h-4 w-4 text-homehelp-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View Activity Log
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;