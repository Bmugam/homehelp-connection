
import React from 'react';

const AdminSettings = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="mt-2 text-gray-600">Configure platform settings and preferences</p>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Platform Configuration</h2>
        <p className="mb-4 text-gray-600">Adjust global settings for the HomeHelp platform</p>
        
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="mb-2 text-lg font-medium text-gray-800">General Settings</h3>
            <p className="text-gray-600">Configure general platform behavior</p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="mb-2 text-lg font-medium text-gray-800">Email Templates</h3>
            <p className="text-gray-600">Customize notification emails</p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="mb-2 text-lg font-medium text-gray-800">Payment Settings</h3>
            <p className="text-gray-600">Configure payment methods and fees</p>
          </div>
          
          <div className="border-b border-gray-200 pb-4">
            <h3 className="mb-2 text-lg font-medium text-gray-800">API Integration</h3>
            <p className="text-gray-600">Manage external service connections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
