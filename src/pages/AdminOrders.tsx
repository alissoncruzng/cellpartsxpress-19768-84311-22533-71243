import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import OrderManagement from "@/components/admin/OrderManagement";
import DeliveryConfig from "@/components/admin/DeliveryConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminOrders() {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      toast.error("Acesso negado. Apenas administradores.");
      navigate("/catalog");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header cartItemsCount={0} userRole="admin" />
      
      <div className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="delivery">Configuração de Frete</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="mt-6">
            <OrderManagement />
          </TabsContent>
          
          <TabsContent value="delivery" className="mt-6">
            <DeliveryConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
