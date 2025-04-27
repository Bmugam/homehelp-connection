import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, Clock, Star, MapPin, Check, X, Loader2, ChevronLeft, ChevronRight, ImageIcon, UploadCloud } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from '../../../../apiConfig';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  client_name: string;
}

interface AvailabilityHours {
  monday?: { start: string; end: string; };
  tuesday?: { start: string; end: string; };
  wednesday?: { start: string; end: string; };
  thursday?: { start: string; end: string; };
  friday?: { start: string; end: string; };
  saturday?: { start: string; end: string; };
  sunday?: { start: string; end: string; };
}

interface Provider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  profile_image?: string;
  provider: {
    id: number;
    business_name: string;
    business_description: string;
    location: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    availability_hours: AvailabilityHours;
    average_rating: number;
    review_count: number;
    reviews: Review[];
    services: Array<{
      service_id: number;
      name: string;
      category: string;
      price: number;
      description: string;
      availability: {
        days: string[];
        hours: { start: string; end: string; }[];
      };
    }>;
  };
}

const defaultAvailabilityHours: AvailabilityHours = {
  monday: { start: '', end: '' },
  tuesday: { start: '', end: '' },
  wednesday: { start: '', end: '' },
  thursday: { start: '', end: '' },
  friday: { start: '', end: '' },
  saturday: { start: '', end: '' },
  sunday: { start: '', end: '' }
};

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

