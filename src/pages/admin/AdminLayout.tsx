
import React, { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Calendar, 
  FileText, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const navItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/admin-dashboard/users", icon: Users },
    { name: "Bookings", path: "/admin-dashboard/bookings", icon: Calendar },
    { name: "Reports", path: "/admin-dashboard/reports", icon: FileText },
    { name: "Settings", path: "/admin-dashboard/settings", icon: Settings },
    { name: "Help", path: "/admin-dashboard/help", icon: HelpCircle },
  ];
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-homehelp-900 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out fixed h-full z-10`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <h2 className="text-xl font-bold">HomeHelp Admin</h2>
          ) : (
            <h2 className="text-xl font-bold">HH</h2>
          )}
          <button onClick={toggleSidebar} className="text-white p-1 rounded-full hover:bg-homehelp-800">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-homehelp-800 text-white' 
                      : 'text-homehelp-100 hover:bg-homehelp-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 text-homehelp-100 hover:bg-homehelp-800 hover:text-white rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800 hidden md:block">
              Admin Panel
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-homehelp-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <UserCircle className="h-8 w-8 text-gray-700" />
              {user && sidebarOpen && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <div className="container mx-auto">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="bg-white p-4 text-center text-gray-500 text-sm mt-auto border-t">
          <p>© {new Date().getFullYear()} HomeHelp Admin. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;
