
import { AppointmentType } from "@/types/appointment";

// Mock data for appointments
export const mockAppointments: AppointmentType[] = [
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

export const getAppointmentsByStatus = (
  appointments: AppointmentType[],
  status: AppointmentStatus,
  searchQuery: string = ""
): AppointmentType[] => {
  return appointments.filter(appointment => {
    let statusMatch = false;
    
    if (status === "upcoming" && (appointment.status === "confirmed" || appointment.status === "pending")) {
      statusMatch = true;
    } else if (status === "completed" && appointment.status === "completed") {
      statusMatch = true;
    } else if (status === "cancelled" && appointment.status === "cancelled") {
      statusMatch = true;
    }
    
    if (!statusMatch) return false;
    
    if (!searchQuery) return true;
    
    // Search logic
    return (
      appointment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (appointment.location && appointment.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
};

type AppointmentStatus = "upcoming" | "completed" | "cancelled";
