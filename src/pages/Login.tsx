
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Mail, Lock, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (!success) {
        setIsLoading(false);
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "An error occurred during login" 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-homehelp-50 to-homehelp-100 px-4 py-12">
      <Button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-2 text-homehelp-900 hover:text-homehelp-700"
        variant="ghost"
      >
        ← Back Home
      </Button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-display font-bold text-homehelp-900">HomeHelp</h1>
          </Link>
          <p className="mt-2 text-homehelp-600">Log in to your HomeHelp account</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-homehelp-100">
              <LogIn className="h-8 w-8 text-homehelp-900" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-homehelp-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || authLoading}
                />
              </div>
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
                  disabled={isLoading || authLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-homehelp-400 hover:text-homehelp-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || authLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-homehelp-900 hover:bg-homehelp-800"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? "Logging in..." : "Login"}
            </Button>
            
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-homehelp-700 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-homehelp-600">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-homehelp-900 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
