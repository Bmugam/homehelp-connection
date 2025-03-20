
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  ThumbsUp,
  Clock,
  Award,
  CheckCircle,
  User,
  Briefcase
} from "lucide-react";

// Import sample provider data
import { providersData } from "@/data/providers";

const ProviderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll use our sample data
    const foundProvider = providersData.find(p => p.id === Number(id));
    
    // Simulate API loading
    const timer = setTimeout(() => {
      setProvider(foundProvider);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 border-4 border-homehelp-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-homehelp-600">Loading provider information...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-semibold text-homehelp-900 mb-4">Provider Not Found</h2>
          <p className="text-homehelp-600 mb-6">The service provider you're looking for doesn't exist or has been removed.</p>
          <Link to="/providers">
            <Button className="bg-homehelp-900 hover:bg-homehelp-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Providers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/providers" className="inline-flex items-center text-homehelp-600 hover:text-homehelp-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all providers
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Provider Profile Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <img 
                  src={provider.image} 
                  alt={provider.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-homehelp-100"
                />
                <h1 className="text-2xl font-bold text-homehelp-900 mt-4">{provider.name}</h1>
                
                <div className="flex items-center gap-1 text-amber-500 mt-2">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-medium">{provider.rating}</span>
                  <span className="text-homehelp-500 text-sm">({provider.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center gap-1 text-homehelp-600 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.location}</span>
                </div>
                
                <div className="w-full border-t border-homehelp-100 my-4"></div>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-homehelp-700">
                    <Phone className="w-5 h-5 text-homehelp-500" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-homehelp-700">
                    <Mail className="w-5 h-5 text-homehelp-500" />
                    <span>{provider.email}</span>
                  </div>
                </div>
                
                <Button className="w-full mt-6 bg-homehelp-900 hover:bg-homehelp-800">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Provider Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-homehelp-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-homehelp-500" />
                About {provider.name}
              </h2>
              <p className="text-homehelp-700 leading-relaxed">{provider.bio}</p>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-homehelp-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-homehelp-500" />
                  Services Offered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {provider.services.map((service: string) => (
                    <Badge 
                      key={service} 
                      className="bg-homehelp-100 text-homehelp-800 hover:bg-homehelp-200 px-3 py-1"
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-homehelp-900 mb-4 flex items-center">
                <ThumbsUp className="w-5 h-5 mr-2 text-homehelp-500" />
                Why Choose {provider.name.split(' ')[0]}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-homehelp-900">Professional Services</h4>
                    <p className="text-sm text-homehelp-600">Highly trained and certified in their field</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-homehelp-900">Quality Guaranteed</h4>
                    <p className="text-sm text-homehelp-600">Satisfaction guaranteed on all services</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-homehelp-900">Reliable & Punctual</h4>
                    <p className="text-sm text-homehelp-600">Shows up on time, every time</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-homehelp-900">Transparent Pricing</h4>
                    <p className="text-sm text-homehelp-600">No hidden fees or surprises</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-homehelp-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-homehelp-500" />
                Customer Reviews
              </h2>
              
              <div className="space-y-6">
                {/* Sample reviews - in a real app, these would come from an API */}
                <div className="border-b border-homehelp-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-homehelp-200 flex items-center justify-center text-homehelp-700 font-medium">
                        JD
                      </div>
                      <span className="font-medium text-homehelp-900">John Doe</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-homehelp-700">Excellent service! Very professional and thorough with their work. Would definitely recommend.</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-homehelp-500">
                    <Clock className="w-3 h-3" />
                    <span>1 month ago</span>
                  </div>
                </div>
                
                <div className="border-b border-homehelp-100 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-homehelp-200 flex items-center justify-center text-homehelp-700 font-medium">
                        MS
                      </div>
                      <span className="font-medium text-homehelp-900">Mary Smith</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-current" />
                      ))}
                      <Star className="w-4 h-4 text-homehelp-300" />
                    </div>
                  </div>
                  <p className="text-homehelp-700">Great service overall. Arrived on time and finished the job quickly. Only minor issue was some tools left behind.</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-homehelp-500">
                    <Clock className="w-3 h-3" />
                    <span>2 months ago</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-homehelp-200 flex items-center justify-center text-homehelp-700 font-medium">
                        RJ
                      </div>
                      <span className="font-medium text-homehelp-900">Robert Johnson</span>
                    </div>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-homehelp-700">Absolutely fantastic! The work was done perfectly and they were very respectful of my home. Will definitely use again.</p>
                  <div className="flex items-center gap-1 mt-2 text-sm text-homehelp-500">
                    <Clock className="w-3 h-3" />
                    <span>3 months ago</span>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-6">
                Show More Reviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetail;
