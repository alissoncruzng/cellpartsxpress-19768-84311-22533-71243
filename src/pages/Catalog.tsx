// @ts-nocheck - Types will be regenerated after migration
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Search, Plus, Minus, Package, MessageCircle, Grid3x3, List, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ShippingCalculator from "@/components/ShippingCalculator";
import OrderReceipt from "@/components/OrderReceipt";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [customerType, setCustomerType] = useState<"regular" | "wholesale">("regular");
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCep, setDeliveryCep] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('acr_cart');
    if (savedCart) {
      try {
        const cartArray = JSON.parse(savedCart);
        setCart(new Map(cartArray));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.size > 0) {
      localStorage.setItem('acr_cart', JSON.stringify(Array.from(cart.entries())));
    } else {
      localStorage.removeItem('acr_cart');
    }
  }, [cart]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // @ts-ignore - Types will be regenerated after migration
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQty = cart.get(productId) || 0;
    if (currentQty >= product.stock) {
      toast.error("Quantidade máxima atingida");
      return;
    }

    const newCart = new Map(cart);
    newCart.set(productId, currentQty + 1);
    setCart(newCart);
    toast.success("Produto adicionado ao carrinho");
  };

  const removeFromCart = (productId: string) => {
    const currentQty = cart.get(productId) || 0;
    if (currentQty === 0) return;

    const newCart = new Map(cart);
    if (currentQty === 1) {
      newCart.delete(productId);
    } else {
      newCart.set(productId, currentQty - 1);
    }
    setCart(newCart);
  };

  const getTotalItems = () => {
    return Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
  };

  const getSubtotal = () => {
    let subtotal = 0;
    cart.forEach((qty, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const price = customerType === "wholesale" ? product.price * 0.85 : product.price;
        subtotal += price * qty;
      }
    });
    return subtotal;
  };

  const getDiscount = () => {
    if (customerType !== "wholesale") return 0;
    const regularTotal = Array.from(cart.entries()).reduce((sum, [productId, qty]) => {
      const product = products.find(p => p.id === productId);
      return sum + (product ? product.price * qty : 0);
    }, 0);
    return regularTotal - getSubtotal();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const sendWhatsAppOrder = () => {
    if (cart.size === 0) {
      toast.error("Carrinho vazio");
      return;
    }

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const total = subtotal + shippingFee;

    let message = "🛒 *Novo Pedido ACR Delivery*\n\n";
    
    if (customerType === "wholesale") {
      message += "⭐ *Cliente Lojista*\n\n";
    }

    cart.forEach((qty, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const price = customerType === "wholesale" ? product.price * 0.85 : product.price;
        const itemTotal = price * qty;
        message += `${qty}x ${product.name} - R$ ${itemTotal.toFixed(2)}\n`;
      }
    });

    message += `\n📦 Subtotal: R$ ${subtotal.toFixed(2)}`;
    if (discount > 0) {
      message += `\n💰 Desconto Lojista: -R$ ${discount.toFixed(2)}`;
    }
    message += `\n🚚 Frete (${shippingMethod}): ${shippingFee === 0 ? "GRÁTIS" : `R$ ${shippingFee.toFixed(2)}`}`;
    if (deliveryAddress) {
      message += `\n📍 Endereço: ${deliveryAddress}`;
    }
    message += `\n\n💵 *Total: R$ ${total.toFixed(2)}*`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShippingCalculated = (fee: number, method: string, address: string, cep: string) => {
    setShippingFee(fee);
    setShippingMethod(method);
    setDeliveryAddress(address);
    setDeliveryCep(cep);
  };

  const createOrder = async () => {
    if (cart.size === 0) {
      toast.error("Carrinho vazio");
      return;
    }
    if (!shippingMethod) {
      toast.error("Calcule o frete primeiro");
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        navigate("/auth");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          client_id: user.id,
          subtotal: getSubtotal(),
          delivery_fee: shippingFee,
          total: getSubtotal() + shippingFee,
          delivery_address: deliveryAddress,
          delivery_cep: deliveryCep,
          delivery_city: "São Paulo", // Extract from address in production
          delivery_state: "SP",
          status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = Array.from(cart.entries()).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        const price = customerType === "wholesale" ? product!.price * 0.85 : product!.price;
        return {
          order_id: order.id,
          product_id: productId,
          quantity,
          price
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Pedido criado com sucesso!");
      setCart(new Map());
      localStorage.removeItem('acr_cart');
      navigate("/my-orders");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error("Erro ao criar pedido");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const generateReceipt = () => {
    if (cart.size === 0) {
      toast.error("Carrinho vazio");
      return;
    }
    if (!shippingMethod) {
      toast.error("Calcule o frete primeiro");
      return;
    }
    setShowReceipt(true);
  };

  const getReceiptItems = () => {
    const items: Array<{ name: string; quantity: number; price: number }> = [];
    cart.forEach((qty, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        const price = customerType === "wholesale" ? product.price * 0.85 : product.price;
        items.push({
          name: product.name,
          quantity: qty,
          price: price,
        });
      }
    });
    return items;
  };

  if (showReceipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-background p-8">
        <Button
          onClick={() => setShowReceipt(false)}
          variant="ghost"
          className="mb-4"
        >
          ← Voltar ao Catálogo
        </Button>
        <OrderReceipt
          orderNumber={`ACR-${Date.now().toString().slice(-6)}`}
          date={new Date().toLocaleString('pt-BR')}
          items={getReceiptItems()}
          subtotal={getSubtotal()}
          shippingFee={shippingFee}
          total={getSubtotal() + shippingFee}
          shippingMethod={shippingMethod}
          address={deliveryAddress}
          customerType={customerType}
          discount={getDiscount()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Header cartItemsCount={getTotalItems()} userRole="client" />
      
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Catálogo de Produtos</h1>
                <p className="text-muted-foreground">Escolha seus produtos e faça seu pedido</p>
              </div>
              
              <div className="flex gap-2">
                <Tabs value={customerType} onValueChange={(v) => setCustomerType(v as "regular" | "wholesale")}>
                  <TabsList>
                    <TabsTrigger value="regular">Cliente</TabsTrigger>
                    <TabsTrigger value="wholesale">Lojista</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
              {filteredProducts.map((product) => {
                const displayPrice = customerType === "wholesale" ? product.price * 0.85 : product.price;
                
                return (
                  <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex" : ""}`}>
                    <div className={`${viewMode === "grid" ? "aspect-video" : "w-32"} bg-muted relative overflow-hidden flex-shrink-0`}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2">{product.category}</Badge>
                    </div>
                    
                    <div className="flex-1">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {product.name}
                          {customerType === "wholesale" && (
                            <Badge variant="secondary" className="ml-2">-15%</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            {customerType === "wholesale" && (
                              <span className="text-sm text-muted-foreground line-through block">
                                R$ {product.price.toFixed(2)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-primary">
                              R$ {displayPrice.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Estoque: {product.stock}
                          </span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex gap-2">
                        {cart.has(product.id) ? (
                          <div className="flex items-center gap-2 w-full">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeFromCart(product.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="flex-1 text-center font-semibold">
                              {cart.get(product.id)}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => addToCart(product.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => addToCart(product.id)} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar
                          </Button>
                        )}
                      </CardFooter>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Cart & Shipping */}
          {getTotalItems() > 0 && (
            <div className="lg:w-96 space-y-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrinho ({getTotalItems()} itens)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-semibold">R$ {getSubtotal().toFixed(2)}</span>
                    </div>
                    {customerType === "wholesale" && getDiscount() > 0 && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Desconto Lojista (15%):</span>
                        <span className="font-semibold">-R$ {getDiscount().toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={createOrder}
                      disabled={!shippingMethod || checkoutLoading}
                      className="w-full"
                    >
                      {checkoutLoading ? (
                        <>Processando...</>
                      ) : (
                        <>Finalizar Pedido</>
                      )}
                    </Button>
                    <Button 
                      onClick={sendWhatsAppOrder}
                      disabled={!shippingMethod}
                      variant="outline"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button 
                      onClick={generateReceipt}
                      disabled={!shippingMethod}
                      variant="outline"
                      className="w-full"
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      Gerar Cupom
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <ShippingCalculator
                subtotal={getSubtotal()}
                onShippingCalculated={handleShippingCalculated}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
