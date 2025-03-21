
import React from 'react';
import { User, CalendarDays, Clock, Home, Settings } from 'lucide-react';
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
  return (
    <aside className="w-full md:w-64 bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex flex-col items-center">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=0D8ABC&color=fff&size=128`} />
            <AvatarFallback className="bg-homehelp-700 text-white text-2xl">
              {userDetails.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold">{userDetails.name}</h2>
          <p className="text-sm text-gray-500">Member since {userDetails.memberSince}</p>
        </div>
        
        <div className="mt-4 bg-gray-100 rounded-full h-2">
          <div 
            className="bg-homehelp-600 h-2 rounded-full" 
            style={{ width: `${userDetails.profileCompletion}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Profile {userDetails.profileCompletion}% complete
        </p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          <li>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'overview' 
                  ? 'bg-homehelp-50 text-homehelp-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Dashboard Overview</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'bookings' 
                  ? 'bg-homehelp-50 text-homehelp-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CalendarDays className="h-5 w-5" />
              <span>My Bookings</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'history' 
                  ? 'bg-homehelp-50 text-homehelp-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>Service History</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'profile' 
                  ? 'bg-homehelp-50 text-homehelp-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="h-5 w-5" />
              <span>My Profile</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'settings' 
                  ? 'bg-homehelp-50 text-homehelp-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Account Settings</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default UserSidebar;
