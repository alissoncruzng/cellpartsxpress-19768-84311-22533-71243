import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Banknote,
  Smartphone,
  DollarSign,
  CheckCircle
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
}

export function PaymentMethods({ selectedMethod, onMethodSelect }: PaymentMethodsProps) {
  const paymentMethods: PaymentMethod[] = [
    {
      id: "PIX",
      name: "PIX",
      icon: Smartphone,
      description: "Pagamento instantâneo",
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-200"
    },
    {
      id: "Cartão de Crédito",
      name: "Crédito",
      icon: CreditCard,
      description: "Até 12x sem juros",
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200"
    },
    {
      id: "Cartão de Débito",
      name: "Débito",
      icon: CreditCard,
      description: "Pagamento à vista",
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      borderColor: "border-purple-200"
    },
    {
      id: "Dinheiro",
      name: "Dinheiro",
      icon: Banknote,
      description: "Pagamento na entrega",
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Método de Pagamento</h3>
        <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                isSelected
                  ? `ring-2 ring-primary shadow-lg ${method.borderColor}`
                  : `hover:border-primary/50 ${method.borderColor}`
              }`}
              onClick={() => onMethodSelect(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Ícone */}
                  <div className={`p-3 rounded-full transition-colors duration-300 ${
                    isSelected
                      ? `${method.color} bg-white shadow-md`
                      : `${method.color} ${method.bgColor}`
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold transition-colors duration-300 ${
                          isSelected ? method.color : 'text-foreground'
                        }`}>
                          {method.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {method.description}
                        </p>
                      </div>

                      {/* Indicador de seleção */}
                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-primary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selecionado
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo do método selecionado */}
      {selectedMethod && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium">
              Método selecionado: <span className="text-primary">{selectedMethod}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
