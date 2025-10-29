import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CreditCard,
  MapPin,
  Truck,
  CheckCircle,
  ArrowLeft,
  ShoppingBag
} from "lucide-react";
import Header from "@/components/Header";
import { PaymentMethods } from "@/components/PaymentMethods";
import ShippingCalculator from "@/components/ShippingCalculator";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('acr_cart');
    if (savedCart) {
      try {
        const cartArray = JSON.parse(savedCart);
        // Aqui você precisaria buscar os detalhes dos produtos
        // Por enquanto, vamos criar uma estrutura básica
        setCartItems([]);
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal + shippingFee;
  };

  const handleShippingCalculated = (fee: number, method: string) => {
    setShippingFee(fee);
    setShippingMethod(method);
  };

  const handlePayment = async () => {
    if (!paymentMethod || !shippingMethod) {
      toast.error("Selecione o método de pagamento e forma de entrega");
      return;
    }

    setProcessing(true);

    try {
      // Aqui você implementaria a lógica de processamento do pagamento
      // baseado no método selecionado

      switch (paymentMethod) {
        case "PIX":
          // Lógica para PIX
          toast.success("PIX gerado com sucesso!");
          break;
        case "Cartão de Crédito":
        case "Cartão de Débito":
          // Lógica para cartão
          toast.success("Pagamento processado com cartão!");
          break;
        case "Dinheiro":
          // Lógica para dinheiro
          toast.success("Pedido confirmado para pagamento na entrega!");
          break;
        default:
          throw new Error("Método de pagamento inválido");
      }

      // Limpar carrinho
      localStorage.removeItem('acr_cart');

      // Redirecionar para página de confirmação
      navigate('/order-confirmation');

    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Carrinho vazio</h1>
            <p className="text-muted-foreground">
              Adicione produtos ao carrinho para continuar com a compra.
            </p>
            <Button onClick={() => navigate('/catalog')}>
              Ir para Catálogo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/catalog')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Catálogo
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Finalizar Compra</h1>
              <p className="text-muted-foreground">
                Complete seu pedido selecionando forma de pagamento e entrega
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda - Itens do Pedido */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)} cada
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Calculadora de Frete */}
              <ShippingCalculator
                subtotal={calculateTotal() - shippingFee}
                onShippingCalculated={handleShippingCalculated}
              />
            </div>

            {/* Coluna Direita - Pagamento e Resumo */}
            <div className="space-y-6">
              {/* Endereço de Entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.address || "Endereço não informado"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CEP: {user?.cep || "Não informado"}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Alterar Endereço
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Método de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Forma de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Escolha como deseja pagar seu pedido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentMethods
                    selectedMethod={paymentMethod}
                    onMethodSelect={setPaymentMethod}
                  />
                </CardContent>
              </Card>

              {/* Resumo do Pedido */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {(calculateTotal() - shippingFee).toFixed(2)}</span>
                  </div>

                  {shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span>Frete ({shippingMethod}):</span>
                      <span>R$ {shippingFee.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">R$ {calculateTotal().toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={!paymentMethod || !shippingMethod || processing}
                    className="w-full h-12 text-lg font-semibold mt-6"
                    size="lg"
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Finalizar Compra
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
