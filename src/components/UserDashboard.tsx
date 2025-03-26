
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoryItemType, BookingType } from "./user-dashboard/types";
import { DashboardOverview } from "./user-dashboard/tabs/DashboardOverview";
import { UserBookings } from "./user-dashboard/tabs/UserBookings";
import { ServiceHistory } from "./user-dashboard/tabs/ServiceHistory";
import { UserProfile } from "./user-dashboard/tabs/UserProfile";
import { AccountSettings } from "./user-dashboard/tabs/AccountSettings";
import { UserHeader } from "./user-dashboard/UserHeader";
import { UserSidebar } from "./user-dashboard/UserSidebar";

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [serviceHistory, setServiceHistory] = useState<HistoryItemType[]>([]);

  useEffect(() => {
    // Fetch bookings data - This would be an API call in a real app
    const dummyBookings: BookingType[] = [
      {
        id: 1,
        service: "Home Cleaning",
        provider: "CleanMasters Ltd",
        date: new Date(2023, 10, 25, 9, 0),
        status: "confirmed",
        price: 4500,
        address: "123 Main St, Nairobi",
        duration: 3,
        rating: 5 // Adding rating field to make it compatible with HistoryItemType
      },
      {
        id: 2,
        service: "Plumbing Repair",
        provider: "QuickFix Plumbers",
        date: new Date(2023, 10, 28, 14, 0),
        status: "pending",
        price: 2000,
        address: "456 Oak Avenue, Nairobi",
        duration: 2,
        rating: 4 // Adding rating field to make it compatible with HistoryItemType
      },
      {
        id: 3,
        service: "Gardening",
        provider: "Green Thumbs",
        date: new Date(2023, 11, 5, 10, 0),
        status: "confirmed",
        price: 3000,
        address: "789 Elm Street, Nairobi",
        duration: 4,
        rating: 4.5 // Adding rating field to make it compatible with HistoryItemType
      }
    ];

    const dummyHistory: HistoryItemType[] = [
      {
        id: 4,
        service: "Electrical Repair",
        provider: "PowerPros",
        date: new Date(2023, 9, 10, 11, 0),
        status: "completed",
        price: 1800,
        address: "321 Pine Rd, Nairobi",
        duration: 1,
        rating: 5
      },
      {
        id: 5,
        service: "Home Cleaning",
        provider: "CleanMasters Ltd",
        date: new Date(2023, 9, 5, 9, 0),
        status: "completed",
        price: 4500,
        address: "123 Main St, Nairobi",
        duration: 3,
        rating: 4
      },
      {
        id: 6,
        service: "Furniture Assembly",
        provider: "BuildItRight",
        date: new Date(2023, 8, 20, 13, 0),
        status: "cancelled",
        price: 2500,
        address: "567 Maple Ave, Nairobi",
        duration: 2,
        rating: 0
      }
    ];

    setBookings(dummyBookings);
    setServiceHistory(dummyHistory);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <UserSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader 
          user={user} 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DashboardOverview 
                bookings={bookings} 
                serviceHistory={serviceHistory} 
                user={user}
              />
            </TabsContent>

            <TabsContent value="bookings">
              <UserBookings bookings={bookings} />
            </TabsContent>

            <TabsContent value="history">
              <ServiceHistory historyItems={serviceHistory} />
            </TabsContent>

            <TabsContent value="profile">
              <UserProfile user={user} />
            </TabsContent>

            <TabsContent value="settings">
              <AccountSettings user={user} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
