import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Box, BarChart3, Plus, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUser";

interface WholesaleDashboardProps {
  user: UserProfile;
}

export function WholesaleDashboard({ user }: WholesaleDashboardProps) {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Adicionar Produto",
      icon: <Plus className="h-5 w-5" />,
      onClick: () => navigate("/products/new"),
      description: "Adicione novos produtos ao catálogo",
    },
    {
      title: "Meus Produtos",
      icon: <Package className="h-5 w-5" />,
      onClick: () => navigate("/products"),
      description: "Gerencie seu catálogo",
    },
    {
      title: "Pedidos",
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => navigate("/wholesale/orders"),
      description: "Visualize todos os pedidos",
    },
    {
      title: "Relatórios",
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: () => navigate("/wholesale/analytics"),
      description: "Acompanhe suas métricas",
    },
  ];

  // Dados de exemplo para o dashboard
  const stats = [
    { name: 'Vendas Hoje', value: 'R$ 1.245,00', change: '+12%', changeType: 'increase' },
    { name: 'Pedidos Pendentes', value: '8', change: '+2', changeType: 'increase' },
    { name: 'Produtos em Estoque', value: '124', change: '-5%', changeType: 'decrease' },
    { name: 'Avaliação Média', value: '4.8/5', change: '+0.2', changeType: 'increase' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user.full_name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, statIdx) => (
          <Card key={statIdx}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-muted-foreground">{stat.name}</dt>
                <div className={`p-1.5 rounded-full ${
                  stat.changeType === 'increase' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingUp className="h-4 w-4 transform rotate-180" />
                  )}
                </div>
              </div>
              <dd className="mt-1 flex items-baseline">
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div 
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </div>
              </dd>
            </CardHeader>
          </Card>
        ))}
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

      {/* Pedidos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pedidos Recentes</CardTitle>
                <p className="text-sm text-muted-foreground">Últimos pedidos realizados</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/wholesale/orders")}>
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((order) => (
                <div key={order} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Pedido #{1000 + order}</p>
                      <p className="text-sm text-muted-foreground">Cliente {order}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {150 + (order * 25)},00</p>
                    <p className="text-sm text-muted-foreground">Há {order} hora{order > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Produtos em Destaque</CardTitle>
                <p className="text-sm text-muted-foreground">Mais vendidos</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/products")}>
                Ver todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((product) => (
                <div key={product} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Produto {product}</p>
                    <p className="text-sm text-muted-foreground">{50 + (product * 5)} vendas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {100 + (product * 10)},00</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
