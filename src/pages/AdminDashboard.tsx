// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3
} from "lucide-react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  totalProducts: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  delivery_address: string;
  driver_id: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadDashboardData();

    // Realtime updates
    const channel = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/welcome");
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

  const loadDashboardData = async () => {
    try {
      // Load orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Load products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("is_active", true);

      if (productsError) throw productsError;

      // Load drivers
      const { data: drivers, error: driversError } = await supabase
        .from("profiles")
        .select("id, is_approved")
        .eq("role", "driver")
        .eq("is_approved", true)
        .eq("is_blocked", false);

      if (driversError) throw driversError;

      const pending = orders?.filter(o => o.status === 'pending').length || 0;
      const completed = orders?.filter(o => o.status === 'delivered').length || 0;
      const revenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      setStats({
        totalOrders: orders?.length || 0,
        pendingOrders: pending,
        completedOrders: completed,
        totalRevenue: revenue,
        activeDrivers: drivers?.length || 0,
        totalProducts: products?.length || 0,
      });

      setRecentOrders(orders?.slice(0, 10) || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "Pendente", variant: "outline", icon: Clock },
      driver_assigned: { label: "Motorista Designado", variant: "default", icon: Truck },
      out_for_delivery: { label: "Em Rota", variant: "default", icon: TrendingUp },
      delivered: { label: "Entregue", variant: "default", icon: CheckCircle },
    };

    const info = statusMap[status] || statusMap.pending;
    const Icon = info.icon;

    return (
      <Badge variant={info.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {info.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header userRole="admin" />
      
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground">Visão geral do sistema em tempo real</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedOrders} entregas completas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Motoristas Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDrivers}</div>
              <p className="text-xs text-muted-foreground">
                Aprovados e disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando motorista
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Disponíveis no catálogo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalOrders > 0 
                  ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Pedidos entregues
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">#{order.id.slice(0, 8)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.delivery_address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      R$ {order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              {recentOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pedido recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate("/admin/products")}
            variant="outline"
            className="h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <span>Gerenciar Produtos</span>
            </div>
          </Button>
          
          <Button
            onClick={() => navigate("/admin/drivers")}
            variant="outline"
            className="h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span>Gerenciar Motoristas</span>
            </div>
          </Button>
          
          <Button
            onClick={() => navigate("/admin/promotions")}
            variant="outline"
            className="h-auto py-6"
          >
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Promoções</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
