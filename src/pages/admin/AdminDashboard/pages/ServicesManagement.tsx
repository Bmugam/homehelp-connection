
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServicesManagement = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Service
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Service list will be populated from backend */}
              <p className="text-gray-500">Loading services...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServicesManagement;
