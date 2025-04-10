import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, EyeOff, Eye, Phone, Briefcase, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '../apiConfig';

const ProviderSignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [services, setServices] = useState(""); // We'll use this as business_name
  const [bio, setBio] = useState(""); // We'll use this as business_description
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Updated endpoint to match backend route
      const response = await fetch(`${API_BASE_URL}/api/auth/registerProvider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          phone,
          location,
          services,
          bio,
          password 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Provider account created successfully! Please log in.",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-homehelp-50 to-homehelp-100 px-4 py-12">
      <Button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-homehelp-900 hover:text-homehelp-700"
        variant="ghost"
      >
        ← Back
      </Button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-display font-bold text-homehelp-900">HomeHelp</h1>
          </Link>
          <p className="mt-2 text-homehelp-600">Register as a Service Provider</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-homehelp-100">
              <Briefcase className="h-8 w-8 text-homehelp-900" />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="provider@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="City, Country"
                    className="pl-10"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
  <Label htmlFor="services">Services Offered</Label>
  <div className="relative">
    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
    <Input
      id="services"
      type="text"
      placeholder="Plumbing, Electrical, etc."
      className="pl-10"
      value={services}
      onChange={(e) => setServices(e.target.value)}
      required
    />
  </div>
  <p className="text-xs text-homehelp-500">
    Enter services you offer, separated by commas. These will be added to your profile.
  </p>
</div>

<div className="space-y-2">
  <Label htmlFor="bio">Business Description</Label>
  <Textarea 
    id="bio"
    placeholder="Tell clients about your services, experience, and expertise..."
    className="min-h-24"
    value={bio}
    onChange={(e) => setBio(e.target.value)}
  />
</div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-homehelp-400 hover:text-homehelp-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-homehelp-900 hover:bg-homehelp-800"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Register as Provider"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-homehelp-600">
              Already registered as a provider?{" "}
              <Link to="/login" className="font-medium text-homehelp-900 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignUp;