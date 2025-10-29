import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { LogOut, Shield, Users, Package, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login?role=admin');
        return;
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        navigate('/login?role=admin');
        return;
      }

      setUser(profile);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-gray-900">ACR Delivery - Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Olá, {user?.full_name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h2>
            <p className="text-gray-600">Gerencie o sistema ACR Delivery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Total Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">0</div>
                <p className="text-sm text-gray-600">Usuários registrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Pedidos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">0</div>
                <p className="text-sm text-gray-600">Pedidos realizados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Receita Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">R$ 0,00</div>
                <p className="text-sm text-gray-600">Faturamento do dia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Status Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-500">Online</div>
                <p className="text-sm text-gray-600">Sistema operacional</p>
              </CardContent>
            </Card>
          </div>

          {/* Área de Ações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Clientes
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Gerenciar Motoboys
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Gerenciar Pedidos
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatórios
                  </Button>
                  <Button className="w-full" variant="outline">
                    Configurações do Sistema
                  </Button>
                  <Button className="w-full" variant="outline">
                    Manutenção
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Info Card */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Informações do Administrador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p className="text-sm text-gray-900">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Conta</p>
                    <p className="text-sm text-gray-900 capitalize">{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">Administrador Ativo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
