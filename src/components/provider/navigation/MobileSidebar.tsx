
import { Link } from "react-router-dom";
import { Briefcase, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SheetContent } from "@/components/ui/sheet";
import SidebarNavItem from "./SidebarNavItem";
import UserProfileFooter from "./UserProfileFooter";
import { NavItem } from "./SidebarNav";

type MobileSidebarProps = {
  navItems: NavItem[];
  onCloseMobileMenu: () => void;
};

const MobileSidebar = ({ navItems, onCloseMobileMenu }: MobileSidebarProps) => {
  const location = useLocation();

  return (
    <SheetContent side="left" className="p-0 w-full sm:w-64">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link to="/providers-dashboard" className="flex items-center">
            <Briefcase className="h-6 w-6 text-homehelp-900 mr-2" />
            <h1 className="text-xl font-display font-bold text-homehelp-900">Provider Portal</h1>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCloseMobileMenu}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
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
            onClick={onCloseMobileMenu}
          />
        ))}
      </div>
      
      <UserProfileFooter />
    </SheetContent>
  );
};

export default MobileSidebar;
