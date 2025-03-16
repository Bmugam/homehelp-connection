
import React from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { AppointmentType } from "@/types/appointment";

interface AppointmentCardProps {
  appointment: AppointmentType;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
  onComplete?: (id: number) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onAccept,
  onDecline,
  onComplete,
}) => {
  const { toast } = useToast();
  
  const handleAccept = () => {
    onAccept?.(appointment.id);
    toast({
      title: "Appointment Accepted",
      description: "You've accepted the appointment. The client will be notified.",
    });
  };

  const handleDecline = () => {
    onDecline?.(appointment.id);
    toast({
      title: "Appointment Declined",
      description: "You've declined the appointment. The client will be notified.",
    });
  };

  const handleComplete = () => {
    onComplete?.(appointment.id);
    toast({
      title: "Appointment Completed",
      description: "You've marked the appointment as completed.",
    });
  };

  return (
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
                    : appointment.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    : appointment.status === "completed"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {appointment.status === "pending" && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleAccept}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDecline}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            )}
            {appointment.status === "confirmed" && (
              <Button 
                size="sm"
                onClick={handleComplete}
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
  );
};

export default AppointmentCard;
