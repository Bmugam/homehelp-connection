
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

// Sample service data
const servicesData = [
  {
    id: 1,
    title: "House Cleaning",
    description: "Professional home cleaning services including deep cleaning, regular maintenance, and specialized cleaning for different areas of your home.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80",
    price: "From Ksh 1,500",
    categories: ["Cleaning", "Home Maintenance"]
  },
  {
    id: 2,
    title: "Plumbing Services",
    description: "Expert plumbing repair and installation services for kitchens, bathrooms, and water systems throughout your home.",
    image: "https://images.unsplash.com/photo-1609234656432-603fd648c5b9?auto=format&fit=crop&q=80",
    price: "From Ksh 2,000",
    categories: ["Plumbing", "Repairs"]
  },
  {
    id: 3,
    title: "Electrical Installation",
    description: "Certified electrical services for new installations, repairs, and maintenance of all electrical systems in your home.",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80",
    price: "From Ksh 2,500",
    categories: ["Electrical", "Installation"]
  },
  {
    id: 4,
    title: "Gardening & Landscaping",
    description: "Professional landscaping and garden maintenance services to keep your outdoor spaces beautiful and well-maintained.",
    image: "https://images.unsplash.com/photo-1599685438082-ca6d8074da65?auto=format&fit=crop&q=80",
    price: "From Ksh 1,800",
    categories: ["Gardening", "Outdoor"]
  },
  {
    id: 5,
    title: "Painting Services",
    description: "Interior and exterior painting services with premium quality paints and professional techniques.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80",
    price: "From Ksh 3,000",
    categories: ["Painting", "Home Improvement"]
  },
  {
    id: 6,
    title: "Furniture Assembly",
    description: "Professional assembly of all types of furniture including beds, wardrobes, tables, and office furniture.",
    image: "https://images.unsplash.com/photo-1558051815-0f18e64e6280?auto=format&fit=crop&q=80",
    price: "From Ksh 1,200",
    categories: ["Assembly", "Furniture"]
  }
];

// All unique categories
const allCategories = Array.from(new Set(servicesData.flatMap(service => service.categories)));

const Services = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredServices, setFilteredServices] = useState(servicesData);

  // Filter services based on search query and selected categories
  useEffect(() => {
    let filtered = servicesData;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(query) || 
        service.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(service => 
        selectedCategories.some(category => service.categories.includes(category))
      );
    }
    
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategories]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-homehelp-900 text-center mb-8">
        Our Services
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium text-lg mb-4">Filter By Category</h3>
              <div className="space-y-3">
                {allCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <label 
                      htmlFor={`category-${category}`}
                      className="text-sm cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Services list */}
        <div className="lg:col-span-3">
          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-homehelp-200 focus:outline-none focus:ring-2 focus:ring-homehelp-500 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-homehelp-400 w-5 h-5" />
          </div>
          
          {/* Services grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-homehelp-900">{service.title}</h3>
                      <span className="text-sm font-medium text-homehelp-700">{service.price}</span>
                    </div>
                    <p className="text-homehelp-600 text-sm mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.categories.map(category => (
                        <span 
                          key={`${service.id}-${category}`}
                          className="text-xs bg-homehelp-100 text-homehelp-700 px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-homehelp-500">No services found matching your criteria. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
