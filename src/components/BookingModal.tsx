import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {useAuth} from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Provider } from '@/types';
import { Clock, MapPin, ClipboardList } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  selectedServiceId?: number;
}

export const BookingModal = ({ isOpen, onClose, provider, selectedServiceId }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<number | ''>(selectedServiceId ?? '');
  const [timeSlot, setTimeSlot] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);

  const queryClient = useQueryClient();

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (selectedServiceId !== undefined) {
      setSelectedService(selectedServiceId);
    }
  }, [selectedServiceId]);

  const bookingMutation = useMutation({
    mutationFn: (data: {
      providerId: string;
      serviceId: string;
      date: string;
      time: string;
      location: string;
      notes?: string;
    }) => Promise.resolve(apiService.bookings.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Booking creation error:', error);
      toast.error('Failed to create booking');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login or signup to book a service');
      return;
    }

    if (!provider || !provider.id) {
      toast.error('Provider information is missing');
      return;
    }

    if (!selectedDate || !selectedService || !timeSlot || !location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const bookingDate = new Date(selectedDate);
    const today = new Date();
    if (bookingDate < today) {
      toast.error('Cannot book for past dates');
      return;
    }

    const payload = {
      providerId: provider.id.toString(),
      serviceId: selectedService.toString(),
      date: selectedDate.toISOString().split('T')[0],
      time: timeSlot,
      location,
      notes: notes || undefined
    };

    bookingMutation.mutate(payload);
  };

  const nextStep = () => {
    if (step === 1 && !selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (step === 2 && !selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (step === 3 && !timeSlot) {
      toast.error('Please select a time');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const reset = () => {
    setStep(1);
    setSelectedDate(undefined);
    setSelectedService('');
    setTimeSlot('');
    setLocation('');
    setNotes('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectedServiceDetails = provider.services?.find(
    service => service.id === selectedService
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Book Appointment with {provider.name}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            {step === 1 && "Select a date for your appointment"}
            {step === 2 && "Choose the service you need"}
            {step === 3 && "Pick a convenient time"}
            {step === 4 && "Complete your booking details"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${step === i ? 'bg-blue-600 text-white' : 
                    step > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {step > i ? '✓' : i}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {i === 1 && 'Date'}
                {i === 2 && 'Service'}
                {i === 3 && 'Time'}
                {i === 4 && 'Details'}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-lg border shadow-md"
                disabled={(date) => date < new Date()}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {(provider.services ?? []).map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all
                      ${selectedService === service.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'hover:border-gray-300 hover:bg-gray-50'}`}
                  >
                    <div className="font-medium">{service.name}</div>
                    {service.price !== undefined && (
                      <div className="text-green-600 font-semibold mt-1">${service.price}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-sm text-gray-500 mb-2 flex items-center">
                <Clock size={16} className="mr-2" />
                Select your preferred time
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
                  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((time) => (
                  <div
                    key={time}
                    onClick={() => setTimeSlot(time)}
                    className={`p-2 border rounded-md text-center cursor-pointer
                      ${timeSlot === time 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'hover:bg-gray-50'}`}
                  >
                    {time}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-2 border-t">
                <Input
                  type="time"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="Or enter specific time"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 mb-4">
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Service:</div>
                  <div>{selectedServiceDetails?.name}</div>
                  
                  <div className="text-gray-500">Date:</div>
                  <div>{selectedDate?.toLocaleDateString()}</div>
                  
                  <div className="text-gray-500">Time:</div>
                  <div>{timeSlot}</div>
                  
                  <div className="text-gray-500">Price:</div>
                  <div className="text-green-600 font-medium">
                    ${selectedServiceDetails?.price}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-500" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                  />
                </div>
                
                <div className="flex items-start">
                  <ClipboardList size={16} className="mr-2 mt-2 text-gray-500" />
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes or special requests"
                    className="min-h-24"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t mt-6">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}
            
            {step < 4 ? (
              <Button type="button" onClick={nextStep}>
                Continue
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={bookingMutation.isPending || !location}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};