import React, { useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { UserDetailsType } from '../types';

interface UserProfileProps {
  userDetails: UserDetailsType;
  onUpdate: (updatedDetails: UserDetailsType) => Promise<void>;
}

const UserProfile = ({ userDetails, onUpdate }: UserProfileProps) => {
  const [formData, setFormData] = useState<UserDetailsType>({...userDetails});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof UserDetailsType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await onUpdate(formData);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <label className="text-sm font-medium text-gray-500" htmlFor="name">Full Name</label>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="flex-1 border rounded px-2 py-1"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-500" htmlFor="email">Email Address</label>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="flex-1 border rounded px-2 py-1"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-500" htmlFor="phone">Phone Number</label>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="flex-1 border rounded px-2 py-1"
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-500" htmlFor="address">Address</label>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                className="flex-1 border rounded px-2 py-1"
              />
            </div>
          </div>
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">Profile updated successfully!</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfile;
