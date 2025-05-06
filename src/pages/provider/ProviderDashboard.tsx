import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

import {
  Clock,
  DollarSign,
  Star,
  Users,
  XCircle,
} from "lucide-react";

import { apiService } from '../../services/api';

interface Payment {
  amount: number;
  status: string;
  date: string;
}

interface Review {
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface Client {
  id: number;
  name: string;
  avatar?: string;
  lastService?: string;
}

interface Appointment {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: string;
}

const ProviderDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Use the user ID for all API calls - the backend will handle getting the provider ID
        const appointmentsResponse = await apiService.providers.getAppointments();
        setAppointments(appointmentsResponse.data.data || []);

        const paymentsResponse = await apiService.providers.getPayments(user.id);
        setPayments((paymentsResponse.data as Payment[]) || []);

        const clientsResponse = await apiService.clients.getAll(user.id);
        setClients((clientsResponse.data as Client[]) || []);

        const reviewsResponse = await apiService.reviews.getUserReviews();
        setReviews((reviewsResponse.data as Review[]) || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load provider dashboard data';
        setError(errorMessage);
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats dynamically
  const totalClients = clients.length;
  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "N/A";
  const totalEarnings = payments.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const cancelledJobs = appointments.filter(a => a.status === 'cancelled').length;

  const stats = [
    {
      title: "Total Clients",
      value: totalClients.toString(),
      icon: Users,
      change: "+5% from last month",
      positive: true,
    },
    {
      title: "Average Rating",
      value: averageRating,
      icon: Star,
      change: "+3% from last month",
      positive: true,
    },
    {
      title: "Total Earnings",
      value: totalEarnings,
      icon: DollarSign,
      change: "+15% from last month",
      positive: true,
    },
    {
      title: "Cancelled Jobs",
      value: cancelledJobs.toString(),
      icon: XCircle,
      change: "-3% from last month",
      positive: false,
    },
  ];

  if (loading) {
    return <div>Loading provider dashboard data...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Provider Dashboard</h1>
          <p className="text-homehelp-600">Welcome back, {user?.name || "Provider"}</p>
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

      {/* Upcoming Appointments */}
      <Card className="p-5 mb-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-homehelp-900">Upcoming Appointments</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-homehelp-900">No upcoming appointments</h3>
                </div>
              </div>
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-homehelp-900">{appointment.clientName}</h3>
                    <p className="text-sm text-homehelp-600">{appointment.service}</p>
                    <p className="text-xs text-homehelp-600">{appointment.date} at {appointment.time}</p>
                    <p className="text-xs text-homehelp-600">{appointment.location}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${appointment.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Client Ratings */}
      <Card className="p-5 mb-8">
        <h2 className="text-xl font-bold text-homehelp-900 mb-4">Client Ratings</h2>
        <div className="flex items-center mb-4">
          <div className="text-4xl font-bold text-homehelp-900 mr-4">
            {averageRating !== "N/A" ? averageRating : "N/A"}
          </div>
          <div>
            <div className="flex text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : ""}`} />
              ))}
            </div>
            <p className="text-homehelp-600 text-sm">Based on {reviews.length} reviews</p>
          </div>
        </div>
        <div className="space-y-2">
          {[5,4,3,2,1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length;
            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center">
                <span className="text-sm text-homehelp-600 w-16">{star} stars</span>
                <div className="flex-1 bg-homehelp-100 h-2 rounded-full mx-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                </div>
                <span className="text-sm text-homehelp-600">{Math.round(percent)}%</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Clients */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-homehelp-900">Recent Clients</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {clients.length === 0 ? (
            <p className="text-homehelp-600">No clients found.</p>
          ) : (
            clients.slice(0, 3).map((client) => (
              <div key={client.id} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-homehelp-200 mr-3 overflow-hidden">
                  {client.avatar ? (
                    <img 
                      src={client.avatar} 
                      alt={client.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-homehelp-900">{client.name}</h3>
                  <p className="text-xs text-homehelp-600">Last Service: {client.lastService || "N/A"}</p>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProviderDashboard;
