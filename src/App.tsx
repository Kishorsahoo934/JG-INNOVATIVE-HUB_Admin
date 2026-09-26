import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminDataProvider } from "@/context/AdminDataContext";
import AdminLayout from "@/components/layouts/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
import Payments from "@/pages/Payments";
import Reviews from "@/pages/Reviews";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import ProfitManagement from "@/pages/ProfitManagement";
import DeliveryManagement from "@/pages/DeliveryManagement";
import OfflineOrders from "@/pages/OfflineOrders";
import Coupons from "@/pages/Coupons";
import Tutors from "@/pages/Tutors";
import Workshops from "@/pages/Workshops";
import Internships from "@/pages/Internships";
import Gallery from "@/pages/Gallery";
import Projects from "@/pages/Projects";
import ProductDevelopment from "@/pages/ProductDevelopment";
import Consultations from "@/pages/Consultations";
import NotFound from "@/pages/NotFound";
import RealtimeBoundary from "@/components/RealtimeBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RealtimeBoundary>
      <AdminAuthProvider>
        <AdminDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Admin Routes */}
              <Route element={<AdminLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/delivery" element={<DeliveryManagement />} />
                <Route path="/offline-orders" element={<OfflineOrders />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profit" element={<ProfitManagement />} />
                <Route path="/tutors" element={<Tutors />} />
                <Route path="/workshops" element={<Workshops />} />
                <Route path="/internships" element={<Internships />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/product-development" element={<ProductDevelopment />} />
                  <Route path="/consultations" element={<Consultations />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </AdminDataProvider>
      </AdminAuthProvider>
    </RealtimeBoundary>
  </QueryClientProvider>
);

export default App;

