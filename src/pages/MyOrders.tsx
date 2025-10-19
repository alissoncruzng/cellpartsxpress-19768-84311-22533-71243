import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Package, Clock, CheckCircle } from "lucide-react";
import Header from "@/components/Header";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-500", icon: Package },
  in_transit: { label: "Em Trânsito", color: "bg-purple-500", icon: MapPin },
  delivered: { label: "Entregue", color: "bg-green-500", icon: CheckCircle },
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    // Realtime updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header userRole="client" />
      
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe seus pedidos em tempo real</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusMap[order.status] || statusMap.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-card/50 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Pedido #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={`${statusInfo.color} text-white gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Endereço de Entrega</p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_address}, {order.delivery_city} - {order.delivery_state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>

                  {order.status === 'in_transit' && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary flex items-center gap-2">
                        <MapPin className="h-4 w-4 animate-pulse" />
                        Seu pedido está a caminho! Acompanhe em tempo real.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você ainda não fez nenhum pedido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
