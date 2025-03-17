import { useState } from "react";
import ProviderDashboardLayout from "@/components/layout/ProviderDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAppointments, getAppointmentsByStatus } from "@/data/appointments";
import { AppointmentStatus } from "@/types/appointment";
import AppointmentFilters from "@/components/provider/AppointmentFilters";
import AppointmentTabs from "@/components/provider/AppointmentTabs";

const ProviderAppointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<AppointmentStatus>("upcoming");
  
  const filteredAppointments = getAppointmentsByStatus(mockAppointments, activeTab, searchQuery);

  const handleAccept = (id: number) => {
    console.log(`Accepting appointment ${id}`);
  };

  const handleDecline = (id: number) => {
    console.log(`Declining appointment ${id}`);
  };

  const handleComplete = (id: number) => {
    console.log(`Completing appointment ${id}`);
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
            <AppointmentFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" onValueChange={(value) => setActiveTab(value as AppointmentStatus)}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <AppointmentTabs 
              filteredAppointments={filteredAppointments}
              activeTab={activeTab}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onComplete={handleComplete}
            />
          </Tabs>
        </CardContent>
      </Card>
    </ProviderDashboardLayout>
  );
};

export default ProviderAppointments;
