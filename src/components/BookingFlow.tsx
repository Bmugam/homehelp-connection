import { useState } from "react";
import { ServiceListModal } from "./ServiceListModal";
import { ProviderListModal } from "./ProviderListModal";
import { BookingModal } from "./BookingModal";
import { Provider, Service } from "../types";

interface BookingFlowProps {
  services: Service[];
  providers: Provider[];
}

export function BookingFlow({ services, providers }: BookingFlowProps) {
  const [serviceListOpen, setServiceListOpen] = useState(true);
  const [providerListOpen, setProviderListOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setServiceListOpen(false);
    setProviderListOpen(true);
  };

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setProviderListOpen(false);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedProvider(null);
    setSelectedService(null);
    setServiceListOpen(true);
  };

  const closeProviderList = () => {
    setProviderListOpen(false);
    setSelectedService(null);
    setServiceListOpen(true);
  };

  return (
    <>
      <ServiceListModal
        isOpen={serviceListOpen}
        onClose={() => setServiceListOpen(false)}
        services={services}
        onSelectService={handleSelectService}
      />
      <ProviderListModal
        isOpen={providerListOpen}
        onClose={closeProviderList}
        providers={selectedService ? providers.filter(p => p.services.some(s => s.id === selectedService.id)) : []}
        serviceName={selectedService ? selectedService.name : ""}
        onSelectProvider={handleSelectProvider}
      />
      {selectedProvider && selectedService && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={closeBookingModal}
          provider={selectedProvider}
          selectedServiceId={selectedService.id}
        />
      )}
    </>
  );
}
