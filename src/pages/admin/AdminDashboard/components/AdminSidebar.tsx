
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, Settings, LayoutDashboard, 
  UserCog, Building, ClipboardList 
} from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    { path: '/admin-dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin-dashboard/users', icon: Users, label: 'Users' },
    { path: '/admin-dashboard/providers', icon: Building, label: 'Service Providers' },
    { path: '/admin-dashboard/services', icon: ClipboardList, label: 'Services' },
    { path: '/admin-dashboard/roles', icon: UserCog, label: 'Role Management' },
    { path: '/admin-dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-homehelp-900">Admin Panel</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-homehelp-50 text-homehelp-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
