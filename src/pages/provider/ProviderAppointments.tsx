
import { useState } from "react";
import ProviderDashboardLayout from "@/components/layout/ProviderDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, CalendarDays, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Appointment type
type AppointmentStatus = "upcoming" | "completed" | "cancelled";
type Appointment = {
  id: number;
  client: string;
  service: string;
  date: Date;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  clientPhone?: string;
  location?: string;
  notes?: string;
};

const ProviderAppointments = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<AppointmentStatus>("upcoming");
  
  // In a real app, this data would come from an API
  const allAppointments: Appointment[] = [
    {
      id: 1,
      client: "Sarah Johnson",
      service: "Plumbing Repair",
      date: new Date(2023, 11, 22, 10, 30),
      status: "confirmed",
      clientPhone: "+1 (555) 123-4567",
      location: "123 Main St, Anytown, CA",
      notes: "Leaky faucet in the master bathroom",
    },
    {
      id: 2,
      client: "Michael Brown",
      service: "Electrical Installation",
      date: new Date(2023, 11, 23, 14, 0),
      status: "pending",
      clientPhone: "+1 (555) 987-6543",
      location: "456 Oak Ave, Somewhere, CA",
      notes: "Install new ceiling fan in living room",
    },
    {
      id: 3,
      client: "Emma Wilson",
      service: "Plumbing Repair",
      date: new Date(2023, 11, 24, 9, 0),
      status: "confirmed",
      clientPhone: "+1 (555) 456-7890",
      location: "789 Pine St, Elsewhere, CA",
      notes: "Clogged kitchen sink",
    },
    {
      id: 4,
      client: "Robert Davis",
      service: "Electrical Maintenance",
      date: new Date(2023, 11, 18, 13, 0),
      status: "completed",
      clientPhone: "+1 (555) 234-5678",
      location: "101 Maple Dr, Nowhere, CA",
      notes: "Circuit breaker inspection",
    },
    {
      id: 5,
      client: "Jennifer Smith",
      service: "Plumbing Installation",
      date: new Date(2023, 11, 19, 11, 0),
      status: "completed",
      clientPhone: "+1 (555) 345-6789",
      location: "202 Elm St, Somewhere, CA",
      notes: "New shower installation",
    },
    {
      id: 6,
      client: "Thomas Johnson",
      service: "Electrical Repair",
      date: new Date(2023, 11, 20, 15, 0),
      status: "cancelled",
      clientPhone: "+1 (555) 876-5432",
      location: "303 Birch Ave, Anytown, CA",
      notes: "Faulty outlet repair",
    },
  ];

  // Filter appointments based on tab and search query
  const filteredAppointments = allAppointments.filter(appointment => {
    // Filter by tab
    if (activeTab === "upcoming" && (appointment.status === "confirmed" || appointment.status === "pending")) {
      // Filter by search query if any
      if (searchQuery) {
        return (
          appointment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (appointment.location && appointment.location.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      return true;
    } else if (activeTab === "completed" && appointment.status === "completed") {
      if (searchQuery) {
        return (
          appointment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (appointment.location && appointment.location.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      return true;
    } else if (activeTab === "cancelled" && appointment.status === "cancelled") {
      if (searchQuery) {
        return (
          appointment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (appointment.location && appointment.location.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      return true;
    }
    return false;
  });

  const handleAccept = (id: number) => {
    toast({
      title: "Appointment Accepted",
      description: "You've accepted the appointment. The client will be notified.",
    });
  };

  const handleDecline = (id: number) => {
    toast({
      title: "Appointment Declined",
      description: "You've declined the appointment. The client will be notified.",
    });
  };

  const handleComplete = (id: number) => {
    toast({
      title: "Appointment Completed",
      description: "You've marked the appointment as completed.",
    });
  };

  return (
    <ProviderDashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600">Manage your upcoming and past appointments</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-homehelp-700" />
                Appointments
              </CardTitle>
              <CardDescription>
                View and manage your appointments
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search appointments" 
                  className="pl-9 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" onValueChange={(value) => setActiveTab(value as AppointmentStatus)}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{appointment.client.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900">{appointment.client}</h3>
                              <p className="text-sm text-gray-500">{appointment.service}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-gray-500">{appointment.clientPhone}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">{format(appointment.date, "EEEE, MMMM d, yyyy")}</div>
                            <div className="text-sm text-gray-500">{format(appointment.date, "h:mm a")}</div>
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <Badge
                                className={
                                  appointment.status === "confirmed" 
                                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                }
                              >
                                {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {appointment.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleAccept(appointment.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleDecline(appointment.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {appointment.status === "confirmed" && (
                              <Button 
                                size="sm"
                                onClick={() => handleComplete(appointment.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                          <p className="font-medium text-gray-700">Notes:</p>
                          <p className="text-gray-600">{appointment.notes}</p>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-500">
                          <p>{appointment.location}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No upcoming appointments</h3>
                  <p className="mt-1 text-gray-500">You don't have any upcoming appointments at the moment.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{appointment.client.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900">{appointment.client}</h3>
                              <p className="text-sm text-gray-500">{appointment.service}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-gray-500">{appointment.clientPhone}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">{format(appointment.date, "EEEE, MMMM d, yyyy")}</div>
                            <div className="text-sm text-gray-500">{format(appointment.date, "h:mm a")}</div>
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                Completed
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                          <p className="font-medium text-gray-700">Notes:</p>
                          <p className="text-gray-600">{appointment.notes}</p>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-500">
                          <p>{appointment.location}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Check className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No completed appointments</h3>
                  <p className="mt-1 text-gray-500">You haven't completed any appointments yet.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{appointment.client.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-gray-900">{appointment.client}</h3>
                              <p className="text-sm text-gray-500">{appointment.service}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-gray-500">{appointment.clientPhone}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">{format(appointment.date, "EEEE, MMMM d, yyyy")}</div>
                            <div className="text-sm text-gray-500">{format(appointment.date, "h:mm a")}</div>
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                Cancelled
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                          <p className="font-medium text-gray-700">Notes:</p>
                          <p className="text-gray-600">{appointment.notes}</p>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-500">
                          <p>{appointment.location}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <X className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No cancelled appointments</h3>
                  <p className="mt-1 text-gray-500">You don't have any cancelled appointments.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ProviderDashboardLayout>
  );
};

export default ProviderAppointments;
