
import { useState } from "react";
import ProviderDashboardLayout from "@/components/layout/ProviderDashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/provider/settings/ProfileSettings";
import NotificationSettings from "@/components/provider/settings/NotificationSettings";
import SecuritySettings from "@/components/provider/settings/SecuritySettings";

const ProviderSettings = () => {
  return (
    <ProviderDashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </ProviderDashboardLayout>
  );
};

export default ProviderSettings;
