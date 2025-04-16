import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const ProviderAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('Fetching appointments for provider:', user.id);
      
      const response = await apiService.providers.getAppointments(user.id);
      console.log('Raw appointments response:', response);
      
      // Check if response.data exists and is an array
      const appointmentsData = response?.data?.data || [];
      console.log('Processed appointments data:', appointmentsData);
      
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await apiService.providers.updateAppointmentStatus(id, status, user.id);
      toast.success(`Appointment status updated to ${status}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await apiService.providers.deleteAppointment(id, user.id);
      toast.success('Appointment deleted successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  if (!user) {
    return <div>Please login to view appointments</div>;
  }

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  // Add a guard clause to check if appointments is an array
  if (!Array.isArray(appointments)) {
    console.error('Appointments is not an array:', appointments);
    return <div>Error: Invalid appointments data</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>

      <div className="grid grid-cols-1 gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{appointment.service}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {(appointment.status || 'pending').charAt(0).toUpperCase() +
                    (appointment.status || 'pending').slice(1)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>{appointment.clientName}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(appointment.date).toLocaleDateString()}</span>
                <Clock className="w-4 h-4 ml-4 mr-2" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{appointment.location}</span>
              </div>

              <div className="flex space-x-2 pt-4">
                {appointment.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      variant="default"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <Button
                    onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                    variant="default"
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {appointments.length === 0 && (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-gray-500">No appointments found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProviderAppointments;