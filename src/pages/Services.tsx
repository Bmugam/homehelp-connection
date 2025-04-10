import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, Clock, Badge, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { ProviderListModal } from "@/components/ProviderListModal";

interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  providers: Array<{
    provider_id: string;
    business_name: string;
    provider_name: string;
    location: string;
    price: number;
    description: string;
    availability: string;
    verification_status: string;
    average_rating: number;
    review_count: number;
  }>;
  created_at: string;
  updated_at: string;
}

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

const Services = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceProviders, setServiceProviders] = useState<Provider[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Fetching services from API...');
        const response = await apiService.services.getAll();
        console.log('API Response:', response);
        
        if (!response.data) {
          console.error('No data in response:', response);
          throw new Error('No data received from API');
        }

        const services: Service[] = (response.data as Service[]) || [];
        console.log('Services data:', services);
        
        if (!services.length) {
          console.warn('Received empty services array');
        }

        setServicesData(services);
        setFilteredServices(services);
        
        // Extract unique categories
        const categories = Array.from(
          new Set(services.map((service: Service) => service.category))
        ).filter(Boolean) as string[];
        setAllCategories(categories);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        console.error('Error fetching services:', {
          error: err,
          response: err.response,
          stack: err.stack
        });
        setError(`Failed to load services: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search query and selected categories
  useEffect(() => {
    if (loading) return;
    
    let filtered = servicesData;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(service => 
        selectedCategories.includes(service.category)
      );
    }
    
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategories, servicesData, loading]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleServiceClick = async (serviceId: string) => {
    try {
      const service = servicesData.find(s => s.id === serviceId);
      if (!service) return;

      setSelectedService(service);
      const response = await apiService.providers.getByService(serviceId);
      setServiceProviders(response.data as Provider[]);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 bg-slate-50 text-center">
        <p>Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 bg-slate-50 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-slate-50">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-2">
                  {allCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <label htmlFor={category} className="text-sm">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Services list */}
        <div className="w-full md:w-3/4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                className="pl-10 w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p>No services found matching your criteria.</p>
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {service.providers.length > 0 && (
                          <>
                            <span className="font-medium">
                              ${service.providers[0].price.toFixed(2)}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">
                                {service.providers[0].average_rating} ({service.providers[0].review_count})
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        <span
                          key={service.category}
                          className="text-xs border rounded-full px-2 py-0.5"
                        >
                          {service.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <ProviderListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        providers={serviceProviders}
        serviceName={selectedService?.name || ''}
      />
    </div>
  );
};

export default Services;
