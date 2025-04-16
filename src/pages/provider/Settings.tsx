import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Bell,
  Shield,
  Clock,
  CreditCard,
  Languages,
  Save,
  Mail,
  Phone,
} from "lucide-react";

const ProviderSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "254712345678",
    bio: "Professional plumber with 8+ years of experience specializing in residential and commercial plumbing services.",
    languages: "English, Swahili",
    address: "123 Main St, Nairobi"
  });

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appNotifications: true,
    bookingUpdates: true,
    marketingEmails: false,
    paymentAlerts: true
  });

  const [availabilitySettings, setAvailabilitySettings] = useState({
    autoAcceptBookings: false,
    showUnavailableTimes: true,
    bufferTimeBetweenBookings: 30
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAvailabilityToggle = (setting) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleBufferTimeChange = (e) => {
    setAvailabilitySettings(prev => ({
      ...prev,
      bufferTimeBetweenBookings: parseInt(e.target.value) || 0
    }));
  };

  const handleSaveSettings = (section) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been updated successfully.`,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Settings</h1>
          <p className="text-homehelp-600">Manage your account preferences and settings</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Availability</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Personal Information</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-homehelp-200 mb-4 overflow-hidden">
                  <img 
                    src="https://randomuser.me/api/portraits/men/42.jpg" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button variant="outline" size="sm" className="mb-2">Change Photo</Button>
                <p className="text-xs text-homehelp-600 text-center">
                  Recommended: Square JPG, PNG <br />at least 300x300px
                </p>
              </div>
              
              <div className="md:w-2/3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={profileForm.name} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={profileForm.email} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={profileForm.phone} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="languages">Languages Spoken</Label>
                    <Input 
                      id="languages" 
                      name="languages" 
                      value={profileForm.languages} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={profileForm.address} 
                    onChange={handleProfileChange} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    rows={4} 
                    value={profileForm.bio} 
                    onChange={handleProfileChange} 
                    placeholder="Tell clients about your services and experience..."
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSaveSettings('profile')}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Services & Pricing</h2>
            
            <div className="space-y-4">
              {/* Service cards would go here */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border border-homehelp-200">
                  <h3 className="font-medium text-homehelp-900 mb-2">Plumbing Services</h3>
                  <p className="text-homehelp-600 text-sm mb-3">Pipe repairs, installations, drain cleaning</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-homehelp-900">
                      KSh 2,500/hr
                    </span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </Card>
                
                <Card className="p-4 border border-dashed border-homehelp-300 flex flex-col items-center justify-center text-homehelp-500 h-full">
                  <div className="text-center">
                    <p className="mb-2">Add another service</p>
                    <Button variant="outline">+ Add Service</Button>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Communication Channels</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-homehelp-700" />
                    <div>
                      <p className="font-medium text-homehelp-900">Email Notifications</p>
                      <p className="text-sm text-homehelp-600">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications} 
                    onCheckedChange={() => handleNotificationToggle('emailNotifications')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-homehelp-700" />
                    <div>
                      <p className="font-medium text-homehelp-900">SMS Notifications</p>
                      <p className="text-sm text-homehelp-600">Receive updates via text message</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.smsNotifications} 
                    onCheckedChange={() => handleNotificationToggle('smsNotifications')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-homehelp-700" />
                    <div>
                      <p className="font-medium text-homehelp-900">App Notifications</p>
                      <p className="text-sm text-homehelp-600">Receive in-app notifications</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.appNotifications} 
                    onCheckedChange={() => handleNotificationToggle('appNotifications')} 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Notification Types</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Booking Updates</p>
                    <p className="text-sm text-homehelp-600">New bookings, cancellations, etc.</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.bookingUpdates} 
                    onCheckedChange={() => handleNotificationToggle('bookingUpdates')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Payment Alerts</p>
                    <p className="text-sm text-homehelp-600">Payment receipts and updates</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.paymentAlerts} 
                    onCheckedChange={() => handleNotificationToggle('paymentAlerts')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Marketing Emails</p>
                    <p className="text-sm text-homehelp-600">News, promotions, and tips</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.marketingEmails} 
                    onCheckedChange={() => handleNotificationToggle('marketingEmails')} 
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => handleSaveSettings('notification')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Security Settings</h2>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  
                  <Button className="mt-2">Update Password</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Two-Factor Authentication</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Enable 2FA</p>
                    <p className="text-sm text-homehelp-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Session Management</h3>
                
                <Card className="p-4 border border-homehelp-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-homehelp-900">Current Session</p>
                      <p className="text-sm text-homehelp-600">Nairobi, Kenya • Chrome • April 16, 2025</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  </div>
                </Card>
                
                <Button variant="outline">Log Out All Other Devices</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Availability Settings</h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Booking Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Auto-Accept Bookings</p>
                    <p className="text-sm text-homehelp-600">Automatically accept new booking requests</p>
                  </div>
                  <Switch 
                    checked={availabilitySettings.autoAcceptBookings} 
                    onCheckedChange={() => handleAvailabilityToggle('autoAcceptBookings')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Show Unavailable Times</p>
                    <p className="text-sm text-homehelp-600">Display unavailable time slots on your calendar</p>
                  </div>
                  <Switch 
                    checked={availabilitySettings.showUnavailableTimes} 
                    onCheckedChange={() => handleAvailabilityToggle('showUnavailableTimes')} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="bufferTime">Buffer Time Between Bookings (minutes)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <Input 
                      id="bufferTime" 
                      type="number" 
                      className="w-24" 
                      value={availabilitySettings.bufferTimeBetweenBookings} 
                      onChange={handleBufferTimeChange} 
                      min="0"
                      max="120"
                    />
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="15"
                      value={availabilitySettings.bufferTimeBetweenBookings}
                      onChange={handleBufferTimeChange}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Working Hours</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <div key={day} className="flex items-center justify-between border-b pb-2">
                      <p className="font-medium text-homehelp-900">{day}</p>
                      <div className="flex items-center gap-2">
                        <select className="border rounded-md px-2 py-1 text-sm">
                          {['8:00 AM', '9:00 AM', '10:00 AM'].map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <span>to</span>
                        <select className="border rounded-md px-2 py-1 text-sm">
                          {['5:00 PM', '6:00 PM', '7:00 PM'].map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <Switch defaultChecked={day !== 'Sunday'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Time Off</h3>
                
                <Button variant="outline">
                  + Add Time Off
                </Button>
                
                <div className="mt-2">
                  <p className="text-homehelp-600 text-sm">No upcoming time off scheduled.</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => handleSaveSettings('availability')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderSettings;