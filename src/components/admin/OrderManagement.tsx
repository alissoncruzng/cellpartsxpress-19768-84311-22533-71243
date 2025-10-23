// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Package, User, MapPin, DollarSign, Clock, Search, Filter, X, Eye, UserPlus, Ban } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Order {
  id: string;
  client_id: string;
  driver_id: string | null;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at: string;
  profiles?: {
    full_name: string;
    phone: string;
  };
  driver?: {
    full_name: string;
    phone: string;
  };
}

interface Driver {
  id: string;
  full_name: string;
  phone: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    loadOrders();
    loadDrivers();
    subscribeToOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles:client_id (full_name, phone),
          driver:driver_id (full_name, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, profiles:user_id(id, full_name, phone)")
        .eq("role", "driver");

      if (error) throw error;

      const driversList = data
        ?.filter(d => d.profiles)
        .map(d => ({
          id: d.profiles.id,
          full_name: d.profiles.full_name,
          phone: d.profiles.phone,
        })) || [];

      setDrivers(driversList);
    } catch (error: any) {
      console.error("Error loading drivers:", error);
    }
  };

  const subscribeToOrders = () => {
    const channel = supabase
      .channel('admin-orders')
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
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(term) ||
        o.profiles?.full_name?.toLowerCase().includes(term) ||
        o.delivery_address.toLowerCase().includes(term) ||
        o.delivery_city.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  const assignDriver = async () => {
    if (!selectedOrder || !selectedDriverId) {
      toast.error("Selecione um motorista");
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          driver_id: selectedDriverId,
          status: "driver_assigned",
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      toast.success("Motorista atribuído com sucesso!");
      setAssignDialogOpen(false);
      setSelectedDriverId("");
      loadOrders();
    } catch (error: any) {
      console.error("Error assigning driver:", error);
      toast.error("Erro ao atribuir motorista");
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      toast.error("Informe o motivo do cancelamento");
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          driver_notes: `Cancelado pelo admin: ${cancelReason}`,
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      toast.success("Pedido cancelado");
      setCancelDialogOpen(false);
      setCancelReason("");
      loadOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error("Erro ao cancelar pedido");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "outline" },
      driver_assigned: { label: "Motorista Atribuído", variant: "default" },
      picked_up: { label: "Coletado", variant: "default" },
      out_for_delivery: { label: "Em Rota", variant: "default" },
      delivered: { label: "Entregue", variant: "secondary" },
      cancelled: { label: "Cancelado", variant: "destructive" },
      confirmed: { label: "Confirmado", variant: "default" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "border-yellow-500/50 bg-yellow-500/5",
      driver_assigned: "border-blue-500/50 bg-blue-500/5",
      picked_up: "border-purple-500/50 bg-purple-500/5",
      out_for_delivery: "border-orange-500/50 bg-orange-500/5",
      delivered: "border-green-500/50 bg-green-500/5",
      cancelled: "border-red-500/50 bg-red-500/5",
      confirmed: "border-cyan-500/50 bg-cyan-500/5",
    };
    return colors[status] || "";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestão de Pedidos
          </CardTitle>
          <CardDescription>
            Gerencie todos os pedidos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ID, cliente, endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="driver_assigned">Motorista Atribuído</SelectItem>
                  <SelectItem value="picked_up">Coletado</SelectItem>
                  <SelectItem value="out_for_delivery">Em Rota</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === "pending").length}
                </div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => ["driver_assigned", "picked_up", "out_for_delivery"].includes(o.status)).length}
                </div>
                <div className="text-xs text-muted-foreground">Em Andamento</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === "delivered").length}
                </div>
                <div className="text-xs text-muted-foreground">Entregues</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum pedido encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className={`border-2 ${getStatusColor(order.status)}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold">
                            #{order.id.slice(0, 8)}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          R$ {order.total.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Entrega: R$ {order.delivery_fee.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex items-start gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-semibold">{order.profiles?.full_name || "Cliente"}</p>
                        <p className="text-xs text-muted-foreground">{order.profiles?.phone}</p>
                      </div>
                    </div>

                    {/* Driver Info */}
                    {order.driver_id && order.driver && (
                      <div className="flex items-start gap-2 text-sm">
                        <User className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-600">{order.driver.full_name}</p>
                          <p className="text-xs text-muted-foreground">{order.driver.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{order.delivery_address}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.delivery_city} - {order.delivery_state}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setAssignDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Atribuir Motorista
                        </Button>
                      )}
                      {!["delivered", "cancelled"].includes(order.status) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedOrder(order);
                            setCancelDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Assign Driver Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Motorista</DialogTitle>
            <DialogDescription>
              Selecione um motorista para este pedido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motorista</Label>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.full_name} - {driver.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={assignDriver} className="w-full">
              Atribuir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Pedido</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Descreva o motivo do cancelamento..."
                rows={4}
              />
            </div>
            <Button onClick={cancelOrder} variant="destructive" className="w-full">
              Confirmar Cancelamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
