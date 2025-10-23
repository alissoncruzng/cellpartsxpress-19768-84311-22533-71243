// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, CreditCard, Building, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  pix_key?: string;
  bank_name?: string;
  rejection_reason?: string;
  created_at: string;
  processed_at?: string;
}

interface WithdrawalRequestProps {
  balance: number;
  onSuccess?: () => void;
}

export default function WithdrawalRequest({ balance, onSuccess }: WithdrawalRequestProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "bank_transfer">("pix");
  const [pixKey, setPixKey] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankAgency, setBankAgency] = useState("");
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    if (open) {
      loadRequests();
    }
  }, [open]);

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("driver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error loading requests:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    
    if (!amountValue || amountValue <= 0) {
      toast.error("Valor inválido");
      return;
    }

    if (amountValue > balance) {
      toast.error("Saldo insuficiente");
      return;
    }

    if (amountValue < 10) {
      toast.error("Valor mínimo para saque: R$ 10,00");
      return;
    }

    if (paymentMethod === "pix" && !pixKey.trim()) {
      toast.error("Informe a chave PIX");
      return;
    }

    if (paymentMethod === "bank_transfer" && (!bankName || !bankAccount || !bankAgency)) {
      toast.error("Preencha todos os dados bancários");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const requestData: any = {
        driver_id: user.id,
        amount: amountValue,
        payment_method: paymentMethod,
      };

      if (paymentMethod === "pix") {
        requestData.pix_key = pixKey;
      } else {
        requestData.bank_name = bankName;
        requestData.bank_account = bankAccount;
        requestData.bank_agency = bankAgency;
      }

      const { error } = await supabase
        .from("withdrawal_requests")
        .insert(requestData);

      if (error) throw error;

      toast.success("Solicitação de saque enviada com sucesso!");
      setAmount("");
      setPixKey("");
      setBankName("");
      setBankAccount("");
      setBankAgency("");
      setOpen(false);
      
      if (onSuccess) onSuccess();
      loadRequests();
    } catch (error: any) {
      console.error("Error creating withdrawal request:", error);
      toast.error("Erro ao solicitar saque");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { label: "Pendente", variant: "secondary", icon: Clock },
      approved: { label: "Aprovado", variant: "default", icon: CheckCircle },
      completed: { label: "Concluído", variant: "outline", icon: CheckCircle },
      rejected: { label: "Rejeitado", variant: "destructive", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <DollarSign className="h-4 w-4" />
          Solicitar Saque
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
          <DialogDescription>
            Saldo disponível: <span className="font-bold text-green-600">R$ {balance.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Saque</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="10"
              max={balance}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Valor mínimo: R$ 10,00 | Máximo: R$ {balance.toFixed(2)}
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "bank_transfer")}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-4 w-4" />
                  PIX (Instantâneo)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Building className="h-4 w-4" />
                  Transferência Bancária (1-2 dias úteis)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* PIX Key */}
          {paymentMethod === "pix" && (
            <div className="space-y-2">
              <Label htmlFor="pix_key">Chave PIX</Label>
              <Input
                id="pix_key"
                placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                required
              />
            </div>
          )}

          {/* Bank Details */}
          {paymentMethod === "bank_transfer" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco</Label>
                <Input
                  id="bank_name"
                  placeholder="Nome do Banco"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bank_agency">Agência</Label>
                  <Input
                    id="bank_agency"
                    placeholder="0000"
                    value={bankAgency}
                    onChange={(e) => setBankAgency(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account">Conta</Label>
                  <Input
                    id="bank_account"
                    placeholder="00000-0"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processando..." : "Solicitar Saque"}
          </Button>
        </form>

        {/* Recent Requests */}
        {requests.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-sm">Solicitações Recentes</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">R$ {request.amount.toFixed(2)}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                        {request.payment_method === "pix" && request.pix_key && (
                          <div className="text-xs text-muted-foreground">
                            PIX: {request.pix_key}
                          </div>
                        )}
                        {request.rejection_reason && (
                          <div className="flex items-start gap-1 text-xs text-destructive mt-1">
                            <AlertCircle className="h-3 w-3 mt-0.5" />
                            <span>{request.rejection_reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
