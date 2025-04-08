
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UserHeader from './user-dashboard/UserHeader';
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
  
  const [upcomingBookings, setUpcomingBookings] = useState<BookingType[]>([]);
  const [serviceHistory, setServiceHistory] = useState<HistoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const [upcomingRes, historyRes] = await Promise.all([
          apiService.bookings.getAll().then(res => res.data),
          apiService.bookings.getAll().then(res => 
            res.data.filter(b => b.status === 'completed')
          )
        ]);
        
        type ApiBooking = {
          id: string;
          service?: { name: string };
          provider?: { name: string };
          date: string;
          status: string;
          userId: string;
          providerId: string;
          serviceId: string;
          time: string;
          notes?: string;
          createdAt: string;
          updatedAt: string;
        };

        // Type guard to check if object is ApiBooking
        const isApiBooking = (obj: unknown): obj is ApiBooking => {
          if (typeof obj !== 'object' || obj === null) return false;
          
          const booking = obj as Record<string, unknown>;
          return (
            typeof booking.id === 'string' && 
            typeof booking.date === 'string' &&
            typeof booking.status === 'string'
          );
        };

        // Transform API data to match BookingType
        const transformBooking = (booking: unknown): BookingType => {
          if (!isApiBooking(booking)) {
            throw new Error('Invalid booking data');
          }

          return {
            id: parseInt(booking.id),
            service: booking.service?.name ?? 'Unknown Service',
            provider: booking.provider?.name ?? 'Unknown Provider',
            date: booking.date,
            status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
          };
        };

        // Process bookings with proper type checking
        const processBookings = (bookings: unknown[]): BookingType[] => {
          return bookings
            .filter(isApiBooking)
            .filter(b => b.status !== 'completed')
            .map(transformBooking);
        };

        const processHistory = (bookings: unknown[]): HistoryItemType[] => {
          return bookings
            .filter(isApiBooking)
            .filter(b => b.status === 'completed')
            .map(transformBooking)
            .map(b => ({
              ...b,
              rating: 0
            }));
        };

        setUpcomingBookings(processBookings(upcomingRes));
        setServiceHistory(processHistory(historyRes));
      } catch (err) {
        setError('Failed to load bookings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  
  // Mock user details - In a real app, this would be part of the user object from context
  const userDetails: UserDetailsType = {
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    phone: user?.phone ||  '+254 712 345 678',
    address: '123 Main St, Nairobi, Kenya',
    memberSince: 'March 2025',
    profileCompletion: 80,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

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
