
import { useState } from "react";
import { Home, Calendar, Settings, Briefcase } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import SidebarNav from "@/components/provider/navigation/SidebarNav";
import MobileHeader from "@/components/provider/navigation/MobileHeader";
import MobileSidebar from "@/components/provider/navigation/MobileSidebar";

const ProviderDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <SidebarNav />

      {/* Mobile Sidebar with SheetTrigger to properly wrap the DialogTrigger */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger className="md:hidden">
          {/* This is an invisible trigger for the sheet, actual button is in MobileHeader */}
          <span className="sr-only">Open mobile menu</span>
        </SheetTrigger>
        <MobileSidebar 
          navItems={navItems} 
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)} 
        />
      </Sheet>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Header */}
        <MobileHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default ProviderDashboardLayout;
