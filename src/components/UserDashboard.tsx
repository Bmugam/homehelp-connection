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
import UserReviews from './user-dashboard/tabs/UserReviews';
import { BookingType, UserDetailsType, BookingCreate, BookingUpdate } from './user-dashboard/types';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        setError('');
      } catch (err) {
        setError('Failed to load bookings. Please try refreshing the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [refreshTrigger]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
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
      await apiService.auth.getCurrentUser();
      console.log('Profile update simulation successful');
      return true;
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
      return true;
    } catch (err) {
      console.error('Failed to update booking', err);
      throw err;
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      await apiService.bookings.cancel(bookingId.toString());
      setUpcomingBookings(prev => prev.filter(b => b.id !== bookingId));
      return true;
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

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-homehelp-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <UserHeader 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen}
        userName={userDetails.name}
      />
      
      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <button 
                onClick={refreshData} 
                className="ml-2 underline text-homehelp-700 hover:text-homehelp-800"
              >
                Refresh now
              </button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className={`md:block ${sidebarOpen ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
            <UserSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              userDetails={userDetails} 
            />
          </div>
          
          <main className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'overview' && (
              <DashboardOverview 
                userName={userDetails.name} 
                setActiveTab={setActiveTab}
                upcomingBookings={upcomingBookings.slice(0, 3)}
                onRefresh={refreshData}
              />
            )}
            
            {activeTab === 'profile' && (
              <UserProfile 
                userDetails={userDetails} 
                onUpdate={handleUpdateProfile} 
              />
            )}
            
            {activeTab === 'bookings' && (
              <UserBookings 
                bookings={upcomingBookings}
                onUpdate={handleUpdateBooking}
                onDelete={handleDeleteBooking}
                onRefresh={refreshData}
              />
            )}
            
            {activeTab === 'history' && (
              <ServiceHistory 
                serviceHistory={serviceHistory} 
                onViewDetails={handleViewDetails} 
                onBookAgain={handleBookAgain}
                onRefresh={refreshData}
              />
            )}
            
            {activeTab === 'settings' && (
              <AccountSettings 
                userDetails={userDetails}
              />
            )}

            {activeTab === 'reviews' && (
              <UserReviews />
            )}
          </main>
        </div>
      </div>
      
      <footer className="mt-auto py-6 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
