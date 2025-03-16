
import { useState } from "react";
import ProviderDashboardLayout from "@/components/layout/ProviderDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Users, 
  Clock, 
  Star, 
  CalendarCheck, 
  Calendar as CalendarIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

const ProviderDashboard = () => {
  // In a real app, this would come from an API
  const upcomingAppointments = [
    {
      id: 1,
      client: "Sarah Johnson",
      service: "Plumbing Repair",
      date: new Date(2023, 11, 22, 10, 30),
      status: "confirmed",
    },
    {
      id: 2,
      client: "Michael Brown",
      service: "Electrical Installation",
      date: new Date(2023, 11, 23, 14, 0),
      status: "pending",
    },
    {
      id: 3,
      client: "Emma Wilson",
      service: "Plumbing Repair",
      date: new Date(2023, 11, 24, 9, 0),
      status: "confirmed",
    },
  ];

  const recentReviews = [
    {
      id: 1,
      client: "David Smith",
      rating: 5,
      comment: "Excellent service! Very professional and thorough.",
      date: "2 days ago",
    },
    {
      id: 2,
      client: "Jessica Lee",
      rating: 4,
      comment: "Great job, but arrived a bit late.",
      date: "1 week ago",
    },
  ];

  return (
    <ProviderDashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, John Doe!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">28</p>
                <p className="text-sm text-green-600 mt-1">+12% from last month</p>
              </div>
              <div className="bg-homehelp-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-homehelp-900" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">$1,200</p>
                <p className="text-sm text-green-600 mt-1">+8% from last month</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
                <p className="text-3xl font-bold text-gray-900">19</p>
                <p className="text-sm text-green-600 mt-1">+5% from last month</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                <p className="text-3xl font-bold text-gray-900">4.8</p>
                <div className="flex text-amber-500 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck className="h-5 w-5 mr-2 text-homehelp-700" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{appointment.client.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-sm text-gray-500">{appointment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(appointment.date, "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(appointment.date, "h:mm a")}
                      </p>
                    </div>
                    <Badge
                      className={appointment.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
            <Button className="w-full mt-4" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View All Appointments
            </Button>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-homehelp-700" />
              Recent Reviews
            </CardTitle>
            <CardDescription>What your clients are saying</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{review.client}</p>
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= review.rating ? "fill-current" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
            <Button className="w-full mt-4" variant="outline">
              <Star className="h-4 w-4 mr-2" />
              View All Reviews
            </Button>
          </CardContent>
        </Card>
      </div>
    </ProviderDashboardLayout>
  );
};

export default ProviderDashboard;
