import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDrivers from "./pages/AdminDrivers_new";
import AdminPromotions from "./pages/AdminPromotions";
import AdminOrders from "./pages/AdminOrders";
import EmailTemplates from "./pages/EmailTemplates";
import AdminDeliveryConfigs from "./pages/AdminDeliveryConfigs";
import AdminRatings from "./pages/AdminRatings";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";
import InstallPWA from "./pages/InstallPWA";
import DriverDashboard from "./pages/DriverDashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import ClientRegistration from "./pages/auth/register/client";
import WholesaleRegistration from "./pages/auth/register/wholesale";
import DriverRegistration from "./pages/auth/register/driver";
import AuthCallback from "./pages/auth/callback";
import WholesaleDashboard from "./pages/WholesaleDashboard";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import VerifyEmail from "./pages/auth/verify-email";
import PendingApproval from "./pages/PendingApproval";
import AccountBlocked from "./pages/AccountBlocked";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PWAInstallPrompt />
          <Routes>
            {/* Rotas públicas */}
            <Route
              path="/"
              element={<ProtectedRoute requireAuth={false}><Index /></ProtectedRoute>}
            />
            <Route path="/install" element={<Install />} />
            <Route path="/install-pwa" element={<InstallPWA />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            {/* Rotas de autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<ClientRegistration />} />
            <Route path="/register/wholesale" element={<WholesaleRegistration />} />
            <Route path="/register/driver" element={<DriverRegistration />} />
            <Route path="/complete-profile/client" element={<ClientRegistration />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/account-blocked" element={<AccountBlocked />} />

            {/* Dashboards por Role */}
            <Route
              path="/wholesale/dashboard"
              element={
                <ProtectedRoute allowedRoles={['wholesale', 'admin']}>
                  <WholesaleDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rotas para CLIENTES (não podem acessar rotas de lojistas) */}
            <Route
              path="/catalog"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <Catalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-tracking/:orderId"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />

            {/* Rotas para LOJISTAS não implementadas - Sistema focado em clientes e entregadores */}

            {/* Rotas para MOTOROBOYS/ENTREGADORES */}
            <Route
              path="/driver/dashboard"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rotas para ADMINISTRADORES - Acesso completo */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/drivers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDrivers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/promotions"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPromotions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/templates"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EmailTemplates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/delivery-configs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDeliveryConfigs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ratings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRatings />
                </ProtectedRoute>
              }
            />

            {/* Rota padrão - redireciona baseado no role */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
