import React, { useState } from 'react';
import { CheckCircle, Star, Calendar, ChevronLeft, ChevronRight, Clock, ArrowRight, FileText, RefreshCcw } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/card';
import { HistoryItemType } from '../types';
import { Badge } from '../../ui/badge';
import { Skeleton } from '../../ui/skeleton';

interface ServiceHistoryProps {
  serviceHistory: HistoryItemType[];
  onViewDetails: (id: number) => void;
  onBookAgain: (serviceId: number) => void;
  loading?: boolean;
}

const ServiceHistory = ({ 
  serviceHistory, 
  onViewDetails, 
  onBookAgain, 
  loading = false 
}: ServiceHistoryProps) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = serviceHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(serviceHistory.length / itemsPerPage);

  // Navigation functions
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Time since completion
  const getTimeSince = (dateString: string) => {
    const completedDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - completedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Render stars
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{rating}/5</span>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-homehelp-900">Service History</h2>
        <Card>
          <CardHeader>
            <CardTitle>Completed Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-4 w-32 mr-3" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-homehelp-900">Service History</h2>
        <Badge variant="outline" className="bg-gray-50 text-gray-700 font-normal">
          {serviceHistory.length} services
        </Badge>
      </div>
      
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Completed Services
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {currentItems.length > 0 ? (
            <div className="divide-y">
              {currentItems.map(item => (
                <div 
                  key={item.id} 
                  className="p-4 md:p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h3 className="font-medium text-lg text-gray-800">{item.service}</h3>
                        <div className="flex items-center">
                          {renderRating(item.rating)}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-2 font-medium">
                        Provider: <span className="text-gray-600 font-normal">{item.provider}</span>
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5 text-green-500" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-green-500" />
                          <span>{getTimeSince(item.date)}</span>
                        </div>
                      </div>
                      
                      {item.notes && (
                        <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                          <p className="font-medium mb-1">Notes:</p>
                          <p>{item.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row sm:flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewDetails(item.id)}
                        className="flex items-center gap-1 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      >
                        <FileText className="h-3 w-3" />
                        <span>View Details</span>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => onBookAgain(item.id)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <RefreshCcw className="h-3 w-3" />
                        <span>Book Again</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Service History</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't used any services yet. Book your first service to get started.</p>
              <Button 
                onClick={() => window.location.href = '/services'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>Browse Services</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
        
        {serviceHistory.length > itemsPerPage && (
          <CardFooter className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, serviceHistory.length)} of {serviceHistory.length} services
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ServiceHistory;