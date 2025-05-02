import React, { useState, useEffect } from 'react';
import { 
  User, 
  CalendarDays, 
  Clock, 
  Home, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  Bell,
  LogOut,
  HelpCircle,
  UserPlus,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface UserDetailsType {
  name: string;
  email: string;
  memberSince: string;
  profileCompletion: number;
  avatarUrl?: string;
  status?: "online" | "away" | "offline";
  role?: string;
  notifications?: number;
}

interface UserSidebarProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  userDetails: UserDetailsType;
  onLogout?: () => void;
}

const UserSidebar = ({ 
  activeTab, 
  setActiveTab, 
  userDetails,
  onLogout = () => console.log("Logout clicked") 
}: UserSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);
  
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

  // Enable tooltips when sidebar is collapsed
  useEffect(() => {
    setShowTooltips(collapsed);
  }, [collapsed]);
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Navigation items
  const primaryNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Home, badge: null },
    { id: 'bookings', label: 'My Bookings', icon: CalendarDays, badge: { text: "3", variant: "primary" } },
    { id: 'history', label: 'Service History', icon: Clock, badge: null },
    { id: 'profile', label: 'My Profile', icon: User, badge: null },
    { id: 'settings', label: 'Account Settings', icon: Settings, badge: null }
  ];

  const secondaryNavItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: { text: `${userDetails.notifications || 0}`, variant: "destructive" } },
    { id: 'referrals', label: 'Refer a Friend', icon: UserPlus, badge: null },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, badge: null }
  ];

  // Status indicator colors
  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-gray-400"
  };

  // Accessibility improvements for keyboard users
  const handleKeyNavigation = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setActiveTab(itemId);
      e.preventDefault();
    }
  };

  // Animations
  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" }
  };

  // Render nav item with tooltip if needed
  const renderNavItem = (item: any, isActive: boolean) => {
    const navButton = (
      <motion.button 
        onClick={() => setActiveTab(item.id)}
        onKeyDown={(e) => handleKeyNavigation(e, item.id)}
        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-homehelp-100 to-homehelp-50 text-homehelp-800 shadow-sm border border-homehelp-200' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-homehelp-700'
        }`}
        tabIndex={0}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <item.icon className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5'} ${isActive ? 'text-homehelp-600' : ''}`} />
          {!collapsed && <span>{item.label}</span>}
        </div>
        
        {!collapsed && item.badge && (
          <Badge variant={item.badge.variant} className="ml-2">
            {item.badge.text}
          </Badge>
        )}
      </motion.button>
    );

    return showTooltips ? (
      <TooltipProvider key={item.id}>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {navButton}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-homehelp-800 text-white border-none">
            <div className="flex flex-col">
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-xs text-homehelp-200 mt-1">
                  {item.badge.variant === "destructive" ? "Unread notifications" : "Upcoming"}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : navButton;
  };

  return (
    <TooltipProvider>
      <motion.aside 
        className="bg-white rounded-xl shadow-lg flex flex-col h-screen sticky top-0 overflow-hidden border border-gray-100"
        initial={isMobile ? "collapsed" : "expanded"}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Toggle button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button 
              onClick={() => setCollapsed(!collapsed)}
              className="absolute right-0 top-6 bg-white hover:bg-gray-50 rounded-l-md p-2 shadow-md transform translate-x-full z-10 hidden md:flex items-center justify-center border border-r-0 border-gray-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-homehelp-800 text-white border-none">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
        
        {/* User Profile Section */}
        <div className={`p-4 border-b border-gray-200 ${collapsed ? 'items-center justify-center' : ''} flex flex-col`}>
          <div className="relative">
            <Avatar className={`${collapsed ? 'h-12 w-12' : 'h-20 w-20'} mx-auto mb-3 ring-2 ring-homehelp-200 transition-all duration-300 shadow-sm`}>
              <AvatarImage 
                src={userDetails.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=0D8ABC&color=fff&size=128`} 
                alt={userDetails.name}
              />
              <AvatarFallback className="bg-gradient-to-br from-homehelp-600 to-homehelp-800 text-white text-2xl">
                {getInitials(userDetails.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Status indicator */}
            {userDetails.status && (
              <div className={`absolute ${collapsed ? 'bottom-3 right-0' : 'bottom-3 right-1'} w-3.5 h-3.5 ${statusColors[userDetails.status]} rounded-full border-2 border-white`}></div>
            )}
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="w-full text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-semibold">{userDetails.name}</h2>
                <div className="flex items-center justify-center mt-1 mb-2">
                  {userDetails.role && (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 flex items-center gap-1 font-normal">
                      <Shield className="w-3 h-3" />
                      {userDetails.role}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">Member since {userDetails.memberSince}</p>
                
                <div className="mt-4 w-full">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-homehelp-700">
                        Profile Completion
                      </span>
                      <span className="text-xs font-medium text-homehelp-700">
                        {userDetails.profileCompletion}%
                      </span>
                    </div>
                    <Progress 
                      value={userDetails.profileCompletion} 
                      className="h-2 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-homehelp-500 [&>div]:to-homehelp-700"
                    />
                    {userDetails.profileCompletion < 100 && (
                      <button 
                        className="text-xs text-homehelp-600 hover:text-homehelp-700 mt-2 flex items-center"
                        onClick={() => setActiveTab('profile')}
                      >
                        Complete your profile <ExternalLink className="ml-1 w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Primary Navigation */}
        <nav className="flex-grow p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <ul className="space-y-1">
            {primaryNavItems.map((item) => (
              <li key={item.id}>
                {renderNavItem(item, activeTab === item.id)}
              </li>
            ))}
          </ul>
          
          {/* Secondary Navigation */}
          <div className={`mt-6 ${collapsed ? 'border-t border-gray-200 pt-2' : 'border-t border-gray-200 pt-4'}`}>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Access
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>
            
            <ul className="space-y-1">
              {secondaryNavItems.map((item) => (
                <li key={item.id}>
                  {renderNavItem(item, activeTab === item.id)}
                </li>
              ))}
            </ul>
          </div>
        </nav>
        
        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 ${collapsed ? 'flex justify-center' : ''}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button 
                onClick={onLogout}
                className={`flex items-center ${collapsed ? 'justify-center p-2' : 'justify-center p-2 w-full'} space-x-2 text-sm text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
                {!collapsed && <span>Sign out</span>}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "bottom"} className="bg-homehelp-800 text-white border-none">
              Sign out of your account
            </TooltipContent>
          </Tooltip>
          
          {!collapsed && (
            <div className="text-xs text-gray-400 text-center mt-3">
              <p>&copy; {new Date().getFullYear()} HomeHelp</p>
              <p className="mt-1">All rights reserved</p>
            </div>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default UserSidebar;