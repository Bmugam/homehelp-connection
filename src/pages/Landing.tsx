import { Link } from "react-router-dom";
import { Search, Star, Clock, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    title: "House Cleaning",
    description: "Professional home cleaning services",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80",
    path: "/services"
  },
  {
    title: "Plumbing",
    description: "Expert plumbing repair and installation",
    image: "https://plus.unsplash.com/premium_photo-1661884973994-d7625e52631a?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    path: "/services"
  },
  {
    title: "Electrical",
    description: "Certified electrical services",
    image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80",
    path: "/services"
  },
  {
    title: "Gardening",
    description: "Professional landscaping and maintenance",
    image: "https://plus.unsplash.com/premium_photo-1680286739871-01142bc609df?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    path: "/services"
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

const testimonials = [
  {
    id: 1,
    content: "HomeHelp made finding a reliable plumber so easy. The service was excellent and I've bookmarked the app for all my future home service needs.",
    author: "David Kimani",
    role: "Homeowner, Nairobi",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg"
  },
  {
    id: 2,
    content: "As a busy professional, I don't have time to search for quality service providers. HomeHelp solved this problem perfectly. Highly recommended!",
    author: "Sarah Wangari",
    role: "Business Owner, Mombasa",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg"
  },
  {
    id: 3,
    content: "The gardening service I booked through HomeHelp exceeded my expectations. The app is intuitive and the service providers are top-notch.",
    author: "Michael Odhiambo",
    role: "Property Manager, Kisumu",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg"
  },
];

const Landing = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="pt-12 pb-32 animate-fade-in">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-homehelp-900 mb-6">
            Find Trusted Home Service Professionals
          </h1>
          <p className="text-lg md:text-xl text-homehelp-600 mb-8">
            Connect with verified local service providers for all your home maintenance needs
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-homehelp-900 hover:bg-homehelp-800">
                Get Started
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16 animate-slide-up">
        <h2 className="text-3xl font-display font-bold text-homehelp-900 text-center mb-4">
          Popular Services
        </h2>
        <p className="text-homehelp-600 text-center max-w-2xl mx-auto mb-12">
          Discover our most requested home services from verified professionals
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link to={category.path} key={index} className="group cursor-pointer">
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
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/services">
            <Button variant="outline" className="hover-lift">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-homehelp-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-homehelp-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-homehelp-600 text-center max-w-2xl mx-auto mb-12">
            Getting help for your home has never been easier
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover-lift">
              <div className="w-12 h-12 bg-homehelp-100 rounded-full flex items-center justify-center text-homehelp-900 font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-homehelp-900 mb-2">Select a Service</h3>
              <p className="text-homehelp-600">Browse through our wide range of professional home services</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover-lift">
              <div className="w-12 h-12 bg-homehelp-100 rounded-full flex items-center justify-center text-homehelp-900 font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-homehelp-900 mb-2">Choose a Provider</h3>
              <p className="text-homehelp-600">Select from our verified professionals based on ratings and reviews</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-md hover-lift">
              <div className="w-12 h-12 bg-homehelp-100 rounded-full flex items-center justify-center text-homehelp-900 font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-homehelp-900 mb-2">Schedule & Relax</h3>
              <p className="text-homehelp-600">Book your appointment and let our professionals handle the rest</p>
            </div>
          </div>
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

      {/* Testimonials Section */}
      <section className="py-20 bg-homehelp-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-homehelp-900 text-center mb-4">
            What Our Users Say
          </h2>
          <p className="text-homehelp-600 text-center max-w-2xl mx-auto mb-12">
            Don't just take our word for it — hear from some of our satisfied users
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-md hover-lift">
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-homehelp-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-medium text-homehelp-900">{testimonial.author}</h4>
                    <p className="text-sm text-homehelp-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="bg-white text-homehelp-900 px-8 py-3 rounded-full font-bold hover:bg-homehelp-100 transition-colors duration-300 hover-lift">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="bg-transparent border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors duration-300 hover-lift">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
