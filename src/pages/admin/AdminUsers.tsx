
import React from 'react';
import { Button } from "@/components/ui/button";

const AdminUsers = () => {
  return (
    <div>
      <h1>Admin Users Management</h1>
      <Button variant="outline">Example Button</Button>
      {/* If there was a destructive button, change to use className instead */}
      <Button variant="outline" className="text-red-500 hover:text-red-600">Delete</Button>
    </div>
  );
};

export default AdminUsers;
