import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  Package,
  TrendingUp,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Send
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  document?: string;
  city?: string;
  state?: string;
}

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  blockedUsers: number;
  totalOrders: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    blockedUsers: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAdminAccess = () => {
    // Verificação feita pelo ProtectedRoute
    return true;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar estatísticas
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("*");

      if (usersError) throw usersError;

      // Calcular estatísticas
      const totalUsers = users?.length || 0;
      const pendingUsers = users?.filter(u => !u.is_approved)?.length || 0;
      const approvedUsers = users?.filter(u => u.is_approved && !u.is_blocked)?.length || 0;
      const blockedUsers = users?.filter(u => u.is_blocked)?.length || 0;

      setStats({
        totalUsers,
        pendingUsers,
        approvedUsers,
        blockedUsers,
        totalOrders: 0, // TODO: implementar quando houver tabela de orders
        revenue: 0 // TODO: implementar quando houver sistema de pagamentos
      });

      // Carregar usuários pendentes
      const { data: pending, error: pendingError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (pendingError) throw pendingError;
      setPendingUsers(pending || []);

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;

      // Recarregar dados
      await loadDashboardData();
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: true })
        .eq("id", userId);

      if (error) throw error;

      // Recarregar dados
      await loadDashboardData();
    } catch (error) {
      console.error("Erro ao rejeitar usuário:", error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "driver": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "wholesale": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "client": return "bg-green-500/20 text-green-300 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "driver": return "Motoboy";
      case "wholesale": return "Lojista";
      case "client": return "Cliente";
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-400" />
              Painel Administrativo
            </h1>
            <p className="text-white/70 mt-1">Gerencie usuários, aprovações e sistema</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/70 text-sm">Administrador</p>
              <p className="text-white text-sm">{user?.email}</p>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Aguardando Aprovação</CardTitle>
                <Clock className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendingUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Usuários Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.approvedUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/70">Usuários Bloqueados</CardTitle>
                <UserX className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.blockedUsers}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="analytics">Relatórios</TabsTrigger>
            <TabsTrigger value="approvals">Cadastros</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Usuários Aguardando Aprovação</CardTitle>
                <CardDescription className="text-white/70">
                  Revise e aprove ou rejeite os cadastros pendentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <p className="text-white/70">Nenhum usuário aguardando aprovação</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{user.full_name}</h3>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {getRoleLabel(user.role)}
                              </Badge>
                              <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-white/70">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {user.phone}
                                </div>
                              )}
                              {user.document && (
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  {user.document}
                                </div>
                              )}
                              {(user.city || user.state) && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {[user.city, user.state].filter(Boolean).join(", ")}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(user.created_at).toLocaleDateString("pt-BR")}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => approveUser(user.id)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => rejectUser(user.id)}
                              variant="outline"
                              className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Todos os Usuários</CardTitle>
                <CardDescription className="text-white/70">
                  Lista completa de usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                  <p className="text-white/70">Funcionalidade em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <p className="text-white/70">R$ {stats.revenue.toLocaleString("pt-BR")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Total de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                    <p className="text-white/70">{stats.totalOrders}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Aprovação de Cadastros</CardTitle>
                <CardDescription className="text-white/70">
                  Gerencie cadastros pendentes de lojistas e motoboys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                  <p className="text-white/70">Sistema de aprovações em desenvolvimento</p>
                  <p className="text-white/50 text-sm mt-2">
                    Em breve você poderá aprovar/rejeitar cadastros aqui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Templates de E-mail</CardTitle>
                <CardDescription className="text-white/70">
                  Configure os templates de e-mail para OTP e comunicações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => window.location.href = "/admin/templates"}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 h-20 flex flex-col items-center justify-center"
                    >
                      <Mail className="h-6 w-6 mb-2" />
                      <span>Configurar Templates</span>
                    </Button>

                    <Button
                      className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 h-20 flex flex-col items-center justify-center"
                    >
                      <Send className="h-6 w-6 mb-2" />
                      <span>Testar Envio</span>
                    </Button>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">📧 Templates Disponíveis</h4>
                    <div className="space-y-2 text-white/70">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Código OTP de Verificação</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>E-mail de Boas-vindas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Aprovação de Cadastro</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-300 font-medium mb-2">⚠️ Configuração no Supabase</h4>
                    <p className="text-white/70 text-sm">
                      Os templates precisam ser configurados no painel do Supabase em:
                      <br />
                      <strong>Authentication → Email Templates → Confirm signup</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
