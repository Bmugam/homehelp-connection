
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ClipboardList, 
  LogOut, 
  Menu, 
  X,
  UserCog,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <aside className={`bg-homehelp-900 text-white ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out h-screen sticky top-0`}>
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
          <SidebarItem 
            to="/admin-dashboard" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard"
            sidebarOpen={sidebarOpen}
            end
          />
          <SidebarItem 
            to="/admin-dashboard/users" 
            icon={<Users size={20} />} 
            label="Users"
            sidebarOpen={sidebarOpen}
          />
          <SidebarItem 
            to="/admin-dashboard/providers" 
            icon={<UserCog size={20} />} 
            label="Providers"
            sidebarOpen={sidebarOpen}
          />
          <SidebarItem 
            to="/admin-dashboard/services" 
            icon={<ClipboardList size={20} />} 
            label="Services"
            sidebarOpen={sidebarOpen}
          />
          <SidebarItem 
            to="/admin-dashboard/roles" 
            icon={<Shield size={20} />} 
            label="Roles"
            sidebarOpen={sidebarOpen}
          />
          <SidebarItem 
            to="/admin-dashboard/settings" 
            icon={<Settings size={20} />} 
            label="Settings"
            sidebarOpen={sidebarOpen}
          />
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={logout}
          className="flex items-center p-3 text-white hover:bg-homehelp-800 rounded-lg transition-colors w-full"
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  sidebarOpen: boolean;
  end?: boolean;
}

const SidebarItem = ({ to, icon, label, sidebarOpen, end = false }: SidebarItemProps) => {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${
            isActive 
              ? 'bg-homehelp-800 text-white' 
              : 'text-white hover:bg-homehelp-800'
          }`
        }
      >
        {icon}
        {sidebarOpen && <span className="ml-3">{label}</span>}
      </NavLink>
    </li>
  );
};

export default AdminSidebar;
