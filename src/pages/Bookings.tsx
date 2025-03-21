
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

const Bookings = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      {/* Example bookings would go here */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>No Active Bookings</CardTitle>
            <CardDescription>You don't have any active bookings at the moment</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Browse our services to find the help you need for your home.</p>
          </CardContent>
          <CardFooter>
            <Button>Browse Services</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Bookings;
