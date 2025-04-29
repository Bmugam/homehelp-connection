import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { getImageUrl } from '@/utils/imageUtils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const makeAuthenticatedRequest = async (url, options = {}) => {
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

// Utility components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const ErrorMessage = ({ error }) => (
  <div className="flex justify-center items-center h-screen">
    <div className="text-red-500">Error: {error}</div>
  </div>
);

const UserBadge = ({ userType }) => {
  const badgeStyles = {
    client: "bg-blue-100 text-blue-800",
    provider: "bg-green-100 text-green-800",
    admin: "bg-purple-100 text-purple-800"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${badgeStyles[userType] || "bg-gray-100 text-gray-800"}`}>
      {userType}
    </span>
  );
};

const UserManagement = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [tempImage, setTempImage] = useState({
    file: null,
    preview: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // New user state with default values
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
      services: []
    }
  });

  // Fetch users data
  const fetchUsers = useCallback(async () => {
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
  }, []);

  // Handle image upload
  const handleImageChange = useCallback((e, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    if (isEditing) {
      setTempImage({ file, preview });
    } else {
      setNewUser(prev => ({
        ...prev,
        profile_image: preview,
        imageFile: file
      }));
    }
  }, []);

  // Add user function
  const handleAddUser = useCallback(async () => {
    try {
      const formData = new FormData();
      
      // Append all user data
      Object.entries(newUser).forEach(([key, value]) => {
        if (key !== 'imageFile' && key !== 'profile_image') {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });

      // Append image file if exists
      if (newUser.imageFile) {
        formData.append('profile_image', newUser.imageFile);
      }

      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      });
      
      if (response.ok) {
        await fetchUsers();
        setIsAddUserDialogOpen(false);
        // Reset form
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
            services: []
          }
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }, [newUser, fetchUsers]);

  // Edit user function
  const handleEditUser = useCallback(async () => {
    if (!editingUser) return;

    try {
      const formData = new FormData();

      // Append only fields that have non-empty values or have been changed
      Object.entries(editingUser).forEach(([key, value]) => {
        if (key === 'profile_image') {
          // skip profile_image here, handled separately
          return;
        }
        // Skip null, undefined, or empty string values to avoid overwriting with null
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'object') {
            // Only append if object has keys (non-empty)
            if (Object.keys(value).length > 0) {
              formData.append(key, JSON.stringify(value));
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Append new image file if exists
      if (tempImage.file) {
        formData.append('profile_image', tempImage.file);
      }

      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/api/admin/users/${editingUser.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      await fetchUsers();
      setEditingUser(null);
      setTempImage({ file: null, preview: null });
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || 'Failed to update user');
    }
  }, [editingUser, tempImage.file, fetchUsers]);

  // Delete user function
  const handleDeleteUser = useCallback(async (userId) => {
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
  }, [fetchUsers]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Cleanup for image preview URLs
  useEffect(() => {
    return () => {
      if (tempImage.preview) {
        URL.revokeObjectURL(tempImage.preview);
      }
    };
  }, [tempImage.preview]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => 
    users?.filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [], 
    [users, searchTerm]
  );

  // Pagination calculations
  const pageCount = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Pagination controls component
  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-500">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to{' '}
        {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter(page => {
              const distance = Math.abs(page - currentPage);
              return distance === 0 || distance === 1 || page === 1 || page === pageCount;
            })
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              </React.Fragment>
            ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
          disabled={currentPage === pageCount}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Image upload UI component
  const renderImageUpload = useCallback((isEditing = false) => (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
        {isEditing ? (
          <Avatar className="w-full h-full">
            {(tempImage.preview || editingUser?.profile_image) ? (
              <AvatarImage
                src={tempImage.preview || getImageUrl(editingUser?.profile_image)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <AvatarFallback>
                <UserCircle className="w-12 h-12 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
        ) : (
          <Avatar className="w-full h-full">
            {newUser.profile_image ? (
              <AvatarImage
                src={newUser.profile_image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <AvatarFallback>
                <UserCircle className="w-12 h-12 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          type="file"
          id={isEditing ? "editImageInput" : "addImageInput"}
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e, isEditing)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(isEditing ? "editImageInput" : "addImageInput")?.click()}
        >
          {isEditing && (editingUser?.profile_image || tempImage.preview) ? 'Change Image' : 'Upload Image'}
        </Button>
        {((isEditing && (editingUser?.profile_image || tempImage.preview)) || 
          (!isEditing && newUser.profile_image)) && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (isEditing) {
                if (tempImage.preview) {
                  URL.revokeObjectURL(tempImage.preview);
                }
                setTempImage({ file: null, preview: null });
                setEditingUser(prev => prev ? { ...prev, profile_image: '' } : null);
              } else {
                setNewUser(prev => ({ ...prev, profile_image: '', imageFile: null }));
              }
            }}
          >
            Remove
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500">
        Recommended: Square JPG or PNG under 2MB
      </p>
    </div>
  ), [tempImage.preview, editingUser?.profile_image, newUser.profile_image, handleImageChange]);

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error) {
    return <ErrorMessage error={error} />;
  }

  // When setting editing user, ensure we create a clean copy with all existing values
  const handleSetEditingUser = (user) => {
    // Create a deep copy of the user object to avoid direct state mutations
    const userCopy = JSON.parse(JSON.stringify(user));
    
    // Ensure all required fields are preserved
    const cleanUser = {
      ...userCopy,
      email: userCopy.email || '',
      phone_number: userCopy.phone_number || '',
      first_name: userCopy.first_name || '',
      last_name: userCopy.last_name || '',
      user_type: userCopy.user_type || 'client',
      // Preserve other fields as needed
    };
    
    setEditingUser(cleanUser);
  };

  // Main render
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
            placeholder="Search users by name or email..." 
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
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        {user.profile_image ? (
                          <AvatarImage
                            src={getImageUrl(user.profile_image)}
                            alt={`${user.first_name} ${user.last_name}`}
                          />
                        ) : (
                          <AvatarFallback>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone_number || "—"}</td>
                    <td className="p-3">
                      <UserBadge userType={user.user_type} />
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setViewingUser(user)}
                        >
                          <ChevronRight className="h-4 w-4" />
                          <span className="ml-1">View</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSetEditingUser(user)}
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
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls />
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          
          {renderImageUpload(false)}
          
          <Tabs defaultValue="basic">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="role-specific">Role Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="role-specific" className="space-y-4">
              {newUser.user_type === 'client' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Client Details</h3>
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
                  <h3 className="font-medium">Provider Details</h3>
                  <Input 
                    placeholder="Business Name"
                    value={newUser.provider.business_name}
                    onChange={(e) => setNewUser({...newUser, provider: {...newUser.provider, business_name: e.target.value}})}
                  />
                  <textarea 
                    className="min-h-[100px] p-3 border rounded-md w-full"
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
                </div>
              )}

              {newUser.user_type === 'admin' && (
                <div className="p-4 border border-dashed rounded-md bg-gray-50 text-center text-gray-500">
                  No additional details required for admin users
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        {editingUser && (
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user account details</DialogDescription>
            </DialogHeader>
            
            {renderImageUpload(true)}
            
            <Tabs defaultValue="basic">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="role-specific">Role Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
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
              </TabsContent>
              
              <TabsContent value="role-specific" className="space-y-4">
                {editingUser.user_type === 'client' && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Client Details</h3>
                    <Input 
                      placeholder="Address"
                      value={editingUser.client?.address || ''}
                      onChange={(e) => setEditingUser({
                        ...editingUser, 
                        client: {...(editingUser.client || {}), address: e.target.value}
                      })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Latitude"
                        type="number"
                        value={editingUser.client?.location_coordinates?.lat || ''}
                        onChange={(e) => setEditingUser({
                          ...editingUser,
                          client: {
                            ...(editingUser.client || {}),
                            location_coordinates: {
                              ...(editingUser.client?.location_coordinates || {}),
                              lat: e.target.value
                            }
                          }
                        })}
                      />
                      <Input 
                        placeholder="Longitude"
                        type="number"
                        value={editingUser.client?.location_coordinates?.lng || ''}
                        onChange={(e) => setEditingUser({
                          ...editingUser,
                          client: {
                            ...(editingUser.client || {}),
                            location_coordinates: {
                              ...(editingUser.client?.location_coordinates || {}),
                              lng: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                )}

                {editingUser.user_type === 'provider' && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Provider Details</h3>
                    <Input 
                      placeholder="Business Name"
                      value={editingUser.provider?.business_name || ''}
                      onChange={(e) => setEditingUser({...editingUser, provider: {...(editingUser.provider || {}), business_name: e.target.value}})}
                    />
                    <textarea 
                      className="min-h-[100px] p-3 border rounded-md w-full"
                      placeholder="Business Description"
                      value={editingUser.provider?.business_description || ''}
                      onChange={(e) => setEditingUser({...editingUser, provider: {...(editingUser.provider || {}), business_description: e.target.value}})}
                    />
                    <Input 
                      placeholder="Location"
                      value={editingUser.provider?.location || ''}
                      onChange={(e) => setEditingUser({...editingUser, provider: {...(editingUser.provider || {}), location: e.target.value}})}
                    />
                    <Select 
                      value={editingUser.provider?.verification_status || 'pending'}
                      onValueChange={(value) => setEditingUser({
                        ...editingUser,
                        provider: {...(editingUser.provider || {}), verification_status: value}
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
                  </div>
                )}

                {editingUser.user_type === 'admin' && (
                  <div className="p-4 border border-dashed rounded-md bg-gray-50 text-center text-gray-500">
                    No additional details required for admin users
                  </div>
                )}
              </TabsContent>
            </Tabs>

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
        )}
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        {viewingUser && (
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  {viewingUser.profile_image ? (
                    <AvatarImage
                      src={getImageUrl(viewingUser.profile_image)}
                      alt={`${viewingUser.first_name} ${viewingUser.last_name}`}
                    />
                  ) : (
                    <AvatarFallback>
                      {viewingUser.first_name?.[0]}{viewingUser.last_name?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                <DialogTitle className="text-xl">
                    {viewingUser.first_name} {viewingUser.last_name}
                  </DialogTitle>
                  <UserBadge userType={viewingUser.user_type} />
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p>{viewingUser.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p>{viewingUser.phone_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">User ID</p>
                    <p className="font-mono">{viewingUser.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p>{new Date(viewingUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {viewingUser.user_type === 'client' && viewingUser.client && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Client Details</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p>{viewingUser.client.address || "—"}</p>
                    </div>
                    {viewingUser.client.location_coordinates && (
                      <div>
                        <p className="text-gray-500">Location Coordinates</p>
                        <p>
                          Lat: {viewingUser.client.location_coordinates.lat || "—"}, 
                          Lng: {viewingUser.client.location_coordinates.lng || "—"}
                        </p>
                      </div>
                    )}
                    {viewingUser.client.preferences && Object.keys(viewingUser.client.preferences).length > 0 && (
                      <div>
                        <p className="text-gray-500">Preferences</p>
                        <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-auto">
                          {JSON.stringify(viewingUser.client.preferences, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingUser.user_type === 'provider' && viewingUser.provider && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Provider Details</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Business Name</p>
                      <p>{viewingUser.provider.business_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Business Description</p>
                      <p>{viewingUser.provider.business_description || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p>{viewingUser.provider.location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Verification Status</p>
                      <p className={`font-medium ${
                        viewingUser.provider.verification_status === 'verified' ? 'text-green-600' : 
                        viewingUser.provider.verification_status === 'rejected' ? 'text-red-600' : 
                        'text-yellow-600'
                      }`}>
                        {viewingUser.provider.verification_status || "pending"}
                      </p>
                    </div>
                    {viewingUser.provider.services && viewingUser.provider.services.length > 0 && (
                      <div>
                        <p className="text-gray-500">Services</p>
                        <ul className="list-disc pl-5">
                          {viewingUser.provider.services.map((service, index) => (
                            <li key={index}>{service.name} - ${service.price}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {viewingUser.provider.availability_hours && Object.keys(viewingUser.provider.availability_hours).length > 0 && (
                      <div>
                        <p className="text-gray-500">Availability Hours</p>
                        <pre className="bg-gray-50 p-2 rounded-md text-xs overflow-auto">
                          {JSON.stringify(viewingUser.provider.availability_hours, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingUser({...viewingUser});
                  setViewingUser(null);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  handleDeleteUser(viewingUser.id);
                  setViewingUser(null);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default UserManagement;