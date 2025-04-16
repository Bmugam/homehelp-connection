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
import { BookingType, UserDetailsType, BookingCreate, BookingUpdate } from './user-dashboard/types';

interface HistoryItemType extends BookingType {
  rating: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [upcomingBookings, setUpcomingBookings] = useState<BookingType[]>([]);
  const [serviceHistory, setServiceHistory] = useState<HistoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const [upcomingRes, historyRes] = await Promise.all([
          apiService.bookings.getUserBookings().then(res => res.data),
          apiService.bookings.getUserBookings().then(res => 
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

        const isApiBooking = (obj: unknown): obj is ApiBooking => {
          if (typeof obj !== 'object' || obj === null) return false;
          
          const booking = obj as Record<string, unknown>;
          return (
            typeof booking.id === 'string' && 
            typeof booking.date === 'string' &&
            typeof booking.status === 'string'
          );
        };

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

  const userDetails: UserDetailsType = {
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    phone: user?.phone ||  '+254 712 345 678',
    address: '123 Main St, Nairobi, Kenya',
    memberSince: 'March 2025',
    profileCompletion: 80,
  };

  const handleUpdateProfile = async (updatedDetails: UserDetailsType) => {
    try {
      // For now, just verify the user is authenticated since update endpoint isn't available
      await apiService.auth.getCurrentUser();
      console.log('Profile update simulation successful');
    } catch (err) {
      console.error('Failed to update profile', err);
      throw new Error('Failed to update profile. Please try again.');
    }
  };

  const handleUpdateBooking = async (bookingId: number, updatedData: Partial<BookingType>) => {
    try {
      const updatePayload: BookingUpdate = {
        status: updatedData.status as 'confirmed' | 'completed' | 'cancelled' | undefined,
        date: updatedData.date,
        time: updatedData.time,
        notes: updatedData.notes
      };
      await apiService.bookings.update(bookingId.toString(), updatePayload);
      setUpcomingBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updatedData } : b));
    } catch (err) {
      console.error('Failed to update booking', err);
      throw err;
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      await apiService.bookings.cancel(bookingId.toString());
      setUpcomingBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      console.error('Failed to delete booking', err);
      throw err;
    }
  };

  const handleViewDetails = (id: number) => {
    console.log('View details for service history id:', id);
  };

  const handleBookAgain = (serviceId: number) => {
    console.log('Book again for service id:', serviceId);
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
      <UserHeader 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen} 
      />
      
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
                setActiveTab={setActiveTab} 
              />
            )}
            
            {activeTab === 'profile' && (
              <UserProfile userDetails={userDetails} onUpdate={handleUpdateProfile} />
            )}
            
            {activeTab === 'bookings' && (
              <UserBookings />
            )}
            
            {activeTab === 'history' && (
              <ServiceHistory 
                serviceHistory={serviceHistory} 
                onViewDetails={handleViewDetails} 
                onBookAgain={handleBookAgain} 
              />
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
