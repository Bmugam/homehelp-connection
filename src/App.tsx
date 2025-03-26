
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Services from "./pages/Services";
import Providers from "./pages/Providers";
import ProviderDetail from "./pages/ProviderDetail";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderSignUp from "./pages/ProviderSignUp";
import NotFound from "./pages/NotFound";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderLayout from "./components/layout/ProviderLayout";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDashboardLayout from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/AdminDashboard/pages/UserManagement';
import ProvidersManagement from './pages/admin/AdminDashboard/pages/ProvidersManagement';
import ServicesManagement from './pages/admin/AdminDashboard/pages/ServicesManagement';
import RoleManagement from './pages/admin/AdminDashboard/pages/RoleManagement';
import AdminSettings from './pages/admin/AdminDashboard/pages/AdminSettings';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <MainLayout>
                <Landing />
              </MainLayout>
            } />
            <Route path="/home" element={
              <ProtectedRoute allowedRoles={['client']}>
                <MainLayout>
                  <Index />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
            <Route path="/providers" element={<MainLayout><Providers /></MainLayout>} />
            <Route path="/providers/:id" element={<MainLayout><ProviderDetail /></MainLayout>} />
          
            {/* Protected Client Routes */}
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={['client']}>
                <MainLayout><Bookings /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['client', 'provider', 'admin']}>
                <MainLayout><Profile /></MainLayout>
              </ProtectedRoute>
            } />
          
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/provider-login" element={<ProviderLogin />} />
            <Route path="/provider-signup" element={<ProviderSignUp />} />
          
            {/* Dashboard Routes */}
            <Route 
              path="/userDashboard" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/providers-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderLayout><ProviderDashboard /></ProviderLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Dashboard Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="providers" element={<ProvidersManagement />} />
              <Route path="services" element={<ServicesManagement />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
