import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { LogOut, Bike, Package, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login?role=driver');
        return;
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'driver') {
        navigate('/login?role=driver');
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
              <Bike className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-gray-900">ACR Delivery - Motoboy</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Painel do Motoboy</h2>
            <p className="text-gray-600">Gerencie suas entregas e aumente sua renda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Entregas Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">0</div>
                <p className="text-sm text-gray-600">Entregas realizadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Em Trânsito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">0</div>
                <p className="text-sm text-gray-600">Pedidos em andamento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bike className="h-5 w-5 mr-2" />
                  Disponibilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-500">Disponível</div>
                <p className="text-sm text-gray-600">Pronto para entregas</p>
              </CardContent>
            </Card>
          </div>

          {/* Área de Ações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entregas Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma entrega disponível no momento</p>
                  <p className="text-sm text-gray-500 mt-2">
                    As entregas aparecerão aqui quando houver pedidos para sua região
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minhas Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nome</p>
                    <p className="text-sm text-gray-900">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">
                      {user?.is_approved ? 'Aprovado' : 'Aguardando Aprovação'}
                    </p>
                  </div>
                  {user?.vehicle_plate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Placa do Veículo</p>
                      <p className="text-sm text-gray-900">{user.vehicle_plate}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
