// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, Ban, CheckCircle, XCircle, Search, Star, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  status: string;
  suspension_reason?: string;
  suspended_at?: string;
  driver_stats?: {
    total_deliveries: number;
    completed_deliveries: number;
    average_rating: number;
    acceptance_rate: number;
  };
}

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchTerm]);

  const loadDrivers = async () => {
    try {
      const { data: driverRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "driver");

      if (rolesError) throw rolesError;

      const driverIds = driverRoles?.map(r => r.user_id) || [];

      if (driverIds.length === 0) {
        setDrivers([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", driverIds);

      if (profilesError) throw profilesError;

      // Load stats for each driver
      const driversWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: stats } = await supabase
            .from("driver_stats")
            .select("*")
            .eq("driver_id", profile.id)
            .single();

          return {
            ...profile,
            driver_stats: stats || {
              total_deliveries: 0,
              completed_deliveries: 0,
              average_rating: 0,
              acceptance_rate: 0,
            },
          };
        })
      );

      setDrivers(driversWithStats);
    } catch (error: any) {
      console.error("Error loading drivers:", error);
      toast.error("Erro ao carregar motoristas");
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    if (!searchTerm) {
      setFilteredDrivers(drivers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = drivers.filter(
      (d) =>
        d.full_name?.toLowerCase().includes(term) ||
        d.phone?.toLowerCase().includes(term)
    );
    setFilteredDrivers(filtered);
  };

  const suspendDriver = async () => {
    if (!selectedDriver || !suspensionReason.trim()) {
      toast.error("Informe o motivo da suspensão");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          status: "suspended",
          suspension_reason: suspensionReason,
          suspended_at: new Date().toISOString(),
          suspended_by: user.id,
        })
        .eq("id", selectedDriver.id);

      if (error) throw error;

      toast.success("Motorista suspenso com sucesso");
      setSuspendDialogOpen(false);
      setSuspensionReason("");
      loadDrivers();
    } catch (error: any) {
      console.error("Error suspending driver:", error);
      toast.error("Erro ao suspender motorista");
    }
  };

  const activateDriver = async () => {
    if (!selectedDriver) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "active",
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null,
        })
        .eq("id", selectedDriver.id);

      if (error) throw error;

      toast.success("Motorista ativado com sucesso");
      setActivateDialogOpen(false);
      loadDrivers();
    } catch (error: any) {
      console.error("Error activating driver:", error);
      toast.error("Erro ao ativar motorista");
    }
  };

  const deactivateDriver = async (driverId: string) => {
    if (!confirm("Tem certeza que deseja desativar este motorista permanentemente?")) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          status: "inactive",
          suspended_by: user.id,
        })
        .eq("id", driverId);

      if (error) throw error;

      toast.success("Motorista desativado");
      loadDrivers();
    } catch (error: any) {
      console.error("Error deactivating driver:", error);
      toast.error("Erro ao desativar motorista");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Ativo", variant: "default" },
      suspended: { label: "Suspenso", variant: "destructive" },
      inactive: { label: "Inativo", variant: "secondary" },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: "border-green-500/50 bg-green-500/5",
      suspended: "border-red-500/50 bg-red-500/5",
      inactive: "border-gray-500/50 bg-gray-500/5",
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
            <User className="h-5 w-5" />
            Gestão de Motoristas
          </CardTitle>
          <CardDescription>
            Gerencie o status e permissões dos motoristas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Motorista</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {drivers.filter(d => d.status === "active").length}
                </div>
                <div className="text-xs text-muted-foreground">Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {drivers.filter(d => d.status === "suspended").length}
                </div>
                <div className="text-xs text-muted-foreground">Suspensos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {drivers.filter(d => d.status === "inactive").length}
                </div>
                <div className="text-xs text-muted-foreground">Inativos</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Drivers List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredDrivers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum motorista encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredDrivers.map((driver) => (
              <Card key={driver.id} className={`border-2 ${getStatusColor(driver.status)}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{driver.full_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {driver.phone}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(driver.status)}
                    </div>

                    {/* Stats */}
                    {driver.driver_stats && (
                      <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="text-lg font-bold">
                            {driver.driver_stats.total_deliveries}
                          </div>
                          <div className="text-xs text-muted-foreground">Entregas</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          </div>
                          <div className="text-lg font-bold">
                            {driver.driver_stats.completed_deliveries}
                          </div>
                          <div className="text-xs text-muted-foreground">Concluídas</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                          </div>
                          <div className="text-lg font-bold">
                            {driver.driver_stats.average_rating.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">Avaliação</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="h-3 w-3 text-blue-500" />
                          </div>
                          <div className="text-lg font-bold">
                            {driver.driver_stats.acceptance_rate.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Aceitação</div>
                        </div>
                      </div>
                    )}

                    {/* Suspension Info */}
                    {driver.status === "suspended" && driver.suspension_reason && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm font-semibold text-destructive mb-1">
                          Motivo da Suspensão:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {driver.suspension_reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {driver.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedDriver(driver);
                              setSuspendDialogOpen(true);
                            }}
                            className="flex-1"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspender
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deactivateDriver(driver.id)}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Desativar
                          </Button>
                        </>
                      )}
                      {driver.status === "suspended" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setActivateDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ativar
                        </Button>
                      )}
                      {driver.status === "inactive" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedDriver(driver);
                            setActivateDialogOpen(true);
                          }}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reativar
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

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender Motorista</DialogTitle>
            <DialogDescription>
              Informe o motivo da suspensão. O motorista não poderá aceitar novos pedidos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo da Suspensão</Label>
              <Textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Descreva o motivo da suspensão..."
                rows={4}
              />
            </div>
            <Button onClick={suspendDriver} variant="destructive" className="w-full">
              Confirmar Suspensão
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activate Dialog */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar Motorista</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja ativar este motorista? Ele poderá aceitar pedidos novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={activateDriver} className="w-full">
              Confirmar Ativação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
