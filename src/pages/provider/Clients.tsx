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
  Award,
  Loader2,
  Mail,
  AlertCircle,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProviderClients = () => {
  const { user } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => apiService.clients.getAll(user.id).then(res => res.data),
    enabled: !!user?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ clientId, status }) => 
      apiService.clients.updateStatus(clientId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Client status updated successfully');
    },
    onError: () => toast.error('Failed to update client status')
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (clientId) => apiService.clients.toggleFavorite(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      toast.success('Favorite status updated');
    },
    onError: () => toast.error('Failed to update favorite status')
  });

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleOpenClientModal = (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  // Loading state components
  const ClientCardSkeleton = () => (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start">
            <Skeleton className="w-16 h-16 rounded-full mr-4" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <div className="flex items-center mt-1">
                <Skeleton className="h-4 w-16 mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mt-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-homehelp-50 p-4 flex sm:flex-col justify-between sm:justify-center items-center sm:space-y-3 border-t sm:border-t-0 sm:border-l">
          <Skeleton className="h-9 w-full mb-2" />
          <Skeleton className="h-9 w-full mb-2" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="border-t px-6 py-3 bg-homehelp-50 flex justify-between items-center">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
    </Card>
  );

  const LoadingState = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-12 w-full mb-6" />
      <div className="grid gap-4">
        {Array(3).fill(0).map((_, index) => (
          <ClientCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <Card className="p-6 bg-red-50 border-red-200">
      <div className="flex items-center mb-4">
        <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
        <h3 className="text-lg font-semibold text-red-700">Error Loading Clients</h3>
      </div>
      <p className="text-red-600 mb-4">We're having trouble loading your client data. Please try again later.</p>
      <Button onClick={() => queryClient.invalidateQueries(['clients'])}>
        Try Again
      </Button>
    </Card>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  const renderClientCard = (client) => (
    <Card key={client.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex items-start">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-homehelp-100">
                <AvatarImage src={client.avatar} alt={client.name} />
                <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <button 
                className={`absolute -top-1 -right-1 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  client.favorites ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-red-100'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoriteMutation.mutate(client.id);
                }}
              >
                <Heart className={`h-3 w-3 ${client.favorites ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="flex-1 ml-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-homehelp-900 hover:text-homehelp-700 cursor-pointer" 
                      onClick={() => handleOpenClientModal(client)}>
                    {client.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center text-amber-500 mr-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-medium">{client.rating}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {client.jobsCompleted} jobs completed
                    </Badge>
                  </div>
                </div>
                
                <Badge 
                  variant={client.status === "active" ? "success" : "outline"}
                  className={`cursor-pointer transition-colors duration-200 ${
                    client.status === "active" 
                      ? "bg-green-100 text-green-800 hover:bg-green-200" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatusMutation.mutate({
                      clientId: client.id,
                      status: client.status === 'active' ? 'inactive' : 'active'
                    });
                  }}
                >
                  {client.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mt-4">
                <div className="flex items-center text-sm text-homehelp-600">
                  <Phone className="h-4 w-4 mr-2 text-homehelp-500" />
                  {client.phone}
                </div>
                <div className="flex items-center text-sm text-homehelp-600">
                  <Mail className="h-4 w-4 mr-2 text-homehelp-500" />
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-homehelp-600">
                  <MapPin className="h-4 w-4 mr-2 text-homehelp-500" />
                  {client.address || "No address provided"}
                </div>
                <div className="flex items-center text-sm text-homehelp-600">
                  <Clock className="h-4 w-4 mr-2 text-homehelp-500" />
                  Last service: {client.lastServiceDate || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-homehelp-50 p-4 flex sm:flex-col justify-between sm:justify-center items-center sm:space-y-3 border-t sm:border-t-0 sm:border-l">
          <Button variant="outline" size="sm" className="w-full hover:bg-homehelp-100 transition-colors duration-200">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="w-full hover:bg-homehelp-100 transition-colors duration-200">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button 
            size="sm" 
            className="w-full hover:bg-homehelp-700 transition-colors duration-200"
            onClick={() => handleOpenClientModal(client)}
          >
            View Details
          </Button>
        </div>
      </div>
      
      <div className="border-t px-6 py-3 bg-homehelp-50 flex justify-between items-center">
        <div className="flex items-center">
          <Award className="h-4 w-4 text-homehelp-600 mr-2" />
          <span className="text-sm text-homehelp-600">
            Last service: <span className="font-medium text-homehelp-900">{client.lastService || "None"}</span>
          </span>
        </div>
        <Button variant="secondary" size="sm" className="text-homehelp-600 hover:bg-homehelp-200 transition-colors duration-200">
          Service History
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
          <Button variant="outline" className="hidden sm:flex hover:bg-homehelp-100 transition-colors duration-200">
            <Tag className="mr-2 h-4 w-4" />
            Add Tags
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <TabsList className="bg-homehelp-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-homehelp-600 data-[state=active]:text-white">All Clients</TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-homehelp-600 data-[state=active]:text-white">Active</TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-homehelp-600 data-[state=active]:text-white">Favorites</TabsTrigger>
              <TabsTrigger value="inactive" className="data-[state=active]:bg-homehelp-600 data-[state=active]:text-white">Inactive</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-homehelp-500 h-4 w-4" />
                <Input 
                  placeholder="Search clients..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center hover:bg-homehelp-100 transition-colors duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
          
          {filterOpen && (
            <Card className="mt-4 p-4 border-homehelp-200 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-homehelp-700 mb-1 block">Service Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Services</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="renovation">Renovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-homehelp-700 mb-1 block">Date Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Time</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-homehelp-700 mb-1 block">Rating</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Rating</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-homehelp-700 mb-1 block">Jobs Completed</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">At least 1</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                      <SelectItem value="10">10+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="outline" size="sm" className="hover:bg-homehelp-100 transition-colors duration-200">Reset</Button>
                <Button size="sm" className="hover:bg-homehelp-700 transition-colors duration-200">Apply Filters</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="grid gap-4">
          <TabsContent value="all" className="m-0">
            {filteredClients.length > 0 ? (
              filteredClients.map(renderClientCard)
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-homehelp-300 mb-3" />
                <h3 className="text-lg font-medium text-homehelp-900 mb-2">No clients found</h3>
                <p className="text-homehelp-600 mb-4">
                  {searchTerm ? 
                    `No clients match your search "${searchTerm}"` : 
                    "You don't have any clients yet"
                  }
                </p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="m-0">
            {filteredClients.filter(client => client.status === "active").map(renderClientCard)}
          </TabsContent>
          
          <TabsContent value="favorites" className="m-0">
            {filteredClients.filter(client => client.favorites).map(renderClientCard)}
          </TabsContent>
          
          <TabsContent value="inactive" className="m-0">
            {filteredClients.filter(client => client.status === "inactive").map(renderClientCard)}
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-homehelp-600">
          Showing <span className="font-medium">{Math.min(5, filteredClients.length)}</span> of <span className="font-medium">{filteredClients.length}</span> clients
        </div>
        <div className="flex space-x-1">
          <Button variant="outline" size="sm" disabled className="opacity-50">Previous</Button>
          <Button variant="outline" size="sm" className="bg-homehelp-100 hover:bg-homehelp-200 transition-colors duration-200">1</Button>
          <Button variant="outline" size="sm" className="hover:bg-homehelp-100 transition-colors duration-200">2</Button>
          <Button variant="outline" size="sm" className="hover:bg-homehelp-100 transition-colors duration-200">3</Button>
          <Button variant="outline" size="sm" className="hover:bg-homehelp-100 transition-colors duration-200">Next</Button>
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Client Details</span>
                <Badge variant={selectedClient.status === "active" ? "success" : "outline"}>
                  {selectedClient.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center space-y-4 pt-4 pb-6">
              <Avatar className="w-24 h-24 border-2 border-homehelp-100">
                <AvatarImage src={selectedClient.avatar} alt={selectedClient.name} />
                <AvatarFallback>{selectedClient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-homehelp-900">{selectedClient.name}</h2>
                <div className="flex items-center justify-center mt-1">
                  <div className="flex items-center text-amber-500 mr-2">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">{selectedClient.rating}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {selectedClient.jobsCompleted} jobs completed
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-homehelp-500">Email</span>
                <div className="flex items-center text-homehelp-900">
                  <Mail className="h-4 w-4 mr-2 text-homehelp-500" />
                  {selectedClient.email}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-homehelp-500">Phone</span>
                <div className="flex items-center text-homehelp-900">
                  <Phone className="h-4 w-4 mr-2 text-homehelp-500" />
                  {selectedClient.phone}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-homehelp-500">Address</span>
                <div className="flex items-center text-homehelp-900">
                  <MapPin className="h-4 w-4 mr-2 text-homehelp-500" />
                  {selectedClient.address || "No address provided"}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-homehelp-500">Last Service</span>
                <div className="flex items-center text-homehelp-900">
                  <Clock className="h-4 w-4 mr-2 text-homehelp-500" />
                  {selectedClient.lastServiceDate || "N/A"}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-md font-medium mb-2">Service History</h3>
              <div className="bg-homehelp-50 p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedClient.lastService || "No service history"}</span>
                  <span className="text-sm text-homehelp-500">{selectedClient.lastServiceDate}</span>
                </div>
                <p className="text-sm text-homehelp-600">
                  {selectedClient.lastService 
                    ? "Last service completed successfully" 
                    : "This client hasn't booked any services yet"}
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="hover:bg-homehelp-100">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-homehelp-100">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProviderClients;