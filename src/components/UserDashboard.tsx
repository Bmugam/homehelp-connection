
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserHeader } from './user-dashboard/UserHeader';
import UserSidebar from './user-dashboard/UserSidebar';
import DashboardOverview from './user-dashboard/tabs/DashboardOverview';
import UserProfile from './user-dashboard/tabs/UserProfile';
import UserBookings from './user-dashboard/tabs/UserBookings';
import ServiceHistory from './user-dashboard/tabs/ServiceHistory';
import AccountSettings from './user-dashboard/tabs/AccountSettings';
import { BookingType, UserDetailsType } from './user-dashboard/types';

interface HistoryItemType extends BookingType {
  rating: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - In a real app, this would come from an API
  const upcomingBookings: BookingType[] = [
    { id: 1, service: 'House Cleaning', provider: 'Clean Masters', date: '2023-06-15T10:00:00', status: 'confirmed' },
    { id: 2, service: 'Plumbing Repair', provider: 'Quick Fix Plumbing', date: '2023-06-22T14:30:00', status: 'pending' }
  ];
  
  const serviceHistory: HistoryItemType[] = [
    { id: 101, service: 'Lawn Mowing', provider: 'Green Thumb', date: '2023-05-20T09:00:00', status: 'completed', rating: 5 },
    { id: 102, service: 'Electrical Work', provider: 'Power Connect', date: '2023-05-10T11:00:00', status: 'completed', rating: 4 }
  ];
  
  // Mock user details - In a real app, this would be part of the user object from context
  const userDetails: UserDetailsType = {
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    phone: '+254 712 345 678',
    address: '123 Main St, Nairobi, Kenya',
    memberSince: 'March 2025',
    profileCompletion: 80,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader toggleSidebar={function (): void {
        throw new Error('Function not implemented.');
      } } sidebarOpen={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <UserSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            userDetails={userDetails} 
          />
          
          <main className="flex-1">
            {activeTab === 'overview' && (
              <DashboardOverview 
                userName={userDetails.name} 
                upcomingBookings={upcomingBookings} 
                serviceHistory={serviceHistory} 
                setActiveTab={setActiveTab} 
              />
            )}
            
            {activeTab === 'profile' && (
              <UserProfile userDetails={userDetails} />
            )}
            
            {activeTab === 'bookings' && (
              <UserBookings upcomingBookings={upcomingBookings} />
            )}
            
            {activeTab === 'history' && (
              <ServiceHistory serviceHistory={serviceHistory} />
            )}
            
            {activeTab === 'settings' && (
              <AccountSettings />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
