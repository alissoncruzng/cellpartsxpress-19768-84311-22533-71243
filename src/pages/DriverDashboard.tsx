import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Package, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Camera, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SignatureCapture from "@/components/SignatureCapture";
import DriverStats from "@/components/driver/DriverStats";
import WithdrawalRequest from "@/components/driver/WithdrawalRequest";
import ClientInfo from "@/components/driver/ClientInfo";
import DeliveryRoute from "@/components/driver/DeliveryRoute";

interface Order {
  id: string;
  client_id: string;
  driver_id: string | null;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string;
  delivery_cep: string;
  delivery_city: string;
  delivery_state: string;
  pickup_address: string | null;
  created_at: string;
  pickup_photo_url: string | null;
  delivery_photo_url: string | null;
  signature_data: string | null;
  driver_notes: string | null;
}

interface WalletTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function DriverDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [pickupPhoto, setPickupPhoto] = useState<File | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadOrders();
    loadWallet();
    
    // Subscribe to realtime updates for new orders
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change received:', payload);
          loadOrders();
          if (payload.eventType === 'INSERT') {
            toast.info("Novo pedido disponível!", {
              description: "Um novo pedido foi adicionado à lista.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const checkAuth = async () => {
    // Temporarily disabled for testing - using fake session from App.tsx
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   navigate("/");
    //   return;
    // }
    // setUserId(user.id);
    setUserId("test-driver-user"); // Fake user ID for testing
  };

  const loadOrders = async () => {
    try {
      // Temporarily disabled for testing - using fake session from App.tsx
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return;

      // Load available orders (pending, not assigned)
      const { data: available, error: availableError } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "pending")
        .is("driver_id", null)
        .order("created_at", { ascending: false });

      if (availableError) throw availableError;
      setAvailableOrders(available || []);

      // Load my orders (assigned to me)
      const { data: mine, error: mineError } = await supabase
        .from("orders")
        .select("*")
        .eq("driver_id", userId)
        .order("created_at", { ascending: false });

      if (mineError) throw mineError;
      setMyOrders(mine || []);

      // Find active delivery
      const active = mine?.find(o => o.status === "driver_assigned" || o.status === "picked_up" || o.status === "out_for_delivery");
      setActiveDelivery(active || null);

    } catch (error: any) {
      toast.error("Erro ao carregar pedidos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      // Temporarily disabled for testing - using fake session from App.tsx
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) return;

      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("driver_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      
      // Calculate balance
      const total = (data || []).reduce((sum, t) => {
        return t.type === "credit" ? sum + Number(t.amount) : sum - Number(t.amount);
      }, 0);
      setBalance(total);

    } catch (error: any) {
      console.error("Erro ao carregar carteira:", error);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          driver_id: userId,
          status: "driver_assigned"
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Pedido aceito!");
      loadOrders();
    } catch (error: any) {
      toast.error("Erro ao aceitar pedido");
      console.error(error);
    }
  };

  const openRejectDialog = (order: Order) => {
    setSelectedOrder(order);
    setRejectDialogOpen(true);
  };

  const rejectOrder = async () => {
    if (!selectedOrder || !rejectReason.trim()) {
      toast.error("Por favor, informe o motivo da recusa");
      return;
    }

    try {
      // Log rejection
      const { error: logError } = await supabase
        .from("rejection_logs")
        .insert({
          order_id: selectedOrder.id,
          driver_id: userId,
          motivo: rejectReason
        });

      if (logError) throw logError;

      toast.success("Pedido recusado");
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedOrder(null);
      loadOrders();
    } catch (error: any) {
      toast.error("Erro ao recusar pedido");
      console.error(error);
    }
  };

  const uploadPhoto = async (file: File, type: "pickup" | "delivery") => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('delivery-proofs')
        .getPublicUrl(fileName);

      // Create delivery proof record
      await supabase
        .from('delivery_proofs')
        .insert({
          order_id: activeDelivery!.id,
          driver_id: userId,
          tipo: type,
          file_url: publicUrl
        });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const startDelivery = async () => {
    if (!activeDelivery || !pickupPhoto) {
      toast.error("Por favor, tire a foto de coleta");
      return;
    }

    try {
      const photoUrl = await uploadPhoto(pickupPhoto, "pickup");
      
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: "out_for_delivery",
          pickup_photo_url: photoUrl
        })
        .eq("id", activeDelivery.id);

      if (error) throw error;

      toast.success("Entrega iniciada!");
      loadOrders();
    } catch (error: any) {
      toast.error("Erro ao iniciar entrega");
      console.error(error);
    }
  };

  const completeDelivery = async () => {
    if (!activeDelivery || !deliveryPhoto || !signature) {
      toast.error("Por favor, preencha todos os campos (foto e assinatura)");
      return;
    }

    try {
      const photoUrl = await uploadPhoto(deliveryPhoto, "delivery");
      
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: "delivered",
          delivery_photo_url: photoUrl,
          signature_data: signature,
          driver_notes: notes
        })
        .eq("id", activeDelivery.id);

      if (error) throw error;

      toast.success("Entrega concluída com sucesso!");
      setPickupPhoto(null);
      setDeliveryPhoto(null);
      setSignature("");
      setNotes("");
      loadOrders();
      loadWallet();
    } catch (error: any) {
      toast.error("Erro ao concluir entrega");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "outline" },
      driver_assigned: { label: "Aceito", variant: "default" },
      picked_up: { label: "Coletado", variant: "default" },
      out_for_delivery: { label: "Em Rota", variant: "default" },
      delivered: { label: "Entregue", variant: "secondary" },
      cancelled: { label: "Cancelado", variant: "destructive" },
      confirmed: { label: "Confirmado", variant: "default" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header cartItemsCount={0} userRole="driver" />
      
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        {/* Stats and Ranking */}
        <DriverStats />

        {/* Wallet Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Minha Carteira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-primary">
              R$ {balance.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              Saldo disponível
            </p>
            <WithdrawalRequest balance={balance} onSuccess={loadWallet} />
          </CardContent>
        </Card>

        {/* Active Delivery Card */}
        {activeDelivery && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Entrega Ativa
              </CardTitle>
              <CardDescription>
                {getStatusBadge(activeDelivery.status)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Info */}
              <ClientInfo 
                clientId={activeDelivery.client_id} 
                orderId={activeDelivery.id}
              />

              {/* Delivery Route */}
              <DeliveryRoute
                pickupAddress={activeDelivery.pickup_address || undefined}
                deliveryAddress={activeDelivery.delivery_address}
                deliveryCity={activeDelivery.delivery_city}
                deliveryState={activeDelivery.delivery_state}
                deliveryCep={activeDelivery.delivery_cep}
              />

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-muted-foreground">Valor da Entrega:</span>
                <span className="font-bold text-primary">R$ {activeDelivery.delivery_fee.toFixed(2)}</span>
              </div>

              {activeDelivery.status === "driver_assigned" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="pickup-photo">Foto de Coleta *</Label>
                    <Input
                      id="pickup-photo"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => setPickupPhoto(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={startDelivery} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Iniciar Entrega
                  </Button>
                </div>
              )}

              {(activeDelivery.status === "out_for_delivery" || activeDelivery.status === "picked_up") && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="delivery-photo">Foto de Entrega *</Label>
                    <Input
                      id="delivery-photo"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => setDeliveryPhoto(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Assinatura do Cliente *</Label>
                    <SignatureCapture 
                      onSave={(sig) => setSignature(sig)} 
                      onCancel={() => {}}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione observações sobre a entrega..."
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={completeDelivery} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Concluir Entrega
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Disponíveis ({availableOrders.length})
            </TabsTrigger>
            <TabsTrigger value="myorders">
              Minhas Entregas ({myOrders.length})
            </TabsTrigger>
            <TabsTrigger value="wallet">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  Nenhum pedido disponível no momento
                </CardContent>
              </Card>
            ) : (
              availableOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <p className="font-semibold">Endereço:</p>
                        <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.delivery_city} - {order.delivery_state}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Valor da Entrega:</span>
                      <span className="font-bold text-primary text-lg">
                        R$ {order.delivery_fee.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => acceptOrder(order.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Aceitar
                      </Button>
                      <Button
                        onClick={() => openRejectDialog(order)}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Recusar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="myorders" className="space-y-4">
            {myOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  Você ainda não tem entregas
                </CardContent>
              </Card>
            ) : (
              myOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <p className="font-semibold">Endereço:</p>
                        <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Ganho:</span>
                      <span className="font-bold text-primary">
                        R$ {order.delivery_fee.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  Nenhuma transação ainda
                </CardContent>
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Pedido</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da recusa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Distância muito longa, fora da minha área..."
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={rejectOrder} className="flex-1">
                Confirmar Recusa
              </Button>
              <Button 
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectReason("");
                  setSelectedOrder(null);
                }}
                variant="outline" 
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
