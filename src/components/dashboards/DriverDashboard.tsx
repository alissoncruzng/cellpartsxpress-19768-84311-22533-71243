import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Clock, MapPin, CheckCircle, AlertCircle, Bike, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";

interface Delivery {
  id: string;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  customerName: string;
  address: string;
  estimatedTime: string;
  amount: number;
  distance: number;
}

interface DriverDashboardProps {
  user: UserProfile;
}

export function DriverDashboard({ user }: DriverDashboardProps) {
  const navigate = useNavigate();
  
  // Estado para controlar se o motorista está online
  const [isOnline, setIsOnline] = useState(true);
  
  // Dados de exemplo para as entregas
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 'D-1001',
      status: 'in_progress',
      customerName: 'João Silva',
      address: 'Rua das Flores, 123 - Centro',
      estimatedTime: '15 min',
      amount: 18.50,
      distance: 2.5
    },
    {
      id: 'D-1002',
      status: 'pending',
      customerName: 'Maria Santos',
      address: 'Av. Brasil, 1500 - Jardim América',
      estimatedTime: '25 min',
      amount: 15.00,
      distance: 3.8
    },
    {
      id: 'D-1003',
      status: 'pending',
      customerName: 'Carlos Oliveira',
      address: 'Rua das Palmeiras, 45 - Vila Nova',
      estimatedTime: '35 min',
      amount: 22.50,
      distance: 5.2
    }
  ]);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    // Aqui você pode adicionar a lógica para atualizar o status no backend
  };

  const startDelivery = (deliveryId: string) => {
    // Lógica para iniciar uma entrega
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, status: 'in_progress' } 
        : delivery
    ));
  };

  const completeDelivery = (deliveryId: string) => {
    // Lógica para marcar uma entrega como concluída
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, status: 'delivered' } 
        : delivery
    ));
  };

  const activeDelivery = deliveries.find(d => d.status === 'in_progress');
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Olá, {user.full_name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Acompanhe suas entregas em tempo real</p>
        </div>
        <Button 
          variant={isOnline ? "default" : "outline"} 
          onClick={toggleOnlineStatus}
          className="gap-2"
        >
          {isOnline ? (
            <>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Online
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              Offline
            </>
          )}
        </Button>
      </div>

      {activeDelivery ? (
        <Card className="border-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-500" />
                <CardTitle>Entrega em Andamento</CardTitle>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Em andamento
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-green-100">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">{activeDelivery.customerName}</h3>
                  <p className="text-sm text-muted-foreground">{activeDelivery.address}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {activeDelivery.estimatedTime}
                    </span>
                    <span>•</span>
                    <span>{activeDelivery.distance} km</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Valor da entrega</p>
                  <p className="text-lg font-bold">R$ {activeDelivery.amount.toFixed(2)}</p>
                </div>
                <Button onClick={() => completeDelivery(activeDelivery.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Entregue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma entrega em andamento</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Aguarde novas solicitações de entrega
            </p>
          </CardContent>
        </Card>
      )}

      {pendingDeliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Entregas</CardTitle>
            <p className="text-sm text-muted-foreground">Entregas aguardando coleta</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDeliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Pedido {delivery.id}</h3>
                        <Badge variant="outline" className="text-xs">
                          {delivery.distance} km
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {delivery.customerName}
                      </p>
                      <p className="text-sm mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{delivery.address}</span>
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">R$ {delivery.amount.toFixed(2)}</p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => startDelivery(delivery.id)}
                      >
                        Iniciar Entrega
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
            <p className="text-sm text-muted-foreground">Seu desempenho hoje</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Entregas Realizadas</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ganhos do Dia</span>
                <span className="font-medium">R$ 87,50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Média por Entrega</span>
                <span className="font-medium">R$ 17,50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quilometragem</span>
                <span className="font-medium">28,5 km</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Veículo</CardTitle>
            <p className="text-sm text-muted-foreground">Informações da sua moto</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bike className="h-5 w-5 text-primary" />
                  <span className="text-sm">Modelo</span>
                </div>
                <span className="font-medium">Honda CG 160</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm">Placa</span>
                </div>
                <span className="font-mono font-medium">ABC-1D23</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm">Tempo Online Hoje</span>
                </div>
                <span className="font-medium">4h 23min</span>
              </div>
              <div className="pt-4 mt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status do Documento</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Em dia
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Próxima verificação em 30 dias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
