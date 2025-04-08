import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../../services/api';
import { format, parseISO } from 'date-fns';

interface AdminBooking {
  id: number;
  provider_id: number;
  service_id: number;
  date: string;
  time_slot: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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

const BookingsManagement = () => {
  const { data: bookings = [], isLoading, error } = useQuery<AdminBooking[]>({
    queryKey: ['adminBookings'],
    queryFn: () => apiService.bookings.getAllForAdmin()
  });

  // State for sorting and filtering
  const [sortConfig, setSortConfig] = useState<{key: keyof AdminBooking; direction: 'asc' | 'desc'}>({
    key: 'id',
    direction: 'asc'
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  if (isLoading) return <div className="p-4">Loading bookings...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading bookings</div>;

  // Filter bookings by status
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
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
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('id')}
              >
                Booking ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('provider_id')}
              >
                Provider ID {sortConfig.key === 'provider_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('service_id')}
              >
                Service ID {sortConfig.key === 'service_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort('date')}
              >
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Slot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.provider_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.service_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(parseISO(booking.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.time_slot}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {statusBadge(booking.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;
