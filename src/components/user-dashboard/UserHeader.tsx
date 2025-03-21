
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '../../contexts/AuthContext';

const UserHeader = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-homehelp-900">HomeHelp</h1>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-500" />
          </Button>
          
          <div className="flex items-center">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`} />
              <AvatarFallback className="bg-homehelp-700 text-white">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 mr-2">{user?.name || 'Guest User'}</span>
          </div>
          
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
