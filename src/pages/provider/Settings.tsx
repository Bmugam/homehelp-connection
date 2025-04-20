 import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  User,
  Bell,
  Shield,
  Clock,
  Save,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  CalendarRange
} from "lucide-react";
import {
  getProviderById,
  getProviderServices,
  updateProviderProfile,
  updateProviderAvailability,
  addProviderService,
  updateProviderService
} from '@/services/providerService';

const ProviderSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Helper function to convert { weekdays, weekends } to AvailabilityHours
  const convertToAvailabilityHours = (availability) => {
    const defaultStart = "08:00";
    const defaultEnd = "17:00";
    const dayAvailability = (active) => ({
      active,
      start: defaultStart,
      end: defaultEnd
    });

    return {
      monday: dayAvailability(availability.weekdays),
      tuesday: dayAvailability(availability.weekdays),
      wednesday: dayAvailability(availability.weekdays),
      thursday: dayAvailability(availability.weekdays),
      friday: dayAvailability(availability.weekdays),
      saturday: dayAvailability(availability.weekends),
      sunday: dayAvailability(availability.weekends)
    };
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to split full name into first and last names
  const splitName = (fullName) => {
    if (!fullName) return { first_name: "", last_name: "" };
    const parts = fullName.trim().split(" ");
    return {
      first_name: parts[0] || "",
      last_name: parts.slice(1).join(" ") || ""
    };
  };

  const { first_name, last_name } = splitName(user?.name);

  const [profileForm, setProfileForm] = useState({
    email: user?.email || "",
    phone_number: user?.phone || "",
    first_name: first_name,
    last_name: last_name,
    profile_image: user?.profile_image || "",
    business_name: "",
    business_description: "",
    location: "",
    verification_status: "pending"
  });

  const [availabilityHours, setAvailabilityHours] = useState({
    monday: { active: true, start: "08:00", end: "17:00" },
    tuesday: { active: true, start: "08:00", end: "17:00" },
    wednesday: { active: true, start: "08:00", end: "17:00" },
    thursday: { active: true, start: "08:00", end: "17:00" },
    friday: { active: true, start: "08:00", end: "17:00" },
    saturday: { active: true, start: "09:00", end: "15:00" },
    sunday: { active: false, start: "09:00", end: "15:00" }
  });

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    service_id: "",
    price: "",
    description: "",
    availability: {
      weekdays: true,
      weekends: true
    }
  });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const openAddServiceModal = () => {
    setSelectedService(null);
    setServiceForm({
      service_id: "",
      price: "",
      description: "",
      availability: {
        weekdays: true,
        weekends: true
      }
    });
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service) => {
    setSelectedService(service);
    setServiceForm({
      service_id: service.service_id?.toString() || "",
      price: service.price || "",
      description: service.description || "",
      availability: {
        weekdays: service.availability?.weekdays ?? true,
        weekends: service.availability?.weekends ?? true
      }
    });
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
  };

  const handleServiceFormSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const availabilityHoursObj = convertToAvailabilityHours(serviceForm.availability);
      if (selectedService) {
        await updateProviderService(user.id.toString(), selectedService.id, {
          price: serviceForm.price,
          description: serviceForm.description,
          availability: availabilityHoursObj
        });
      } else {
        await addProviderService(user.id.toString(), {
          service_id: Number(serviceForm.service_id),
          price: serviceForm.price,
          description: serviceForm.description,
          availability: availabilityHoursObj
        });
      }
      const updatedServices = await getProviderServices(user.id.toString());
      setServices(updatedServices);
      toast({
        title: "Success",
        description: `Service ${selectedService ? "updated" : "added"} successfully.`,
      });
      closeServiceModal();
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${selectedService ? "update" : "add"} service.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: true,
    booking_updates: true,
    payment_alerts: true
  });


  useEffect(() => {
    const fetchProviderData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const providerData = await getProviderById(user.id.toString());
        setProfileForm(prev => ({
          ...prev,
          business_name: providerData.business_name || "",
          business_description: providerData.bio || "",
          location: providerData.location || "",
          verification_status: providerData.verification_status || "pending"
        }));
        if (providerData.availability_hours) {
          setAvailabilityHours(providerData.availability_hours);
        }
        const providerServices = await getProviderServices(user.id.toString());
        setServices(providerServices);
      } catch (err) {
        setError("Failed to load provider data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
  }, [user?.id]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setAvailabilityHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleServiceAvailabilityToggle = (setting) => {
    setServiceForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [setting]: !prev.availability[setting]
      }
    }));
  };

  const handleSaveSettings = async (section) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (section === 'profile') {
        // Combine first_name and last_name into full name
        const fullName = `${profileForm.first_name} ${profileForm.last_name}`.trim();
        await updateProviderProfile(user.id.toString(), {
          name: fullName,
          business_name: profileForm.business_name,
          business_description: profileForm.business_description,
          location: profileForm.location
        });
      } else if (section === 'availability') {
        await updateProviderAvailability(user.id.toString(), {
          availability_hours: availabilityHours
        });
      } else if (section === 'services') {
        if (serviceForm.service_id) {
          const availabilityHoursObj = convertToAvailabilityHours(serviceForm.availability);
          if (selectedService) {
            await updateProviderService(user.id.toString(), selectedService.id, {
              price: serviceForm.price,
              description: serviceForm.description,
              availability: availabilityHoursObj
            });
          } else {
            await addProviderService(user.id.toString(), {
              service_id: Number(serviceForm.service_id),
              price: serviceForm.price,
              description: serviceForm.description,
              availability: availabilityHoursObj
            });
          }
          const updatedServices = await getProviderServices(user.id.toString());
          setServices(updatedServices);
        }
      } else if (section === 'notification') {
        // No backend support, keep local state only
      }
      toast({
        title: "Settings saved",
        description: `Your ${section} settings have been updated successfully.`,
      });
    } catch (err) {
      setError(`Failed to save ${section} settings.`);
      toast({
        title: "Error",
        description: `Failed to save ${section} settings.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-homehelp-900">Provider Settings</h1>
          <p className="text-homehelp-600">Manage your service provider profile and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Availability</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Personal & Business Information</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-homehelp-200 mb-4 overflow-hidden">
                  {profileForm.profile_image ? (
                    <img 
                      src={profileForm.profile_image}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-homehelp-100 text-homehelp-500">
                      <User size={40} />
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="mb-2">Change Photo</Button>
                <p className="text-xs text-homehelp-600 text-center">
                  Recommended: Square JPG, PNG <br />at least 300x300px
                </p>
              </div>
              
              <div className="md:w-2/3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input 
                      id="first_name" 
                      name="first_name" 
                      value={profileForm.first_name} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input 
                      id="last_name" 
                      name="last_name" 
                      value={profileForm.last_name} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={profileForm.email} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input 
                      id="phone_number" 
                      name="phone_number" 
                      value={profileForm.phone_number} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input 
                    id="business_name" 
                    name="business_name" 
                    value={profileForm.business_name} 
                    onChange={handleProfileChange} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location/Service Area</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-homehelp-500" />
                    <Input 
                      id="location" 
                      name="location" 
                      value={profileForm.location} 
                      onChange={handleProfileChange}
                      placeholder="City, Area, or Neighborhood"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="business_description">Business Description</Label>
                  <Textarea 
                    id="business_description" 
                    name="business_description" 
                    rows={4} 
                    value={profileForm.business_description} 
                    onChange={handleProfileChange} 
                    placeholder="Describe your services, experience, and expertise..."
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={() => handleSaveSettings('profile')}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {profileForm.verification_status !== "verified" && (
            <Card className="p-6 mt-6 border-yellow-300 bg-yellow-50">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-medium text-homehelp-900">Verification Status: {profileForm.verification_status}</h3>
                  <p className="text-homehelp-600 text-sm mt-1">
                    {profileForm.verification_status === "pending" 
                      ? "Your account is being reviewed. Verification typically takes 1-3 business days."
                      : "Your verification was rejected. Please update your information and submit again."}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Services & Pricing</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="p-4 border border-homehelp-200">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-homehelp-900">{service.name}</h3>
                      <div className="flex gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    <p className="text-homehelp-600 text-sm mt-1 mb-3">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-homehelp-900">KSh {service.price}</span>
                      <Button variant="outline" size="sm" onClick={() => openEditServiceModal(service)}>Edit</Button>
                    </div>
                  </Card>
                ))}
                
                {/* Add new service card */}
                <Card className="p-4 border border-dashed border-homehelp-300 flex flex-col items-center justify-center text-homehelp-500 h-full">
                  <div className="text-center">
                    <p className="mb-2">Add a new service</p>
                    <Button variant="outline" onClick={openAddServiceModal}>+ Add Service</Button>
                  </div>
                </Card>
              </div>
              
              {isServiceModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                    <h3 className="text-lg font-medium text-homehelp-900 mb-4">{selectedService ? "Edit Service" : "Add New Service"}</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="service_id">Service Type</Label>
                        <select 
                          id="service_id"
                          name="service_id"
                          value={serviceForm.service_id}
                          onChange={handleServiceFormChange}
                          className="w-full rounded-md border border-input px-3 py-2"
                          disabled={!!selectedService}
                        >
                          <option value="">-- Select Service Type --</option>
                          <option value="1">House Cleaning</option>
                          <option value="2">Plumbing</option>
                          <option value="3">Electrical</option>
                          <option value="4">Gardening</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="price">Price (KSh)</Label>
                        <Input 
                          id="price" 
                          name="price" 
                          type="number"
                          value={serviceForm.price} 
                          onChange={handleServiceFormChange} 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Service Description</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          rows={3} 
                          value={serviceForm.description} 
                          onChange={handleServiceFormChange} 
                          placeholder="Describe what's included in this service..."
                        />
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Service Availability</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={serviceForm.availability.weekdays} 
                              onCheckedChange={() => handleServiceAvailabilityToggle('weekdays')} 
                            />
                            <span>Available on weekdays</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={serviceForm.availability.weekends} 
                              onCheckedChange={() => handleServiceAvailabilityToggle('weekends')} 
                            />
                            <span>Available on weekends</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={closeServiceModal}>Cancel</Button>
                        <Button onClick={handleServiceFormSubmit}>Save Service</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Availability Settings</h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Working Hours</h3>
                <p className="text-sm text-homehelp-600">Set your regular working hours for client bookings</p>
                
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(availabilityHours).map(([day, schedule]) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3">
                      <p className="font-medium text-homehelp-900 capitalize mb-2 sm:mb-0">{day}</p>
                      <div className="flex items-center gap-2">
                        <select 
                          className="border rounded-md px-2 py-1 text-sm"
                          value={schedule.start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                          disabled={!schedule.active}
                        >
                          {Array.from({ length: 13 }, (_, i) => i + 7).map((hour) => (
                            <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>
                          ))}
                        </select>
                        <span>to</span>
                        <select 
                          className="border rounded-md px-2 py-1 text-sm"
                          value={schedule.end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                          disabled={!schedule.active}
                        >
                          {Array.from({ length: 13 }, (_, i) => i + 9).map((hour) => (
                            <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>
                          ))}
                        </select>
                        <Switch 
                          checked={schedule.active}
                          onCheckedChange={(checked) => handleAvailabilityChange(day, 'active', checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Special Availability</h3>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4" />
                    Set Time Off
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Add Special Hours
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => handleSaveSettings('availability')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Availability
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-homehelp-900 mb-6">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Communication Channels</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-homehelp-700" />
                    <div>
                      <p className="font-medium text-homehelp-900">Email Notifications</p>
                      <p className="text-sm text-homehelp-600">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.email_notifications} 
                    onCheckedChange={() => handleNotificationToggle('email_notifications')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-homehelp-700" />
                    <div>
                      <p className="font-medium text-homehelp-900">SMS Notifications</p>
                      <p className="text-sm text-homehelp-600">Receive updates via text message</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms_notifications} 
                    onCheckedChange={() => handleNotificationToggle('sms_notifications')} 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-homehelp-800">Notification Types</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Booking Updates</p>
                    <p className="text-sm text-homehelp-600">New bookings, changes, cancellations</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.booking_updates} 
                    onCheckedChange={() => handleNotificationToggle('booking_updates')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-homehelp-900">Payment Alerts</p>
                    <p className="text-sm text-homehelp-600">Payment receipts and confirmations</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.payment_alerts} 
                    onCheckedChange={() => handleNotificationToggle('payment_alerts')} 
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => handleSaveSettings('notification')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderSettings;