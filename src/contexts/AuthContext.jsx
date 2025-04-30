import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from '../apiConfig'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserType(parsedUser.userType);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Redirect logged-in users based on their type
  useEffect(() => {
    if (user && userType && !loading) {
      // Only redirect if user is on the login page
      if (window.location.pathname === '/login' || window.location.pathname === '/') {
        if (userType === 'client') {
          navigate('/userDashboard');
        } else if (userType === 'provider') {
          navigate('/providers-dashboard');
        } else if (userType === 'admin') {
          navigate('/admin-dashboard');
        }
      }
    }
  }, [user, userType, loading, navigate]);

  // Check if token is valid and fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setUserType(userData.userType);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Save data and show success message
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setUserType(data.user.userType);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Directly navigate based on user type without checking current path
      switch (data.user.userType) {
        case 'client':
          navigate('/userDashboard');
          break;
        case 'provider':
          navigate('/providers-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An error occurred during login",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setUserType(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      toast({ 
        title: "Success", 
        description: "Account created successfully" 
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({ 
        variant: "destructive", 
        title: "Registration Failed", 
        description: error.message || "An error occurred during registration" 
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    userType 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



