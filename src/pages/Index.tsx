import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, 
  Shield, 
  Clock, 
  Home, 
  Briefcase,
  Star,
  CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-homehelp-900 mb-2">Welcome back, {user?.name || 'Guest'}!</h1>
          <p className="text-homehelp-600">Find the perfect service provider for your home needs.</p>
          
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex items-center justify-center gap-2 bg-homehelp-900 hover:bg-homehelp-800">
                Book a Service <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-homehelp-200 text-homehelp-900 hover:bg-homehelp-50">
                Browse Providers
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 rounded-full bg-homehelp-100 flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-homehelp-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Recent Bookings</h3>
          <p className="text-homehelp-600 mb-4">You have no recent bookings.</p>
          <Button variant="outline" className="w-full text-homehelp-900 border-homehelp-200 hover:bg-homehelp-50">
            Book Now
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 rounded-full bg-homehelp-100 flex items-center justify-center mb-4">
            <Home className="h-6 w-6 text-homehelp-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Popular Services</h3>
          <p className="text-homehelp-600 mb-4">Explore our most booked services.</p>
          <Button variant="outline" className="w-full text-homehelp-900 border-homehelp-200 hover:bg-homehelp-50">
            Explore Services
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 rounded-full bg-homehelp-100 flex items-center justify-center mb-4">
            <Star className="h-6 w-6 text-homehelp-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Top Rated Providers</h3>
          <p className="text-homehelp-600 mb-4">View our highest rated service providers.</p>
          <Button variant="outline" className="w-full text-homehelp-900 border-homehelp-200 hover:bg-homehelp-50">
            View Providers
          </Button>
        </div>
      </section>
      
      <section className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-homehelp-100 flex items-center justify-center mb-4">
              <span className="text-homehelp-900 font-bold">1</span>
            </div>
            <h3 className="font-semibold mb-2">Search Services</h3>
            <p className="text-homehelp-600">Browse through our wide range of home services.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-homehelp-100 flex items-center justify-center mb-4">
              <span className="text-homehelp-900 font-bold">2</span>
            </div>
            <h3 className="font-semibold mb-2">Book a Provider</h3>
            <p className="text-homehelp-600">Choose a time and date that works for you.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-homehelp-100 flex items-center justify-center mb-4">
              <span className="text-homehelp-900 font-bold">3</span>
            </div>
            <h3 className="font-semibold mb-2">Get the Work Done</h3>
            <p className="text-homehelp-600">Sit back while professionals handle your needs.</p>
          </div>
        </div>
      </section>
      
      <section className="bg-homehelp-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Need Help?</h2>
            <p className="text-homehelp-600 mb-4 md:mb-0">Our customer support team is available 24/7.</p>
          </div>
          <Button className="bg-homehelp-900 hover:bg-homehelp-800">Contact Support</Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
