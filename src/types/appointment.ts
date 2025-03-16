
export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export type AppointmentType = {
  id: number;
  client: string;
  service: string;
  date: Date;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  clientPhone?: string;
  location?: string;
  notes?: string;
};
