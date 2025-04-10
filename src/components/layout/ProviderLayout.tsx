import { useAuth } from '../../contexts/AuthContext';
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Users, 
  LogOut,
  Bell,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ProviderLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/providers-dashboard", icon: LayoutDashboard },
    { name: "Appointments", path: "/providers-dashboard/appointments", icon: Calendar },
    { name: "Messages", path: "/providers-dashboard/messages", icon: MessageSquare },
    { name: "Clients", path: "/providers-dashboard/clients", icon: Users },
    { name: "Payments", path: "/providers-dashboard/payments", icon: CreditCard },
    { name: "Settings", path: "/providers-dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-homehelp-50">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-homehelp-900 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/providers-dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-display font-bold">HomeHelp Pro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    location.pathname === item.path 
                      ? "text-white font-semibold" 
                      : "text-homehelp-100 hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Notifications & Logout - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-homehelp-100 hover:text-white">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="destructive" size="sm" onClick={logout} className="text-red border-homehelp-700 hover:bg-homehelp-800">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-homehelp-800 border-t border-homehelp-700 animate-fade-in">
            <nav className="container mx-auto px-4 py-3">
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 p-2 rounded-md ${
                        location.pathname === item.path
                          ? "bg-homehelp-700 text-white font-medium"
                          : "text-homehelp-100 hover:bg-homehelp-700 hover:text-white"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
                
                {/* Notifications & Logout - Mobile */}
                <li className="pt-2 border-t border-homehelp-700">
                  <div className="flex items-center justify-between p-2">
                    <Button variant="ghost" size="sm" className="text-homehelp-100 hover:text-white w-full justify-start">
                      <Bell className="w-5 h-5 mr-3" />
                      <span>Notifications</span>
                    </Button>
                  </div>
                </li>
                <li>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center border-homehelp-700 text-white hover:bg-homehelp-700"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-homehelp-900 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-homehelp-400">
          <p>© {new Date().getFullYear()} HomeHelp Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProviderLayout;
