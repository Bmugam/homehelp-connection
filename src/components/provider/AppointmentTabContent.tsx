
import React from "react";
import { CalendarDays, Check, X } from "lucide-react";
import AppointmentCard from "./AppointmentCard";
import { AppointmentType } from "@/types/appointment";

interface AppointmentTabContentProps {
  appointments: AppointmentType[];
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
  onComplete?: (id: number) => void;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}

const AppointmentTabContent: React.FC<AppointmentTabContentProps> = ({
  appointments,
  onAccept,
  onDecline,
  onComplete,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon}
        <h3 className="mt-4 text-lg font-medium text-gray-900">{emptyTitle}</h3>
        <p className="mt-1 text-gray-500">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onAccept={onAccept}
          onDecline={onDecline}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
};

export default AppointmentTabContent;
