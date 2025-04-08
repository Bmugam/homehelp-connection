import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Provider } from '@/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
}

export const BookingModal = ({ isOpen, onClose, provider }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  const bookingMutation = useMutation({
    mutationFn: apiService.bookings.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create booking');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedService || !timeSlot || !location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Add validation for date
    const bookingDate = new Date(selectedDate);
    const today = new Date();
    if (bookingDate < today) {
      toast.error('Cannot book for past dates');
      return;
    }

    bookingMutation.mutate({
      providerId: provider.id.toString(),
      serviceId: selectedService,
      date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: timeSlot,
      location,
      notes: notes || undefined
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {provider.name}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields */}
            <div className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a service</option>
                {provider.services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price}
                  </option>
                ))}
              </select>
              <Input
                type="time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="Select time"
              />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
              />
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={bookingMutation.isPending}>
                {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
