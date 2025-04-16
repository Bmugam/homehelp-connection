import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Search,
  Users,
  Star,
  Filter,
  MessageSquare,
  Phone,
  Calendar,
  MapPin,
  Tag,
  Clock,
  MoreHorizontal,
  ChevronDown,
  Heart,
  Award
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

const ProviderClients = () => {
  const { user } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => apiService.clients.getAll(user.id).then(res => res.data),
    enabled: !!user?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ clientId, status }: { clientId: number; status: 'active' | 'inactive' }) => 
      apiService.clients.updateStatus(clientId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Client status updated');
    },
    onError: () => toast.error('Failed to update client status')
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (clientId: number) => apiService.clients.toggleFavorite(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Favorite status updated');
    },
    onError: () => toast.error('Failed to update favorite status')
  });

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  if (error) {
    return <div>Error loading clients</div>;
  }

  const renderClientCard = (client) => (
    <Card key={client.id} className="p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                <img 
                  src={client.avatar} 
                  alt={client.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {client.favorites && (
                <span 
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                  onClick={() => toggleFavoriteMutation.mutate(client.id)}
                >
                  <Heart className="h-3 w-3 fill-current" />
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-homehelp-900">{client.name}</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center text-amber-500 mr-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{client.rating}</span>
                    </div>
                    <span className="text-xs text-homehelp-500 bg-homehelp-100 px-2 py-1 rounded-full">
                      {client.jobsCompleted} jobs completed
                    </span>
                  </div>
                </div>
                
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                    client.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}
                  onClick={() => updateStatusMutation.mutate({
                    clientId: client.id,
                    status: client.status === 'active' ? 'inactive' : 'active'
                  })}
                >
                  {client.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mt-4">
                <div className="flex items-center text-sm text-homehelp-600">
                  <Phone className="h-4 w-4 mr-2 text-homehelp-500" />
                  {client.phone}
                </div>
                <div className="flex items-center text-sm text-homehelp-600">
                  <MessageSquare className="h-4 w-4 mr-2 text-homehelp-500" />
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-homehelp-600">
                  <MapPin className="h-4 w-4 mr-2 text-homehelp-500" />
                  {client.address}
                </div>
                <div className="flex items-center text-sm text-homehelp-600">
                  <Clock className="h-4 w-4 mr-2 text-homehelp-500" />
                  Last service: {client.lastServiceDate}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-homehelp-50 p-4 flex sm:flex-col justify-between sm:justify-center items-center sm:space-y-3 border-t sm:border-t-0 sm:border-l">
          <Button variant="outline" size="sm" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button size="sm" className="w-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border-t px-6 py-3 bg-homehelp-50 flex justify-between items-center">
        <div className="flex items-center">
          <Award className="h-4 w-4 text-homehelp-600 mr-2" />
          <span className="text-sm text-homehelp-600">
            Last service: <span className="font-medium text-homehelp-900">{client.lastService}</span>
          </span>
        </div>
        <Button variant="info" size="sm" className="text-homehelp-600">
          View Service History
        </Button>
      </div>
    </Card>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Clients</h1>
          <p className="text-homehelp-600">Manage and track all your clients</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hidden sm:flex">
            <Tag className="mr-2 h-4 w-4" />
            Add Tags
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <TabsList>
              <TabsTrigger value="all">All Clients</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-homehelp-500 h-4 w-4" />
                <Input 
                  placeholder="Search clients..." 
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
          
          {filterOpen && (
            <Card className="mt-4 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-homehelp-700 mb-1 block">Service Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">All Services</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="renovation">Renovation</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-homehelp-700 mb-1 block">Date Range</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">All Time</option>
                    <option value="last-month">Last Month</option>
                    <option value="last-3-months">Last 3 Months</option>
                    <option value="last-year">Last Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-homehelp-700 mb-1 block">Rating</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Any Rating</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-homehelp-700 mb-1 block">Jobs Completed</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Any</option>
                    <option value="1">At least 1</option>
                    <option value="5">5+</option>
                    <option value="10">10+</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" size="sm">Reset</Button>
                <Button size="sm">Apply Filters</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="grid gap-4">
          <TabsContent value="all" className="m-0">
            {clients.map(renderClientCard)}
          </TabsContent>
          
          <TabsContent value="active" className="m-0">
            {clients.filter(client => client.status === "active").map(renderClientCard)}
          </TabsContent>
          
          <TabsContent value="favorites" className="m-0">
            {clients.filter(client => client.favorites).map(renderClientCard)}
          </TabsContent>
          
          <TabsContent value="inactive" className="m-0">
            {clients.filter(client => client.status === "inactive").map(renderClientCard)}
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-homehelp-600">
          Showing <span className="font-medium">5</span> of <span className="font-medium">24</span> clients
        </div>
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" className="bg-homehelp-100">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderClients;