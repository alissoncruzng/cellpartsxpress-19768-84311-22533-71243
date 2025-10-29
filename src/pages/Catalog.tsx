import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { LogOut, Package, ShoppingCart, User } from "lucide-react";
import { toast } from "sonner";

export default function Catalog() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login?role=client');
        return;
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'client') {
        navigate('/login?role=client');
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
              <Package className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-gray-900">ACR Delivery</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Peças</h2>
            <p className="text-gray-600">Bem-vindo ao sistema de pedidos ACR Delivery</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards for products */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Produto {item}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Descrição do produto {item}. Este é um exemplo de peça disponível no catálogo.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">R$ {(item * 25.99).toFixed(2)}</span>
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Comprar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Info Card */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações da Conta
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
                    <p className="text-sm text-gray-900">
                      {user?.is_approved ? 'Aprovado' : 'Pendente de Aprovação'}
                    </p>
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
