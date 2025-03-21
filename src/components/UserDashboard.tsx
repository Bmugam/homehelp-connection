
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  CalendarDays, 
  Bell, 
  Settings, 
  Home, 
  Clock, 
  CheckCircle,
  FileText,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - In a real app, this would come from an API
  const upcomingBookings = [
    { id: 1, service: 'House Cleaning', provider: 'Clean Masters', date: '2023-06-15T10:00:00', status: 'confirmed' },
    { id: 2, service: 'Plumbing Repair', provider: 'Quick Fix Plumbing', date: '2023-06-22T14:30:00', status: 'pending' }
  ];
  
  const serviceHistory = [
    { id: 101, service: 'Lawn Mowing', provider: 'Green Thumb', date: '2023-05-20T09:00:00', status: 'completed', rating: 5 },
    { id: 102, service: 'Electrical Work', provider: 'Power Connect', date: '2023-05-10T11:00:00', status: 'completed', rating: 4 }
  ];
  
  // Mock user details - In a real app, this would be part of the user object from context
  const userDetails = {
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    phone: '+254 712 345 678',
    address: '123 Main St, Nairobi, Kenya',
    memberSince: 'June 2022',
    profileCompletion: 80,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-homehelp-900">HomeHelp</h1>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
            
            <div className="flex items-center">
              <Avatar className="h-9 w-9 mr-2">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=0D8ABC&color=fff`} />
                <AvatarFallback className="bg-homehelp-700 text-white">
                  {userDetails.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 mr-2">{userDetails.name}</span>
            </div>
            
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=0D8ABC&color=fff&size=128`} />
                  <AvatarFallback className="bg-homehelp-700 text-white text-2xl">
                    {userDetails.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{userDetails.name}</h2>
                <p className="text-sm text-gray-500">Member since {userDetails.memberSince}</p>
              </div>
              
              <div className="mt-4 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-homehelp-600 h-2 rounded-full" 
                  style={{ width: `${userDetails.profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Profile {userDetails.profileCompletion}% complete
              </p>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'overview' 
                        ? 'bg-homehelp-50 text-homehelp-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    <span>Dashboard Overview</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'bookings' 
                        ? 'bg-homehelp-50 text-homehelp-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CalendarDays className="h-5 w-5" />
                    <span>My Bookings</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'history' 
                        ? 'bg-homehelp-50 text-homehelp-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Clock className="h-5 w-5" />
                    <span>Service History</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'profile' 
                        ? 'bg-homehelp-50 text-homehelp-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span>My Profile</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'settings' 
                        ? 'bg-homehelp-50 text-homehelp-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Account Settings</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-homehelp-900">Welcome back, {userDetails.name}!</h2>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-homehelp-600 to-homehelp-800 text-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Book a Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm opacity-90">Find the perfect service provider for your home needs.</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full border-white text-white hover:bg-white hover:text-homehelp-800"
                        onClick={() => navigate('/services')}
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
            )}
            
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-homehelp-900">My Profile</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your personal details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <p>{userDetails.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <p>{userDetails.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <p>{userDetails.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-500">Address</p>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <p>{userDetails.address}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Update Profile</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            
            {activeTab === 'bookings' && (
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
            )}
            
            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-homehelp-900">Service History</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {serviceHistory.length > 0 ? (
                      <div className="space-y-4">
                        {serviceHistory.map(item => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-medium text-lg">{item.service}</h3>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg 
                                    key={i}
                                    className={`w-4 h-4 ${i < item.rating ? 'text-amber-400' : 'text-gray-300'}`}
                                    xmlns="http://www.w3.org/2000/svg" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor"
                                  >
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">Provider: {item.provider}</p>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                              <span>Completed on {new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">View Details</Button>
                              <Button variant="outline" size="sm">Book Again</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-500">You haven't used any services yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-homehelp-900">Account Settings</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive emails about your account activity</p>
                        </div>
                        <Button variant="outline">Manage</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-gray-500">Update your password</p>
                        </div>
                        <Button variant="outline">Change</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Payment Methods</h4>
                          <p className="text-sm text-gray-500">Manage your payment options</p>
                        </div>
                        <Button variant="outline">Manage</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Delete Account</h4>
                          <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
