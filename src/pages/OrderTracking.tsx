// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Phone, Clock, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import RatingDialog from "@/components/RatingDialog";

interface Order {
  id: string;
  status: string;
  total: number;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
  driver_id?: string;
  profiles?: {
    full_name: string;
    phone: string;
  };
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-500", icon: Package },
  in_transit: { label: "Em Trânsito", color: "bg-purple-500", icon: MapPin },
  delivered: { label: "Entregue", color: "bg-green-500", icon: CheckCircle },
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    loadOrder();

    // Realtime updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        () => {
          loadOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:driver_id (full_name, phone)
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);

      // Show rating dialog when delivered
      if (data.status === "delivered" && !localStorage.getItem(`rated_${orderId}`)) {
        setTimeout(() => setShowRating(true), 1000);
      }
    } catch (error: any) {
      console.error("Error loading order:", error);
      toast.error("Erro ao carregar pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingComplete = () => {
    localStorage.setItem(`rated_${orderId}`, 'true');
    setShowRating(false);
    toast.success("Avaliação enviada com sucesso!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
        <Header userRole="client" />
        <div className="container mx-auto p-6 text-center">
          <p className="text-muted-foreground">Pedido não encontrado</p>
          <Button onClick={() => navigate("/my-orders")} className="mt-4">
            Voltar para Meus Pedidos
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusMap[order.status] || statusMap.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header userRole="client" />
      
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/my-orders")}>
            ← Voltar
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge className={`${statusInfo.color} text-white text-lg px-6 py-2 gap-2`}>
                  <StatusIcon className="h-5 w-5" />
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Timeline */}
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${order.status !== 'pending' ? 'opacity-100' : 'opacity-50'}`}>
                    <CheckCircle className={`h-5 w-5 ${order.status !== 'pending' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span>Pedido Recebido</span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'confirmed' || order.status === 'in_transit' || order.status === 'delivered' ? 'opacity-100' : 'opacity-50'}`}>
                    <Package className={`h-5 w-5 ${order.status === 'confirmed' || order.status === 'in_transit' || order.status === 'delivered' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    <span>Pedido Confirmado</span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'in_transit' || order.status === 'delivered' ? 'opacity-100' : 'opacity-50'}`}>
                    <MapPin className={`h-5 w-5 ${order.status === 'in_transit' || order.status === 'delivered' ? 'text-purple-500 animate-pulse' : 'text-muted-foreground'}`} />
                    <span>Saiu para Entrega</span>
                  </div>
                  <div className={`flex items-center gap-3 ${order.status === 'delivered' ? 'opacity-100' : 'opacity-50'}`}>
                    <CheckCircle className={`h-5 w-5 ${order.status === 'delivered' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span>Pedido Entregue</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Driver & Delivery Info */}
          <div className="space-y-6">
            {order.driver_id && order.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Motorista</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-lg">{order.profiles.full_name}</p>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <Phone className="h-4 w-4" />
                      <span>{order.profiles.phone}</span>
                    </div>
                  </div>
                  
                  {order.status === 'in_transit' && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary flex items-center gap-2">
                        <MapPin className="h-4 w-4 animate-pulse" />
                        Seu pedido está a caminho!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p>{order.delivery_address}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.delivery_city} - {order.delivery_state}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  R$ {order.total.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {order.status === 'delivered' && (
              <Button
                onClick={() => setShowRating(true)}
                className="w-full"
                variant="outline"
              >
                <Star className="mr-2 h-4 w-4" />
                Avaliar Entrega
              </Button>
            )}
          </div>
        </div>

        {/* Map Placeholder */}
        {order.status === 'in_transit' && (
          <Card>
            <CardHeader>
              <CardTitle>Localização em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">
                    Mapa em tempo real estará disponível em breve
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Integração com Google Maps/Mapbox será implementada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showRating && order.driver_id && (
        <RatingDialog
          orderId={order.id}
          driverId={order.driver_id}
          onClose={() => setShowRating(false)}
          onComplete={handleRatingComplete}
        />
      )}
    </div>
  );
}
