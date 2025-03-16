
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, Phone, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Import provider data
import { providersData } from "@/data/providers";

// Service filter options
const serviceOptions = Array.from(
  new Set(providersData.flatMap(provider => provider.services))
);

// Location filter options
const locationOptions = Array.from(
  new Set(providersData.map(provider => provider.location))
);

const Providers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [filteredProviders, setFilteredProviders] = useState(providersData);
  
  // Filter providers based on criteria
  useEffect(() => {
    let filtered = providersData;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(query) || 
        provider.bio.toLowerCase().includes(query) ||
        provider.services.some(service => service.toLowerCase().includes(query))
      );
    }
    
    // Filter by services
    if (selectedServices.length > 0) {
      filtered = filtered.filter(provider => 
        selectedServices.some(service => provider.services.includes(service))
      );
    }
    
    // Filter by locations
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(provider => 
        selectedLocations.includes(provider.location)
      );
    }
    
    setFilteredProviders(filtered);
  }, [searchQuery, selectedServices, selectedLocations]);

  // Toggle service selection
  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };
  
  // Toggle location selection
  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-homehelp-900 text-center mb-8">
        Our Service Providers
      </h1>
      
      {/* Search bar */}
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
      
      {/* Filters */}
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
      
      {/* Providers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.length > 0 ? (
          filteredProviders.map(provider => (
            <Card key={provider.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={provider.image} 
                      alt={provider.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-homehelp-900">{provider.name}</h3>
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
                  
                  <p className="text-homehelp-600 text-sm mb-4">{provider.bio.substring(0, 120)}...</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.services.map(service => (
                        <span 
                          key={`${provider.id}-${service}`}
                          className="text-xs bg-homehelp-100 text-homehelp-700 px-2 py-1 rounded-full"
                        >
                          {service}
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
                
                <div className="p-4 border-t border-homehelp-100 bg-homehelp-50 flex justify-between items-center">
                  <Link to={`/providers/${provider.id}`} className="text-sm text-homehelp-700 hover:text-homehelp-900">
                    View Profile
                  </Link>
                  <Button size="sm" className="flex items-center gap-1">
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
    </div>
  );
};

export default Providers;
