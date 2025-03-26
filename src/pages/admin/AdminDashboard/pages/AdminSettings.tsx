
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-gray-500">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure general platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site-name">Platform Name</Label>
              <Input id="site-name" defaultValue="HomeHelp" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact-email">Support Email</Label>
              <Input id="contact-email" type="email" defaultValue="support@homehelp.com" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Take the site offline for maintenance</p>
              </div>
              <Switch id="maintenance-mode" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>Configure email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-user">New User Registration</Label>
                <p className="text-sm text-gray-500">Send welcome email to new users</p>
              </div>
              <Switch id="new-user" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-booking">New Booking Notification</Label>
                <p className="text-sm text-gray-500">Send notification when new booking is created</p>
              </div>
              <Switch id="new-booking" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="admin-notifications">Admin Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications about important events</p>
              </div>
              <Switch id="admin-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security-related settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Require 2FA for admin users</p>
              </div>
              <Switch id="two-factor" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>
          </CardContent>
        </Card>
        
        <Button className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
