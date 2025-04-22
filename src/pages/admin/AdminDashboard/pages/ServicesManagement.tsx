import React, { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Service, ServiceCreateInput, ServiceWithDefaults, DEFAULT_SERVICE_VALUES } from "@/types/service";
import { API_BASE_URL } from '../../../../apiConfig';
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const makeAuthenticatedRequest = async (url: string, options = {}) => {
  const token = localStorage.getItem('token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...options
  };

  const response = await fetch(url, defaultOptions);
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized access');
  }
  return response;
};

const debugLog = (action: string, data: any) => {
  console.log(`[Services ${action}]`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

const ServicesManagement = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [newService, setNewService] = useState<ServiceCreateInput>({
    name: '',
    description: '',
    category: '',
    price: 0,
    duration: 30
  });

  const {
    data: services = [],
    isLoading,
    error
  } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      debugLog('Fetch', { status: 'starting' });
      try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/services`);
        const data = await response.json();
        debugLog('Fetch', { status: 'success', count: data.length });
        return data.map(service => ({
          ...DEFAULT_SERVICE_VALUES,
          ...service,
          price: Number(service?.price || 0),
          providers: Array.isArray(service?.providers) ? service.providers : []
        }));
      } catch (error) {
        debugLog('Fetch', { status: 'error', error });
        throw error;
      }
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (newService: ServiceCreateInput) => {
      debugLog('Create', { service: newService });
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/services`,
        {
          method: 'POST',
          body: JSON.stringify(newService)
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsAddServiceDialogOpen(false);
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    },
    onError: (error) => {
      debugLog('Create', { status: 'error', error });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create service"
      });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (service: Service) => {
      debugLog('Update', { service });
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/services/${service.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(service)
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setEditingService(null);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    },
    onError: (error) => {
      debugLog('Update', { status: 'error', error });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update service"
      });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      debugLog('Delete', { serviceId });
      await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/services/${serviceId}`,
        { method: 'DELETE' }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    },
    onError: (error) => {
      debugLog('Delete', { status: 'error', error });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service"
      });
    }
  });

  const handleAddService = () => {
    createServiceMutation.mutate(newService);
  };

  const handleEditService = (service: Service) => {
    updateServiceMutation.mutate(service);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedServices.length ||
      !window.confirm(`Are you sure you want to delete ${selectedServices.length} services?`)) {
      return;
    }

    debugLog('BulkDelete', { count: selectedServices.length });
    try {
      await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/services/bulk-delete`,
        {
          method: 'DELETE',
          body: JSON.stringify({ ids: selectedServices })
        }
      );

      queryClient.invalidateQueries(['services']);
      setSelectedServices([]);
      toast({
        title: "Success",
        description: `${selectedServices.length} services deleted successfully`,
      });
    } catch (error) {
      debugLog('BulkDelete', { status: 'error', error });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete services"
      });
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    setNewService(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? value === '' ? 0 : parseFloat(value) || 0
        : value || ''
    }));
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(service => service.id));
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services Directory</h1>
        <div className="flex gap-4 fixed top-4 right-6 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm">
          {selectedServices.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected ({selectedServices.length})
            </Button>
          )}
          <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new service to the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newService.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter service name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newService.description || ''}
                    onChange={handleInputChange}
                    placeholder="Brief description of the service"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={newService.category || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Cleaning, Plumbing, etc."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newService.price?.toString() || '0'}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min="1"
                      value={newService.duration?.toString() || '30'}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddService}>Add Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Search services..."
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Checkbox
            checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-500">
            {selectedServices.length} of {filteredServices.length} selected
          </span>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => {
          const price = typeof service?.price === 'number' ? service.price : 0;

          return (
            <Card
              key={service.id}
              className={`hover:shadow-lg transition-shadow ${
                selectedServices.includes(service.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => handleSelectService(service.id)}
                  />
                  <CardTitle>{service?.name || 'Unnamed Service'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">{service?.description || 'No description available'}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium">Base Price:</span>
                      <span className="ml-2">${price.toFixed(2)}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      service?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {service?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setSelectedService(service);
                        setIsProviderDialogOpen(true);
                      }}
                    >
                      <span className="flex items-center gap-1">
                        👥 {service.providers.length} Provider{service.providers.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-blue-500">→</span>
                    </Button>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedService?.name} Providers
              <span className="ml-2 text-sm text-gray-500">
                ({selectedService?.providers.length || 0} total)
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedService?.providers?.filter(provider => provider && Object.keys(provider).length > 0)
              .map((provider) => {
                const price = typeof provider?.price === 'number' ? provider.price : 0;
                const rating = typeof provider?.average_rating === 'number' ? provider.average_rating : 0;
                const reviews = typeof provider?.review_count === 'number' ? provider.review_count : 0;

                return (
                  <Card key={provider.provider_id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{provider?.business_name || 'Unnamed Business'}</h3>
                          <p className="text-sm text-gray-500">{provider?.provider_name || 'Unknown Provider'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          provider?.verification_status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {provider?.verification_status || 'Pending'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>📍 {provider?.location || 'Location not specified'}</p>
                        <p>💰 ${price.toFixed(2)}</p>
                        <p>⭐ {rating.toFixed(1)} ({reviews} reviews)</p>
                      </div>
                      {provider?.description && (
                        <p className="text-sm text-gray-600 border-t pt-2 mt-2">
                          {provider.description}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;
