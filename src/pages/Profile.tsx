import React from 'react';
import { Button } from "@/components/ui/button";

const Profile = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      {/* Profile content would go here */}
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Profile page under construction</p>
        <Button variant="outline">Edit Profile</Button>
      </div>
    </div>
  );
};

export default Profile;
