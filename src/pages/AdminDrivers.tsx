// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  User, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Ban,
  Star,
  Truck
} from "lucide-react";
import Header from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  vehicle_type: string;
  vehicle_plate: string;
  cnh_number: string;
  cnh_image_url: string;
  is_approved: boolean;
  is_blocked: boolean;
  rejection_count: number;
  created_at: string;
}

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "driver")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar motoristas");
    } finally {
      setLoading(false);
    }
  };

  const approveDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true, is_blocked: false })
        .eq("id", driverId);

      if (error) throw error;
      
      toast.success("Motorista aprovado com sucesso!");
      loadDrivers();
    } catch (error: any) {
      toast.error("Erro ao aprovar motorista");
    }
  };

  const blockDriver = async (driverId: string, block: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: block })
        .eq("id", driverId);

      if (error) throw error;
      
      toast.success(block ? "Motorista bloqueado" : "Motorista desbloqueado");
      loadDrivers();
    } catch (error: any) {
      toast.error("Erro ao atualizar status do motorista");
    }
  };

  const viewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setDialogOpen(true);
  };

  const pendingDrivers = drivers.filter(d => !d.is_approved && !d.is_blocked);
  const approvedDrivers = drivers.filter(d => d.is_approved && !d.is_blocked);
  const blockedDrivers = drivers.filter(d => d.is_blocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header userRole="admin" />
      
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Motoristas</h1>
          <p className="text-muted-foreground">Aprovar, visualizar e gerenciar cadastros de motoristas</p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pendentes ({pendingDrivers.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprovados ({approvedDrivers.length})
            </TabsTrigger>
            <TabsTrigger value="blocked">
              Bloqueados ({blockedDrivers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingDrivers.map((driver) => (
              <Card key={driver.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {driver.full_name}
                    </CardTitle>
                    <Badge variant="outline">Aguardando Aprovação</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.vehicle_type} - {driver.vehicle_plate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => viewDriver(driver)}
                      variant="outline"
                      size="sm"
                    >
                      Ver Detalhes
                    </Button>
                    <Button
                      onClick={() => approveDriver(driver.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprovar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingDrivers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum motorista pendente de aprovação
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedDrivers.map((driver) => (
              <Card key={driver.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {driver.full_name}
                    </CardTitle>
                    <Badge className="bg-green-600">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.vehicle_type} - {driver.vehicle_plate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>Rejeições: {driver.rejection_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => viewDriver(driver)}
                      variant="outline"
                      size="sm"
                    >
                      Ver Detalhes
                    </Button>
                    <Button
                      onClick={() => blockDriver(driver.id, true)}
                      variant="destructive"
                      size="sm"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Bloquear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {approvedDrivers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum motorista aprovado
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocked" className="space-y-4 mt-6">
            {blockedDrivers.map((driver) => (
              <Card key={driver.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {driver.full_name}
                    </CardTitle>
                    <Badge variant="destructive">Bloqueado</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.vehicle_type} - {driver.vehicle_plate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => viewDriver(driver)}
                      variant="outline"
                      size="sm"
                    >
                      Ver Detalhes
                    </Button>
                    <Button
                      onClick={() => blockDriver(driver.id, false)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Desbloquear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {blockedDrivers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum motorista bloqueado
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Driver Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Motorista</DialogTitle>
            <DialogDescription>
              Informações completas do cadastro
            </DialogDescription>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome Completo</label>
                  <p className="text-sm text-muted-foreground">{selectedDriver.full_name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <p className="text-sm text-muted-foreground">{selectedDriver.phone}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Endereço</label>
                  <p className="text-sm text-muted-foreground">{selectedDriver.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo de Veículo</label>
                    <p className="text-sm text-muted-foreground">{selectedDriver.vehicle_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Placa</label>
                    <p className="text-sm text-muted-foreground">{selectedDriver.vehicle_plate}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">CNH</label>
                  <p className="text-sm text-muted-foreground">{selectedDriver.cnh_number}</p>
                </div>

                {selectedDriver.cnh_image_url && (
                  <div>
                    <label className="text-sm font-medium">Foto da CNH</label>
                    <img 
                      src={selectedDriver.cnh_image_url} 
                      alt="CNH" 
                      className="mt-2 rounded-lg border max-w-full"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Status:</label>
                    {selectedDriver.is_approved ? (
                      <Badge className="bg-green-600">Aprovado</Badge>
                    ) : (
                      <Badge variant="outline">Pendente</Badge>
                    )}
                  </div>

                  {selectedDriver.is_blocked && (
                    <Badge variant="destructive">Bloqueado</Badge>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Cadastrado em</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedDriver.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
