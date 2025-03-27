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
    name: '',
    email: '',
    phone: '',
    userType: 'client'
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);


const fetchUsers = async () => {
  try {
    setIsLoading(true);
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/users`);
    const data = await response.json();
    setUsers(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching users:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  // Filter users based on search term
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
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        fetchUsers();
        setIsAddUserDialogOpen(false);
        setNewUser({
          name: '',
          email: '',
          phone: '',
          userType: 'client'
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
                  <th className="text-left p-3">Status</th>
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
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Active
                      </span>
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
      <Dialog 
        open={isAddUserDialogOpen} 
        onOpenChange={setIsAddUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Full Name" 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
            <Input 
              placeholder="Email" 
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
            <Input 
              placeholder="Phone Number" 
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
            />
            <Select 
              value={newUser.userType}
              onValueChange={(value) => setNewUser({...newUser, userType: value})}
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
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog 
          open={!!editingUser} 
          onOpenChange={() => setEditingUser(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user account details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input 
                placeholder="Full Name" 
                value={`${editingUser.first_name} ${editingUser.last_name}`}
                onChange={(e) => setEditingUser({
                  ...editingUser, 
                  first_name: e.target.value.split(' ')[0],
                  last_name: e.target.value.split(' ').slice(1).join(' ')
                })}
              />
              <Input 
                placeholder="Email" 
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
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
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleEditUser}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;