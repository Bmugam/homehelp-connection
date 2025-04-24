import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from '../../../../apiConfig';

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
      console.log(data);
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
      // Set empty array as fallback
      setAvailableServices([]);
    }
  };

  const handleAddProvider = async () => {
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
    }
  };

  const handleEditProvider = async () => {
    if (!editingProvider) return;

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
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) return;

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
    }
  };

  const handleVerificationStatus = async (providerId: number, status: string) => {
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
    }
  };

  const renderBusinessHours = (hours: AvailabilityHours, onChange: (day: string, field: 'start' | 'end', value: string) => void) => (
    <div className="col-span-2 space-y-4">
      <h3 className="font-semibold">Business Hours</h3>
      {Object.keys(defaultAvailabilityHours).map((day) => (
        <div key={day} className="grid grid-cols-3 gap-4 items-center">
          <Label className="capitalize">{day}</Label>
          <Input 
            type="time"
            value={hours?.[day]?.start || ''}
            onChange={(e) => onChange(day, 'start', e.target.value)}
          />
          <Input 
            type="time"
            value={hours?.[day]?.end || ''}
            onChange={(e) => onChange(day, 'end', e.target.value)}
          />
        </div>
      ))}
    </div>
  );

  const filteredProviders = providers.filter(provider =>
    `${provider.first_name} ${provider.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold">Service Providers Management</h1>
        <Button onClick={() => setIsAddProviderDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Provider
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="Search providers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Service Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{`${provider.first_name} ${provider.last_name}`}</td>
                    <td className="p-3">{provider.email}</td>
                    <td className="p-3">{provider.provider.location}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          provider.provider.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {provider.provider.verification_status}
                        </span>
                        <span className="text-sm text-gray-500">
                          ⭐ {provider.provider.average_rating?.toFixed(1) || 'N/A'} ({provider.provider.review_count || 0})
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingProvider(provider)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddProviderDialogOpen} onOpenChange={setIsAddProviderDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Provider</DialogTitle>
            <DialogDescription>Create a new service provider account</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name"
                  value={newProvider.first_name}
                  onChange={(e) => setNewProvider({...newProvider, first_name: e.target.value})}
                />
                <Input 
                  placeholder="Last Name"
                  value={newProvider.last_name}
                  onChange={(e) => setNewProvider({...newProvider, last_name: e.target.value})}
                />
              </div>
              <Input 
                type="email"
                placeholder="Email"
                value={newProvider.email}
                onChange={(e) => setNewProvider({...newProvider, email: e.target.value})}
              />
              <Input 
                placeholder="Phone Number"
                value={newProvider.phone_number}
                onChange={(e) => setNewProvider({...newProvider, phone_number: e.target.value})}
              />
              <Input 
                type="password"
                placeholder="Password"
                value={newProvider.password}
                onChange={(e) => setNewProvider({...newProvider, password: e.target.value})}
              />
              <Input 
                placeholder="Profile Image URL"
                value={newProvider.profile_image}
                onChange={(e) => setNewProvider({...newProvider, profile_image: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Business Information</h3>
              <Input 
                placeholder="Business Name"
                value={newProvider.provider.business_name}
                onChange={(e) => setNewProvider({
                  ...newProvider,
                  provider: {...newProvider.provider, business_name: e.target.value}
                })}
              />
              <textarea 
                className="min-h-[100px] p-3 border rounded-md w-full"
                placeholder="Business Description"
                value={newProvider.provider.business_description}
                onChange={(e) => setNewProvider({
                  ...newProvider,
                  provider: {...newProvider.provider, business_description: e.target.value}
                })}
              />
              <Input 
                placeholder="Location"
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

            <div className="col-span-2 space-y-4">
              <h3 className="font-semibold">Services Offered</h3>
              {newProvider.provider.services.map((service, index) => (
                <div key={index} className="grid gap-2">
                  <Select
                    value={service.service_id.toString()}
                    onValueChange={(value) => {
                      const services = [...newProvider.provider.services];
                      services[index] = {
                        ...service,
                        service_id: parseInt(value),
                        name: availableServices.find(s => s.id === parseInt(value))?.name || ''
                      };
                      setNewProvider({
                        ...newProvider,
                        provider: { ...newProvider.provider, services }
                      });
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
                  <Input
                    type="number"
                    placeholder="Price"
                    value={service.price}
                    onChange={(e) => {
                      const services = [...newProvider.provider.services];
                      services[index] = { ...service, price: parseFloat(e.target.value) };
                      setNewProvider({
                        ...newProvider,
                        provider: { ...newProvider.provider, services }
                      });
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
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
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddProviderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProvider}>Add Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingProvider && (
        <Dialog open={!!editingProvider} onOpenChange={() => setEditingProvider(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Provider</DialogTitle>
              <DialogDescription>Update provider details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="First Name"
                    value={editingProvider.first_name}
                    onChange={(e) => setEditingProvider({...editingProvider, first_name: e.target.value})}
                  />
                  <Input 
                    placeholder="Last Name"
                    value={editingProvider.last_name}
                    onChange={(e) => setEditingProvider({...editingProvider, last_name: e.target.value})}
                  />
                </div>
                <Input 
                  type="email"
                  placeholder="Email"
                  value={editingProvider.email}
                  onChange={(e) => setEditingProvider({...editingProvider, email: e.target.value})}
                />
                <Input 
                  placeholder="Phone Number"
                  value={editingProvider.phone_number}
                  onChange={(e) => setEditingProvider({...editingProvider, phone_number: e.target.value})}
                />
                <Input 
                  placeholder="Profile Image URL"
                  value={editingProvider.profile_image}
                  onChange={(e) => setEditingProvider({...editingProvider, profile_image: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Business Information</h3>
                <Input 
                  placeholder="Business Name"
                  value={editingProvider.provider.business_name}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    provider: {...editingProvider.provider, business_name: e.target.value}
                  })}
                />
                <textarea 
                  className="min-h-[100px] p-3 border rounded-md w-full"
                  placeholder="Business Description"
                  value={editingProvider.provider.business_description}
                  onChange={(e) => setEditingProvider({
                    ...editingProvider,
                    provider: {...editingProvider.provider, business_description: e.target.value}
                  })}
                />
                <Input 
                  placeholder="Location"
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

              <div className="col-span-2 space-y-4">
                <h3 className="font-semibold">Services Offered</h3>
                {editingProvider.provider.services.map((service, index) => (
                  <div key={index} className="grid gap-2">
                    <Select
                      value={service.service_id.toString()}
                      onValueChange={(value) => {
                        const services = [...editingProvider.provider.services];
                        services[index] = {
                          ...service,
                          service_id: parseInt(value),
                          name: availableServices.find(s => s.id === parseInt(value))?.name || ''
                        };
                        setEditingProvider({
                          ...editingProvider,
                          provider: { ...editingProvider.provider, services }
                        });
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
                    <Input
                      type="number"
                      placeholder="Price"
                      value={service.price}
                      onChange={(e) => {
                        const services = [...editingProvider.provider.services];
                        services[index] = { ...service, price: parseFloat(e.target.value) };
                        setEditingProvider({
                          ...editingProvider,
                          provider: { ...editingProvider.provider, services }
                        });
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
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
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setEditingProvider(null)}>Cancel</Button>
              <Button onClick={handleEditProvider}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedProvider && (
        <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Provider Details</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Name</Label>
                <p>{`${selectedProvider.first_name} ${selectedProvider.last_name}`}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p>{selectedProvider.email}</p>
              </div>
              <div>
                <Label>Business Name</Label>
                <p>{selectedProvider.provider.business_name}</p>
              </div>
              <div>
                <Label>Business Description</Label>
                <p>{selectedProvider.provider.business_description}</p>
              </div>
              <div>
                <Label>Location</Label>
                <p>{selectedProvider.provider.location}</p>
              </div>
              <div>
                <Label>Verification Status</Label>
                <p>{selectedProvider.provider.verification_status}</p>
              </div>
              <div>
                <Label>Average Rating</Label>
                <p>{selectedProvider.provider.average_rating?.toFixed(1) || 'N/A'}</p>
              </div>
              <div>
                <Label>Review Count</Label>
                <p>{selectedProvider.provider.review_count || 0}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-lg font-semibold">Business Hours</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {Object.entries(selectedProvider.provider.availability_hours || defaultAvailabilityHours).map(([day, hours]) => (
                    <div key={day} className="border rounded p-2">
                      <Label className="capitalize">{day}</Label>
                      <p className="text-sm text-gray-600">
                        {hours?.start || 'Not set'} - {hours?.end || 'Not set'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-lg font-semibold">Reviews</Label>
                <div className="space-y-4 mt-2">
                  {selectedProvider.provider.reviews?.map(review => (
                    <div key={review.id} className="border rounded p-4">
                      <div className="flex justify-between">
                        <span>{review.client_name}</span>
                        <span>⭐ {review.rating}</span>
                      </div>
                      <p className="text-gray-600 mt-2">{review.comment}</p>
                      <span className="text-sm text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 col-span-2">
                {selectedProvider.provider.verification_status !== 'verified' && (
                  <Button 
                    onClick={() => handleVerificationStatus(Number(selectedProvider.id), 'verified')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Verify Provider
                  </Button>
                )}
                {selectedProvider.provider.verification_status !== 'rejected' && (
                  <Button 
                    onClick={() => handleVerificationStatus(Number(selectedProvider.id), 'rejected')}
                    variant="destructive"
                  >
                    Reject Provider
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProvidersManagement;