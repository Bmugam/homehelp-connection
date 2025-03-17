
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProviderDashboardLayout from "./components/layout/ProviderDashboardLayout";
import Index from "./pages/Index";
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
import ProviderAppointments from "./pages/provider/ProviderAppointments";
import ProviderSettings from "./pages/provider/ProviderSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Index /></MainLayout>} />
          <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
          <Route path="/providers" element={<MainLayout><Providers /></MainLayout>} />
          <Route path="/providers/:id" element={<MainLayout><ProviderDetail /></MainLayout>} />
          <Route path="/bookings" element={<MainLayout><Bookings /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/provider-login" element={<ProviderLogin />} />
          <Route path="/provider-signup" element={<ProviderSignUp />} />
          
          {/* Provider Dashboard Routes - These are now correctly wrapped with ProviderDashboardLayout */}
          <Route path="/providers-dashboard" element={<ProviderDashboard />} />
          <Route path="/providers-dashboard/appointments" element={<ProviderAppointments />} />
          <Route path="/providers-dashboard/settings" element={<ProviderSettings />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
