
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Trash, Calendar as CalendarIcon } from "lucide-react";

// Sample booking data
const upcomingBookings = [
  {
    id: 1,
    service: "House Cleaning",
    provider: {
      name: "John Kamau",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    date: "2023-11-15",
    time: "09:00 - 12:00",
    location: "123 Moi Avenue, Nairobi",
    status: "confirmed",
    price: "Ksh 3,500"
  },
  {
    id: 2,
    service: "Plumbing Repair",
    provider: {
      name: "Sarah Njeri",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    date: "2023-11-20",
    time: "14:00 - 16:00",
    location: "456 Kenyatta Road, Nairobi",
    status: "pending",
    price: "Ksh 2,800"
  }
];

const pastBookings = [
  {
    id: 3,
    service: "Electrical Installation",
    provider: {
      name: "David Mwangi",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    date: "2023-10-28",
    time: "10:00 - 13:00",
    location: "789 Mombasa Road, Nairobi",
    status: "completed",
    price: "Ksh 4,200",
    rating: 4
  },
  {
    id: 4,
    service: "Gardening",
    provider: {
      name: "Mary Wanjiku",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
    },
    date: "2023-10-15",
    time: "08:00 - 11:00",
    location: "321 Langata Road, Nairobi",
    status: "completed",
    price: "Ksh 2,500",
    rating: 5
  },
  {
    id: 5,
    service: "Furniture Assembly",
    provider: {
      name: "Peter Ochieng",
      image: "https://randomuser.me/api/portraits/men/5.jpg",
    },
    date: "2023-09-30",
    time: "15:00 - 17:00",
    location: "654 Ngong Road, Nairobi",
    status: "cancelled",
    price: "Ksh 1,800"
  }
];

// Booking status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ";
  
  switch (status) {
    case "confirmed":
      className += "bg-green-100 text-green-800";
      break;
    case "pending":
      className += "bg-yellow-100 text-yellow-800";
      break;
    case "completed":
      className += "bg-blue-100 text-blue-800";
      break;
    case "cancelled":
      className += "bg-red-100 text-red-800";
      break;
    default:
      className += "bg-gray-100 text-gray-800";
  }
  
  return <span className={className}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg 
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-homehelp-900 text-center mb-8">
        My Bookings
      </h1>
      
      <Tabs defaultValue="upcoming" className="max-w-4xl mx-auto" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-6">
              {upcomingBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <img 
                          src={booking.provider.image} 
                          alt={booking.provider.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-homehelp-900">{booking.service}</h3>
                          <div className="flex items-center text-homehelp-600 text-sm">
                            <User className="w-4 h-4 mr-1" />
                            <span>{booking.provider.name}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 mb-4">
                      <div className="flex items-center text-homehelp-600">
                        <Calendar className="w-5 h-5 mr-2 text-homehelp-500" />
                        <div>
                          <div className="text-homehelp-900 font-medium">Date</div>
                          <div className="text-sm">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-homehelp-600">
                        <Clock className="w-5 h-5 mr-2 text-homehelp-500" />
                        <div>
                          <div className="text-homehelp-900 font-medium">Time</div>
                          <div className="text-sm">{booking.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-homehelp-600">
                        <MapPin className="w-5 h-5 mr-2 text-homehelp-500" />
                        <div>
                          <div className="text-homehelp-900 font-medium">Location</div>
                          <div className="text-sm">{booking.location}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-homehelp-100 pt-4">
                      <div className="text-homehelp-900 font-semibold">{booking.price}</div>
                      <div className="space-x-3">
                        {booking.status === 'pending' && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        <Button size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {booking.status === 'confirmed' ? 'Reschedule' : 'Confirm'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 mx-auto text-homehelp-300 mb-4" />
                <h3 className="text-xl font-semibold text-homehelp-900 mb-2">No Upcoming Bookings</h3>
                <p className="text-homehelp-600 mb-6">You don't have any upcoming service bookings.</p>
                <Button>Book a Service</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastBookings.length > 0 ? (
            <div className="space-y-6">
              {pastBookings.map(booking => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <img 
                          src={booking.provider.image} 
                          alt={booking.provider.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-homehelp-900">{booking.service}</h3>
                          <div className="flex items-center text-homehelp-600 text-sm">
                            <User className="w-4 h-4 mr-1" />
                            <span>{booking.provider.name}</span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 mb-4">
                      <div className="flex items-center text-homehelp-600">
                        <Calendar className="w-5 h-5 mr-2 text-homehelp-500" />
                        <div>
                          <div className="text-homehelp-900 font-medium">Date</div>
                          <div className="text-sm">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-homehelp-600">
                        <Clock className="w-5 h-5 mr-2 text-homehelp-500" />
                        <div>
                          <div className="text-homehelp-900 font-medium">Time</div>
                          <div className="text-sm">{booking.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-homehelp-600">
                        <MapPin className="w-5 h-5 mr-2 text-homehelp-500" />
                        <div>
                          <div className="text-homehelp-900 font-medium">Location</div>
                          <div className="text-sm">{booking.location}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-homehelp-100 pt-4">
                      <div className="text-homehelp-900 font-semibold">{booking.price}</div>
                      <div className="space-x-3 flex items-center">
                        {booking.status === 'completed' && booking.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-homehelp-600">Your Rating:</span>
                            <StarRating rating={booking.rating} />
                          </div>
                        )}
                        {booking.status === 'completed' && !booking.rating && (
                          <Button size="sm" variant="outline">Rate Service</Button>
                        )}
                        {booking.status === 'completed' && (
                          <Button size="sm">Book Again</Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 mx-auto text-homehelp-300 mb-4" />
                <h3 className="text-xl font-semibold text-homehelp-900 mb-2">No Past Bookings</h3>
                <p className="text-homehelp-600 mb-6">You don't have any past service bookings.</p>
                <Button>Book a Service</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bookings;
