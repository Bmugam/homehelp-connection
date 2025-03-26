
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Service, ServiceCreateInput } from "@/types/service";

const ServicesManagement = () => {
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [newService, setNewService] = useState<ServiceCreateInput>({
    name: '',
    description: '',
    category: '',
    price: 0,
    duration: 30
  });

  // Mock data - will be replaced with actual data from backend API
  const [services] = useState<Service[]>([
    {
      id: '1',
      name: 'House Cleaning',
      description: 'Complete house cleaning service',
      category: 'Cleaning',
      price: 50,
      duration: 120,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Lawn Mowing',
      description: 'Professional lawn care service',
      category: 'Garden',
      price: 35,
      duration: 60,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setNewService(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? parseFloat(value) : value
    }));
  };

  const handleAddService = () => {
    // This will be replaced with an actual API call to create a service
    console.log('Adding new service:', newService);
    
    // Close the dialog and reset the form
    setIsAddServiceDialogOpen(false);
    setNewService({
      name: '',
      description: '',
      category: '',
      price: 0,
      duration: 30
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new service to the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={newService.name}
                  onChange={handleInputChange}
                  placeholder="e.g., House Cleaning"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  name="description"
                  value={newService.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the service"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  name="category"
                  value={newService.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Cleaning, Plumbing, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newService.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration" 
                    name="duration"
                    type="number"
                    min="1"
                    value={newService.duration}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddService}>Add Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-10" 
            placeholder="Search services..." 
          />
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Duration</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{service.name}</td>
                      <td className="p-3">{service.category}</td>
                      <td className="p-3">${service.price.toFixed(2)}</td>
                      <td className="p-3">{service.duration} mins</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesManagement;
