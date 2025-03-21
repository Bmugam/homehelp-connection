
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface HistoryItemType {
  id: number;
  service: string;
  provider: string;
  date: string;
  status: string;
  rating: number;
}

interface ServiceHistoryProps {
  serviceHistory: HistoryItemType[];
}

const ServiceHistory = ({ serviceHistory }: ServiceHistoryProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-homehelp-900">Service History</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Completed Services</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceHistory.length > 0 ? (
            <div className="space-y-4">
              {serviceHistory.map(item => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-lg">{item.service}</h3>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i}
                          className={`w-4 h-4 ${i < item.rating ? 'text-amber-400' : 'text-gray-300'}`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">Provider: {item.provider}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span>Completed on {new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Book Again</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">You haven't used any services yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceHistory;
