
import React, { useState } from 'react';
import { 
  Settings, 
  Save,
  Lock,
  Globe,
  Bell,
  Mail,
  CreditCard,
  FileText,
  Server,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'HomeHelp',
    siteDescription: 'Your trusted platform for home services',
    contactEmail: 'admin@homehelp.com',
    supportPhone: '+254712345678',
    currency: 'KSH',
    language: 'en',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@homehelp.com',
    smtpPassword: '••••••••••••',
    senderName: 'HomeHelp Team',
    senderEmail: 'no-reply@homehelp.com',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enablePushNotifications: true,
    bookingNotifications: true,
    marketingEmails: false,
    systemAlerts: true,
  });

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = (settingType: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${settingType} settings have been updated successfully.`,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Settings</h1>
        <p className="text-gray-500">Manage system settings and configurations</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic information about your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Platform Name</Label>
                  <Input 
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input 
                    id="supportPhone"
                    name="supportPhone"
                    value={generalSettings.supportPhone}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select 
                    id="currency"
                    name="currency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    <option value="KSH">Kenyan Shilling (KSH)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Platform Description</Label>
                <Textarea 
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralSettingsChange}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('general')}>
                <Save className="h-4 w-4 mr-2" />
                Save General Settings
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure the email service for notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input 
                    id="smtpServer"
                    name="smtpServer"
                    value={emailSettings.smtpServer}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input 
                    id="smtpPort"
                    name="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input 
                    id="smtpUsername"
                    name="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input 
                    id="smtpPassword"
                    name="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input 
                    id="senderName"
                    name="senderName"
                    value={emailSettings.senderName}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input 
                    id="senderEmail"
                    name="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={handleEmailSettingsChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('email')}>
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how users receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Enable or disable email notifications</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => handleToggleChange('enableEmailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Enable or disable SMS notifications</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.enableSmsNotifications}
                    onCheckedChange={(checked) => handleToggleChange('enableSmsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Enable or disable push notifications</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.enablePushNotifications}
                    onCheckedChange={(checked) => handleToggleChange('enablePushNotifications', checked)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Booking Notifications</h4>
                      <p className="text-sm text-gray-500">Notify users about booking updates</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.bookingNotifications}
                      onCheckedChange={(checked) => handleToggleChange('bookingNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-gray-500">Send promotional content to users</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => handleToggleChange('marketingEmails', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Alerts</h4>
                      <p className="text-sm text-gray-500">Important system notifications</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => handleToggleChange('systemAlerts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('notification')}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Settings
                </CardTitle>
                <CardDescription>
                  Manage database configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Database Connection Status</p>
                    <div className="flex items-center text-green-600 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Connected</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-md border">
                    <p className="text-sm font-medium">Database Size</p>
                    <p className="text-sm mt-1">245 MB</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button variant="outline">Check Connection</Button>
                  <Button variant="outline">Backup Database</Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password Expiry</h4>
                    <p className="text-sm text-gray-500">Force password reset every 90 days</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="pt-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <div className="flex items-center mt-2">
                    <Input 
                      id="sessionTimeout"
                      type="number"
                      defaultValue="60"
                      className="w-32"
                    />
                    <Button variant="outline" className="ml-2">Apply</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Security Settings</Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  System Maintenance
                </CardTitle>
                <CardDescription>
                  Perform system maintenance tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md text-center hover:bg-gray-50 cursor-pointer">
                    <FileText className="h-10 w-10 mx-auto text-homehelp-600 mb-2" />
                    <h3 className="font-medium">Clear Cache</h3>
                    <p className="text-sm text-gray-500 mt-1">Clear system cache files</p>
                  </div>
                  <div className="p-4 border rounded-md text-center hover:bg-gray-50 cursor-pointer">
                    <Database className="h-10 w-10 mx-auto text-homehelp-600 mb-2" />
                    <h3 className="font-medium">Optimize Database</h3>
                    <p className="text-sm text-gray-500 mt-1">Run database optimization</p>
                  </div>
                  <div className="p-4 border rounded-md text-center hover:bg-gray-50 cursor-pointer">
                    <Server className="h-10 w-10 mx-auto text-homehelp-600 mb-2" />
                    <h3 className="font-medium">Test Services</h3>
                    <p className="text-sm text-gray-500 mt-1">Verify all services status</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">Last maintenance: 3 days ago</p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
