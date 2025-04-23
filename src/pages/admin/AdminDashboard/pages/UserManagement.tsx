import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from '../../../../apiConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const makeAuthenticatedRequest = async (url: string, options = {}) => {
  const token = localStorage.getItem('token'); // or however you store your auth token
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...options
  };

  const response = await fetch(url, defaultOptions);
  if (response.status === 401) {
    // Handle unauthorized access - maybe redirect to login
    window.location.href = '/login';
    throw new Error('Unauthorized access');
  }
  return response;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    user_type: 'client',
    password: '',
    profile_image: '',
    client: {
      address: '',
      location_coordinates: { lat: '', lng: '' },
      preferences: {}
    },
    provider: {
      business_name: '',
      business_description: '',
      location: '',
      verification_status: 'pending',
      availability_hours: {},
      services: [] as Array<{
        service_id: number,
        price: number,
        description: string,
        availability: any
      }>,
      average_rating: 0,
      review_count: 0
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/users/detailed`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const handleAddUser = async () => {
    try {
      const userData = {
        ...newUser,
        name: `${newUser.first_name} ${newUser.last_name}`
      };

      if (userData.user_type === 'client') {
        delete userData.provider;
      } else if (userData.user_type === 'provider') {
        delete userData.client;
      }

      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        fetchUsers();
        setIsAddUserDialogOpen(false);
        setNewUser({
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
          user_type: 'client',
          password: '',
          profile_image: '',
          client: {
            address: '',
            location_coordinates: { lat: '', lng: '' },
            preferences: {}
          },
          provider: {
            business_name: '',
            business_description: '',
            location: '',
            verification_status: 'pending',
            availability_hours: {},
            services: [],
            average_rating: 0,
            review_count: 0
          }
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEditUser = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/users/${editingUser.id}`, 
        {
          method: 'PUT',
          body: JSON.stringify(editingUser)
        }
      );
      
      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/users/${userId}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Services</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.first_name} {user.last_name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.user_type}</td>
                    <td className="p-3">
                      {user.user_type === 'client' 
                        ? user.client?.address 
                        : user.provider?.location}
                    </td>
                    <td className="p-3">
                      {user.user_type === 'provider' ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.provider?.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.provider?.verification_status || 'pending'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {user.user_type === 'provider' && (
                        <div className="flex items-center">
                          {user.provider?.average_rating 
                            ? `${Number(user.provider.average_rating).toFixed(1)} ⭐` 
                            : 'No rating'} 
                          <span className="text-sm text-gray-500 ml-1">
                            ({user.provider?.review_count || 0})
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {user.user_type === 'provider' && (
                        <div className="flex flex-wrap gap-1">
                          {user.provider?.services?.map(service => (
                            <span key={service.service_id} 
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {service.name || 'Unnamed Service'}
                            </span>
                          )) || 'No services'}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="First Name" 
                value={newUser.first_name}
                onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
              />
              <Input 
                placeholder="Last Name" 
                value={newUser.last_name}
                onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
              />
            </div>
            <Input 
              placeholder="Email" 
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
            <Input 
              placeholder="Phone Number" 
              value={newUser.phone_number}
              onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
            />
            <Input 
              placeholder="Password" 
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />
            <Select 
              value={newUser.user_type}
              onValueChange={(value) => setNewUser({...newUser, user_type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {newUser.user_type === 'client' && (
              <div className="space-y-4">
                <Input 
                  placeholder="Address"
                  value={newUser.client.address}
                  onChange={(e) => setNewUser({
                    ...newUser, 
                    client: {...newUser.client, address: e.target.value}
                  })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Latitude"
                    type="number"
                    value={newUser.client.location_coordinates.lat}
                    onChange={(e) => setNewUser({
                      ...newUser,
                      client: {
                        ...newUser.client,
                        location_coordinates: {
                          ...newUser.client.location_coordinates,
                          lat: e.target.value
                        }
                      }
                    })}
                  />
                  <Input 
                    placeholder="Longitude"
                    type="number"
                    value={newUser.client.location_coordinates.lng}
                    onChange={(e) => setNewUser({
                      ...newUser,
                      client: {
                        ...newUser.client,
                        location_coordinates: {
                          ...newUser.client.location_coordinates,
                          lng: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              </div>
            )}

            {newUser.user_type === 'provider' && (
              <div className="space-y-4">
                <Input 
                  placeholder="Business Name"
                  value={newUser.provider.business_name}
                  onChange={(e) => setNewUser({...newUser, provider: {...newUser.provider, business_name: e.target.value}})}
                />
                <textarea 
                  className="min-h-[100px] p-3 border rounded-md"
                  placeholder="Business Description"
                  value={newUser.provider.business_description}
                  onChange={(e) => setNewUser({...newUser, provider: {...newUser.provider, business_description: e.target.value}})}
                />
                <Input 
                  placeholder="Location"
                  value={newUser.provider.location}
                  onChange={(e) => setNewUser({...newUser, provider: {...newUser.provider, location: e.target.value}})}
                />
                <Select 
                  value={newUser.provider.verification_status}
                  onValueChange={(value) => setNewUser({
                    ...newUser,
                    provider: {...newUser.provider, verification_status: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Verification Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Services Offered</h3>
                  {newUser.provider.services.map((service, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Select
                        value={service.service_id.toString()}
                        onValueChange={(value) => {
                          const services = [...newUser.provider.services];
                          services[index] = {...service, service_id: parseInt(value)};
                          setNewUser({
                            ...newUser,
                            provider: {...newUser.provider, services}
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* You'll need to fetch and map available services */}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={service.price}
                        onChange={(e) => {
                          const services = [...newUser.provider.services];
                          services[index] = {...service, price: parseFloat(e.target.value)};
                          setNewUser({
                            ...newUser,
                            provider: {...newUser.provider, services}
                          });
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewUser({
                      ...newUser,
                      provider: {
                        ...newUser.provider,
                        services: [
                          ...newUser.provider.services,
                          { service_id: 0, price: 0, description: '', availability: {} }
                        ]
                      }
                    })}
                  >
                    Add Service
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user account details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name" 
                  value={editingUser.first_name}
                  onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                />
                <Input 
                  placeholder="Last Name" 
                  value={editingUser.last_name}
                  onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                />
              </div>
              <Input 
                placeholder="Email" 
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
              <Input 
                placeholder="Phone Number" 
                value={editingUser.phone_number}
                onChange={(e) => setEditingUser({...editingUser, phone_number: e.target.value})}
              />
              <Select 
                value={editingUser.user_type}
                onValueChange={(value) => setEditingUser({...editingUser, user_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {editingUser.user_type === 'client' && (
                <Input 
                  placeholder="Address"
                  value={editingUser.client?.address}
                  onChange={(e) => setEditingUser({
                    ...editingUser, 
                    client: {...editingUser.client, address: e.target.value}
                  })}
                />
              )}

              {editingUser.user_type === 'provider' && (
                <>
                  <Input 
                    placeholder="Business Name"
                    value={editingUser.provider?.business_name}
                    onChange={(e) => setEditingUser({...editingUser, provider: {...editingUser.provider, business_name: e.target.value}})}
                  />
                  <textarea 
                    className="min-h-[100px] p-3 border rounded-md"
                    placeholder="Business Description"
                    value={editingUser.provider?.business_description}
                    onChange={(e) => setEditingUser({...editingUser, provider: {...editingUser.provider, business_description: e.target.value}})}
                  />
                  <Input 
                    placeholder="Location"
                    value={editingUser.provider?.location}
                    onChange={(e) => setEditingUser({...editingUser, provider: {...editingUser.provider, location: e.target.value}})}
                  />
                </>
              )}

              <Input 
                placeholder="Profile Image URL" 
                value={editingUser.profile_image}
                onChange={(e) => setEditingUser({...editingUser, profile_image: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleEditUser}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;