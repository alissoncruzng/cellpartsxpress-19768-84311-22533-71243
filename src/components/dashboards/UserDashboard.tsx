import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, History, Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUser";

interface UserDashboardProps {
  user: UserProfile;
}

export function UserDashboard({ user }: UserDashboardProps) {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Novo Pedido",
      icon: <ShoppingCart className="h-6 w-6" />,
      onClick: () => navigate("/catalog"),
      description: "Iniciar um novo pedido",
    },
    {
      title: "Meus Pedidos",
      icon: <Package className="h-6 w-6" />,
      onClick: () => navigate("/orders"),
      description: "Acompanhe seus pedidos",
    },
    {
      title: "Favoritos",
      icon: <Heart className="h-6 w-6" />,
      onClick: () => navigate("/favorites"),
      description: "Seus itens favoritos",
    },
    {
      title: "Endereços",
      icon: <MapPin className="h-6 w-6" />,
      onClick: () => navigate("/addresses"),
      description: "Gerenciar endereços",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user.full_name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta ao seu painel</p>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={action.onClick}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <div className="p-2 rounded-full bg-primary/10">
                  {action.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Últimos Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Pedidos</CardTitle>
          <p className="text-sm text-muted-foreground">Acompanhe seus pedidos recentes</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-2" />
            <p>Nenhum pedido recente</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/catalog")}
            >
              Fazer meu primeiro pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
