import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>({ user: { id: 'test-user', email: 'test@example.com' } }); // Sessão fake para teste
  const [loading, setLoading] = useState(false);

  // Temporariamente desabilitado para testes
  /*
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão real do Supabase
        const { data: { session: realSession } } = await supabase.auth.getSession();

        // Verificar sessão de desenvolvimento
        const devSession = localStorage.getItem('dev-session');
        let parsedDevSession = null;

        if (devSession) {
          try {
            parsedDevSession = JSON.parse(devSession);
            // Verificar se a sessão não expirou (24 horas)
            if (Date.now() - parsedDevSession.timestamp > 24 * 60 * 60 * 1000) {
              localStorage.removeItem('dev-session');
              parsedDevSession = null;
            }
          } catch (error) {
            localStorage.removeItem('dev-session');
          }
        }

        // Usar sessão real se existir, senão usar sessão de desenvolvimento
        const effectiveSession = realSession || (parsedDevSession ? { user: parsedDevSession.user } : null);
        setSession(effectiveSession);
      } catch (error) {
        console.error('Auth check error:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  */

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
            <Route
              path="/"
              element={<Index />}
            />
            <Route
              path="/catalog"
              element={<Catalog />}
            />
            <Route
              path="/my-orders"
              element={<MyOrders />}
            />
            <Route
              path="/order-tracking/:orderId"
              element={<OrderTracking />}
            />
            <Route
              path="/admin/products"
              element={<AdminProducts />}
            />
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
            <Route
              path="/admin/drivers"
              element={<AdminDrivers />}
            />
            <Route
              path="/admin/promotions"
              element={<AdminPromotions />}
            />
            <Route
              path="/admin/orders"
              element={<AdminOrders />}
            />
            <Route
              path="/admin/templates"
              element={<EmailTemplates />}
            />
            <Route
              path="/admin/delivery-configs"
              element={<AdminDeliveryConfigs />}
            />
            <Route
              path="/admin/ratings"
              element={<AdminRatings />}
            />
            <Route
              path="/driver/dashboard"
              element={<DriverDashboard />}
            />
            <Route path="/install" element={<Install />} />
            <Route path="/install-pwa" element={<InstallPWA />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
