// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeliveryConfig {
  id: string;
  region: string;
  base_fee: number;
  per_km_fee: number;
  max_distance_km: number;
  is_active: boolean;
}

export default function DeliveryConfig() {
  const [configs, setConfigs] = useState<DeliveryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DeliveryConfig | null>(null);
  
  const [formData, setFormData] = useState({
    region: "",
    base_fee: "",
    per_km_fee: "",
    max_distance_km: "",
    is_active: true,
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_configs")
        .select("*")
        .order("region", { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      console.error("Error loading configs:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.region || !formData.base_fee || !formData.per_km_fee || !formData.max_distance_km) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const configData = {
        region: formData.region,
        base_fee: parseFloat(formData.base_fee),
        per_km_fee: parseFloat(formData.per_km_fee),
        max_distance_km: parseFloat(formData.max_distance_km),
        is_active: formData.is_active,
      };

      if (editingConfig) {
        // Update
        const { error } = await supabase
          .from("delivery_configs")
          .update(configData)
          .eq("id", editingConfig.id);

        if (error) throw error;
        toast.success("Configuração atualizada!");
      } else {
        // Insert
        const { error } = await supabase
          .from("delivery_configs")
          .insert(configData);

        if (error) throw error;
        toast.success("Configuração criada!");
      }

      resetForm();
      setDialogOpen(false);
      loadConfigs();
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast.error("Erro ao salvar configuração");
    }
  };

  const handleEdit = (config: DeliveryConfig) => {
    setEditingConfig(config);
    setFormData({
      region: config.region,
      base_fee: config.base_fee.toString(),
      per_km_fee: config.per_km_fee.toString(),
      max_distance_km: config.max_distance_km.toString(),
      is_active: config.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta configuração?")) return;

    try {
      const { error } = await supabase
        .from("delivery_configs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Configuração excluída!");
      loadConfigs();
    } catch (error: any) {
      console.error("Error deleting config:", error);
      toast.error("Erro ao excluir configuração");
    }
  };

  const toggleActive = async (config: DeliveryConfig) => {
    try {
      const { error } = await supabase
        .from("delivery_configs")
        .update({ is_active: !config.is_active })
        .eq("id", config.id);

      if (error) throw error;
      toast.success(config.is_active ? "Região desativada" : "Região ativada");
      loadConfigs();
    } catch (error: any) {
      console.error("Error toggling active:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const resetForm = () => {
    setFormData({
      region: "",
      base_fee: "",
      per_km_fee: "",
      max_distance_km: "",
      is_active: true,
    });
    setEditingConfig(null);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Configuração de Frete por Região
              </CardTitle>
              <CardDescription>
                Configure taxas de entrega por região
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Região
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingConfig ? "Editar Configuração" : "Nova Configuração"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure as taxas de entrega para a região
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Região / Cidade</Label>
                    <Input
                      id="region"
                      placeholder="Ex: São Paulo - SP"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="base_fee">Taxa Base (R$)</Label>
                      <Input
                        id="base_fee"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.base_fee}
                        onChange={(e) => setFormData({ ...formData, base_fee: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="per_km_fee">Por KM (R$)</Label>
                      <Input
                        id="per_km_fee"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.per_km_fee}
                        onChange={(e) => setFormData({ ...formData, per_km_fee: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_distance">Distância Máxima (KM)</Label>
                    <Input
                      id="max_distance"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={formData.max_distance_km}
                      onChange={(e) => setFormData({ ...formData, max_distance_km: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Região Ativa</Label>
                  </div>

                  <Button type="submit" className="w-full">
                    {editingConfig ? "Atualizar" : "Criar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma configuração cadastrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <Card key={config.id} className={!config.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{config.region}</h3>
                          <Badge variant={config.is_active ? "default" : "secondary"}>
                            {config.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Taxa Base</p>
                            <p className="font-semibold text-primary">
                              R$ {config.base_fee.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Por KM</p>
                            <p className="font-semibold text-primary">
                              R$ {config.per_km_fee.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Dist. Máx.</p>
                            <p className="font-semibold">
                              {config.max_distance_km} km
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          <p>Exemplo: 5km = R$ {(config.base_fee + (config.per_km_fee * 5)).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(config)}
                        >
                          <Switch checked={config.is_active} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
