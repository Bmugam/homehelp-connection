import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-homehelp-900 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out fixed h-full z-10`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <h2 className="text-xl font-bold">HomeHelp Admin</h2>
          ) : (
            <h2 className="text-xl font-bold">HH</h2>
          )}
          <button onClick={toggleSidebar} className="text-white p-1 rounded-full hover:bg-homehelp-800">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2 px-2">
            <li>
              <a href="/admin-dashboard" className="flex items-center p-3 text-white rounded-lg bg-homehelp-800">
                <LayoutDashboard className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Dashboard</span>}
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 text-white hover:bg-homehelp-800 rounded-lg transition-colors">
                <Users className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Users</span>}
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 text-white hover:bg-homehelp-800 rounded-lg transition-colors">
                <Calendar className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Bookings</span>}
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 text-white hover:bg-homehelp-800 rounded-lg transition-colors">
                <FileText className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Reports</span>}
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 text-white hover:bg-homehelp-800 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Settings</span>}
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-3 text-white hover:bg-homehelp-800 rounded-lg transition-colors">
                <HelpCircle className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Help</span>}
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={logout}
            className="flex items-center p-3 text-white hover:bg-homehelp-800 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-6`}>
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
                <div className="text-3xl font-bold">2,345</div>
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+12.5%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">+48 new this week</p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Service Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">192</div>
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+8.2%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">+12 new this week</p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">3,872</div>
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">+23.1%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">+217 new this week</p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">$42,582</div>
                <div className="flex items-center text-red-500">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">-3.4%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-xs text-gray-500">-$850 compared to last week</p>
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
                {[1, 2, 3, 4, 5].map((user) => (
                  <div key={user} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">User {user}</p>
                        <p className="text-sm text-gray-500">user{user}@example.com</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Joined today
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">Showing 5 of 100 users</p>
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
                {[
                  { action: "Updated system settings", time: "2 hours ago" },
                  { action: "Approved new provider", time: "5 hours ago" },
                  { action: "Removed spam user", time: "Yesterday" },
                  { action: "Updated pricing", time: "Yesterday" },
                  { action: "System maintenance", time: "3 days ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
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
