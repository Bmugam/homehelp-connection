
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const NotificationSettings = () => {
  const { toast } = useToast();
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [reviewNotifications, setReviewNotifications] = useState(true);
  
  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-homehelp-700" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleNotificationUpdate}>
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Communication Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via text message
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4">Notification Types</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking-notifications">Booking Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Notifications for new, updated, or cancelled bookings
                    </p>
                  </div>
                  <Switch
                    id="booking-notifications"
                    checked={bookingNotifications}
                    onCheckedChange={setBookingNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="review-notifications">Review Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Notifications when a client leaves a review
                    </p>
                  </div>
                  <Switch
                    id="review-notifications"
                    checked={reviewNotifications}
                    onCheckedChange={setReviewNotifications}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">Save Preferences</Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
