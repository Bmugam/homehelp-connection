
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-homehelp-50 p-4">
      <header className="mb-8 flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-homehelp-900">HomeHelp Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium text-homehelp-900">{user?.name}</p>
            <p className="text-sm text-homehelp-600">{user?.email}</p>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="border-homehelp-200 text-homehelp-900 hover:bg-homehelp-100"
          >
            Logout
          </Button>
        </div>
      </header>
      
      <main className="flex-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}</h2>
          <p className="text-homehelp-600">
            This is your personal dashboard. You can manage your account, bookings, and more from here.
          </p>
        </div>
        
        {/* Add more dashboard cards/sections as needed */}
      </main>
    </div>
  );
};

export default UserDashboard;
