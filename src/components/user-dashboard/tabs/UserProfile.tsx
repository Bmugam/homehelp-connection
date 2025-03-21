
import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface UserDetailsType {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface UserProfileProps {
  userDetails: UserDetailsType;
}

const UserProfile = ({ userDetails }: UserProfileProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-homehelp-900">My Profile</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-500">Full Name</p>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <p>{userDetails.name}</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-500">Email Address</p>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <p>{userDetails.email}</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-500">Phone Number</p>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <p>{userDetails.phone}</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-gray-500">Address</p>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <p>{userDetails.address}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Update Profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfile;
