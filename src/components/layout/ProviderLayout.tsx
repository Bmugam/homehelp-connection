import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from "react";
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
  CreditCard,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const ProviderLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout with confirmation
  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: "Dashboard", path: "/providers-dashboard", icon: LayoutDashboard },
    { name: "My Services", path: "/providers-dashboard/my-services", icon: Users },
    { name: "Appointments", path: "/providers-dashboard/appointments", icon: Calendar },
    { name: "Clients", path: "/providers-dashboard/clients", icon: Users },
    { name: "Payments", path: "/providers-dashboard/payments", icon: CreditCard },
    // { name: "Messages", path: "/providers-dashboard/messages", icon: MessageSquare }, // Uncomment if needed to show messages
    { name: "Settings", path: "/providers-dashboard/settings", icon: Settings },
  ];

  // Animation variants
  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: "auto" }
  };

  const userInitials = user?.name ? 
    user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
    "HH";

  return (
    <div className="min-h-screen bg-gradient-to-br from-homehelp-50 to-white flex flex-col">
      {/* Navigation */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-homehelp-900/95 backdrop-blur-sm shadow-lg" 
            : "bg-homehelp-900"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/providers-dashboard" className="flex items-center space-x-2 group">
              <div className="relative w-8 h-8 bg-homehelp-500 rounded-lg flex items-center justify-center overflow-hidden">
                <span className="text-white font-bold">HH</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-homehelp-600 to-homehelp-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-2xl font-display font-bold text-white group-hover:text-homehelp-70 transition-colors">
                HomeHelp <span className="text-homehelp-300">Pro</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                      isActive 
                        ? "bg-homehelp-800 text-white font-semibold" 
                        : "text-homehelp-100 hover:bg-homehelp-800/50 hover:text-white"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-homehelp-300' : ''}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="w-1 h-1 rounded-full bg-homehelp-300"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Notifications & Profile - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-homehelp-100 hover:text-white relative p-2">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="flex items-center space-x-3 border-l border-homehelp-700 pl-4">
                <Avatar className="h-8 w-8 border-2 border-homehelp-700">
                  <AvatarImage src={user?.profilePic} />
                  <AvatarFallback className="bg-homehelp-700 text-white text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-white">{user?.name || 'Provider'}</p>
                  <p className="text-xs text-homehelp-300">{user?.email || 'provider@homehelp.com'}</p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="text-homehelp-100 hover:text-red-400 hover:bg-homehelp-800"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md text-white hover:bg-homehelp-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div 
          className="md:hidden bg-homehelp-800 border-t border-homehelp-700 overflow-hidden"
          initial="closed"
          animate={isMenuOpen ? "open" : "closed"}
          variants={mobileMenuVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-3">
            {/* User profile - Mobile */}
            <div className="flex items-center space-x-3 p-2 mb-3 border-b border-homehelp-700 pb-3">
              <Avatar className="h-10 w-10 border-2 border-homehelp-700">
                <AvatarImage src={user?.profilePic} />
                <AvatarFallback className="bg-homehelp-700 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">{user?.name || 'Provider'}</p>
                <p className="text-xs text-homehelp-300">{user?.email || 'provider@homehelp.com'}</p>
              </div>
            </div>
            
            <nav>
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center justify-between p-3 rounded-md transition-all ${
                          isActive
                            ? "bg-homehelp-700 text-white font-medium"
                            : "text-homehelp-100 hover:bg-homehelp-700/50 hover:text-white"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-homehelp-300' : ''}`} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-homehelp-400" />
                      </Link>
                    </li>
                  );
                })}
                
                {/* Notifications - Mobile */}
                <li className="pt-2 border-t border-homehelp-700 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-homehelp-100 hover:text-white w-full justify-start p-3"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/providers-dashboard/notifications');
                    }}
                  >
                    <Bell className="w-5 h-5 mr-3" />
                    <span>Notifications</span>
                    <span className="ml-auto w-5 h-5 rounded-full bg-homehelp-600 text-xs flex items-center justify-center text-white">3</span>
                  </Button>
                </li>
              </ul>
            </nav>
            
            {/* Logout - Mobile */}
            <div className="mt-4 pt-2 border-t border-homehelp-700">
              <Button 
                variant="destructive" 
                className="w-full justify-center bg-red-600/20 text-red-400 hover:bg-red-600/30 border-none"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-homehelp-900 text-white py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-homehelp-700 rounded-md flex items-center justify-center">
                <span className="text-xs font-bold text-white">HH</span>
              </div>
              <span className="text-lg font-display font-bold">HomeHelp Pro</span>
            </div>
            
            <div className="text-sm text-homehelp-400">
              <p>© {new Date().getFullYear()} HomeHelp Professional Services. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProviderLayout;