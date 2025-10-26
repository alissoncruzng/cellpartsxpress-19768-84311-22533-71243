// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, Package, Clock, CheckCircle, Download, FileSpreadsheet, Star } from "lucide-react";
import Header from "@/components/Header";
import RatingModal from "@/components/RatingModal";
import * as XLSX from 'xlsx';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  driver_id?: string;
  has_rating?: boolean;
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-500", icon: Package },
  in_transit: { label: "Em Trânsito", color: "bg-purple-500", icon: MapPin },
  delivered: { label: "Entregue", color: "bg-green-500", icon: CheckCircle },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    orderId: string;
    driverId: string;
  }>({
    isOpen: false,
    orderId: "",
    driverId: "",
  });

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

      // @ts-ignore - Types will be regenerated after migration
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*, driver_id")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Check ratings for delivered orders
      const deliveredOrders = ordersData?.filter(order => order.status === 'delivered') || [];
      const ratingPromises = deliveredOrders.map(async (order) => {
        const { data: rating } = await supabase
          .from("ratings")
          .select("id")
          .eq("order_id", order.id)
          .eq("client_id", user.id)
          .single();
        return { orderId: order.id, hasRating: !!rating };
      });

      const ratings = await Promise.all(ratingPromises);
      const ratingMap = Object.fromEntries(ratings.map(r => [r.orderId, r.hasRating]));

      const ordersWithRatingStatus = ordersData?.map(order => ({
        ...order,
        has_rating: ratingMap[order.id] || false,
      })) || [];

      setOrders(ordersWithRatingStatus);
    } catch (error: any) {
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = orders.map(order => ({
      'Pedido': order.id.slice(0, 8),
      'Data': new Date(order.created_at).toLocaleString('pt-BR'),
      'Status': statusMap[order.status]?.label || order.status,
      'Total': `R$ ${order.total.toFixed(2)}`,
      'Endereço': `${order.delivery_address}, ${order.delivery_city} - ${order.delivery_state}`
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    XLSX.writeFile(wb, `pedidos_acr_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Relatório exportado com sucesso!");
  };

  const openRatingModal = (orderId: string, driverId: string) => {
    setRatingModal({
      isOpen: true,
      orderId,
      driverId,
    });
  };

  const closeRatingModal = () => {
    setRatingModal({
      isOpen: false,
      orderId: "",
      driverId: "",
    });
  };

  const handleRatingSuccess = () => {
    loadOrders(); // Recarregar pedidos para atualizar status de avaliação
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header userRole="client" />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Pedidos</h1>
            <p className="text-muted-foreground">Acompanhe seus pedidos em tempo real</p>
          </div>
          {orders.length > 0 && (
            <Button onClick={exportToExcel} variant="outline">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusMap[order.status] || statusMap.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/order-tracking/${order.id}`)}>
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
                        Clique para acompanhar em tempo real
                      </p>
                    </div>
                  )}

                  {order.status === 'delivered' && !order.has_rating && order.driver_id && (
                    <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRatingModal(order.id, order.driver_id!);
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Avaliar Motorista
                      </Button>
                    </div>
                  )}

                  <Button variant="outline" className="w-full mt-4" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/order-tracking/${order.id}`);
                  }}>
                    Ver Detalhes
                  </Button>
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

      <RatingModal
        orderId={ratingModal.orderId}
        driverId={ratingModal.driverId}
        isOpen={ratingModal.isOpen}
        onClose={closeRatingModal}
        onSuccess={handleRatingSuccess}
      />
    </div>
  );
}
