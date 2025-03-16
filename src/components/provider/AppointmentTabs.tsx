
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { CalendarDays, Check, X } from "lucide-react";
import AppointmentTabContent from "./AppointmentTabContent";
import { AppointmentType, AppointmentStatus } from "@/types/appointment";

interface AppointmentTabsProps {
  filteredAppointments: AppointmentType[];
  activeTab: AppointmentStatus;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onComplete: (id: number) => void;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  filteredAppointments,
  activeTab,
  onAccept,
  onDecline,
  onComplete,
}) => {
  return (
    <>
      <TabsContent value="upcoming">
        <AppointmentTabContent
          appointments={filteredAppointments}
          onAccept={onAccept}
          onDecline={onDecline}
          onComplete={onComplete}
          emptyIcon={<CalendarDays className="mx-auto h-12 w-12 text-gray-300" />}
          emptyTitle="No upcoming appointments"
          emptyDescription="You don't have any upcoming appointments at the moment."
        />
      </TabsContent>
            
      <TabsContent value="completed">
        <AppointmentTabContent
          appointments={filteredAppointments}
          emptyIcon={<Check className="mx-auto h-12 w-12 text-gray-300" />}
          emptyTitle="No completed appointments"
          emptyDescription="You haven't completed any appointments yet."
        />
      </TabsContent>
            
      <TabsContent value="cancelled">
        <AppointmentTabContent
          appointments={filteredAppointments}
          emptyIcon={<X className="mx-auto h-12 w-12 text-gray-300" />}
          emptyTitle="No cancelled appointments"
          emptyDescription="You don't have any cancelled appointments."
        />
      </TabsContent>
    </>
  );
};

export default AppointmentTabs;
