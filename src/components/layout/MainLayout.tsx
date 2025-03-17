
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Briefcase, Users, Calendar, User, LogIn, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/services", icon: Briefcase },
    { name: "Providers", path: "/providers", icon: Users },
    { name: "Bookings", path: "/bookings", icon: Calendar },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-homehelp-50 to-homehelp-100">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-display font-bold text-homehelp-900">HomeHelp</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    location.pathname === item.path 
                      ? "text-homehelp-900 font-semibold" 
                      : "text-homehelp-600 hover:text-homehelp-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {/* Provider Dashboard Link */}
              <Link 
                to="/providers-dashboard"
                className="flex items-center space-x-1 text-sm font-medium transition-colors text-homehelp-600 hover:text-homehelp-900"
              >
                <UserCog className="w-4 h-4" />
                <span>Provider Dashboard</span>
              </Link>
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-homehelp-900 hover:bg-homehelp-800">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md text-homehelp-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-homehelp-200 animate-fade-in">
            <nav className="container mx-auto px-4 py-3">
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 p-2 rounded-md ${
                        location.pathname === item.path
                          ? "bg-homehelp-100 text-homehelp-900 font-medium"
                          : "text-homehelp-600 hover:bg-homehelp-50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
                
                {/* Provider Dashboard Link - Mobile */}
                <li>
                  <Link
                    to="/providers-dashboard"
                    className="flex items-center space-x-3 p-2 rounded-md text-homehelp-600 hover:bg-homehelp-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCog className="w-5 h-5" />
                    <span>Provider Dashboard</span>
                  </Link>
                </li>
                
                {/* Auth Buttons - Mobile */}
                <li className="pt-2 border-t border-homehelp-100">
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 p-2 rounded-md text-homehelp-600 hover:bg-homehelp-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="block p-2 rounded-md bg-homehelp-900 text-white text-center font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-homehelp-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-display font-bold text-lg mb-4">HomeHelp</h3>
              <p className="text-homehelp-100 text-sm">
                Connecting homeowners with trusted service professionals for all your home maintenance needs.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-base mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-homehelp-100">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/providers-dashboard" className="hover:text-white transition-colors">
                    Provider Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-homehelp-100">
                <li><Link to="/services" className="hover:text-white transition-colors">House Cleaning</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Plumbing</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Electrical</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Gardening</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-homehelp-100">
                <li>contact@homehelp.com</li>
                <li>+254 700 000 000</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-homehelp-800 mt-8 pt-6 text-center text-sm text-homehelp-400">
            <p>© {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
