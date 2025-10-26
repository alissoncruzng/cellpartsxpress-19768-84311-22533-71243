import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Printer } from "lucide-react";
import acrLogo from "@/assets/acr-logo.png";

interface OrderReceiptProps {
  orderNumber: string;
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethod: string;
  address?: string;
  customerType?: "regular" | "wholesale";
  wholesaleDiscount?: number;
  couponDiscount?: number;
  paymentMethod?: string;
  couponCode?: string;
}

export default function OrderReceipt({
  orderNumber,
  date,
  items,
  subtotal,
  shippingFee,
  total,
  shippingMethod,
  address,
  customerType = "regular",
  wholesaleDiscount = 0,
  couponDiscount = 0,
  paymentMethod,
  couponCode,
}: OrderReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-4 print:space-y-2">
        <img
          src={acrLogo}
          alt="ACR Logo"
          className="h-16 mx-auto"
        />
        <CardTitle className="text-2xl print:text-xl">Cupom de Pedido</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p>Pedido #{orderNumber}</p>
          <p>{date}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 print:space-y-4">
        {/* Customer Type Badge */}
        {customerType === "wholesale" && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-primary">
              ⭐ Cliente Lojista - Preços Especiais
            </p>
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Itens do Pedido</h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Shipping Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Entrega</h3>
          <p className="text-sm text-muted-foreground">
            Método: {shippingMethod}
          </p>
          {address && (
            <p className="text-sm text-muted-foreground">
              Endereço: {address}
            </p>
          )}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          {wholesaleDiscount > 0 && (
            <div className="flex justify-between text-sm text-primary">
              <span>Desconto Lojista:</span>
              <span>- R$ {wholesaleDiscount.toFixed(2)}</span>
            </div>
          )}

          {couponCode && couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Cupom {couponCode}:</span>
              <span>- R$ {couponDiscount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>Frete:</span>
            <span>{shippingFee === 0 ? "GRÁTIS" : `R$ ${shippingFee.toFixed(2)}`}</span>
          </div>
          
          {paymentMethod && (
            <div className="flex justify-between text-sm">
              <span>Pagamento:</span>
              <span>{paymentMethod}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Print Button */}
        <Button onClick={handlePrint} className="w-full print:hidden">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Cupom
        </Button>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>ACR Delivery System</p>
          <p>Obrigado pela preferência!</p>
        </div>
      </CardContent>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [class*="max-w-2xl"] {
            max-width: 100% !important;
          }
          [class*="max-w-2xl"], [class*="max-w-2xl"] * {
            visibility: visible;
          }
          [class*="max-w-2xl"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Card>
  );
}
