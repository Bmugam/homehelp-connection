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
import AdminDashboardLayout from './pages/Admin/AdminDashboard/AdminDashboardLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/AdminDashboard/pages/UserManagement';
import ProvidersManagement from './pages/Admin/AdminDashboard/pages/ProvidersManagement';
import ServicesManagement from './pages/Admin/AdminDashboard/pages/ServicesManagement';
import RoleManagement from './pages/Admin/AdminDashboard/pages/RoleManagement';
import AdminSettings from './pages/Admin/AdminDashboard/pages/AdminSettings';
import BookingsManagement from "./pages/Admin/AdminDashboard/pages/BookingsManagement";
import ProviderAppointments from "./pages/provider/Appointments";
import ProviderMessages from "./pages/provider/Messages";
import ProviderClients from "./pages/provider/Clients";
import ProviderSettings from "./pages/provider/Settings";
import ProviderPayments from "./pages/provider/Payments";
import ProviderServices from "./pages/provider/MyServices";

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
            <Route path="/services" element={
              <MainLayout>
                <Services />
              </MainLayout>
            } />
            <Route path="/providers" element={
              <MainLayout>
                <Providers />
              </MainLayout>
            } />
            <Route path="/providers/:id" element={
              <MainLayout>
                <ProviderDetail />
              </MainLayout>
            } />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/provider-login" element={<ProviderLogin />} />
            <Route path="/provider-signup" element={<ProviderSignUp />} />

            {/* Protected Client Routes */}
            <Route path="/userDashboard/*" element={
              <ProtectedRoute allowedRoles={['client']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute allowedRoles={['client']}>
                <MainLayout>
                  <Bookings />
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Provider Routes */}
            <Route path="/providers-dashboard/*" element={
              <ProtectedRoute allowedRoles={['provider']}>
                <ProviderLayout>
                  <Routes>
                  <Route index element={<ProviderDashboard />} />
                    <Route path="appointments" element={<ProviderAppointments />} />
                    <Route path="messages" element={<ProviderMessages />} />
                    <Route path="clients" element={<ProviderClients />} />
                    <Route path="settings" element={<ProviderSettings />} />
                    <Route path="payments" element={<ProviderPayments />} />
                    <Route path="my-services" element={<ProviderServices />} />
                    </Routes>
                </ProviderLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin-dashboard/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="providers" element={<ProvidersManagement />} />
                    <Route path="services" element={<ServicesManagement />} />
                    <Route path="bookings" element={<BookingsManagement />} />
                    <Route path="roles" element={<RoleManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Routes>
                </AdminDashboardLayout>
              </ProtectedRoute>
            } />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
