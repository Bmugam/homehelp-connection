
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, Clock, Tool, Star, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";

const UserHome = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentBookings, setRecentBookings] = useState([
    {
      id: 1,
      service: "House Cleaning",
      provider: "CleanPro Services",
      date: "2023-11-15T14:00:00",
      status: "Upcoming"
    },
    {
      id: 2,
      service: "Plumbing Repair",
      provider: "Quick Fix Plumbing",
      date: "2023-11-10T09:30:00",
      status: "Completed"
    }
  ]);

  // Quick access categories
  const quickAccessServices = [
    {
      icon: Tool,
      title: "Plumbing",
      description: "Fix leaks, repairs, installation",
      path: "/services"
    },
    {
      icon: Calendar,
      title: "House Cleaning",
      description: "Regular or one-time cleaning",
      path: "/services"
    },
    {
      icon: Star,
      title: "Electrical",
      description: "Repairs, installation, maintenance",
      path: "/services"
    },
    {
      icon: Clock,
      title: "Urgent Services",
      description: "Available within 2 hours",
      path: "/services"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-homehelp-900 mb-2">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-homehelp-600">
          Find and manage your home services all in one place
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl mb-10">
        <input
          type="text"
          placeholder="What service do you need today?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-6 py-4 rounded-lg border border-homehelp-200 focus:outline-none focus:ring-2 focus:ring-homehelp-500 transition-all duration-300 text-homehelp-800 bg-white shadow-md"
        />
        <Link to="/services">
          <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-homehelp-900 text-white px-6 py-2 rounded-full hover:bg-homehelp-800 transition-colors duration-300">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </Link>
      </div>

      {/* Quick Access Services */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-homehelp-900">Quick Access</h2>
          <Link to="/services" className="text-homehelp-700 hover:text-homehelp-900 flex items-center text-sm font-medium">
            View all services <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessServices.map((service, index) => (
            <Link to={service.path} key={index}>
              <Card className="p-5 hover:shadow-md transition-shadow duration-200 h-full">
                <div className="flex flex-col h-full">
                  <div className="rounded-full w-12 h-12 bg-homehelp-100 text-homehelp-900 flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-homehelp-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-homehelp-600 flex-grow">{service.description}</p>
                  <Button variant="ghost" className="mt-4 text-homehelp-700 p-0 hover:text-homehelp-900 hover:bg-transparent justify-start">
                    Book now <ArrowRight className="ml-1 w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-homehelp-900">Recent Bookings</h2>
          <Link to="/bookings" className="text-homehelp-700 hover:text-homehelp-900 flex items-center text-sm font-medium">
            View all bookings <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        {recentBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBookings.map((booking) => (
              <Card key={booking.id} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-homehelp-900">{booking.service}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "Upcoming" 
                      ? "bg-homehelp-100 text-homehelp-900" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-homehelp-600 mb-2">Provider: {booking.provider}</p>
                <p className="text-homehelp-500 text-sm mb-4">
                  <Clock className="inline-block w-4 h-4 mr-1" />
                  {new Date(booking.date).toLocaleString('en-US', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  {booking.status === "Upcoming" && (
                    <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                      Reschedule
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-homehelp-600 mb-4">You don't have any recent bookings</p>
            <Link to="/services">
              <Button>Book a Service</Button>
            </Link>
          </Card>
        )}
      </section>

      {/* Recommended Providers */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-homehelp-900">Recommended Providers</h2>
          <Link to="/providers" className="text-homehelp-700 hover:text-homehelp-900 flex items-center text-sm font-medium">
            View all providers <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((provider) => (
            <Card key={provider} className="p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 rounded-full bg-homehelp-200 mr-4 overflow-hidden">
                  <img 
                    src={`https://randomuser.me/api/portraits/${provider % 2 === 0 ? 'women' : 'men'}/${provider + 20}.jpg`} 
                    alt="Provider" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-homehelp-900">Provider {provider}</h3>
                  <div className="flex items-center">
                    <div className="flex text-amber-400 mr-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-homehelp-600">(30+ reviews)</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-homehelp-600 mb-4">Specializes in plumbing, electrical work, and general repairs with over 5 years of experience.</p>
              <Button variant="outline" size="sm" className="w-full">View Profile</Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserHome;
