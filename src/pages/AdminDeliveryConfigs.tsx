import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Edit, MapPin, Plus, Ruler, Trash2, Truck } from "lucide-react";

interface DeliveryConfig {
  id: string;
  region: string;
  base_fee: number;
  per_km_fee: number;
  max_distance_km: number;
  is_active: boolean;
  created_at: string;
}

const defaultForm = {
  region: "",
  base_fee: "",
  per_km_fee: "",
  max_distance_km: "",
  is_active: "true"
};

export default function AdminDeliveryConfigs() {
  const [configs, setConfigs] = useState<DeliveryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DeliveryConfig | null>(null);
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConfigs((data || []) as DeliveryConfig[]);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao carregar configurações de entrega");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingConfig(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.region.trim()) {
      toast.error("Informe o nome da região");
      return;
    }

    try {
      const payload = {
        region: formData.region.trim(),
        base_fee: parseFloat(formData.base_fee),
        per_km_fee: parseFloat(formData.per_km_fee),
        max_distance_km: parseFloat(formData.max_distance_km),
        is_active: formData.is_active === "true"
      };

      if (Number.isNaN(payload.base_fee) || Number.isNaN(payload.per_km_fee) || Number.isNaN(payload.max_distance_km)) {
        toast.error("Preencha os valores numéricos corretamente");
        return;
      }

      if (editingConfig) {
        const { error } = await supabase
          .from("delivery_configs")
          .update(payload)
          .eq("id", editingConfig.id);

        if (error) throw error;
        toast.success("Configuração atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from("delivery_configs")
          .insert(payload);

        if (error) throw error;
        toast.success("Configuração criada com sucesso");
      }

      setDialogOpen(false);
      resetForm();
      loadConfigs();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar configuração");
    }
  };

  const handleEdit = (config: DeliveryConfig) => {
    setEditingConfig(config);
    setFormData({
      region: config.region,
      base_fee: config.base_fee.toString(),
      per_km_fee: config.per_km_fee.toString(),
      max_distance_km: config.max_distance_km.toString(),
      is_active: config.is_active ? "true" : "false"
    });
    setDialogOpen(true);
  };

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "desativar" : "reativar";
    if (!confirm(`Deseja realmente ${action} esta configuração?`)) return;

    try {
      const { error } = await supabase
        .from("delivery_configs")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Configuração ${currentStatus ? "desativada" : "reativada"}`);
      loadConfigs();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header userRole="admin" />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-7 w-7 text-primary" />
              Configurações de Entrega
            </h1>
            <p className="text-muted-foreground">Gerencie taxas por região, distância máxima e tempos estimados</p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Configuração
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingConfig ? "Editar Configuração" : "Nova Configuração"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Região</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(event) => setFormData({ ...formData, region: event.target.value })}
                    placeholder="Ex: Zona Sul, Centro, ABC"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_fee">Taxa Base (R$)</Label>
                    <Input
                      id="base_fee"
                      type="number"
                      step="0.01"
                      value={formData.base_fee}
                      onChange={(event) => setFormData({ ...formData, base_fee: event.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="per_km_fee">Taxa por KM (R$)</Label>
                    <Input
                      id="per_km_fee"
                      type="number"
                      step="0.01"
                      value={formData.per_km_fee}
                      onChange={(event) => setFormData({ ...formData, per_km_fee: event.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_distance_km">Distância Máxima (KM)</Label>
                    <Input
                      id="max_distance_km"
                      type="number"
                      step="0.1"
                      value={formData.max_distance_km}
                      onChange={(event) => setFormData({ ...formData, max_distance_km: event.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.is_active} onValueChange={(value) => setFormData({ ...formData, is_active: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativa</SelectItem>
                      <SelectItem value="false">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingConfig ? "Atualizar" : "Criar"} Configuração
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {configs.length === 0 && !loading ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma configuração cadastrada</p>
            <p className="text-sm text-muted-foreground">Clique em "Nova Configuração" para adicionar uma região de entrega.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {configs.map((config) => {
              const statusBadge = config.is_active ? (
                <Badge className="bg-green-600">Ativa</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">Inativa</Badge>
              );

              return (
                <Card key={config.id} className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        {config.region}
                      </CardTitle>
                      <p className="text-xs text-white/60">
                        Criada em {new Date(config.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {statusBadge}
                  </CardHeader>

                  <CardContent className="space-y-4 text-white/80">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/60">Taxa Base</p>
                        <p className="font-semibold">R$ {config.base_fee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/60">Taxa por KM</p>
                        <p className="font-semibold">R$ {config.per_km_fee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/60">Distância Máxima</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {config.max_distance_km} km
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeactivate(config.id, config.is_active)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
