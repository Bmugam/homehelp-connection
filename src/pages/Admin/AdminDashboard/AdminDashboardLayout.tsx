import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-grow p-4">
        <Outlet />
        {children}
      </main>
    </div>
  );
};

export default AdminDashboardLayout;