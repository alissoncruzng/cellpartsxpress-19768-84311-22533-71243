// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Tag, Percent } from "lucide-react";
import Header from "@/components/Header";

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: number | null;
  valid_from: string;
  valid_until: string;
  target_role: string | null;
  is_active: boolean;
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    valid_from: "",
    valid_until: "",
    target_role: "all",
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar promoções");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const promotionData = {
        title: formData.title,
        description: formData.description,
        discount_percentage: formData.discount_type === "percentage" ? parseFloat(formData.discount_value) : null,
        discount_amount: formData.discount_type === "amount" ? parseFloat(formData.discount_value) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        target_role: formData.target_role === "all" ? null : formData.target_role,
        is_active: true,
      };

      if (editingPromotion) {
        const { error } = await supabase
          .from("promotions")
          .update(promotionData)
          .eq("id", editingPromotion.id);

        if (error) throw error;
        toast.success("Promoção atualizada!");
      } else {
        const { error } = await supabase
          .from("promotions")
          .insert([promotionData]);

        if (error) throw error;
        toast.success("Promoção criada!");
      }

      setDialogOpen(false);
      resetForm();
      loadPromotions();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar promoção");
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discount_type: promotion.discount_percentage ? "percentage" : "amount",
      discount_value: (promotion.discount_percentage || promotion.discount_amount || 0).toString(),
      valid_from: promotion.valid_from.split('T')[0],
      valid_until: promotion.valid_until.split('T')[0],
      target_role: promotion.target_role || "all",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta promoção?")) return;

    try {
      const { error } = await supabase
        .from("promotions")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      toast.success("Promoção removida!");
      loadPromotions();
    } catch (error: any) {
      toast.error("Erro ao remover promoção");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      valid_from: "",
      valid_until: "",
      target_role: "all",
    });
    setEditingPromotion(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header userRole="admin" />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Promoções</h1>
            <p className="text-muted-foreground">Criar e gerenciar cupons e descontos</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Promoção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Desconto</Label>
                    <Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="amount">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_value">Valor</Label>
                    <Input
                      id="discount_value"
                      type="number"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valid_from">Válido De</Label>
                    <Input
                      id="valid_from"
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valid_until">Válido Até</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Público Alvo</Label>
                  <Select value={formData.target_role} onValueChange={(v) => setFormData({ ...formData, target_role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="client">Apenas Clientes</SelectItem>
                      <SelectItem value="driver">Apenas Motoristas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingPromotion ? "Atualizar" : "Criar"} Promoção
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => {
            const isActive = new Date(promotion.valid_until) > new Date() && promotion.is_active;
            
            return (
              <Card key={promotion.id} className={`${!isActive ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      {promotion.title}
                    </CardTitle>
                    {isActive ? (
                      <Badge className="bg-green-600">Ativa</Badge>
                    ) : (
                      <Badge variant="outline">Inativa</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {promotion.description}
                  </p>

                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    {promotion.discount_percentage ? (
                      <>
                        <Percent className="h-6 w-6" />
                        {promotion.discount_percentage}% OFF
                      </>
                    ) : (
                      <>
                        R$ {promotion.discount_amount?.toFixed(2)} OFF
                      </>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Válido de: {new Date(promotion.valid_from).toLocaleDateString('pt-BR')}</p>
                    <p>Válido até: {new Date(promotion.valid_until).toLocaleDateString('pt-BR')}</p>
                    {promotion.target_role && (
                      <p>Público: {promotion.target_role === 'client' ? 'Clientes' : 'Motoristas'}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(promotion)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {promotions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma promoção cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