const ProvidersManagement = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddProviderDialogOpen, setIsAddProviderDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [availableServices, setAvailableServices] = useState<Array<{ id: number; name: string; category: string }>>([]);
  const [newProvider, setNewProvider] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    profile_image: '',
    provider: {
      business_name: '',
      business_description: '',
      location: '',
      verification_status: 'pending' as const,
      availability_hours: defaultAvailabilityHours,
      services: [] as Array<{
        service_id: number;
        name: string;
        category: string;
        price: number;
        description: string;
        availability: {
          days: string[];
          hours: { start: string; end: string; }[];
        };
      }>,
    }
  });
  const [verificationLoading, setVerificationLoading] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, []);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/providers`);
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      const data = await response.json();
      setProviders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setError('Failed to fetch providers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setAvailableServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setAvailableServices([]);
    }
  };

  const handleAddProvider = async () => {
    setSaveLoading(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/providers`, {
        method: 'POST',
        body: JSON.stringify({ ...newProvider, user_type: 'provider' })
      });
      
      if (response.ok) {
        fetchProviders();
        setIsAddProviderDialogOpen(false);
        setNewProvider({
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          password: '',
          profile_image: '',
          provider: {
            business_name: '',
            business_description: '',
            location: '',
            verification_status: 'pending',
            availability_hours: defaultAvailabilityHours,
            services: []
          }
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add provider');
      }
    } catch (error) {
      console.error('Error adding provider:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditProvider = async () => {
    if (!editingProvider) return;
    setSaveLoading(true);
    
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/providers/${editingProvider.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editingProvider)
        }
      );
      
      if (response.ok) {
        fetchProviders();
        setEditingProvider(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update provider');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) return;
    setDeleteLoading(providerId);

    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/providers/${providerId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await fetchProviders();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Failed to delete provider');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleVerificationStatus = async (providerId: number, status: string) => {
    setVerificationLoading(providerId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/providers/${providerId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verification_status: status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update verification status');
      }
      
      await fetchProviders();
      alert(`Provider has been ${status} successfully`);
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert(error.message || "Failed to update verification status");
    } finally {
      setVerificationLoading(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderBusinessHours = (hours: AvailabilityHours, onChange?: (day: string, field: 'start' | 'end', value: string) => void) => (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Clock className="w-4 h-4" /> Business Hours
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(defaultAvailabilityHours).map((day) => (
          <div key={day} className="border rounded-lg p-3">
            <Label className="capitalize font-medium">{day}</Label>
            {onChange ? (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Input 
                    type="time"
                    value={hours?.[day]?.start || ''}
                    onChange={(e) => onChange(day, 'start', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    type="time"
                    value={hours?.[day]?.end || ''}
                    onChange={(e) => onChange(day, 'end', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm mt-1">
                {hours?.[day]?.start ? `${hours[day].start} - ${hours[day].end}` : 'Closed'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderServiceCard = (service: any, index: number, editable: boolean) => (
    <div key={index} className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        {editable ? (
          <Select
            value={service.service_id.toString()}
            onValueChange={(value) => {
              const services = editable 
                ? [...editingProvider!.provider.services]
                : [...newProvider.provider.services];
              services[index] = {
                ...service,
                service_id: parseInt(value),
                name: availableServices.find(s => s.id === parseInt(value))?.name || ''
              };
              
              if (editable) {
                setEditingProvider({
                  ...editingProvider!,
                  provider: { ...editingProvider!.provider, services }
                });
              } else {
                setNewProvider({
                  ...newProvider,
                  provider: { ...newProvider.provider, services }
                });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {availableServices.map(service => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.name} ({service.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <h4 className="font-medium">{service.name}</h4>
        )}
      </div>
      
      {editable ? (
        <Input
          type="number"
          placeholder="Price"
          value={service.price}
          onChange={(e) => {
            const services = editable 
              ? [...editingProvider!.provider.services]
              : [...newProvider.provider.services];
            services[index] = { ...service, price: parseFloat(e.target.value) };
            
            if (editable) {
              setEditingProvider({
                ...editingProvider!,
                provider: { ...editingProvider!.provider, services }
              });
            } else {
              setNewProvider({
                ...newProvider,
                provider: { ...newProvider.provider, services }
              });
            }
          }}
        />
      ) : (
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-sm">
            {service.category}
          </Badge>
          <span className="font-semibold">${service.price?.toFixed(2) || '0.00'}</span>
        </div>
      )}
    </div>
  );

  const filteredProviders = providers.filter(provider =>
    `${provider.first_name} ${provider.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.provider.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProviders = filteredProviders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading providers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-destructive bg-destructive/10 p-4 rounded-lg max-w-md text-center">
          <p className="font-medium">{error}</p>
          <Button 
            variant="ghost" 
            className="mt-3"
            onClick={fetchProviders}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const renderImageUpload = (imageUrl: string | undefined, onChange: (newUrl: string) => void) => {
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await makeAuthenticatedRequest(
          `${API_BASE_URL}/api/upload-image`,
          {
            method: 'POST',
            headers: {
              // Remove Content-Type header to let browser set it with boundary
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData
          }
        );

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        onChange(data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      }
    };

    return (
      <div className="space-y-4">
        <Label>Profile Image</Label>
        <div className="flex items-start gap-4">
          <div className="border rounded-lg overflow-hidden w-32 h-32 flex items-center justify-center bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '';
                  target.classList.add('hidden');
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><ImageIcon class="w-8 h-8 text-muted-foreground" /></div>';
                  }
                }}
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2 flex-1">
            <div className="relative">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Supported formats: JPG, PNG, GIF (max 5MB)
            </p>
          </div>
        </div>
      </div>
    );
  };

  // The renderImageUpload function will now be available for use in both the add and edit dialogs

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Providers</h1>
          <p className="text-muted-foreground">Manage all service providers in your platform</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10" 
              placeholder="Search providers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddProviderDialogOpen(true)} className="gap-1">
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Provider</span>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-lg">Provider Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 w-10"></th>
                  <th className="text-left p-3">Provider</th>
                  <th className="text-left p-3 hidden md:table-cell">Business</th>
                  <th className="text-left p-3 hidden lg:table-cell">Location</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProviders.map((provider) => (
                  <tr key={provider.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={provider.profile_image} />
                        <AvatarFallback>
                          {getInitials(`${provider.first_name} ${provider.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{`${provider.first_name} ${provider.last_name}`}</div>
                      <div className="text-sm text-muted-foreground">{provider.email}</div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="font-medium">{provider.provider.business_name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {provider.provider.business_description}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{provider.provider.location}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant={
                            provider.provider.verification_status === 'verified' ? 'default' :
                            provider.provider.verification_status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className="w-fit"
                        >
                          {provider.provider.verification_status}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{provider.provider.average_rating?.toFixed(1) || 'N/A'}</span>
                          <span>({provider.provider.review_count || 0})</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedProvider(provider)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingProvider(provider)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteProvider(provider.id)}
                              disabled={deleteLoading === provider.id}
                            >
                              {deleteLoading === provider.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProviders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? 'No providers match your search' : 'No providers found'}
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredProviders.length)} of{' '}
                  {filteredProviders.length} providers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Provider Dialog */}
      <Dialog open={isAddProviderDialogOpen} onOpenChange={setIsAddProviderDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Add New Provider</span>
            </DialogTitle>
            <DialogDescription>
              Create a new service provider account with all necessary details
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="personal" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <div className="space-y-4">
                {renderImageUpload(
                  newProvider.profile_image,
                  (newUrl) => setNewProvider({...newProvider, profile_image: newUrl})
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input 
                      value={newProvider.first_name}
                      onChange={(e) => setNewProvider({...newProvider, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input 
                      value={newProvider.last_name}
                      onChange={(e) => setNewProvider({...newProvider, last_name: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={newProvider.email}
                    onChange={(e) => setNewProvider({...newProvider, email: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      value={newProvider.phone_number}
                      onChange={(e) => setNewProvider({...newProvider, phone_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input 
                      type="password"
                      value={newProvider.password}
                      onChange={(e) => setNewProvider({...newProvider, password: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="business">
              <div className="space-y-4">
                <div>
                  <Label>Business Name</Label>
                  <Input 
                    value={newProvider.provider.business_name}
                    onChange={(e) => setNewProvider({
                      ...newProvider,
                      provider: {...newProvider.provider, business_name: e.target.value}
                    })}
                  />
                </div>
                
                <div>
                  <Label>Business Description</Label>
                  <textarea 
                    className="min-h-[100px] p-3 border rounded-md w-full"
                    value={newProvider.provider.business_description}
                    onChange={(e) => setNewProvider({
                      ...newProvider,
                      provider: {...newProvider.provider, business_description: e.target.value}
                    })}
                  />
                </div>
                
                <div>
                  <Label>Location</Label>
                  <Input 
                    value={newProvider.provider.location}
                    onChange={(e) => setNewProvider({
                      ...newProvider,
                      provider: {...newProvider.provider, location: e.target.value}
                    })}
                  />
                </div>
                
                {renderBusinessHours(newProvider.provider.availability_hours, (day, field, value) => {
                  setNewProvider({
                    ...newProvider,
                    provider: {
                      ...newProvider.provider,
                      availability_hours: {
                        ...newProvider.provider.availability_hours,
                        [day]: { 
                          ...newProvider.provider.availability_hours[day],
                          [field]: value 
                        }
                      }
                    }
                  });
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="services">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {newProvider.provider.services.map((service, index) => (
                    renderServiceCard(service, index, false)
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setNewProvider({
                    ...newProvider,
                    provider: {
                      ...newProvider.provider,
                      services: [
                        ...newProvider.provider.services,
                        { service_id: 0, name: '', category: '', price: 0, description: '', availability: { days: [], hours: [] } }
                      ]
                    }
                  })}
                >
                  Add Service
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddProviderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProvider} disabled={saveLoading}>
              {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Provider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      {editingProvider && (
        <Dialog open={!!editingProvider} onOpenChange={() => setEditingProvider(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <span>Edit Provider</span>
              </DialogTitle>
              <DialogDescription>
                Update provider details and business information
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <div className="space-y-4">
                  {renderImageUpload(
                    editingProvider.profile_image,
                    (newUrl) => setEditingProvider({...editingProvider, profile_image: newUrl})
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input 
                        value={editingProvider.first_name}
                        onChange={(e) => setEditingProvider({...editingProvider, first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input 
                        value={editingProvider.last_name}
                        onChange={(e) => setEditingProvider({...editingProvider, last_name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={editingProvider.email}
                      onChange={(e) => setEditingProvider({...editingProvider, email: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label>Phone Number</Label>
                    <Input 
                      value={editingProvider.phone_number}
                      onChange={(e) => setEditingProvider({...editingProvider, phone_number: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="business">
                <div className="space-y-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input 
                      value={editingProvider.provider.business_name}
                      onChange={(e) => setEditingProvider({
                        ...editingProvider,
                        provider: {...editingProvider.provider, business_name: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label>Business Description</Label>
                    <textarea 
                      className="min-h-[100px] p-3 border rounded-md w-full"
                      value={editingProvider.provider.business_description}
                      onChange={(e) => setEditingProvider({
                        ...editingProvider,
                        provider: {...editingProvider.provider, business_description: e.target.value}
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label>Location</Label>
                    <Input 
                      value={editingProvider.provider.location}
                      onChange={(e) => setEditingProvider({
                        ...editingProvider,
                        provider: {...editingProvider.provider, location: e.target.value}
                      })}
                    />
                  </div>
                  
                  {renderBusinessHours(editingProvider.provider.availability_hours || defaultAvailabilityHours, (day, field, value) => {
                    setEditingProvider({
                      ...editingProvider,
                      provider: {
                        ...editingProvider.provider,
                        availability_hours: {
                          ...editingProvider.provider.availability_hours,
                          [day]: { 
                            ...editingProvider.provider.availability_hours[day],
                            [field]: value 
                          }
                        }
                      }
                    });
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="services">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {editingProvider.provider.services.map((service, index) => (
                      renderServiceCard(service, index, true)
                    ))}
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setEditingProvider({
                      ...editingProvider,
                      provider: {
                        ...editingProvider.provider,
                        services: [
                          ...editingProvider.provider.services,
                          { service_id: 0, name: '', category: '', price: 0, description: '', availability: { days: [], hours: [] } }
                        ]
                      }
                    })}
                  >
                    Add Service
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setEditingProvider(null)}>Cancel</Button>
              <Button onClick={handleEditProvider} disabled={saveLoading}>
                {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Provider Details Dialog */}
      {selectedProvider && (
        <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedProvider.profile_image} />
                  <AvatarFallback>
                    {getInitials(`${selectedProvider.first_name} ${selectedProvider.last_name}`)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle>{`${selectedProvider.first_name} ${selectedProvider.last_name}`}</DialogTitle>
                  <DialogDescription>{selectedProvider.provider.business_name}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedProvider.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{selectedProvider.phone_number}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Location</Label>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedProvider.provider.location}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Rating</Label>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <p>
                        {selectedProvider.provider.average_rating?.toFixed(1) || 'N/A'} 
                        <span className="text-muted-foreground"> ({selectedProvider.provider.review_count || 0} reviews)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Business Information</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">{selectedProvider.provider.business_description}</p>
                </div>
              </div>
              
              <Separator />
              
              {renderBusinessHours(selectedProvider.provider.availability_hours || defaultAvailabilityHours)}
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Services Offered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedProvider.provider.services?.map((service, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">{service.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-sm text-muted-foreground">
                          {service.availability?.days?.join(', ') || 'No days specified'}
                        </div>
                        <span className="font-semibold">${service.price?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Reviews</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-4 pr-4">
                    {selectedProvider.provider.reviews?.length > 0 ? (
                      selectedProvider.provider.reviews.map(review => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{review.client_name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                            </div>
                            <p className="text-sm mt-2">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          No reviews yet
                        </div>
                      )}
                  </div>
                </ScrollArea>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-3">Verification Status</h3>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      selectedProvider.provider.verification_status === 'verified' ? 'default' :
                      selectedProvider.provider.verification_status === 'pending' ? 'secondary' : 'destructive'
                    }
                    className="text-sm px-3 py-1"
                  >
                    {selectedProvider.provider.verification_status}
                  </Badge>
                  
                  {selectedProvider.provider.verification_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleVerificationStatus(selectedProvider.provider.id, 'verified')}
                        disabled={verificationLoading === selectedProvider.provider.id}
                      >
                        {verificationLoading === selectedProvider.provider.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => handleVerificationStatus(selectedProvider.provider.id, 'rejected')}
                        disabled={verificationLoading === selectedProvider.provider.id}
                      >
                        {verificationLoading === selectedProvider.provider.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {selectedProvider.provider.verification_status === 'rejected' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleVerificationStatus(selectedProvider.provider.id, 'verified')}
                      disabled={verificationLoading === selectedProvider.provider.id}
                    >
                      {verificationLoading === selectedProvider.provider.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Approve Now</span>
                        </>
                      )}
                    </Button>
                  )}

                  {selectedProvider.provider.verification_status === 'verified' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => handleVerificationStatus(selectedProvider.provider.id, 'rejected')}
                      disabled={verificationLoading === selectedProvider.provider.id}
                    >
                      {verificationLoading === selectedProvider.provider.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          <span>Revoke Verification</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProvider(null)}>Close</Button>
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={() => {
                  setEditingProvider(selectedProvider);
                  setSelectedProvider(null);
                }}
              >
                <Edit className="h-4 w-4" />
                Edit Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProvidersManagement;