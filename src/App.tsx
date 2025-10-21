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
import AdminProducts from "./pages/AdminProducts";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";
import InstallPWA from "./pages/InstallPWA";
import DriverDashboard from "./pages/DriverDashboard";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

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
            <Route
              path="/"
              element={<Index />}
            />
            <Route
              path="/catalog"
              element={session ? <Catalog /> : <Navigate to="/" />}
            />
            <Route
              path="/my-orders"
              element={session ? <MyOrders /> : <Navigate to="/" />}
            />
            <Route
              path="/admin/products"
              element={session ? <AdminProducts /> : <Navigate to="/" />}
            />
            <Route
              path="/driver/dashboard"
              element={session ? <DriverDashboard /> : <Navigate to="/" />}
            />
            <Route path="/install" element={<Install />} />
            <Route path="/install-pwa" element={<InstallPWA />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
