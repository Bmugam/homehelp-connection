import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Star, DollarSign, Clock, Tag, Users, Palette, Filter, ChevronLeft, ChevronRight, Menu, Package, Coffee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Service, ServiceCreateInput, ServiceWithDefaults, DEFAULT_SERVICE_VALUES } from "@/types/service";
import { API_BASE_URL } from '../../../../apiConfig';
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent } from 'react';

// Helper for network requests
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

// Logging utility
const debugLog = (action: string, data: Record<string, unknown>) => {
  console.log(`[Services ${action}]`, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Consolidated image URL handling
const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const cleanPath = imageUrl.split('/').filter(Boolean).join('/');
  return `${API_BASE_URL}/${cleanPath}`;
};

// Get random pastel color based on category name for category badges
const getCategoryColor = (category: string) => {
  const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 85%)`;
};

const ServicesManagement = () => {
  const queryClient = useQueryClient();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Provider edits state
  const [providerEdits, setProviderEdits] = useState<Record<string, { price: number; duration: number; isActive: boolean }>>({});

  // Image preview states
  const [newServiceImageFile, setNewServiceImageFile] = useState<File | null>(null);
  const [newServiceImagePreview, setNewServiceImagePreview] = useState<string | null>(null);
  const [editingServiceImageFile, setEditingServiceImageFile] = useState<File | null>(null);
  const [editingServiceImagePreview, setEditingServiceImagePreview] = useState<string | null>(null);

  // New service form state
  const [newService, setNewService] = useState<ServiceCreateInput>({
    name: '',
    description: '',
    category: '',
    price: 0,
    duration: 30,
    imageUrl: ''
  });

  // Initialize providerEdits when selectedService changes
  React.useEffect(() => {
    if (selectedService && selectedService.providers) {
      const initialEdits: Record<string, { price: number; duration: number; isActive: boolean }> = {};
      selectedService.providers.forEach((provider) => {
        if (provider && provider.provider_id) {
          initialEdits[provider.provider_id] = {
            price: typeof provider.price === 'number' ? provider.price : 0,
            duration: typeof provider.duration === 'number' ? provider.duration : 30,
            isActive: typeof provider.isActive === 'boolean' ? provider.isActive : true,
          };
        }
      });
      setProviderEdits(initialEdits);
    } else {
      setProviderEdits({});
    }
  }, [selectedService]);

  // Clean up image previews
  React.useEffect(() => {
    return () => {
      if (newServiceImagePreview) URL.revokeObjectURL(newServiceImagePreview);
      if (editingServiceImagePreview) URL.revokeObjectURL(editingServiceImagePreview);
    };
  }, [newServiceImagePreview, editingServiceImagePreview]);

  // Fetch services
  const { data: services = [], isLoading, error } = useQuery<Service[]>({
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
          providers: Array.isArray(service?.providers) ? service.providers : [],
          imageUrl: service?.image || null
        }));
      } catch (error) {
        debugLog('Fetch', { status: 'error', error });
        throw error;
      }
    }
  });

  // Service CRUD mutations
  const createServiceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      debugLog('Create', { service: formData });
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/services`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized access');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsAddServiceDialogOpen(false);
      resetNewServiceForm();
      toast({ title: "Success", description: "Service created successfully" });
    },
    onError: (error) => {
      debugLog('Create', { status: 'error', error });
      toast({ variant: "destructive", title: "Error", description: "Failed to create service" });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ formData, id }: { formData: FormData; id: string }) => {
      debugLog('Update', { id });
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized access');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setEditingService(null);
      toast({ title: "Success", description: "Service updated successfully" });
    },
    onError: (error) => {
      debugLog('Update', { status: 'error', error });
      toast({ variant: "destructive", title: "Error", description: "Failed to update service" });
    }
  });

  const updateProviderServiceMutation = useMutation({
    mutationFn: async ({ providerId, serviceId, price, duration, isActive }: { 
      providerId: string; 
      serviceId: string; 
      price: number; 
      duration: number; 
      isActive: boolean 
    }) => {
      debugLog('Update Provider Service', { providerId, serviceId, price, duration, isActive });
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/provider-services/${providerId}/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ price, duration, isActive }),
      });
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized access');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setSelectedService(null);
      toast({ title: "Success", description: "Provider service updated successfully" });
    },
    onError: (error) => {
      debugLog('Update Provider Service', { status: 'error', error });
      toast({ variant: "destructive", title: "Error", description: "Failed to update provider service" });
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
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: "Success", description: "Service deleted successfully" });
    },
    onError: (error) => {
      debugLog('Delete', { status: 'error', error });
      toast({ variant: "destructive", title: "Error", description: "Failed to delete service" });
    }
  });

  // Form handlers
  const handleAddService = () => {
    if (!newService.name.trim() || !newService.category.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Service name and category are required." });
      return;
    }

    if (newServiceImageFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(newServiceImageFile.type)) {
        toast({ variant: "destructive", title: "Invalid Image Type", description: "Please upload a JPEG, PNG, GIF, or WEBP image." });
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (newServiceImageFile.size > maxSize) {
        toast({ variant: "destructive", title: "Image Too Large", description: "Image size must be less than 5MB." });
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', newService.name.trim());
    formData.append('description', newService.description.trim());
    formData.append('category', newService.category.trim());
    if (newServiceImageFile) formData.append('image', newServiceImageFile);

    createServiceMutation.mutate(formData);
  };

  const handleEditService = (service: Service) => {
    if (!service.name.trim() || !service.category.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Service name and category are required." });
      return;
    }

    const formData = new FormData();
    formData.append('name', service.name.trim());
    formData.append('description', (service.description || '').trim());
    formData.append('category', (service.category || '').trim());

    if (editingServiceImageFile) {
      formData.append('image', editingServiceImageFile);
    } else if (service.imageUrl === '') {
      formData.append('image', '');
    }

    updateServiceMutation.mutate({ formData, id: service.id });
  };

  const handleUpdateProviderService = (providerId: string | number, serviceId: string | number, price: number, duration: number, isActive: boolean) => {
    updateProviderServiceMutation.mutate({ 
      providerId: providerId.toString(), 
      serviceId: serviceId.toString(), 
      price, 
      duration, 
      isActive 
    });
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedServices.length || !window.confirm(`Are you sure you want to delete ${selectedServices.length} services?`)) {
      return;
    }

    debugLog('BulkDelete', { count: selectedServices.length });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/services/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedServices.map(id => id.toString()) })
      });
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Unauthorized access');
      }

      queryClient.invalidateQueries({ queryKey: ['services'] });
      setSelectedServices([]);
      toast({ title: "Success", description: `${selectedServices.length} services deleted successfully` });
    } catch (error) {
      debugLog('BulkDelete', { status: 'error', error });
      toast({ variant: "destructive", title: "Error", description: "Failed to delete services" });
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

  const handleRemoveNewServiceImage = () => {
    if (newServiceImagePreview) URL.revokeObjectURL(newServiceImagePreview);
    setNewServiceImageFile(null);
    setNewServiceImagePreview(null);
  };

  const handleNewServiceImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (newServiceImagePreview) URL.revokeObjectURL(newServiceImagePreview);
    setNewServiceImageFile(file);
    setNewServiceImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const resetNewServiceForm = () => {
    setNewService({
      name: '',
      description: '',
      category: '',
      price: 0,
      duration: 30,
      imageUrl: ''
    });
    if (newServiceImagePreview) URL.revokeObjectURL(newServiceImagePreview);
    setNewServiceImageFile(null);
    setNewServiceImagePreview(null);
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    setSelectedServices(selectedServices.length === filteredServices.length 
      ? [] 
      : filteredServices.map(service => service.id.toString())
    );
  };

  // Get unique categories for filter tabs
  const categories = ['all', ...new Set(services.map(service => service.category))].filter(Boolean);

  // Filter services by search term and active category
  const filteredServices = React.useMemo(() => {
    return services.filter(service => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, activeCategory]);

  // Calculate total pages after filteredServices is defined
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Get current page services
  const currentServices = React.useMemo(() => {
    return filteredServices.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredServices, currentPage, itemsPerPage]);

  // Handle page change with validation
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Get the total count of active services
  const activeServicesCount = React.useMemo(() => {
    return services.filter(service => service.isActive).length;
  }, [services]);

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-2 border-indigo-100 border-t-indigo-300 animate-spin"></div>
          </div>
          <p className="text-indigo-700 font-medium text-lg">Loading your services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white border border-red-200 rounded-lg p-8 max-w-md shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Unable to Load Services</h3>
          </div>
          <p className="text-gray-600 mb-6">{String(error)}</p>
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-300"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['services'] })}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b pb-4 mb-8">
          <div className="flex flex-col gap-4">
            {/* Title and Actions Row */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Services Directory
              </h1>
              <div className="flex gap-2">
                {selectedServices.length > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={handleBulkDelete} 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedServices.length})
                  </Button>
                )}
                <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        <Package className="h-6 w-6 text-indigo-500" />
                        Add New Service
                      </DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new service to the platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name" className="flex items-center gap-1">
                            <span>Service Name*</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={newService.name || ''}
                            onChange={handleInputChange}
                            placeholder="Enter service name"
                            className="w-full border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="category" className="flex items-center gap-1">
                            <span>Category</span>
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="category"
                            name="category"
                            value={newService.category || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., Cleaning, Plumbing, etc."
                            className="w-full border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          value={newService.description || ''}
                          onChange={handleInputChange}
                          placeholder="Brief description of the service"
                          className="w-full border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="price">Price ($)</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500" />
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={newService.price?.toString() || '0'}
                              onChange={handleInputChange}
                              className="pl-10 border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="duration">Duration (minutes)</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500" />
                            <Input
                              id="duration"
                              name="duration"
                              type="number"
                              min="1"
                              value={newService.duration?.toString() || '30'}
                              onChange={handleInputChange}
                              className="pl-10 border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-imageFile">Image File</Label>
                        <div className="relative border-2 border-dashed border-indigo-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                          <div className="flex items-center justify-center flex-col">
                            <ImageIcon className="h-8 w-8 text-indigo-400 mb-2" />
                            <p className="text-sm text-gray-500 mb-2">Upload a service image</p>
                            <input
                              id="new-imageFile"
                              type="file"
                              accept="image/*"
                              onChange={handleNewServiceImageChange}
                              className="hidden"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('new-imageFile')?.click()}
                              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                              Select File
                            </Button>
                          </div>
                        </div>
                        {newServiceImagePreview && (
                          <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={newServiceImagePreview}
                              alt="New Service Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleRemoveNewServiceImage}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetNewServiceForm();
                          setIsAddServiceDialogOpen(false);
                        }}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleAddService}
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
                        disabled={createServiceMutation.isPending}
                      >
                        {createServiceMutation.isPending ? (
                          <>
                            <span className="mr-2">Creating...</span>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </>
                        ) : (
                          'Create Service'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`px-2 ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  >
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-2 ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="w-3 h-0.5 bg-current rounded-sm"></div>
                      <div className="w-3 h-0.5 bg-current rounded-sm"></div>
                      <div className="w-3 h-0.5 bg-current rounded-sm"></div>
                    </div>
                  </Button>
                </div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                  {services.length} Total
                </Badge>
              </div>
            </div>

            {/* Categories Row */}
            <div className="flex overflow-x-auto pb-2 gap-2 -mb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={
                    activeCategory === category
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }
                >
                  {category === 'all' ? 'All' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Rest of the content */}
        <div className="mb-8">
          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-10 text-center">
              <div className="bg-indigo-50 p-4 rounded-full mb-4">
                <Package className="h-10 w-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No services found</h3>
              {searchTerm ? (
                <p className="text-gray-600 max-w-md">
                  No services matched your search for "{searchTerm}". Try a different search term or clear the filter.
                </p>
              ) : (
                <p className="text-gray-600 max-w-md">
                  You haven't added any services yet. Get started by adding your first service.
                </p>
              )}
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                  !services.length && setIsAddServiceDialogOpen(true);
                }}
                className="mt-6 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              >
                {searchTerm || activeCategory !== 'all' ? (
                  <>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Service
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && filteredServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentServices.map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow relative group">
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Checkbox
                      checked={selectedServices.includes(service.id.toString())}
                      onCheckedChange={() => handleSelectService(service.id.toString())}
                      className="h-5 w-5 border-indigo-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 shadow-sm"
                    />
                  </div>
                  <div className="relative h-40 bg-gray-100">
                    {service.imageUrl ? (
                      <img
                        src={getImageUrl(service.imageUrl)}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    <Badge
                      className="absolute bottom-2 left-2"
                      style={{
                        backgroundColor: getCategoryColor(service.category || ''),
                        color: 'rgba(0,0,0,0.7)'
                      }}
                    >
                      {service.category}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-lg font-semibold">{service.name}</span>
                      <Badge 
                        variant="outline" 
                        className={service.isActive 
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                        }
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {service.description || "No description provided"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-indigo-500 mr-1" />
                          <span className="text-sm font-medium">{service.price?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-indigo-500 mr-1" />
                          <span className="text-sm">{service.duration || 30} min</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingService(service);
                            if (service.imageUrl) {
                              setEditingServiceImagePreview(getImageUrl(service.imageUrl));
                            } else {
                              setEditingServiceImagePreview(null);
                            }
                          }}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedService(service);
                            setIsProviderDialogOpen(true);
                          }}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Users className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id.toString())}
                          className="border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && filteredServices.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">
                        <Checkbox
                          checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                          onCheckedChange={handleSelectAll}
                          className="border-indigo-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-3">Service</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Duration</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedServices.includes(service.id.toString())}
                            onCheckedChange={() => handleSelectService(service.id.toString())}
                            className="border-indigo-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                              {service.imageUrl ? (
                                <img
                                  src={getImageUrl(service.imageUrl)}
                                  alt={service.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                  }}
                                />
                              ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{service.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{service.description || "No description"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            style={{
                              backgroundColor: getCategoryColor(service.category || ''),
                              color: 'rgba(0,0,0,0.7)'
                            }}
                          >
                            {service.category || "Uncategorized"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-indigo-500 mr-1" />
                            <span className="text-sm font-medium">{service.price?.toFixed(2) || "0.00"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-indigo-500 mr-1" />
                            <span className="text-sm">{service.duration || 30} min</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {service.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingService(service);
                                if (service.imageUrl) {
                                  setEditingServiceImagePreview(getImageUrl(service.imageUrl));
                                } else {
                                  setEditingServiceImagePreview(null);
                                }
                              }}
                              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedService(service);
                                setIsProviderDialogOpen(true);
                              }}
                              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Users className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteService(service.id.toString())}
                              className="border-red-200 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredServices.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} services
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show 5 page buttons centered around the current page
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
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-indigo-500 text-white hover:bg-indigo-600"
                            : "border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Service Dialog */}
      <Dialog 
        open={!!editingService} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingService(null);
            setEditingServiceImageFile(null);
            if (editingServiceImagePreview) URL.revokeObjectURL(editingServiceImagePreview);
            setEditingServiceImagePreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Edit className="h-6 w-6 text-indigo-500" />
              Edit Service
            </DialogTitle>
            <DialogDescription>
              Update the details of your service.
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="flex items-center gap-1">
                    <span>Service Name</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    placeholder="Enter service name"
                    className="w-full border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category" className="flex items-center gap-1">
                    <span>Category</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-category"
                    value={editingService.category || ''}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    placeholder="e.g., Cleaning, Plumbing, etc."
                    className="w-full border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Brief description of the service"
                  className="w-full border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-imageFile">Image File</Label>
                <div className="relative border-2 border-dashed border-indigo-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-center flex-col">
                    <ImageIcon className="h-8 w-8 text-indigo-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Upload a new service image</p>
                    <input
                      id="edit-imageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (editingServiceImagePreview && editingServiceImagePreview !== getImageUrl(editingService.imageUrl)) {
                          URL.revokeObjectURL(editingServiceImagePreview);
                        }
                        setEditingServiceImageFile(file);
                        setEditingServiceImagePreview(file ? URL.createObjectURL(file) : null);
                        setEditingService({ ...editingService, imageUrl: file ? 'pending-upload' : editingService.imageUrl });
                      }}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('edit-imageFile')?.click()}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      Select File
                    </Button>
                  </div>
                </div>
                {(editingServiceImagePreview || editingService.imageUrl) && (
                  <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={editingServiceImagePreview || getImageUrl(editingService.imageUrl)}
                      alt="Service Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (editingServiceImagePreview && editingServiceImagePreview !== getImageUrl(editingService.imageUrl)) {
                          URL.revokeObjectURL(editingServiceImagePreview);
                        }
                        setEditingServiceImageFile(null);
                        setEditingServiceImagePreview(null);
                        setEditingService({ ...editingService, imageUrl: '' });
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-isActive"
                  checked={editingService.isActive}
                  onCheckedChange={(checked) => setEditingService({ ...editingService, isActive: !!checked })}
                  className="border-indigo-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                />
                <Label htmlFor="edit-isActive" className="cursor-pointer">Active service</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setEditingService(null);
                setEditingServiceImageFile(null);
                if (editingServiceImagePreview) URL.revokeObjectURL(editingServiceImagePreview);
                setEditingServiceImagePreview(null);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => editingService && handleEditService(editingService)}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              disabled={updateServiceMutation.isPending}
            >
              {updateServiceMutation.isPending ? (
                <>
                  <span className="mr-2">Updating...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provider Dialog */}
      <Dialog 
        open={isProviderDialogOpen} 
        onOpenChange={setIsProviderDialogOpen}
      >
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-500" />
              Manage Providers for {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              Customize pricing and duration for each provider that offers this service.
            </DialogDescription>
          </DialogHeader>
          {selectedService && selectedService.providers && (
            <div className="py-4">
              {selectedService.providers.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Providers</h3>
                  <p className="text-gray-500 mb-4">This service doesn't have any assigned providers yet.</p>
                  <Button 
                    onClick={() => setIsProviderDialogOpen(false)}
                    className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
                  >
                    Go to Providers
                  </Button>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-2">Provider</th>
                        <th className="px-4 py-2">Price ($)</th>
                        <th className="px-4 py-2">Duration (min)</th>
                        <th className="px-4 py-2">Active</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedService.providers.map((provider) => (
                        provider && provider.provider_id ? (
                          <tr key={provider.provider_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={getImageUrl(provider.avatar)} />
                                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                    {provider.name?.charAt(0) || 'P'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{provider.name || 'Unknown Provider'}</p>
                                  <p className="text-xs text-gray-500">{provider.email || ''}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500" />
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={providerEdits[provider.provider_id]?.price?.toString() || '0'}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                    setProviderEdits({
                                      ...providerEdits,
                                      [provider.provider_id]: {
                                        ...providerEdits[provider.provider_id],
                                        price: value
                                      }
                                    });
                                  }}
                                  className="pl-10 border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-500" />
                                <Input
                                  type="number"
                                  min="1"
                                  value={providerEdits[provider.provider_id]?.duration?.toString() || '30'}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? 30 : parseInt(e.target.value, 10) || 30;
                                    setProviderEdits({
                                      ...providerEdits,
                                      [provider.provider_id]: {
                                        ...providerEdits[provider.provider_id],
                                        duration: value
                                      }
                                    });
                                  }}
                                  className="pl-10 border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Checkbox
                                checked={providerEdits[provider.provider_id]?.isActive || false}
                                onCheckedChange={(checked) => {
                                  setProviderEdits({
                                    ...providerEdits,
                                    [provider.provider_id]: {
                                      ...providerEdits[provider.provider_id],
                                      isActive: !!checked
                                    }
                                  });
                                }}
                                className="border-indigo-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const edits = providerEdits[provider.provider_id];
                                  if (edits && selectedService) {
                                    handleUpdateProviderService(
                                      provider.provider_id,
                                      selectedService.id,
                                      edits.price,
                                      edits.duration,
                                      edits.isActive
                                    );
                                  }
                                }}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                              >
                                Update
                              </Button>
                            </td>
                          </tr>
                        ) : null
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setIsProviderDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;