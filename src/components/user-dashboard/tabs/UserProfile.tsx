import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Check, AlertCircle, Home, Settings, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userService, { UserData, ClientData } from '../../../services/userService';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Alert, AlertDescription } from '../../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import  {useAuth}  from '@/contexts/Authcontext';

interface ClientProfileProps {
  onDelete?: () => Promise<void>;
}

const ClientProfile = ({ onDelete }: ClientProfileProps) => {
  const { user, token } = useAuth();

  // Initialize with default values
  const defaultUserData: UserData = {
    id: 0,
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    profile_image: '',
    user_type: 'client',
    created_at: '',
    updated_at: '',
  };

  const defaultClientData: ClientData = {
    id: 0,
    user_id: 0,
    address: '',
    location_coordinates: '',
    created_at: '',
    updated_at: '',
  };

  const [userForm, setUserForm] = useState<UserData>({...defaultUserData});
  const [clientForm, setClientForm] = useState<ClientData>({...defaultClientData});
  const [locationLat, setLocationLat] = useState<string>('');
  const [locationLong, setLocationLong] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('personal');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user and client data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const authToken = token || '';
        console.log('Fetching combined client and user data with token:', authToken);
        const combinedData = await userService.getClient(user.id, authToken);
        console.log('Combined data fetched:', combinedData);

        // Cast combinedData to expected type to avoid TS errors
        const data = combinedData as {
          user_id: number;
          email: string;
          phone_number: string;
          first_name: string;
          last_name: string;
          profile_image: string;
          created_at: string;
          updated_at: string;
          id: number;
          address: string;
          location_coordinates: string | { coordinates: [number, number] };
        };

        // Split combined data into userForm and clientForm
        setUserForm({
          id: data.user_id || 0,
          email: data.email || '',
          phone_number: data.phone_number || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          profile_image: data.profile_image || '',
          user_type: 'client',
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
        });

        setImagePreview(data.profile_image || null);

        setClientForm({
          id: data.id || 0,
          user_id: data.user_id || 0,
          address: data.address || '',
          location_coordinates: typeof data.location_coordinates === 'string'
            ? data.location_coordinates
            : data.location_coordinates && data.location_coordinates.coordinates
              ? `${data.location_coordinates.coordinates[1]},${data.location_coordinates.coordinates[0]}`
              : '',
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
        });

        // Set separate lat and long state from location_coordinates string
        if (typeof data.location_coordinates === 'string' && data.location_coordinates.includes(',')) {
          const [lat, long] = data.location_coordinates.split(',');
          setLocationLat(lat);
          setLocationLong(long);
        } else if (data.location_coordinates && typeof data.location_coordinates === 'object' && 'coordinates' in data.location_coordinates) {
          // If coordinates object, set lat and long accordingly
          setLocationLat(String(data.location_coordinates.coordinates[1]));
          setLocationLong(String(data.location_coordinates.coordinates[0]));
        } else {
          setLocationLat('');
          setLocationLong('');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUserFormChange = (field: keyof UserData, value: string) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated[field];
        return updated;
      });
    }
  };

  const handleClientFormChange = (field: keyof ClientData, value: string) => {
    setClientForm(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[`client_${field}`]) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated[`client_${field}`];
        return updated;
      });
    }
  };

  // New handlers for latitude and longitude input changes
  const handleLocationLatChange = (value: string) => {
    setLocationLat(value);
    if (validationErrors['location_lat']) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated['location_lat'];
        return updated;
      });
    }
  };

  const handleLocationLongChange = (value: string) => {
    setLocationLong(value);
    if (validationErrors['location_long']) {
      setValidationErrors(prev => {
        const updated = {...prev};
        delete updated['location_long'];
        return updated;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setUserForm(prev => ({ ...prev, profile_image: '' }));
    }
  };

  const removeProfileImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setUserForm(prev => ({ ...prev, profile_image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!userForm.first_name?.trim()) {
      errors.first_name = "First name is required";
    }
    
    if (!userForm.last_name?.trim()) {
      errors.last_name = "Last name is required";
    }
    
    if (!userForm.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(userForm.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (userForm.phone_number && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(userForm.phone_number)) {
      errors.phone_number = "Please enter a valid phone number";
    }
    
    if (!clientForm.address?.trim()) {
      errors.client_address = "Address is required";
    }

    // Validate latitude and longitude separately
    if (locationLat && !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/.test(locationLat)) {
      errors.location_lat = "Please enter a valid latitude between -90 and 90.";
    }
    if (locationLong && !/^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$|^[-+]?180(\.0+)?$/.test(locationLong)) {
      errors.location_long = "Please enter a valid longitude between -180 and 180.";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Implement onUpdate handler to perform API calls for update
  const handleUpdate = async (userData: UserData, clientData: ClientData, imageFile?: File) => {
    setLoading(true);
    setError(null);
    try {
      const authToken = token || '';
      console.log('Updating user data with token:', authToken);
      await userService.updateUser(userData.id, userData, authToken);
      console.log('Updating client data with token:', authToken);
      await userService.updateClient(clientData.id, clientData, authToken);
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error TS expects error response shape
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Implement onDelete handler to perform API call for delete
  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = token || '';
      if (user) {
        await userService.deleteUser(user.id, authToken);
      }
      if (onDelete) await onDelete();
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error TS expects error response shape
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUserForm = { ...userForm };
      const updatedClientForm = { ...clientForm };

      // Combine separate lat and long into location_coordinates string
      if (locationLat && locationLong) {
        updatedClientForm.location_coordinates = `${locationLat},${locationLong}`;
      } else {
        updatedClientForm.location_coordinates = '';
      }

      // If there is an image file selected, upload it first
      if (imageFile) {
        const authToken = token || '';
        const uploadResult = await userService.uploadProfileImage(clientForm.id, imageFile, authToken);
        if (uploadResult && uploadResult.profile_image) {
          updatedUserForm.profile_image = uploadResult.profile_image;
          setImagePreview(uploadResult.profile_image);
        }
      }

      await handleUpdate(updatedUserForm, updatedClientForm);
      setUserForm(updatedUserForm);
      setClientForm(updatedClientForm);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await handleDeleteAccount();
    } catch (err: unknown) {
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const getInitials = () => {
    return `${userForm.first_name?.[0] || ''}${userForm.last_name?.[0] || ''}`;
  };

  const handleCancel = () => {
    setUserForm({...defaultUserData, ...userForm});
    setClientForm({...defaultClientData, ...clientForm});

    // Reset lat and long states from clientForm.location_coordinates
    if (clientForm.location_coordinates && clientForm.location_coordinates.includes(',')) {
      const [lat, long] = clientForm.location_coordinates.split(',');
      setLocationLat(lat);
      setLocationLong(long);
    } else {
      setLocationLat('');
      setLocationLong('');
    }

    setValidationErrors({});
    setImagePreview(userForm?.profile_image || null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h2>
        {onDelete && (
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Account
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b mb-6">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Personal Information</span>
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Address & Location</span>
          </TabsTrigger>
        </TabsList>
        
        <Card className="shadow-md border-gray-200 dark:border-gray-700">
          <TabsContent value="personal" className="m-0">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>Your basic contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Image Upload */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Image
                  </Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={imagePreview || undefined} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {imagePreview ? 'Change' : 'Upload'}
                      </Button>
                      {imagePreview && (
                        <Button
                          variant="outline"
                          onClick={removeProfileImage}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Recommended size: 500x500px. Max 5MB.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="first_name"
                      type="text"
                      value={userForm.first_name || ''}
                      onChange={e => handleUserFormChange('first_name', e.target.value)}
                      className={`pl-10 ${validationErrors.first_name ? 'border-red-500' : ''}`}
                      placeholder="John"
                    />
                  </div>
                  {validationErrors.first_name && (
                    <p className="text-sm text-red-500">{validationErrors.first_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="last_name"
                      type="text"
                      value={userForm.last_name || ''}
                      onChange={e => handleUserFormChange('last_name', e.target.value)}
                      className={`pl-10 ${validationErrors.last_name ? 'border-red-500' : ''}`}
                      placeholder="Doe"
                    />
                  </div>
                  {validationErrors.last_name && (
                    <p className="text-sm text-red-500">{validationErrors.last_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email || ''}
                      onChange={e => handleUserFormChange('email', e.target.value)}
                      className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={userForm.phone_number || ''}
                      onChange={e => handleUserFormChange('phone_number', e.target.value)}
                      className={`pl-10 ${validationErrors.phone_number ? 'border-red-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {validationErrors.phone_number && (
                    <p className="text-sm text-red-500">{validationErrors.phone_number}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="address" className="m-0">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-xl">Address & Location</CardTitle>
              <CardDescription>Your address and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <Textarea
                      id="address"
                      value={clientForm.address || ''}
                      onChange={e => handleClientFormChange('address', e.target.value)}
                      className={`pl-10 min-h-24 ${validationErrors.client_address ? 'border-red-500' : ''}`}
                      placeholder="123 Main Street, Apt 4B, City, State, ZIP"
                    />
                  </div>
                  {validationErrors.client_address && (
                    <p className="text-sm text-red-500">{validationErrors.client_address}</p>
                  )}
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location_lat" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Latitude
                    </Label>
                    <Input
                      id="location_lat"
                      type="text"
                      value={locationLat}
                      onChange={e => {
                        const lat = e.target.value.trim();
                        // Validate latitude input
                        if (lat && !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/.test(lat)) {
                          setError('Please enter a valid latitude between -90 and 90.');
                          return;
                        } else {
                          setError(null);
                        }
                        handleLocationLatChange(lat);
                      }}
                      placeholder="40.7128"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location_long" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Longitude
                    </Label>
                    <Input
                      id="location_long"
                      type="text"
                      value={locationLong}
                      onChange={e => {
                        const long = e.target.value.trim();
                        // Validate longitude input
                        if (long && !/^[-+]?((1[0-7]\d)|([1-9]?\d))(\.\d+)?$|^[-+]?180(\.0+)?$/.test(long)) {
                          setError('Please enter a valid longitude between -180 and 180.');
                          return;
                        } else {
                          setError(null);
                        }
                        handleLocationLongChange(long);
                      }}
                      placeholder="-74.0060"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                      if (navigator.geolocation) {
                        setIsLocating(true);
                        setError(null);
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const lat = position.coords.latitude.toFixed(6);
                            const long = position.coords.longitude.toFixed(6);
                            // Validate coordinates before setting
                            const latNum = Number(lat);
                            const longNum = Number(long);
                            if (
                              isNaN(latNum) || isNaN(longNum) ||
                              latNum < -90 || latNum > 90 ||
                              longNum < -180 || longNum > 180
                            ) {
                              setError('Received invalid location coordinates.');
                              setIsLocating(false);
                              return;
                            }
                            setLocationLat(lat);
                            setLocationLong(long);
                            setIsLocating(false);
                          },
                          (error) => {
                            setIsLocating(false);
                            switch(error.code) {
                              case error.PERMISSION_DENIED:
                                setError("Please allow location access to use this feature.");
                                break;
                              case error.POSITION_UNAVAILABLE:
                                setError("Location information is unavailable.");
                                break;
                              case error.TIMEOUT:
                                setError("Location request timed out.");
                                break;
                              default:
                                setError("An unknown error occurred.");
                            }
                          },
                          {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                          }
                        );
                      } else {
                        setError('Geolocation is not supported by this browser.');
                      }
                    }}
                    disabled={isLocating}
                    className="text-sm"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isLocating ? 'Getting Location...' : 'Use My Current Location'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          {error && (
            <Alert variant="destructive" className="mx-6 my-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 mx-6 my-3">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}
          
          <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardFooter>
        </Card>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Account</CardTitle>
              <CardDescription>
                Are you sure you want to delete your account? This action cannot be undone and will remove all your data.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;
