import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { API_BASE_URL } from '../../../../apiConfig';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  const color = 
    status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
    status === 'completed' ? 'bg-green-100 text-green-800' :
    status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
      {status}
    </span>
  );
};

const verificationBadge = (status: string) => {
  const color = 
    status === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
    status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : 
    'bg-yellow-100 text-yellow-800 border-yellow-200';
  
  const icon = 
    status === 'verified' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
    status === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> : 
    <AlertCircle className="w-4 h-4 text-yellow-600" />;
  
  const message = 
    status === 'verified' ? 'Service Provider Verified ✓' :
    status === 'rejected' ? 'Provider Rejected' :
    'Verification Pending';
  
  return (
    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${color}`}>
      {icon} {message}
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

  // State for sorting and filtering
  const [sortConfig, setSortConfig] = useState<{key: keyof AdminBooking; direction: 'asc' | 'desc'}>({
    key: 'id',
    direction: 'asc'
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

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
        title: "Debug Info",
        description: <pre className="mt-2 w-full text-xs bg-slate-950 text-slate-50 p-4 rounded-md">
          {JSON.stringify({
            action: 'update_booking_status',
            bookingId,
            status: newStatus,
            success: true,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>,
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
        title: "Debug Error Info",
        description: <pre className="mt-2 w-full text-xs bg-slate-950 text-red-400 p-4 rounded-md">
          {JSON.stringify({
            error: error.message,
            bookingId,
            attempted_status: newStatus,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>,
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
        title: "Debug Info",
        description: <pre className="mt-2 w-full text-xs bg-slate-950 text-slate-50 p-4 rounded-md">
          {JSON.stringify({
            action: 'verify_provider',
            providerId,
            status,
            success: true,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>,
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
        title: "Debug Error Info",
        description: <pre className="mt-2 w-full text-xs bg-slate-950 text-red-400 p-4 rounded-md">
          {JSON.stringify({
            error: error.message,
            providerId,
            attempted_status: status,
            timestamp: new Date().toISOString()
          }, null, 2)}
        </pre>,
      });
    }
  };

  if (isLoading) return <div className="p-4">Loading bookings...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading bookings</div>;

  // Filter bookings by status
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  // Sort bookings by most recent first
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  // Pagination logic
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
      <h1 className="text-2xl font-bold mb-6">Bookings Management</h1>
      
      {/* Filter controls */}
      <div className="mb-4 flex gap-4 items-center">
        <div>
          <label className="mr-2 font-medium">Filter by Status:</label>
          <select 
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }} 
            value={filterStatus}
            className="border rounded px-3 py-1"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">#{booking.id}</div>
                  <div className="text-xs text-gray-500">
                    {format(parseISO(booking.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {`${booking.client.first_name} ${booking.client.last_name}`}
                  </div>
                  <div className="text-xs text-gray-500">{booking.client.phone_number}</div>
                  <div className="text-xs text-gray-500">{booking.client.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {`${booking.provider.first_name} ${booking.provider.last_name}`}
                  </div>
                  <div className="text-xs text-gray-500">
                  {booking.provider.business_name}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {verificationBadge(booking.provider.verification_status)}
                    {booking.provider.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerificationStatus(booking.provider_id, 'verified')}
                          className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded"
                        >
                          Verify Provider
                        </button>
                        <button
                          onClick={() => handleVerificationStatus(booking.provider_id, 'rejected')}
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded"
                        >
                          Reject Provider
                        </button>
                      </div>
                    )}
                    {booking.provider.verification_status === 'rejected' && (
                      <button
                        onClick={() => handleVerificationStatus(booking.provider_id, 'verified')}
                        className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded w-fit"
                      >
                        Change to Verified
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{booking.service.name}</div>
                  <div className="text-sm font-medium text-gray-900">
                    ${booking.service.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Payment: {booking.payment.status}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {format(parseISO(booking.date), 'EEEE, MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">{booking.time_slot}</div>
                  <div className="text-xs text-gray-500">{booking.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {statusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStatusChange(booking.id, 'confirmed')}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, 'cancelled')}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookingsManagement;