import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { BookingModal } from "./BookingModal";
import { Provider } from "../types";

interface ProviderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
  serviceName: string;
  selectedServiceId?: number;
  onSelectProvider?: (provider: Provider) => void;
}

export function ProviderListModal({ isOpen, onClose, providers, serviceName, selectedServiceId, onSelectProvider }: ProviderListModalProps) {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const openBookingModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedProvider(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Providers for {serviceName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {providers.map((provider) => (
              <Card key={provider.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={provider.image || "https://via.placeholder.com/100"}
                    alt={provider.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {provider.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{(provider.rating ?? 0).toFixed(1)} ({provider.reviews ?? 0} reviews)</span>
                      <span>•</span>
                      <span>{provider.location}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{provider.bio}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-lg">${/* No price field in Provider type */}0.00/hr</span>
                      <Button onClick={() => onSelectProvider ? onSelectProvider(provider) : openBookingModal(provider)}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {providers.length === 0 && (
              <p className="text-center text-gray-500">No providers available for this service.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedProvider && !onSelectProvider && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={closeBookingModal}
          provider={selectedProvider}
          selectedServiceId={selectedServiceId}
        />
      )}
    </>
  );
}
