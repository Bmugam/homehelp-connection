
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Shield } from 'lucide-react';

const RoleManagement = () => {
  // Mock data for roles and permissions
  const roles = [
    { id: 1, name: 'Admin', permissions: ['All permissions'], users: 3 },
    { id: 2, name: 'Provider', permissions: ['Manage own services', 'View bookings', 'Update profile'], users: 15 },
    { id: 3, name: 'Client', permissions: ['Book services', 'View profile', 'Review providers'], users: 120 }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Role
        </Button>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-homehelp-600" />
                  {role.name}
                </div>
              </CardTitle>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Permissions:</h4>
                <ul className="pl-5 list-disc text-sm text-gray-600 space-y-1">
                  {role.permissions.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>{role.users} users with this role</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;
