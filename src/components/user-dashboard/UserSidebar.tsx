import React, { useState, useEffect } from 'react';
import { User, CalendarDays, Clock, Home, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailsType {
  name: string;
  email: string;
  memberSince: string;
  profileCompletion: number;
}

interface UserSidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  userDetails: UserDetailsType;
}

const UserSidebar = ({ activeTab, setActiveTab, userDetails }: UserSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile view on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Auto-collapse on mobile
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Home },
    { id: 'bookings', label: 'My Bookings', icon: CalendarDays },
    { id: 'history', label: 'Service History', icon: Clock },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ];

  return (
    <aside className={`bg-white rounded-lg shadow-lg transition-all duration-300 flex flex-col h-screen sticky top-10 relative ${collapsed ? 'w-16' : 'w-full md:w-64'}`}>
      {/* Toggle button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-6 bg-white rounded-l-md p-1 shadow-md transform translate-x-full hidden md:block"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      
      {/* User Profile Section */}
      <div className={`p-4 border-b border-gray-200 ${collapsed ? 'items-center justify-center' : ''} flex flex-col`}>
        <Avatar className={`${collapsed ? 'h-10 w-10' : 'h-20 w-20'} mb-3 ring-2 ring-homehelp-100 transition-all duration-300`}>
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=0D8ABC&color=fff&size=128`} />
          <AvatarFallback className="bg-homehelp-700 text-white text-2xl">
            {userDetails.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        {!collapsed && (
          <>
            <h2 className="text-lg font-semibold text-center">{userDetails.name}</h2>
            <p className="text-sm text-gray-500 text-center">Member since {userDetails.memberSince}</p>
            
            <div className="mt-4 w-full">
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs font-semibold inline-block text-homehelp-700">
                      Profile Completion
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold inline-block text-homehelp-700">
                      {userDetails.profileCompletion}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100">
                  <div 
                    style={{ width: `${userDetails.profileCompletion}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-homehelp-500 to-homehelp-700 transition-all duration-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Navigation Section */}
      <nav className="flex-grow p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button 
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex ${collapsed ? 'justify-center' : 'items-center'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-homehelp-50 to-homehelp-100 text-homehelp-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={collapsed ? item.label : ''}
              >
                <item.icon className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>&copy; {new Date().getFullYear()} HomeHelp</p>
        </div>
      )}
    </aside>
  );
};

export default UserSidebar;