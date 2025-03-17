
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, Home, Calendar, Settings } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";
import UserProfileFooter from "./UserProfileFooter";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

const SidebarNav = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/providers-dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Appointments",
      href: "/providers-dashboard/appointments",
      icon: <Calendar className="h-5 w-5" />,
      badge: "5",
    },
    {
      title: "Settings",
      href: "/providers-dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link to="/providers-dashboard" className="flex items-center">
          <Briefcase className="h-6 w-6 text-homehelp-900 mr-2" />
          <h1 className="text-xl font-display font-bold text-homehelp-900">Provider Portal</h1>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            title={item.title}
            href={item.href}
            icon={item.icon}
            badge={item.badge}
            isActive={location.pathname === item.href}
          />
        ))}
      </div>
      
      <UserProfileFooter />
    </aside>
  );
};

export default SidebarNav;
