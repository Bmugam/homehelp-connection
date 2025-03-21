
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";
import { User, MapPin, Phone, Mail, Shield, CreditCard, Bell, Lock, Home } from "lucide-react";

// Sample user data
const userData = {
  name: "James Omondi",
  email: "james.omondi@example.com",
  phone: "+254 712 345 678",
  location: "Nairobi, Kenya",
  address: "123 Moi Avenue, Nairobi",
  joinDate: "November 2022",
  profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state (would normally use React Hook Form in a real app)
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    address: userData.address
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would handle API call to update user data here
    setIsEditing(false);
    // Show success message
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-homehelp-900 text-center mb-8">
        My Profile
      </h1>
      
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Summary Card */}
              <Card className="md:col-span-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <img 
                        src={userData.profileImage} 
                        alt={userData.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-homehelp-100"
                      />
                      <button className="absolute bottom-0 right-0 bg-homehelp-900 text-white p-1 rounded-full hover:bg-homehelp-800 transition-colors">
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                    <h2 className="text-xl font-bold text-homehelp-900 mb-1">{userData.name}</h2>
                    <p className="text-homehelp-600 text-sm mb-4">Member since {userData.joinDate}</p>
                    
                    <div className="w-full space-y-3 text-left">
                      <div className="flex items-center text-homehelp-600">
                        <MapPin className="w-5 h-5 mr-2 text-homehelp-500" />
                        <span>{userData.location}</span>
                      </div>
                      <div className="flex items-center text-homehelp-600">
                        <Phone className="w-5 h-5 mr-2 text-homehelp-500" />
                        <span>{userData.phone}</span>
                      </div>
                      <div className="flex items-center text-homehelp-600">
                        <Mail className="w-5 h-5 mr-2 text-homehelp-500" />
                        <span>{userData.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Profile Details Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Personal Information</CardTitle>
                    {!isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-homehelp-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-homehelp-200 rounded-md focus:outline-none focus:ring-2 focus:ring-homehelp-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-homehelp-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-homehelp-200 rounded-md focus:outline-none focus:ring-2 focus:ring-homehelp-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-homehelp-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-homehelp-200 rounded-md focus:outline-none focus:ring-2 focus:ring-homehelp-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-homehelp-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-homehelp-200 rounded-md focus:outline-none focus:ring-2 focus:ring-homehelp-500"
                            required
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-homehelp-500 mb-1">Full Name</h3>
                          <p className="text-homehelp-900">{userData.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-homehelp-500 mb-1">Email Address</h3>
                          <p className="text-homehelp-900">{userData.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-homehelp-500 mb-1">Phone Number</h3>
                          <p className="text-homehelp-900">{userData.phone}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-homehelp-500 mb-1">Location</h3>
                          <p className="text-homehelp-900">{userData.location}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h3 className="text-sm font-medium text-homehelp-500 mb-1">Address</h3>
                          <p className="text-homehelp-900">{userData.address}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-homehelp-100 pt-4 mt-6">
                        <h3 className="text-sm font-medium text-homehelp-900 mb-3">Account Verification</h3>
                        <div className="flex items-center text-homehelp-600">
                          <Shield className="w-5 h-5 mr-2 text-green-500" />
                          <span>Your account is verified</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Addresses</CardTitle>
                  <Button size="sm">Add New Address</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-homehelp-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-homehelp-900">Home</h3>
                        <p className="text-homehelp-600">123 Moi Avenue, Nairobi</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-homehelp-500">
                      <Home className="w-4 h-4 mr-1" />
                      <span>Default Address</span>
                    </div>
                  </div>
                  
                  <div className="border border-homehelp-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-homehelp-900">Office</h3>
                        <p className="text-homehelp-600">456 Kenyatta Road, Nairobi</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Payment Methods</CardTitle>
                  <Button size="sm">Add Payment Method</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-homehelp-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-blue-500 text-white p-2 rounded-md mr-3">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-homehelp-900">M-Pesa</h3>
                          <p className="text-homehelp-600">+254 712 345 678</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-homehelp-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="bg-green-500 text-white p-2 rounded-md mr-3">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-homehelp-900">Credit Card</h3>
                          <p className="text-homehelp-600">**** **** **** 5678</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-homehelp-100">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 mr-3 text-homehelp-600" />
                        <div>
                          <h3 className="font-medium text-homehelp-900">Notifications</h3>
                          <p className="text-sm text-homehelp-600">Manage your notification preferences</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-homehelp-100">
                      <div className="flex items-center">
                        <Lock className="w-5 h-5 mr-3 text-homehelp-600" />
                        <div>
                          <h3 className="font-medium text-homehelp-900">Password & Security</h3>
                          <p className="text-sm text-homehelp-600">Update your password and security settings</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Update</Button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-3 text-homehelp-600" />
                        <div>
                          <h3 className="font-medium text-homehelp-900">Privacy Settings</h3>
                          <p className="text-sm text-homehelp-600">Manage your data and privacy preferences</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-medium text-red-800 mb-1">Delete Account</h3>
                      <p className="text-sm text-red-600 mb-3">
                        Permanently delete your account and all of your data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm">Delete Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
