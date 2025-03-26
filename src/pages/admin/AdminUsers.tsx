
import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash,
  UserPlus,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

// Mock data for users
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+254712345678', type: 'client', status: 'active', createdAt: '2023-05-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+254723456789', type: 'client', status: 'inactive', createdAt: '2023-06-22' },
  { id: 3, name: 'Robert Johnson', email: 'robert@example.com', phone: '+254734567890', type: 'provider', status: 'active', createdAt: '2023-04-10' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+254745678901', type: 'provider', status: 'active', createdAt: '2023-07-05' },
  { id: 5, name: 'Michael Brown', email: 'michael@example.com', phone: '+254756789012', type: 'client', status: 'active', createdAt: '2023-08-18' },
  { id: 6, name: 'Emily Davis', email: 'emily@example.com', phone: '+254767890123', type: 'client', status: 'active', createdAt: '2023-09-01' },
  { id: 7, name: 'David Miller', email: 'david@example.com', phone: '+254778901234', type: 'provider', status: 'inactive', createdAt: '2023-03-25' },
  { id: 8, name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+254789012345', type: 'admin', status: 'active', createdAt: '2023-02-14' },
];

const AdminUsers = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { toast } = useToast();

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || user.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User deleted",
      description: "The user has been successfully deleted.",
    });
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        toast({
          title: `User ${newStatus}`,
          description: `The user is now ${newStatus}.`,
        });
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-gray-500">View and manage all users in the system</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="client">Clients</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.type === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.type === 'provider'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center ${
                        user.status === 'active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.status === 'active' 
                          ? <CheckCircle className="h-4 w-4 mr-1" /> 
                          : <XCircle className="h-4 w-4 mr-1" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(user.id)}>
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
