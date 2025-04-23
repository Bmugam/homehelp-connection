import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { API_BASE_URL } from '../../../../apiConfig';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  Filter
} from 'lucide-react';

interface AdminBooking {
  id: number;
  client_id: number;
  provider_id: number;
  service_id: number;
  date: string;
  time_slot: string;
  location: string;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  client: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  provider: {
    business_name: string;
    first_name: string;
    last_name: string;
    email: string;
    verification_status: 'verified' | 'rejected' | 'pending';
  };
  service: {
    name: string;
    price: number;
  };
  payment: {
    amount: number;
    status: 'pending' | 'completed';
  };
}

const statusBadge = (status: string) => {
  const variants = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
    completed: 'bg-green-100 text-green-800 border border-green-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200'
  };
  
  const color = variants[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

const verificationBadge = (status: string) => {
  const variants = {
    verified: {
      className: 'bg-green-100 text-green-800 border border-green-200',
      icon: <CheckCircle className="w-4 h-4 mr-1" />,
      label: 'Verified'
    },
    rejected: {
      className: 'bg-red-100 text-red-800 border border-red-200',
      icon: <XCircle className="w-4 h-4 mr-1" />,
      label: 'Rejected'
    },
    pending: {
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: <AlertCircle className="w-4 h-4 mr-1" />,
      label: 'Pending Verification'
    }
  };
  
  const { className, icon, label } = variants[status] || variants.pending;
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {icon} {label}
    </span>
  );
};

const paymentBadge = (status: string) => {
  const variants = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    completed: 'bg-green-50 text-green-700 border-green-200'
  };
  
  const color = variants[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${color}`}>
      {status === 'completed' ? 'Paid' : 'Payment Pending'}
    </span>
  );
};

const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[BookingsManagement] ${message}`, data || '');
  }
};

const BookingsManagement = () => {
  const { data: bookings = [], isLoading, error, refetch } = useQuery<AdminBooking[]>({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      debugLog('Fetching bookings data...');
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        debugLog('Bookings API Response:', { status: response.status });
        if (!response.ok) {
          const errorData = await response.json();
          debugLog('Error Data:', errorData);
          throw new Error(errorData.message || 'Failed to fetch bookings');
        }

        const data = await response.json();
        debugLog('Fetched bookings:', data);
        return data;
      } catch (error) {
        debugLog('Error fetching bookings:', error);
        console.error('Error fetching bookings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch bookings data"
        });
        throw error;
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // State for sorting, filtering, and search
  const [sortConfig, setSortConfig] = useState<{key: keyof AdminBooking; direction: 'asc' | 'desc'}>({
    key: 'id',
    direction: 'asc'
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      console.log('🔄 Status Change Request:', {
        bookingId,
        newStatus,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('📥 Status Change Response:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      await refetch();
      console.log('✅ Status Change Success:', {
        bookingId,
        newStatus,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Status updated",
        description: `Booking #${bookingId} status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('❌ Status Change Error:', {
        bookingId,
        attempted_status: newStatus,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      toast({
        variant: "destructive",
        title: "Update failed",
        description: `Couldn't change booking status: ${error.message}`,
      });
    }
  };

  const handleVerificationStatus = async (providerId: number, status: string) => {
    try {
      console.log('🔄 Verification Request:', {
        providerId,
        newStatus: status,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/providers/${providerId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verification_status: status }),
      });

      const responseData = await response.json();
      console.log('📥 Verification Response:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update verification status');
      }
      
      await refetch();
      console.log('✅ Verification Success:', {
        providerId,
        newStatus: status,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Provider updated",
        description: `Provider #${providerId} verification status changed to ${status}`,
      });
    } catch (error) {
      console.error('❌ Verification Error:', {
        providerId,
        attempted_status: status,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      toast({
        variant: "destructive",
        title: "Verification failed",
        description: `Couldn't update provider verification: ${error.message}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 text-lg font-medium">Loading bookings data...</p>
        <p className="text-gray-400 text-sm">Please wait while we fetch the latest information</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-red-50 rounded-full mb-4">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bookings</h3>
        <p className="text-gray-600 mb-4">
          We encountered a problem while loading the bookings data. Please try again later.
        </p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Filter bookings by status and search query
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      booking.client.first_name.toLowerCase().includes(searchLower) ||
      booking.client.last_name.toLowerCase().includes(searchLower) ||
      booking.provider.first_name.toLowerCase().includes(searchLower) ||
      booking.provider.last_name.toLowerCase().includes(searchLower) ||
      booking.service.name.toLowerCase().includes(searchLower);
    return matchesStatus && (searchQuery === '' || matchesSearch);
  });

  // Sort bookings by most recent first
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  // Pagination logic
  const bookingsPerPage = 10;
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(sortedBookings.length / bookingsPerPage);

  const requestSort = (key: keyof AdminBooking) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all service bookings</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Loader2 className="h-4 w-4 mr-2" /> Refresh Page
          </button>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-600">Status:</label>
            <select 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }} 
              value={filterStatus}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {/* Search input */}
          <div className="flex items-center flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {currentBookings.length} of {sortedBookings.length} bookings
          </div>
        </div>
      </div>

      {/* Empty state */}
      {sortedBookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
          <p className="text-gray-500 mb-4">
            {filterStatus === 'all' 
              ? 'There are no bookings in the system yet.' 
              : `There are no bookings with "${filterStatus}" status.`}
          </p>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Bookings table */}
      {sortedBookings.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {/* <div className="text-sm font-medium text-gray-900">Booking #{booking.id}</div> */}
                    <div className="text-xs text-gray-500 mt-1">
                      Booked At: {format(parseISO(booking.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {`${booking.client.first_name} ${booking.client.last_name}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {booking.client.phone_number}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {booking.client.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {`${booking.provider.first_name} ${booking.provider.last_name}`}
                    </div>
                    <div className="text-xs text-gray-500">
                    {booking.provider.business_name}
                    </div>
                    <div className="mt-2">
                      {verificationBadge(booking.provider.verification_status)}
                    </div>
                    {booking.provider.verification_status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleVerificationStatus(booking.provider_id, 'verified')}
                          className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded border border-green-200 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerificationStatus(booking.provider_id, 'rejected')}
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded border border-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {booking.provider.verification_status === 'rejected' && (
                      <button
                        onClick={() => handleVerificationStatus(booking.provider_id, 'verified')}
                        className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded border border-green-200 transition-colors mt-2"
                      >
                        Approve Provider
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.service.name}</div>
                    <div className="text-sm text-gray-700 mt-1">
                      ${booking.service.price.toFixed(2)}
                    </div>
                    <div className="mt-2">
                      {paymentBadge(booking.payment.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                      {format(parseISO(booking.date), 'EEE, MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-gray-700 mt-1">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      {booking.time_slot}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-2">
                      {booking.status !== 'confirmed' && booking.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'confirmed')}
                          className="text-xs px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'cancelled')}
                          className="text-xs px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          className="text-xs px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded border border-green-200 transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {sortedBookings.length > 0 && (
        <div className="sticky bottom-4 mt-6 flex justify-between items-center bg-gray-200">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </button>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;