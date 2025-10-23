// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ticket, Plus, Edit, Trash2, Copy, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  user_limit: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_value: "0",
    max_discount: "",
    usage_limit: "",
    user_limit: "1",
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      console.error("Error loading coupons:", error);
      toast.error("Erro ao carregar cupons");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discount_value) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const couponData: any = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        user_limit: parseInt(formData.user_limit) || 1,
        valid_from: formData.valid_from,
        is_active: formData.is_active,
      };

      if (formData.max_discount) {
        couponData.max_discount = parseFloat(formData.max_discount);
      }

      if (formData.usage_limit) {
        couponData.usage_limit = parseInt(formData.usage_limit);
      }

      if (formData.valid_until) {
        couponData.valid_until = formData.valid_until;
      }

      if (!editingCoupon) {
        couponData.created_by = user.id;
      }

      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(couponData)
          .eq("id", editingCoupon.id);

        if (error) throw error;
        toast.success("Cupom atualizado!");
      } else {
        const { error } = await supabase
          .from("coupons")
          .insert(couponData);

        if (error) throw error;
        toast.success("Cupom criado!");
      }

      resetForm();
      setDialogOpen(false);
      loadCoupons();
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      toast.error(error.message || "Erro ao salvar cupom");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value.toString(),
      max_discount: coupon.max_discount?.toString() || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      user_limit: coupon.user_limit.toString(),
      valid_from: coupon.valid_from.slice(0, 16),
      valid_until: coupon.valid_until?.slice(0, 16) || "",
      is_active: coupon.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Cupom excluído!");
      loadCoupons();
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      toast.error("Erro ao excluir cupom");
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !coupon.is_active })
        .eq("id", coupon.id);

      if (error) throw error;
      toast.success(coupon.is_active ? "Cupom desativado" : "Cupom ativado");
      loadCoupons();
    } catch (error: any) {
      console.error("Error toggling coupon:", error);
      toast.error("Erro ao atualizar cupom");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_value: "0",
      max_discount: "",
      usage_limit: "",
      user_limit: "1",
      valid_from: new Date().toISOString().slice(0, 16),
      valid_until: "",
      is_active: true,
    });
    setEditingCoupon(null);
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
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
                <Ticket className="h-5 w-5" />
                Cupons de Desconto
              </CardTitle>
              <CardDescription>
                Crie e gerencie cupons promocionais
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cupom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure os detalhes do cupom de desconto
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código do Cupom *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        placeholder="DESCONTO10"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        required
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={generateCode}>
                        Gerar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrição do cupom..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount_type">Tipo de Desconto *</Label>
                      <Select
                        value={formData.discount_type}
                        onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                      >
                        <SelectTrigger id="discount_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                          <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount_value">
                        Valor do Desconto * {formData.discount_type === "percentage" ? "(%)" : "(R$)"}
                      </Label>
                      <Input
                        id="discount_value"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_order_value">Valor Mínimo do Pedido (R$)</Label>
                      <Input
                        id="min_order_value"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.min_order_value}
                        onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                      />
                    </div>

                    {formData.discount_type === "percentage" && (
                      <div className="space-y-2">
                        <Label htmlFor="max_discount">Desconto Máximo (R$)</Label>
                        <Input
                          id="max_discount"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Sem limite"
                          value={formData.max_discount}
                          onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="usage_limit">Limite de Uso Total</Label>
                      <Input
                        id="usage_limit"
                        type="number"
                        min="1"
                        placeholder="Ilimitado"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="user_limit">Limite por Usuário</Label>
                      <Input
                        id="user_limit"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.user_limit}
                        onChange={(e) => setFormData({ ...formData, user_limit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valid_from">Válido A Partir De</Label>
                      <Input
                        id="valid_from"
                        type="datetime-local"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valid_until">Válido Até</Label>
                      <Input
                        id="valid_until"
                        type="datetime-local"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Cupom Ativo</Label>
                  </div>

                  <Button type="submit" className="w-full">
                    {editingCoupon ? "Atualizar Cupom" : "Criar Cupom"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{coupons.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter(c => c.is_active && !isExpired(c.valid_until)).length}
                </div>
                <div className="text-xs text-muted-foreground">Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {coupons.reduce((sum, c) => sum + c.usage_count, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Usos Totais</div>
              </CardContent>
            </Card>
          </div>

          {/* Coupons List */}
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum cupom cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className={!coupon.is_active || isExpired(coupon.valid_until) ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-mono font-bold text-lg bg-primary/10 px-3 py-1 rounded">
                            {coupon.code}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyCode(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Badge variant={coupon.is_active && !isExpired(coupon.valid_until) ? "default" : "secondary"}>
                            {isExpired(coupon.valid_until) ? "Expirado" : coupon.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>

                        {coupon.description && (
                          <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Desconto: </span>
                            <span className="font-semibold text-primary">
                              {coupon.discount_type === "percentage"
                                ? `${coupon.discount_value}%`
                                : `R$ ${coupon.discount_value.toFixed(2)}`}
                            </span>
                          </div>
                          {coupon.min_order_value > 0 && (
                            <div>
                              <span className="text-muted-foreground">Mín: </span>
                              <span className="font-semibold">R$ {coupon.min_order_value.toFixed(2)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Usos: </span>
                            <span className="font-semibold">
                              {coupon.usage_count}
                              {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                            </span>
                          </div>
                          {coupon.valid_until && (
                            <div>
                              <span className="text-muted-foreground">Válido até: </span>
                              <span className="font-semibold">
                                {format(new Date(coupon.valid_until), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(coupon)}
                        >
                          <Switch checked={coupon.is_active} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(coupon.id)}
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
