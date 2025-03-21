
import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your platform settings and users</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Users</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
          <div className="mt-4">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              42 Total Users
            </span>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Service Providers</h2>
          <p className="text-gray-600">Monitor and manage service providers</p>
          <div className="mt-4">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              18 Active Providers
            </span>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Services</h2>
          <p className="text-gray-600">Configure available services</p>
          <div className="mt-4">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
              8 Service Categories
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
