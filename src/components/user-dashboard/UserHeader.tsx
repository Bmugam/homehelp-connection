import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Home, 
  Briefcase, 
  Users, 
  Calendar, 
  Bell,
  Settings,
  LogOut,
  LayoutDashboard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface UserHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const UserHeader = ({ toggleSidebar, sidebarOpen }: UserHeaderProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/services", icon: Briefcase },
    { name: "Providers", path: "/providers", icon: Users },
    { name: "Bookings", path: "/bookings", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-homehelp-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 md:hidden"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/userDashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-homehelp-600" />
              <span className="text-xl font-semibold text-homehelp-900">Client Dashboard</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "text-homehelp-900"
                    : "text-homehelp-600 hover:text-homehelp-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-homehelp-600 hover:text-homehelp-900">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="text-homehelp-600 hover:text-homehelp-900">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-homehelp-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-homehelp-900">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-homehelp-900">
                  {user?.name || "User"}
                </span>
              </div>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={logout}
                className="border-homehelp-200 text-homehelp-700 hover:bg-homehelp-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
