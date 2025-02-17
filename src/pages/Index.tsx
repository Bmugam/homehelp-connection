
import { useState } from "react";
import { Search, Star, Clock, Shield } from "lucide-react";

const categories = [
  {
    title: "House Cleaning",
    description: "Professional home cleaning services",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80",
  },
  {
    title: "Plumbing",
    description: "Expert plumbing repair and installation",
    image: "https://images.unsplash.com/photo-1609234656432-603fd648c5b9?auto=format&fit=crop&q=80",
  },
  {
    title: "Electrical",
    description: "Certified electrical services",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80",
  },
  {
    title: "Gardening",
    description: "Professional landscaping and maintenance",
    image: "https://images.unsplash.com/photo-1599685438082-ca6d8074da65?auto=format&fit=crop&q=80",
  }
];

const features = [
  {
    icon: Search,
    title: "Easy Search",
    description: "Find trusted professionals in your area quickly"
  },
  {
    icon: Star,
    title: "Verified Providers",
    description: "All service providers are thoroughly vetted"
  },
  {
    icon: Clock,
    title: "Quick Booking",
    description: "Book services with just a few clicks"
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your data and transactions are always protected"
  }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-homehelp-50 to-homehelp-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 animate-fade-in">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-homehelp-900 mb-6">
            Find Trusted Home Service Professionals
          </h1>
          <p className="text-lg md:text-xl text-homehelp-600 mb-8">
            Connect with verified local service providers for all your home maintenance needs
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="What service do you need?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-homehelp-200 focus:outline-none focus:ring-2 focus:ring-homehelp-500 transition-all duration-300 text-homehelp-800 bg-white shadow-lg"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-homehelp-900 text-white px-6 py-2 rounded-full hover:bg-homehelp-800 transition-colors duration-300">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16 animate-slide-up">
        <h2 className="text-3xl font-display font-bold text-homehelp-900 text-center mb-12">
          Popular Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 z-10" />
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 animate-slide-up">
        <h2 className="text-3xl font-display font-bold text-homehelp-900 text-center mb-12">
          Why Choose HomeHelp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <feature.icon className="w-12 h-12 text-homehelp-600 mb-4" />
              <h3 className="text-xl font-bold text-homehelp-900 mb-2">{feature.title}</h3>
              <p className="text-homehelp-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-homehelp-900 text-white py-20 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-homehelp-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied homeowners who trust HomeHelp for their home service needs
          </p>
          <button className="bg-white text-homehelp-900 px-8 py-3 rounded-full font-bold hover:bg-homehelp-100 transition-colors duration-300">
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;
