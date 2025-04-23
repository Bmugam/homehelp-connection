import React from 'react';
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, Phone, Calendar, Mail } from "lucide-react";
import { BookingModal } from '../components/BookingModal';
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../apiConfig';
import type { Provider } from "@/types/index";

const Providers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const serviceFilter = searchParams.get('service');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Fetch providers from backend
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/providers`);
        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }
        const data = await response.json();
        // Map backend data to match our Provider interface
        const mappedProviders = data.map((provider: {
          user_id: number;
          provider_id: number;
          first_name: string;
          last_name: string;
          email: string;
          phone_number: string;
          location: string;
          business_description: string;
          profile_image?: string;
          average_rating?: number;
          review_count?: number;
          verification_status: string;
          services: { id: number; name: string; price?: number }[];
        }) => ({
          id: provider.provider_id,
          name: `${provider.first_name} ${provider.last_name}`,
          email: provider.email,
          phone: provider.phone_number,
          location: provider.location,
          bio: provider.business_description,
          image: provider.profile_image || '',
          rating: provider.average_rating || 0,
          reviews: provider.review_count || 0,
          verification_status: provider.verification_status,
          services: provider.services
        }));
        setProviders(mappedProviders);
        setFilteredProviders(mappedProviders);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching providers:', error);
        setError('Failed to load providers');
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Get unique service options from providers
  const serviceOptions = Array.from(
    new Set(providers.flatMap(provider => provider.services.map(s => s.name)))
  );

  // Get unique location options from providers
  const locationOptions = Array.from(
    new Set(providers.map(provider => provider.location))
  );

  // Filter providers based on search and filters
  useEffect(() => {
    let filtered = providers;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(query) || 
        provider.bio?.toLowerCase().includes(query) ||
        provider.services.some(service => service.name.toLowerCase().includes(query))
      );
    }
    
    if (serviceFilter) {
      filtered = filtered.filter(provider => 
        provider.services.some(service => 
          service.name.toLowerCase().includes(serviceFilter.toLowerCase())
        )
      );
      if (!selectedServices.includes(serviceFilter)) {
        setSelectedServices([...selectedServices, serviceFilter]);
      }
    }
    
    if (selectedServices.length > 0) {
      filtered = filtered.filter(provider => 
        selectedServices.some(service => 
          provider.services.some(s => 
            s.name.toLowerCase().includes(service.toLowerCase())
          )
        )
      );
    }
    
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(provider => 
        selectedLocations.includes(provider.location)
      );
    }
    
    setFilteredProviders(filtered);
  }, [searchQuery, selectedServices, selectedLocations, serviceFilter, providers]);

  function toggleLocation(location: string): void {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-homehelp-900 text-center mb-8">
          Our Service Providers
        </h1>
        
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="w-full h-14 rounded-full bg-homehelp-100 animate-pulse"></div>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-wrap gap-8 mb-6">
            <div className="w-full md:w-auto">
              <div className="h-5 w-32 bg-homehelp-100 rounded mb-2 animate-pulse"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-homehelp-100 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <div className="h-5 w-32 bg-homehelp-100 rounded mb-2 animate-pulse"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-homehelp-100 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-homehelp-100 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-homehelp-100 rounded animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-homehelp-100 rounded animate-pulse"></div>
                      <div className="h-4 w-2/3 bg-homehelp-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-3 w-full bg-homehelp-100 rounded animate-pulse"></div>
                    <div className="h-3 w-5/6 bg-homehelp-100 rounded animate-pulse"></div>
                    <div className="h-3 w-4/6 bg-homehelp-100 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="h-4 w-20 bg-homehelp-100 rounded mb-2 animate-pulse"></div>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-6 w-16 bg-homehelp-100 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-4 w-3/4 bg-homehelp-100 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-homehelp-100 rounded animate-pulse"></div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-homehelp-100 bg-homehelp-50 flex justify-between">
                  <div className="h-9 w-24 bg-homehelp-100 rounded-md animate-pulse"></div>
                  <div className="h-9 w-24 bg-homehelp-100 rounded-md animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  function toggleService(service: string): void {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-homehelp-900 text-center mb-8">
        Our Service Providers
      </h1>
      
      <div className="relative max-w-2xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search for service providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 rounded-full border border-homehelp-200 focus:outline-none focus:ring-2 focus:ring-homehelp-500 pl-12"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-homehelp-400 w-5 h-5" />
      </div>
      
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Filter by service:</h3>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedServices.includes(service)
                      ? "bg-homehelp-900 text-white"
                      : "bg-homehelp-100 text-homehelp-700 hover:bg-homehelp-200"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Filter by location:</h3>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map(location => (
                <button
                  key={location}
                  onClick={() => toggleLocation(location)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedLocations.includes(location)
                      ? "bg-homehelp-900 text-white"
                      : "bg-homehelp-100 text-homehelp-700 hover:bg-homehelp-200"
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <Card key={provider.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={provider.image || `https://ui-avatars.com/api/?name=${provider.name}`}
                      alt={provider.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-homehelp-900">
                        {provider.name}
                      </h3>
                      <div className="flex items-center gap-1 text-homehelp-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{provider.rating}</span>
                        <span className="text-homehelp-500 text-xs">({provider.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-homehelp-600 text-sm mb-4">
                    {provider.bio?.substring(0, 120)}...
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.services.map(service => (
                        <span 
                          key={service.id}
                          className="text-xs bg-homehelp-100 text-homehelp-700 px-2 py-1 rounded-full"
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1 text-sm text-homehelp-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-homehelp-500" />
                      <span>{provider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-homehelp-500" />
                      <span>{provider.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-homehelp-100 bg-homehelp-950 flex justify-between items-center">
                  <Button
                    variant="info">
                  <Link to={`/providers/${provider.id}`} className="text-sm text-homehelp-30 hover:text-homehelp-900">
                    View Profile
                  </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      setSelectedProvider(provider);
                      setIsBookingModalOpen(true);
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Now</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-homehelp-500">No service providers found matching your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {selectedProvider && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          provider={selectedProvider}
        />
      )}
    </div>
  );
};

export default Providers;
