import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import {
  BarChart,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Star,
  Users,
  XCircle,
} from "lucide-react";

import { Link } from 'react-router-dom';

const ProviderDashboard = () => {
  const { user } = useAuth();

  // Dummy data for the dashboard
  const stats = [
    {
      title: "Total Appointments",
      value: "156",
      icon: CalendarClock,
      change: "+12% from last month",
      positive: true,
    },
    {
      title: "Completed Jobs",
      value: "142",
      icon: CheckCircle2,
      change: "+8% from last month",
      positive: true,
    },
    {
      title: "Cancelled Jobs",
      value: "14",
      icon: XCircle,
      change: "-3% from last month",
      positive: true,
    },
    {
      title: "Total Earnings",
      value: "$12,450",
      icon: DollarSign,
      change: "+15% from last month",
      positive: true,
    },
  ];

  // Upcoming appointments data
  const upcomingAppointments = [
    {
      id: 1,
      client: "James Wilson",
      service: "Plumbing Repair",
      date: "2023-11-15T10:00:00",
      status: "Confirmed",
      address: "123 Main St, Nairobi"
    },
    {
      id: 2,
      client: "Maria Johnson",
      service: "Electrical Work",
      date: "2023-11-16T14:30:00",
      status: "Pending",
      address: "456 Oak Ave, Nairobi"
    },
    {
      id: 3,
      client: "Robert Smith",
      service: "House Cleaning",
      date: "2023-11-17T09:00:00",
      status: "Confirmed",
      address: "789 Pine Rd, Nairobi"
    }
  ];

  return (
    <div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Provider Dashboard</h1>
          <p className="text-homehelp-600">Welcome back, {user?.name || "Provider"}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Availability
          </Button>
          <Button size="sm">
            <DollarSign className="mr-2 h-4 w-4" />
            Earnings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-homehelp-600 text-sm mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-homehelp-900">{stat.value}</h3>
                <p className={`text-xs ${stat.positive ? "text-green-600" : "text-red-600"} mt-1`}>
                  {stat.change}
                </p>
              </div>
              <div className="bg-homehelp-100 p-3 rounded-full">
                <stat.icon className="h-6 w-6 text-homehelp-900" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-homehelp-900">Upcoming Appointments</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-homehelp-900">{appointment.client}</h3>
                    <p className="text-homehelp-600 text-sm">{appointment.service}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === "Confirmed" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-homehelp-600 mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(appointment.date).toLocaleString('en-US', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}
                </div>
                <p className="text-sm text-homehelp-600 mb-3">
                  Address: {appointment.address}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Contact Client</Button>
                  <Button size="sm">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity & Client Rating */}
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-xl font-bold text-homehelp-900 mb-4">Client Ratings</h2>
            <div className="flex items-center mb-4">
              <div className="text-4xl font-bold text-homehelp-900 mr-4">4.8</div>
              <div>
                <div className="flex text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4 ? "fill-current" : ""}`} />
                  ))}
                </div>
                <p className="text-homehelp-600 text-sm">Based on 78 reviews</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm text-homehelp-600 w-16">5 stars</span>
                <div className="flex-1 bg-homehelp-100 h-2 rounded-full mx-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: "70%" }}></div>
                </div>
                <span className="text-sm text-homehelp-600">70%</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-homehelp-600 w-16">4 stars</span>
                <div className="flex-1 bg-homehelp-100 h-2 rounded-full mx-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
                <span className="text-sm text-homehelp-600">20%</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-homehelp-600 w-16">3 stars</span>
                <div className="flex-1 bg-homehelp-100 h-2 rounded-full mx-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: "5%" }}></div>
                </div>
                <span className="text-sm text-homehelp-600">5%</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-homehelp-600 w-16">2 stars</span>
                <div className="flex-1 bg-homehelp-100 h-2 rounded-full mx-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: "3%" }}></div>
                </div>
                <span className="text-sm text-homehelp-600">3%</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-homehelp-600 w-16">1 star</span>
                <div className="flex-1 bg-homehelp-100 h-2 rounded-full mx-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: "2%" }}></div>
                </div>
                <span className="text-homehelp-600">2%</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-homehelp-900">Recent Clients</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((client) => (
                <div key={client} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-homehelp-200 mr-3 overflow-hidden">
                    <img 
                      src={`https://randomuser.me/api/portraits/${client % 2 === 0 ? 'women' : 'men'}/${client + 30}.jpg`} 
                      alt="Client" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-homehelp-900">Client {client}</h3>
                    <p className="text-xs text-homehelp-600">Service: {["Plumbing", "Electrical", "Cleaning"][client-1]}</p>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
