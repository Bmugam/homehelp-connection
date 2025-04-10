import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card } from "./ui/card";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  location: string;
  business_name: string;
  business_description: string;
  average_rating: number;
  review_count: number;
  price: number;
  service_description?: string;
}

interface ProviderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
  serviceName: string;
}

export function ProviderListModal({ isOpen, onClose, providers, serviceName }: ProviderListModalProps) {
  const navigate = useNavigate();

  return (
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
                  src={provider.profile_image || "https://via.placeholder.com/100"}
                  alt={provider.business_name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {provider.business_name || `${provider.first_name} ${provider.last_name}`}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{provider.average_rating.toFixed(1)} ({provider.review_count} reviews)</span>
                    <span>•</span>
                    <span>{provider.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{provider.service_description || provider.business_description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-lg">${provider.price.toFixed(2)}/hr</span>
                    <Button onClick={() => navigate(`/book/${provider.id}`)}>
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
  );
}
