
import React from 'react';
import { Bell, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/use-mobile';

interface UserHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();
  const isMobile = useMobile();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <Button variant="ghost" size="sm" onClick={toggleSidebar} className="md:hidden">
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar>
          <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} />
          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
