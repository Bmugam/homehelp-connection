import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Tag,
  Pencil,
  Bookmark,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react";

// Types
interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  active: boolean;
  image?: string;
  providerId?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

// Debug logger
const debug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MyServices] ${message}`, data || '');
  }
};

const ProviderMyServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    availability: {
      days: [] as string[],
      timeSlots: [] as string[]
    },
    active: true
  });

  

  // Fetch services from the backend
  const fetchServices = async () => {
    if (!user?.id) {
      debug('No user ID found');
      return;
    }
    
    try {
      setLoading(true);
      debug('Fetching services for provider:', user.id);
      
      // Use the correct provider services endpoint
      const response = await apiService.providers.getServices(user.id);
      const servicesData = response.data || [];
      
      debug('Services fetched:', servicesData);
      setServices(servicesData);
      setFilteredServices(servicesData);

      // Use the correct categories endpoint
      const categoriesResponse = await apiService.services.getCategories();
      const categoriesData = categoriesResponse.data || [];
      setCategories(categoriesData.map((cat: any) => cat.name));
      
    } catch (error: any) {
      debug('Error fetching services:', error);
      toast.error(error.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  // Filter services when search or category changes
  useEffect(() => {
    const filtered = services.filter(service => {
      const matchesSearch = 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === 'all' || 
        service.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredServices(filtered);
  }, [searchQuery, categoryFilter, services]);

  const handleAddService = async () => {
    try {
      debug('Adding new service:', formData);
      
      if (!user?.id) {
        toast.error('User ID is required');
        return;
      }

      // Validate form
      if (!formData.name || !formData.category || !formData.price) {
        toast.error('Please fill in all required fields');
        return;
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      const serviceData = {
        ...formData,
        price,
        providerId: user.id,
        active: true
      };

      // Use the correct service creation endpoint
      const response = await apiService.providers.addService(user.id, serviceData);
      debug('Service added successfully:', response.data);
      
      setServices(prev => [...prev, response.data]);
      toast.success('Service added successfully');
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      debug('Error adding service:', error);
      toast.error(error.message || 'Failed to add service');
    }
  };

  const handleUpdateService = async () => {
    if (!editingService || !user?.id) return;
    
    try {
      debug('Updating service:', editingService.id);
      
      const updatedData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      // Use the correct service update endpoint
      const response = await apiService.providers.updateService(
        user.id,
        editingService.id,
        updatedData
      );
      
      debug('Service updated successfully:', response.data);
      
      setServices(prev => 
        prev.map(service => 
          service.id === editingService.id 
            ? response.data
            : service
        )
      );
      
      toast.success('Service updated successfully');
      resetForm();
      setEditingService(null);
    } catch (error: any) {
      debug('Error updating service:', error);
      toast.error(error.message || 'Failed to update service');
    }
  };

  const handleEditService = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      availability: service.availability,
      active: service.active
    });
    setEditingService(service);
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?') || !user?.id) {
      return;
    }

    try {
      debug('Deleting service:', id);
      
      // Use the correct service deletion endpoint
      await apiService.providers.deleteService(user.id, id);
      debug('Service deleted successfully');
      
      setServices(prev => prev.filter(service => service.id !== id));
      toast.success('Service deleted successfully');
    } catch (error: any) {
      debug('Error deleting service:', error);
      toast.error(error.message || 'Failed to delete service');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!user?.id) return;

    try {
      debug('Toggling service status:', { id, currentStatus });
      
      // Use the correct status toggle endpoint
      const response = await apiService.providers.toggleServiceStatus(
        user.id,
        id,
        !currentStatus
      );
      
      debug('Service status updated:', response.data);
      
      setServices(prev => 
        prev.map(service => 
          service.id === id 
            ? { ...service, active: !currentStatus }
            : service
        )
      );
      
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      debug('Error toggling service status:', error);
      toast.error(error.message || 'Failed to update service status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      availability: {
        days: [],
        timeSlots: []
      },
      active: true
    });
  };

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-homehelp-600">Please login to view services</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-homehelp-600">Loading services...</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">My Services</h1>
          <p className="text-homehelp-600">Manage the services you offer to clients</p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Tag className="h-4 w-4 text-homehelp-600" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Services Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active" className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Active Services
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Inactive Services
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            All Services
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {filteredServices.filter(s => s.active).length > 0 ? (
            filteredServices
              .filter(s => s.active)
              .map(service => (
                <ServiceCard 
                  key={service.id} 
                  service={service}  
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                  onToggleActive={handleToggleActive}
                />
              ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-homehelp-600">No active services found.</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          {filteredServices.filter(s => !s.active).length > 0 ? (
            filteredServices
              .filter(s => !s.active)
              .map(service => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                  onToggleActive={handleToggleActive}
                />
              ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-homehelp-600">No inactive services found.</p>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {filteredServices.length > 0 ? (
            filteredServices.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onEdit={handleEditService}
                onDelete={handleDeleteService}
                onToggleActive={handleToggleActive}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-homehelp-600">No services found.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Service Dialog */}
      <Dialog 
        open={isAddDialogOpen || editingService !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingService(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService 
                ? 'Update the details of your service' 
                : 'Fill in the details to add a new service to your profile'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="mb-2 block">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. House Cleaning"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="mb-2 block">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="price" className="mb-2 block">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g. 75"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description" className="mb-2 block">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service in detail"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="col-span-2">
                <Label className="mb-2 block">Availability</Label>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-homehelp-600 mb-1">Available Days</p>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <Button
                          key={day}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`${
                            formData.availability.days.includes(day) 
                              ? 'bg-homehelp-100 border-homehelp-500' 
                              : ''
                          }`}
                          onClick={() => {
                            const days = formData.availability.days.includes(day)
                              ? formData.availability.days.filter(d => d !== day)
                              : [...formData.availability.days, day];
                            setFormData({
                              ...formData, 
                              availability: {...formData.availability, days}
                            });
                          }}
                        >
                          {day.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-homehelp-600 mb-1">Time Slots</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '8:00 AM - 12:00 PM', 
                        '12:00 PM - 4:00 PM', 
                        '4:00 PM - 8:00 PM'
                      ].map(slot => (
                        <Button
                          key={slot}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`${
                            formData.availability.timeSlots.includes(slot) 
                              ? 'bg-homehelp-100 border-homehelp-500' 
                              : ''
                          }`}
                          onClick={() => {
                            const timeSlots = formData.availability.timeSlots.includes(slot)
                              ? formData.availability.timeSlots.filter(s => s !== slot)
                              : [...formData.availability.timeSlots, slot];
                            setFormData({
                              ...formData, 
                              availability: {...formData.availability, timeSlots}
                            });
                          }}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setEditingService(null);
            }}>
              Cancel
            </Button>
            <Button onClick={editingService ? handleUpdateService : handleAddService}>
              {editingService ? 'Save Changes' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component for service cards
const ServiceCard = ({ 
  service, 
  onEdit, 
  onDelete,
  onToggleActive
}: { 
  service: Service, 
  onEdit: (service: Service) => void,
  onDelete: (id: number) => void,
  onToggleActive: (id: number, active: boolean) => void
}) => {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-homehelp-200">
            {service.image ? (
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-homehelp-400 text-white text-xl font-bold">
                {service.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
            <div>
              <div className="flex items-center">
                <h3 className="font-medium text-lg text-homehelp-900">{service.name}</h3>
                <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${
                  service.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {service.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-homehelp-600">
                <Tag className="h-3 w-3 inline mr-1" />
                {service.category}
              </p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="text-lg font-semibold text-homehelp-900">
                ${service.price.toFixed(2)}
              </span>
              <span className="text-sm text-homehelp-600">/service</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-homehelp-600 line-clamp-2">{service.description}</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-homehelp-600">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {service.availability.days.join(', ')}
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {service.availability.timeSlots.length} time slots
              </span>
            </div>
            
            <div className="flex space-x-2 mt-3 md:mt-0">
              <Button
                onClick={() => onToggleActive(service.id, service.active)}
                variant="outline"
                size="sm"
              >
                {service.active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                onClick={() => onEdit(service)}
                variant="outline"
                size="sm"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => onDelete(service.id)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProviderMyServices;