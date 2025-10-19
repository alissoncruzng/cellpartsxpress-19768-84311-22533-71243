import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShippingCalculatorProps {
  subtotal: number;
  onShippingCalculated: (fee: number, method: string, address: string, cep: string) => void;
}

export default function ShippingCalculator({ subtotal, onShippingCalculated }: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<"pickup" | "delivery">("delivery");
  const [loading, setLoading] = useState(false);
  const [shippingFee, setShippingFee] = useState<number | null>(null);

  const fetchAddressByCep = async () => {
    if (cep.length !== 8) {
      toast.error("CEP inválido. Digite 8 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
      setAddress(fullAddress);
      
      // Calculate shipping based on distance (simplified)
      // In production, use a real distance calculation API
      const baseFee = 10;
      const calculatedFee = method === "pickup" ? 0 : baseFee + (Math.random() * 15);
      
      setShippingFee(calculatedFee);
      onShippingCalculated(calculatedFee, method, fullAddress, cep);
      toast.success("Frete calculado com sucesso!");
    } catch (error) {
      toast.error("Erro ao buscar endereço");
    } finally {
      setLoading(false);
    }
  };

  const calculateShipping = () => {
    if (method === "pickup") {
      setShippingFee(0);
      onShippingCalculated(0, method, "Retirada no local", "");
      toast.success("Retirada no local selecionada!");
    } else {
      fetchAddressByCep();
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calculator className="h-5 w-5" />
          Calcular Frete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label>Método de Entrega</Label>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as "pickup" | "delivery")}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup" className="cursor-pointer flex-1">
                Retirar no local (Grátis)
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery" className="cursor-pointer flex-1">
                Entrega por Motoboy
              </Label>
            </div>
          </RadioGroup>
        </div>

        {method === "delivery" && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="cep">CEP (Somente Brasil)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cep"
                  placeholder="00000000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  maxLength={8}
                />
              </div>
            </div>

            {address && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Endereço encontrado:</p>
                    <p className="text-muted-foreground">{address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={calculateShipping}
          disabled={loading || (method === "delivery" && cep.length !== 8)}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculando...
            </>
          ) : (
            "Calcular Frete"
          )}
        </Button>

        {shippingFee !== null && (
          <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">Frete:</span>
              <span className="font-semibold text-primary">
                {shippingFee === 0 ? "GRÁTIS" : `R$ ${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary text-lg">
                R$ {(subtotal + shippingFee).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
