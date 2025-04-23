import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, Mail, Calendar, ArrowLeft, ThumbsUp, Clock, Award, CheckCircle, User, Briefcase } from "lucide-react";

import { getProviderById } from "../services/providerService";
import type { Provider, Review } from "../types/provider";
import { ProviderListModal } from "../components/ProviderListModal";
import type { Service } from "../pages/Services";

interface ProviderDetailService extends Service {
  id: number;
  name: string;
  price?: number;
  description?: string;
}

const ProviderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ProviderDetailService | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        const data = await getProviderById(id!);
        // Transform data to match Provider type
        const transformedProvider = {
          id: data.provider_id.toString(),
          name: data.name || `${data.first_name} ${data.last_name}`,
          email: data.email,
          phone: data.phone,
          location: data.location,
          bio: data.bio || data.business_name,
          image: data.profile_image || '/default-profile.png',
          rating: parseFloat(data.average_rating) || 0,
          reviews: data.review_count || 0,
          services: data.services || [],
          verification_status: data.verification_status,
          experience: data.experience || '',
          verified: data.verification_status === 'verified',
          // Add other fields as needed
        };
        setProvider(transformedProvider);
      } catch (err) {
        setError('Failed to fetch provider details');
        console.error('Error fetching provider:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProvider();
    }
  }, [id]);

  const openBookingModal = (service: ProviderDetailService) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-homehelp-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-homehelp-600">Loading provider information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-semibold text-homehelp-900 mb-4">Error</h2>
          <p className="text-homehelp-600 mb-6">{error}</p>
          <Link to="/providers">
            <Button className="bg-homeh-900 hover:bg-homehelp-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Providers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-semibold text-homehelp-900 mb-4">Provider Not Found</h2>
          <p className="text-homehelp-600 mb-6">The service provider you're looking for doesn't exist or has been removed.</p>
          <Link to="/providers">
            <Button className="bg-homehelp-900 hover:bg-homehelp-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Providers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/providers" className="inline-flex items-center text-homehelp-600 hover:text-homehelp-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all providers
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Provider Profile Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <img 
                  src={provider.image || '/default-profile.png'} 
                  alt={provider.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-homehelp-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-profile.png';
                  }}
                />
                <h1 className="text-2xl font-bold text-homehelp-900 mt-4">
                  {provider.name || 'Unknown Provider'}
                </h1>
                
                <div className="flex items-center gap-1 text-amber-500 mt-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-medium">
                    {typeof provider.rating === 'number' ? provider.rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-homehelp-500 text-sm">
                    ({provider.reviews ?? 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-homehelp-600 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.location || 'Location not specified'}</span>
                </div>
                
                <div className="w-full border-t border-homehelp-100 my-4"></div>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-homehelp-700">
                    <Phone className="w-5 h-5 text-homehelp-500" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-homehelp-700">
                    <Mail className="w-5 h-5 text-homehelp-500" />
                    <span>{provider.email}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 bg-homehelp-900 hover:bg-homehelp-800"
                  onClick={() => {
                    if (provider.services && provider.services.length > 0) {
                      openBookingModal(provider.services[0]);
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Provider Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-homehelp-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-homehelp-500" />
                About {provider.name}
              </h2>
              <p className="text-homehelp-700 leading-relaxed">{provider.bio}</p>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-homehelp-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-homehelp-500" />
                  Services Offered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(provider.services as ProviderDetailService[]).map((service) => (
                    <Badge 
                      key={service.id} 
                      className="bg-homehelp-100 text-homehelp-800 hover:bg-homehelp-200 px-3 py-1 cursor-pointer"
                      onClick={() => openBookingModal(service)}
                    >
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Other sections unchanged */}
          
        </div>
      </div>

      <ProviderListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        providers={provider ? [provider] : []}
        serviceName={selectedService?.name || ''}
        selectedServiceId={selectedService ? Number(selectedService.id) : undefined}
      />
    </div>
  );
};

export default ProviderDetail;
