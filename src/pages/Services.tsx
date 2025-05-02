import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, Clock, Badge, Filter, X, Sliders, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { ProviderListModal } from "@/components/ProviderListModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { motion, AnimatePresence } from "framer-motion";

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
    price: string | number;
    description: string;
    availability: string;
    verification_status: string;
    average_rating: number;
    review_count: number;
  }>;
  created_at: string;
  updated_at: string;
}

import type { Provider } from "../types/index";

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
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const backgroundImages = [
    'https://plus.unsplash.com/premium_photo-1663011218145-c1d0c3ba3542?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1680286739871-01142bc609df?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1661884973994-d7625e52631a?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://plus.unsplash.com/premium_photo-1663126319781-f4de55c7ebd4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Calculate pagination data
  const totalItems = filteredServices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await apiService.services.getAll();
        
        if (!response.data) {
          throw new Error('No data received from API');
        }

        const services = response.data as unknown as Service[];
        setServicesData(services);
        setFilteredServices(services);
        
        const categories = Array.from(
          new Set(services.map((service: Service) => service.category))
        ).filter(Boolean) as string[];
        setAllCategories(categories);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
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
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        (service.name?.toLowerCase() || '').includes(query) || 
        (service.description?.toLowerCase() || '').includes(query)
      );
    }
    
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
      const providers = response.data as Provider[];

      const detailedProviders = await Promise.all(
        providers.map(async (provider: { id?: number; provider_id?: number | string }) => {
          const providerId = provider.id || provider.provider_id;
          if (!providerId) return null;
          const detailResponse = await apiService.providers.getById(providerId.toString());
          const detailedProvider = detailResponse.data as Provider;
          const services = detailedProvider.services && detailedProvider.services.length > 0
            ? detailedProvider.services
            : selectedService
              ? [selectedService]
              : [];
          return { ...detailedProvider, id: Number(detailedProvider.id), services };
        })
      );

      setServiceProviders(detailedProviders.filter(p => p !== null) as Provider[]);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setActiveFilter("all");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar skeleton */}
          <div className="w-full md:w-1/4">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          
          {/* Services list skeleton */}
          <div className="w-full md:w-3/4 space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-56 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-10 rounded-xl shadow-lg">
          <div className="bg-red-100 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Something Went Wrong</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="group relative px-6 py-3 text-white font-medium rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300"
          >
            <div className="absolute inset-0 w-full h-full transition-all duration-300 bg-white opacity-0 group-hover:opacity-20 group-active:opacity-40"></div>
            <div className="flex items-center justify-center">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin group-hover:animate-none" />
              <span>Try Again</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 md:p-12 mb-8 text-white shadow-xl relative overflow-hidden">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentBgIndex ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
        ))}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="relative z-10">
          <motion.h1 
            className="text-3xl md:text-5xl font-bold mb-3 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Find the Perfect Service
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl mb-8 max-w-2xl opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover and book top-rated professionals for all your needs in seconds
          </motion.p>
          
          <motion.div 
            className="relative max-w-2xl backdrop-blur-sm rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200" />
            <input
              type="text"
              placeholder="Search services (e.g. 'plumbing', 'cleaning')..."
              className="pl-12 w-full rounded-xl border-0 bg-white/20 py-4 px-4 text-white placeholder-blue-200 shadow-lg transition-all focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-200 hover:text-white transition-colors" 
                onClick={() => setSearchQuery("")}
              >
                <X className="h-full w-full" />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Quick category filter chips - Mobile & Desktop */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar">
        <button
          onClick={() => {
            setActiveFilter("all");
            setSelectedCategories([]);
          }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === "all"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Services
        </button>
        {allCategories.slice(0, 6).map((category) => (
          <button
            key={`chip-${category}`}
            onClick={() => {
              setActiveFilter(category);
              setSelectedCategories([category]);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === category
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
        {allCategories.length > 6 && (
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            More +
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar - desktop */}
        <div className="hidden md:block w-full md:w-1/4">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-4 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center">
                <Sliders className="h-5 w-5 mr-2 text-blue-600" />
                Filters
              </h3>
              {selectedCategories.length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4 border-b pb-2">Categories</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 styled-scrollbar">
                  {allCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-3 group">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                        className="h-5 w-5 rounded-md border-gray-300 data-[state=checked]:bg-blue-600 transition-all"
                      />
                      <label 
                        htmlFor={category} 
                        className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile filters */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
            >
              <motion.div 
                className="absolute right-0 top-0 h-full w-4/5 bg-white p-6 overflow-y-auto"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <Sliders className="h-5 w-5 mr-2 text-blue-600" />
                    Filters
                  </h3>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4 border-b pb-2 flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-blue-600" />
                      Categories
                    </h4>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 styled-scrollbar">
                      {allCategories.map((category) => (
                        <div key={`mobile-${category}`} className="flex items-center space-x-3 group">
                          <Checkbox
                            id={`mobile-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
                            className="h-5 w-5 rounded-md transition-colors data-[state=checked]:bg-blue-600"
                          />
                          <label htmlFor={`mobile-${category}`} className="text-sm group-hover:text-blue-700 transition-colors">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 sticky bottom-0 bg-white pb-4 border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services list */}
        <div className="w-full md:w-3/4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center flex-wrap">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full mr-3 text-sm">
                  {totalItems}
                </span>
                {totalItems === 1 ? 'Service' : 'Services'} Available
              </h2>
              {selectedCategories.length > 0 && (
                <div className="ml-0 md:ml-3 mt-3 md:mt-0 flex items-center space-x-2 flex-wrap">
                  <span className="text-sm text-gray-500">Filtered by:</span>
                  {selectedCategories.map(category => (
                    <span 
                      key={category}
                      className="text-xs bg-blue-100 text-blue-800 rounded-full px-3 py-1 flex items-center gap-1 group mt-1"
                    >
                      {category}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleCategoryChange(category);
                        }}
                        className="text-blue-400 hover:text-blue-700 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              className="md:hidden flex items-center"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {filteredServices.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-sm text-center"
            >
              <div className="mx-auto max-w-md">
                <div className="bg-blue-50 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">No services found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? `We couldn't find any services matching "${searchQuery}"`
                    : "We couldn't find any services matching your filters"}
                </p>
                <Button 
                  onClick={clearFilters}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors px-6"
                >
                  Clear all filters
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Card
                      className="h-full cursor-pointer group hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden rounded-xl bg-white"
                      onClick={() => handleServiceClick(service.id)}
                    >
                      <CardContent className="p-0 h-full flex flex-col">
                        <div className="aspect-video overflow-hidden relative">
                          <img
                            src={service.image || '/placeholder-service.jpg'}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-service.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                            <span className="bg-white/90 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                              {service.category}
                            </span>
                            <div className="flex items-center space-x-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>
                                {(() => {
                                  const rating = service.providers[0]?.average_rating;
                                  return typeof rating === 'number' 
                                    ? rating.toFixed(1) 
                                    : parseFloat(String(rating || 0)).toFixed(1);
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                            {service.description}
                          </p>
                          
                          <div className="mt-auto">
                            {service.providers && (
                              <div className="flex items-center justify-between pt-3 border-t">
                                <div>
                                  <span className="font-bold text-gray-900">
                                    KSH {(() => {
                                      const price = service.providers[0]?.price;
                                      return typeof price === 'number' 
                                        ? price.toFixed(2)
                                        : parseFloat(String(price || 0)).toFixed(2);
                                    })()}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-1">starting price</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                                    {Array.isArray(service.providers) ? service.providers.length : 0} {service.providers?.length === 1 ? 'Provider' : 'Providers'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-blue-50"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={currentPage === pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={currentPage === pageNum ? "bg-blue-600" : "hover:bg-blue-50"}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-blue-50"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  <div className="text-center text-sm text-gray-500 mt-3">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} services
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <ProviderListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        providers={serviceProviders}
        serviceName={selectedService?.name || ''}
        selectedServiceId={selectedService ? Number(selectedService.id) : undefined}
      />
            
      {/* Add this CSS at the bottom */}
      <style>
        {`
        .styled-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .styled-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 4V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        `}
      </style>
    </div>
  );
};

export default Services;