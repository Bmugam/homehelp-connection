import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";

interface Service {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

interface ServiceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onSelectService: (service: Service) => void;
}

export function ServiceListModal({ isOpen, onClose, services, onSelectService }: ServiceListModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Service</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {services.map((service) => (
            <Card key={service.id} className="p-4 cursor-pointer" onClick={() => onSelectService(service)}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  {service.description && <p className="text-sm text-gray-600">{service.description}</p>}
                </div>
                {service.price !== undefined && <span className="font-semibold">${service.price.toFixed(2)}</span>}
              </div>
            </Card>
          ))}
          {services.length === 0 && <p className="text-center text-gray-500">No services available.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
